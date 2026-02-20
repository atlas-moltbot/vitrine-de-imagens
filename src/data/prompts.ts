export interface PromptTemplate {
  name: string;
  prompt: string;
  category: string;
  product: string;
  scenario: string;
  style: string;
  lighting: string;
  gradient: string;
}

export const IMPORTED_PROMPTS: PromptTemplate[] = [
  {
    "name": "1950s High-Fashion Editorial",
    "prompt": "Model sitting gracefully on a vintage Cream Vespa scooter, outdoor narrow European street. \r\nOutfit: Elegant white sleeveless jumpsuit, sheer silk headscarf in cream and brown tones, white strappy sandals. 1950s chic aesthetic, bright even daylight.",
    "category": "Retratos",
    "product": "Prompt Importado",
    "scenario": "Model sitting gracefully on a vintage Cream Vespa ...",
    "style": "Retratos",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Airplane Wing Adventure Selfie",
    "prompt": "{\r\n  \"image_generation\": {\r\n    \"subject\": {\r\n      \"description\": \"stylish young woman sitting on an airplane wing high above the clouds\",\r\n      \"pose\": \"seated casually on the airplane wing, one hand extended forward as if taking a selfie, relaxed but confident posture\",\r\n      \"expression\": \"calm, confident, composed\",\r\n      \"gaze\": \"looking toward the camera with a cool, self-assured expression\"\r\n    },\r\n    \"appearance\": {\r\n      \"hair\": {\"style\": \"long, natural, slightly flowing in the wind\", \"look\": \"casual and effortless\"},\r\n      \"accessories\": [\"dark sunglasses\", \"minimal jewelry\"],\r\n      \"vibe\": \"adventurous, bold, modern\"\r\n    },\r\n    \"outfit\": {\r\n      \"style\": \"sporty casual\",\r\n      \"details\": \"black hoodie, black fitted pants, clean white sneakers\"\r\n    },\r\n    \"environment\": {\r\n      \"setting\": \"high above the clouds on an airplane wing\",\r\n      \"sky\": \"clear blue sky with soft clouds below\",\r\n      \"atmosphere\": \"open, airy, dramatic aerial view\"\r\n    },\r\n    \"lighting\": {\r\n      \"type\": \"natural sunlight\",\r\n      \"style\": \"bright and cinematic\",\r\n      \"direction\": \"side lighting from the sun\",\r\n      \"quality\": \"crisp highlights with soft shadows\"\r\n    },\r\n    \"camera\": {\r\n      \"angle\": \"wide selfie-style perspective from a slightly elevated angle\",\r\n      \"lens\": \"ultra wide-angle\",\r\n      \"depth_of_field\": \"deep focus capturing both subject and vast sky background\",\r\n      \"composition\": \"dynamic, adventurous framing emphasizing height and openness\"\r\n    },\r\n    \"aesthetic\": {\r\n      \"style\": \"cinematic adventure photography\",\r\n      \"vibe\": \"bold, fearless, modern, travel lifestyle\",\r\n      \"color_grading\": \"clean cinematic tones with natural blues and soft contrast\"\r\n    }\r\n  }\r\n}",
    "category": "Retratos",
    "product": "Prompt Importado",
    "scenario": "{\r\n  \"image_generation\": {\r\n    \"subject\": {\r\n    ...",
    "style": "Retratos",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Serene Lake Portrait",
    "prompt": "Ultra-realistic, vertical 9:16 ratio: a beautiful young woman wearing a sleeveless vintage long dress in beige with soft maroon floral patterns, made of flowy and soft fabric. Her long hair is draped over the front of her chest, adorned with a large brown ribbon tied at the back of her hair. She wears glowing complexion makeup, soft pink blush, soft peach shimmer eyeshadow, and glossy red-ombre pink lipstick. She is sitting on a brown wooden boat, with a gray Angora rabbit resting gently on her lap. The background features a clear turquoise-blue lake with calm water, creating a serene atmosphere as if in the middle of a forest. Beautiful blooming lotus flowers are scattered across the water. The sky is bright blue with soft, fluffy white clouds spread gently across it. Natural daylight illumination, with sunlight falling from the upper right of the frame, creating soft shadows and vibrant colors.",
    "category": "Retratos",
    "product": "Prompt Importado",
    "scenario": "Ultra-realistic, vertical 9:16 ratio: a beautiful ...",
    "style": "Retratos",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Urban Fashion Series",
    "prompt": "Image 1: Woman sitting on the hood of a cream-colored car in a European city street, low-waist pants, long necklace with cross, silver Apple Watch, natural daytime light.\r\nImage 2: Woman standing, crossing a modern city street, holding a can of Coke, looking away from camera, street fashion style, strong midday sun with clear shadows.\r\nImage 3: Woman leaning against a black railing in a street art-style alley with orange cabinets and graffiti, relaxed expression, raw and realistic atmosphere.",
    "category": "Retratos",
    "product": "Prompt Importado",
    "scenario": "Image 1: Woman sitting on the hood of a cream-colo...",
    "style": "Retratos",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Winter Fairy-Tale Portrait",
    "prompt": "{\r\n  \"portrait_prompt\": {\r\n    \"subject\": {\r\n      \"description\": \"young woman standing on a wooden rope swing in deep snow, head gently tilted to the right resting against her white knitted gloves gripping the rope near her face, eyes softly closed with a serene peaceful expression, subtle smile, long black hair falling naturally past shoulders\",\r\n      \"pose\": \"standing upright on wooden swing plank, both hands in white knitted gloves gripping the thick hemp rope at face height, head tilted right resting against knuckles, elegant standing-swing pose\"\r\n    },\r\n    \"attire\": {\r\n      \"details\": [\r\n        \"white short puffy down jacket with stand collar\",\r\n        \"white/cream high-neck knit base layer\",\r\n        \"Nordic Fair-Isle pattern knitted scarf in white and black geometric design\",\r\n        \"white fluffy-trim snow boots\"\r\n      ],\r\n      \"color\": \"Monochrome all-white / cream coordination\"\r\n    },\r\n    \"composition\": {\r\n      \"shot_type\": \"Full body portrait with complete swing visible\",\r\n      \"focal_length\": \"40-50mm equivalent\",\r\n      \"aperture\": \"f/4 to f/5.6\",\r\n      \"aspect_ratio\": \"3:4 vertical\"\r\n    },\r\n    \"lighting\": {\r\n      \"type\": \"High-altitude bright natural sunlight\",\r\n      \"mood\": \"High-key, clean, luminous skin\"\r\n    },\r\n    \"environment\": {\r\n      \"setting\": \"Remote snow village in mountainous region (Xinjiang Hemu style)\",\r\n      \"background\": \"snow-capped mountains, blue sky, wooden fences\"\r\n    }\r\n  }\r\n}",
    "category": "Retratos",
    "product": "Prompt Importado",
    "scenario": "{\r\n  \"portrait_prompt\": {\r\n    \"subject\": {\r\n     ...",
    "style": "Retratos",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Cozy Bedroom Lifestyle",
    "prompt": "Young adult blonde woman sitting comfortably on a neatly made bed, white and cream color palette. \r\nOutfit: white short-sleeve cotton shirt tied at waist, light-wash high-waisted jeans. \r\nEnvironment: bright, cozy bedroom with soft natural light streaming through sheer curtains, 50mm f/1.8 lens, creamy bokeh background.",
    "category": "Arquitetura",
    "product": "Prompt Importado",
    "scenario": "Young adult blonde woman sitting comfortably on a ...",
    "style": "Arquitetura",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Modern Recipe Infographic",
    "prompt": "Ultra-clean modern recipe infographic. Subject: Noodles. Dynamic editorial layout with ingredients, steps, and tips arranged around the dish. \r\nVisual Style: Editorial food photography meets lifestyle design. Vibrant colors, glassmorphism step panels, clean vector icons. 1080x1080 resolution.",
    "category": "Conteúdo",
    "product": "Prompt Importado",
    "scenario": "Ultra-clean modern recipe infographic. Subject: No...",
    "style": "Conteúdo",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  },
  {
    "name": "Editorial Doll-Style Portrait Collage",
    "prompt": "Size 9:16. Photo collage consisting of four close-up portraits of the same woman arranged in a 2x2 grid. \r\nSubject: perfectly smooth, luminous, pale skin. Makeup: light pink blush intensely applied from cheeks to under eyes, dramatic rosy cheeks effect. Lips: rosy pink lip color with high-gloss sheen.\r\nHairstyle: Ash brown hair with precise center parting, ribbon-shaped pleats at base, tight braids with silver metallic star motifs.\r\nAccessories: Rimless glasses with silver metal thorn-shaped ornaments, large crystal cluster earrings.\r\nLighting: Bright, even studio lighting from front and above. Background: plain white wall or fabric.",
    "category": "Avançado",
    "product": "Prompt Importado",
    "scenario": "Size 9:16. Photo collage consisting of four close-...",
    "style": "Avançado",
    "lighting": "Natural",
    "gradient": "from-gray-700 to-gray-900"
  }
];
