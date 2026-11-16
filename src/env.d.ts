/// <reference types="vite/client" />

// Typed environment variables. Set them in .env (see .env.example).
interface ImportMetaEnv {
  /** Base URL of the Ubian API, e.g. https://api.example.com. Empty = use the mock API. */
  readonly VITE_API_URL?: string
  /** Force the mock API on or off ("true" / "false"). Default: on when VITE_API_URL is empty. */
  readonly VITE_USE_MOCK_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
