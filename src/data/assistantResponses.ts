import type { AssistantIntent } from '../types/assistant';

// ── Intent detection ─────────────────────────────────────────────────────────
// Replace getAssistantResponse() body with a real API call when ready
const INTENT_KEYWORDS: Record<AssistantIntent, string[]> = {
  food_question: ['can dogs eat', 'safe for dogs', 'is it ok', 'can i feed', 'what foods', 'good for dogs'],
  substitution: ['substitute', 'replace', 'swap', 'instead of', 'alternative', 'change', 'swap out'],
  calculation: ['how much', 'how many cups', 'how many grams', 'portion', 'serving size', 'calories', 'amount'],
  batch_scaling: ['double', 'triple', 'scale', 'batch', 'make more', 'multiply', 'week worth', 'freeze'],
  shopping: ['shopping list', 'buy', 'store', 'grocery', 'purchase', 'ingredient list'],
  supplement: ['supplement', 'calcium', 'omega', 'vitamin', 'fish oil', 'probiotic', 'joint'],
  safety: ['toxic', 'dangerous', 'safe', 'poison', 'harm', 'bad for dogs', 'avoid', 'not safe'],
  treat_idea: ['treat', 'snack', 'dessert', 'birthday', 'frozen', 'lick mat', 'kong', 'reward'],
  cooking_help: ['cook', 'bake', 'boil', 'temperature', 'how long', 'internal temp', 'prep', 'thaw', 'store'],
  general: [],
};

export function detectIntent(message: string): AssistantIntent {
  const lower = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [AssistantIntent, string[]][]) {
    if (intent === 'general') continue;
    if (keywords.some(k => lower.includes(k))) return intent;
  }
  return 'general';
}

