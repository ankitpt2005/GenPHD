import { getPublicRuntimeConfig } from "../lib/supabase/config";

function serializeRuntimeConfig() {
  return JSON.stringify(getPublicRuntimeConfig())
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function PublicRuntimeConfig() {
  return <script dangerouslySetInnerHTML={{ __html: `window.__GENPHD_PUBLIC_CONFIG__=${serializeRuntimeConfig()};` }} id="genphd-public-runtime-config" />;
}
