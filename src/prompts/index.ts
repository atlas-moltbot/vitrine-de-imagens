import { PromptTemplate } from "../../types";
import { ECOMMERCE_PROMPTS } from "./ecommerce"; 
import { PRESETS_PROMPTS } from "./presets";
import { PRECISION_PRESETS } from "./precision";
import { PRODUCT_PRESETS } from "./product";
import { FILTERS } from "./filters";

export { PRECISION_PRESETS, PRODUCT_PRESETS, FILTERS, ECOMMERCE_PROMPTS, PRESETS_PROMPTS };

// Combina todos os prompts em uma lista única
export const ALL_PROMPTS: PromptTemplate[] = [
  ...ECOMMERCE_PROMPTS,
  ...PRESETS_PROMPTS
];
