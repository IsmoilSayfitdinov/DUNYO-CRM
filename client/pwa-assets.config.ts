import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      padding: 0.35,
      resizeOptions: { background: "#dc2626", fit: "contain" },
    },
    apple: {
      ...preset.apple,
      padding: 0.2,
      resizeOptions: { background: "#dc2626", fit: "contain" },
    },
  },
  images: ["public/logo.svg"],
});
