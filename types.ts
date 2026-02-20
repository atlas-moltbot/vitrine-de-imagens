export enum AppMode {
  HOME = 'HOME',
  ANALYZE_EDIT = 'ANALYZE_EDIT',
  GENERATE = 'GENERATE',
  PRODUCT_EDIT = 'PRODUCT_EDIT',
  LIBRARY = 'LIBRARY',
  SETTINGS = 'SETTINGS',
  REGISTER = 'REGISTER',
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K',
}

export enum AspectRatio {
  RATIO_1_1 = '1:1',
  RATIO_3_4 = '3:4',
  RATIO_4_3 = '4:3',
  RATIO_9_16 = '9:16',
  RATIO_16_9 = '16:9',
  RATIO_2_3 = '2:3',
  RATIO_3_2 = '3:2',
  RATIO_21_9 = '21:9',
}

export interface AnalysisResult {
  description: string;
  objects: string[];
  mood: string;
  lighting: string;
  colors: string[];
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface GenerationConfig {
  size: ImageSize;
  aspectRatio: AspectRatio;
  prompt: string;
  product: string;
  scenarios: string[];
  styles: string[];
  lightings: string[];
}

export interface SavedConfig extends GenerationConfig {
  id: string;
  name: string;
}

export interface PromptTemplate {
  name: string;
  prompt?: string;
  category?: string;
  product: string;
  scenario: string; 
  style: string;
  lighting: string;
  gradient: string; 
}

export interface LibraryItem {
  id: string;
  url: string;
  type: 'generated' | 'edited' | 'uploaded';
  timestamp: number;
  prompt?: string;
  title?: string;
}

export interface DesignLayer {
  id: string;
  label: string;
  point: number[];
  imageUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category?: string;
  active?: boolean;
}
