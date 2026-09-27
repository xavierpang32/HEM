import { copy } from "@/lib/wardrobe/copy";

export function useCopy() {
  return { lang: "en" as const, c: copy.en };
}