// ── Response templates ────────────────────────────────────────────────────────
// {dogName} and {weight} are replaced at runtime
const RESPONSES: Record<AssistantIntent, string[]> = {
  food_question: [
    'Great question! Many whole foods are safe for dogs — things like plain cooked chicken, rice, carrots, green beans, sweet potato, and pumpkin are staples. Always avoid the big no-nos: chocolate, grapes, raisins, onion, garlic, and xylitol. If you\'re curious about a specific food, just ask and I\'ll let you know!',
    'Most lean proteins (chicken, turkey, beef, fish), cooked whole grains, and dog-safe vegetables are great building blocks. The key is keeping everything plain — no seasoning, no salt, no sauces. What ingredient were you wondering about?',
    'I\'d love to help with that! As a general rule, if it\'s a whole, plain food without spices or additives, there\'s a good chance it\'s dog-safe. But some foods that are fine for humans (grapes, onions, garlic) are toxic to dogs. Tell me what you\'re thinking of and I\'ll check it for you.',
  ],
  substitution: [
    'Happy to help with a swap! Most proteins can be exchanged 1:1 by weight — so if a recipe calls for chicken, turkey or whitefish works the same way. For carbs, rice, oats, and sweet potato are interchangeable in similar amounts. What are you looking to swap?',
    'Good news — homemade recipes are very flexible! If you\'re out of an ingredient or your pup has a preference, I can suggest safe alternatives. Just tell me what you want to replace and I\'ll give you a few options.',
    'Substitutions are totally fine as long as you run safety checks (I do that automatically). Common swaps: chicken ↔ turkey, rice ↔ oats, carrots ↔ green beans, pumpkin ↔ sweet potato. What\'s the swap you have in mind?',
  ],
  calculation: [
    'For a rough estimate, most adult dogs need about 2–3% of their body weight in food per day. So a 30-lb dog needs roughly 9–14 oz of food daily. Puppies need about double that, and seniors a bit less. My calculator tool gives you a more precise breakdown — want me to walk you through it?',
    'Food amounts depend on your dog\'s weight, life stage, and activity level. The formula I use starts with Resting Energy Requirement and adjusts from there. For a quick estimate: multiply your dog\'s weight in lbs by 0.6–0.8 to get daily food in ounces. But the built-in calculator gives you ingredient-by-ingredient amounts!',
    'Great question! Portion sizes for homemade food vary by recipe (since fat content changes calorie density). Generally, you\'re aiming to meet daily calorie needs — which I calculate based on weight and activity. Want me to run the numbers for your dog?',
  ],
  batch_scaling: [
    'Batch cooking is one of my favorite features! To scale a recipe, just multiply every ingredient by the factor you want (2x, 3x, etc.) and adjust the cooking time slightly for larger pots. Storage: cooked homemade food keeps 3–4 days in the fridge or up to 3 months in the freezer.',
    'Scaling up is simple! The recipe builder has 1x, 2x, 3x, and 4x options built in. For a 7-day batch, I\'d recommend splitting it: keep 3–4 days in the fridge and freeze the rest in individual meal portions. Thaw overnight in the fridge before serving.',
    'For weekly batch cooking, I recommend making 7 days\' worth at once, portioning into individual meal containers, fridging 3–4 days\' worth and freezing the rest. The "Cook Once, Feed All Week" mode handles all the math — want to try it?',
  ],
  shopping: [
    'Every recipe I generate includes a shopping list broken down by category: proteins, produce, pantry staples, and supplements. You can view it on the recipe detail page. The list shows grocery-friendly quantities like "about 2 lbs chicken" so it\'s easy to shop.',
    'I generate shopping lists automatically with each recipe! They include everything you need, with amounts written the way you\'d actually buy them at the store. If you want a combined list for the week, the batch cooking mode handles that too.',
    'Shopping lists are included with every recipe — look for the shopping cart icon on any recipe page. It groups items by category and rounds amounts up to sensible grocery units.',
  ],
  supplement: [
    'Homemade diets almost always need supplementation to be complete. The big ones are: (1) a calcium source (eggshell powder or calcium carbonate), (2) omega-3s (fish oil), and (3) a canine multivitamin designed for homemade diets. Optional additions include probiotics and joint support. Always confirm amounts with your vet!',
    'Great question — supplements are one of the most important parts of homemade feeding. Without them, even a great recipe can be nutritionally incomplete over time. The supplement checklist on each full-meal recipe gives educational estimates, but your vet or a veterinary nutritionist should confirm the right amounts for your specific dog.',
    'The core supplements for homemade feeding are calcium, omega-3 fatty acids (EPA/DHA from fish oil), and usually a canine multivitamin. The exact amounts depend on your dog\'s weight, age, and the specific recipe. I always recommend running your supplement plan by a vet before starting.',
  ],
  safety: [
    'Safety first! The foods I hard-block are: chocolate, grapes, raisins, onion, garlic (including powders), xylitol, macadamia nuts, alcohol, caffeine, avocado, raw yeast dough, and nutmeg. I check every recipe for these automatically. If you\'re wondering about a specific ingredient, just ask!',
    'I run a safety check on every recipe before showing it to you. Hard-blocked toxic foods are never included. I also watch for risky things like onion powder, garlic powder, and pumpkin pie filling (which is not the same as plain pumpkin!). Is there a specific ingredient you\'re concerned about?',
    'The biggest dangers in homemade dog food are: using the wrong seasoning (garlic/onion powder are often in spice blends), using sweetened or flavored products (pumpkin pie filling, flavored yogurt, peanut butter with xylitol), and not providing enough calcium. Always read labels!',
  ],
  treat_idea: [
    'Treats are so fun! Some easy ideas: frozen banana and peanut butter bites, pumpkin and oat training treats, blueberry and Greek yogurt lick mat fillers, or a simple birthday bowl with plain chicken, rice, carrots, and a dollop of peanut butter. Want a full recipe?',
    'For frozen treats, try blending plain Greek yogurt + banana + peanut butter (xylitol-free!) and freezing in silicone molds. For training treats, oat-based baked biscuits are easy to make and store well. The Desserts & Treats section has lots of ideas!',
    'Lick mat ideas: plain Greek yogurt, pumpkin puree, mashed banana, peanut butter (xylitol-free), and apple slices all work great. You can mix and match! For occasion bowls, a birthday bowl is usually a regular meal dressed up with a "frosting" of Greek yogurt and a blueberry topper.',
  ],
  cooking_help: [
    'For homemade dog food, the key cooking rules are: cook all proteins to safe internal temperatures (165°F for poultry, 160°F for beef), use no seasoning or salt, drain excess fat, and cool completely before mixing with supplements or serving. Store in airtight containers.',
    'Here\'s a simple batch cooking flow: (1) Cook protein fully — bake or boil is easiest. (2) Cook grains separately. (3) Steam or boil vegetables until soft. (4) Mix together when cooled. (5) Add fish oil and supplements after cooling (heat degrades them). (6) Portion and store.',
    'Reheating tip: always thaw frozen portions in the fridge overnight, never in the microwave (uneven heating can create hot spots and degrade nutrients). Serve at room temperature or slightly warm — dogs generally prefer it that way!',
  ],
  general: [
    'Hi there! I\'m Chef Doggo, your homemade dog food assistant. I can help you with recipes, portion sizes, ingredient substitutions, supplement guidance, batch cooking, treat ideas, and food safety. What can I help you with today?',
    'Happy to help! Whether you have questions about ingredients, cooking methods, portions, supplements, or just need some recipe inspiration — I\'m here. What\'s on your mind?',
    'Great question! I\'m still learning the best way to answer that one. In the meantime, I can help with recipes, portions, substitutions, treat ideas, batch cooking, and safety checks. What would be most helpful?',
  ],
};

// ── Public API ────────────────────────────────────────────────────────────────

export interface AssistantContext {
  dogName?: string;
  dogWeightLbs?: number;
  activeRecipeName?: string;
}

// REPLACE THIS FUNCTION BODY with a real API call (Claude, OpenAI, etc.)
export async function getAssistantResponse(
  userMessage: string,
  context: AssistantContext
): Promise<string> {
  const intent = detectIntent(userMessage);
  const pool = RESPONSES[intent];
  const template = pool[Math.floor(Math.random() * pool.length)];

  return template
    .replace(/\{dogName\}/g, context.dogName ?? 'your pup')
    .replace(/\{weight\}/g, context.dogWeightLbs ? `${context.dogWeightLbs} lbs` : 'their weight');
}

export const SUGGESTED_PROMPTS = [
  'What foods are safe for dogs?',
  'How much should I feed my dog?',
  'What supplements does a homemade diet need?',
  'Can you give me a treat recipe?',
  'How do I store homemade dog food?',
  'What can I substitute for chicken?',
  'Is pumpkin good for dogs?',
  'How do I batch cook for the week?',
];
