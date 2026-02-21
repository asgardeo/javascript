/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASGARDEO_BASE_URL: string;
  readonly VITE_ASGARDEO_CLIENT_ID: string;
  readonly VITE_ASGARDEO_AFTER_SIGN_IN_URL?: string;
  readonly VITE_ASGARDEO_AFTER_SIGN_OUT_URL?: string;
  readonly VITE_ASGARDEO_SIGN_IN_URL?: string;
  readonly VITE_ASGARDEO_SIGN_UP_URL?: string;
  readonly VITE_ASGARDEO_APPLICATION_ID?: string;
  readonly VITE_ASGARDEO_PLATFORM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
