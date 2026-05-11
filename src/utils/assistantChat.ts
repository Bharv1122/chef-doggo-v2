import type { DogProfile } from '../types/dog';
import type { ChatMessage } from '../types/assistant';
import { getFallbackAssistantResponse } from '../data/assistantResponses';

const API_KEY = import.meta.env.VITE_ABACUS_API_KEY;
const MODEL = import.meta.env.VITE_ABACUS_TEXT_MODEL ?? 'gpt-4o-mini';
const BASE_URL = import.meta.env.VITE_ABACUS_ROUTELLM_BASE_URL ?? 'https://routellm.abacus.ai/v1';
// Trim long histories to control token usage. Keep the most recent N turns.
const MAX_HISTORY_MESSAGES = 16;

const SYSTEM_PROMPT = `You are Chef Doggo, an expert canine nutrition assistant trusted by owners cooking fresh, homemade meals for their dogs. You combine three areas of expertise:

1. **Veterinary nutrition** — AAFCO requirements, macro and micronutrient balance, calorie calculations, and how needs change with life stage (puppy/adult/senior), activity level, and health conditions (kidney disease, pancreatitis, diabetes, allergies, etc.).
2. **Practical homemade dog-food cooking** — give specific, hands-on preparation steps. When asked about ingredients, name the method (steam, boil, bake, pan-cook), the time, the heat level, the safe internal temperature, the cut size, and how to portion and store.
3. **Canine supplements** — calcium sources (eggshell powder, calcium carbonate), omega-3s (fish/krill oil dosing by body weight), multivitamins, probiotics, joint support (glucosamine/chondroitin), when to add them (after cooling, since heat degrades many actives), and known food/medication interactions.

**Be specific and concrete.** Don't give vague answers when a specific one exists.
- ❌ "Vegetables can be prepared in several ways."
- ✅ "Steam carrots for 8–10 minutes over simmering water until fork-tender, then dice to ½-inch for small dogs or 1-inch for large dogs. Cooked vegetables digest better than raw."

**Safety rules (non-negotiable):**
- Never recommend toxic-to-dogs foods: xylitol, chocolate, grapes, raisins, onions, garlic (including powders), macadamia nuts, alcohol, caffeine, avocado, raw yeast dough, nutmeg.
- If the user describes acute symptoms (vomiting blood, seizures, collapse, suspected toxin ingestion), tell them to **call their veterinarian or the ASPCA Animal Poison Control Center (888-426-4435) immediately**, not to wait.
- For dogs on medication, flag known food/supplement interactions (e.g., warfarin + fish oil = bleeding risk; digoxin + hawthorn = altered drug levels). If you're not sure, say so and recommend confirming with their vet.
- Always note that homemade diets need supplementation to be nutritionally complete over the long term.

**Style:**
- Friendly but expert — like a vet who genuinely wants to help.
- Use Markdown (lists, numbered steps, bold) when it improves clarity. Keep responses focused — usually under ~250 words unless the question requires depth.
- Personalize using the dog profile when one is provided (name, breed, weight, conditions, allergies, medications).
- If you're genuinely uncertain, say so — but offer the closest accurate answer you can.`;

interface OpenAIChatChoice {
  message?: { role?: string; content?: string };
}

interface OpenAIChatResponse {
  choices?: OpenAIChatChoice[];
}

function buildDogContext(dog: DogProfile | null | undefined): string {
  if (!dog) return 'No dog profile is currently selected.';
  const lines: string[] = [`Name: ${dog.name}`];
  if (dog.breed) lines.push(`Breed: ${dog.breed}`);
  const ageBits: string[] = [];
  if (dog.ageYears) ageBits.push(`${dog.ageYears} yr`);
  if (dog.ageMonths) ageBits.push(`${dog.ageMonths} mo`);
  if (ageBits.length) lines.push(`Age: ${ageBits.join(' ')}`);
  lines.push(`Weight: ${dog.weightLbs} lbs${dog.idealWeightLbs ? ` (ideal: ${dog.idealWeightLbs} lbs)` : ''}`);
  lines.push(`Life stage: ${dog.lifeStage}`);
  lines.push(`Activity: ${dog.activityLevel.replace('_', ' ')}`);
  lines.push(`Meals per day: ${dog.mealsPerDay}`);
  if (dog.allergies?.length) lines.push(`Known allergies: ${dog.allergies.join(', ')}`);
  if (dog.avoidFoods?.length) lines.push(`Foods to avoid: ${dog.avoidFoods.join(', ')}`);
  if (dog.medications?.length) lines.push(`Current medications: ${dog.medications.join(', ')}`);
  if (dog.favoriteProteins?.length) lines.push(`Favorite proteins: ${dog.favoriteProteins.join(', ')}`);
  if (dog.texturePreference) lines.push(`Texture preference: ${dog.texturePreference.replace('_', ' ')}`);
  if (dog.pickyEater) lines.push('Note: picky eater');
  return `Dog profile:\n${lines.map(l => `- ${l}`).join('\n')}`;
}

function trimHistory(messages: readonly ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_HISTORY_MESSAGES) return [...messages];
  return messages.slice(messages.length - MAX_HISTORY_MESSAGES);
}

async function callLlm(
  apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat completion failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('Chat completion response did not contain content');
  }
  // Some models (e.g. Gemma) emit a `<thought>…</thought>` reasoning block
  // before the final answer. Strip it so the chat shows only the answer.
  const cleaned = raw.replace(/<thought>[\s\S]*?<\/thought>\s*/g, '').trim();
  return cleaned || raw;
}

export interface ChatRequest {
  history: readonly ChatMessage[];
  userMessage: string;
  dogProfile?: DogProfile | null;
}

export async function chatWithAssistant({ history, userMessage, dogProfile }: ChatRequest): Promise<string> {
  // Fall back to rule-based responses when no LLM key is configured (dev mode,
  // or deploys without the env var set). Caller gets a usable answer either way.
  if (!API_KEY) {
    return getFallbackAssistantResponse(userMessage, {
      dogName: dogProfile?.name,
      dogWeightLbs: dogProfile?.weightLbs,
    });
  }

  const systemContent = `${SYSTEM_PROMPT}\n\n---\n\n${buildDogContext(dogProfile ?? null)}`;
  const trimmed = trimHistory(history);

  const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemContent },
    ...trimmed.map(m => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    return await callLlm(apiMessages);
  } catch (error) {
    console.error('[assistantChat] LLM call failed, using fallback', error);
    return getFallbackAssistantResponse(userMessage, {
      dogName: dogProfile?.name,
      dogWeightLbs: dogProfile?.weightLbs,
    });
  }
}
