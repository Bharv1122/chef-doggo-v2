/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // OpenAI-compatible LLM endpoint used by both recipe image generation and
  // the Chef Doggo chat. Defaults point at Abacus.AI's RouteLLM for images,
  // but the chat (and any other text use) can point at any provider that
  // speaks the chat-completions shape (Google AI Studio, OpenAI, OpenRouter).
  readonly VITE_LLM_API_KEY?: string;
  readonly VITE_LLM_BASE_URL?: string;
  readonly VITE_LLM_TEXT_MODEL?: string;
  readonly VITE_LLM_IMAGE_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
