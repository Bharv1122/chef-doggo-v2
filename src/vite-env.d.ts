/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ABACUS_API_KEY?: string;
  readonly VITE_ABACUS_ROUTELLM_BASE_URL?: string;
  readonly VITE_ABACUS_IMAGE_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
