import type { SpaceData } from './types';
import { v4 as uuidv4 } from 'uuid';

const AXIS_1_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-1';
const AXIS_2_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-2';
const AXIS_3_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-3';
const AXIS_4_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-4';
const AXIS_5_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-5';
const AXIS_6_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-6';
const AXIS_7_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-7';
const AXIS_8_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-8';
const AXIS_9_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef-9';

export const INITIAL_DATA: SpaceData = {
  axes: [
    { id: AXIS_1_ID, name: 'Amount of Fine Details', description: '1 for none (minimalism), 10 for photorealistic.', color: '#34d399' },
    { id: AXIS_2_ID, name: 'Number of Colors', description: '1 for monochrome, 10 for psychedelic or photorealistic.', color: '#60a5fa' },
    { id: AXIS_3_ID, name: 'Color Saturation', description: 'The intensity of colors, from muted to vibrant.', color: '#facc15' },
    { id: AXIS_4_ID, name: 'Lighting Level', description: 'Overall brightness, from dark and moody to bright and airy.', color: '#f87171' },
    { id: AXIS_5_ID, name: 'Textural Quality', description: 'The degree of surface texture, from smooth (flat design) to rough (grunge).', color: '#a78bfa' },
    { id: AXIS_6_ID, name: 'Abstract vs. Representational', description: '1 for purely representational, 10 for purely abstract.', color: '#fb923c' },
    { id: AXIS_7_ID, name: 'Geometric vs. Organic', description: '1 for purely organic shapes, 10 for purely geometric shapes.', color: '#4ade80' },
    { id: AXIS_8_ID, name: 'Dynamic vs. Static', description: 'The sense of motion or stillness in the composition.', color: '#f472b6' },
    { id: AXIS_9_ID, name: 'Emotional Tone (Calm vs. Energetic)', description: 'The overall mood, from calm and serene to energetic and chaotic.', color: '#67e8f9' },
  ],
  styles: [
    {
      id: "4bd36dfb-794a-43de-9491-919182d9e320", name: "ASCII-арт",
      description: "A graphic design technique using printable characters from the ASCII standard to create images. Often monochrome and blocky.",
      scores: { [AXIS_1_ID]: 2, [AXIS_2_ID]: 1, [AXIS_3_ID]: 1, [AXIS_4_ID]: 5, [AXIS_5_ID]: 1, [AXIS_6_ID]: 3, [AXIS_7_ID]: 9, [AXIS_8_ID]: 3, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "1998bc96-b4f8-4684-95d7-68a247cb8253", name: "CRT/сканлайн",
      description: "An aesthetic that mimics old Cathode Ray Tube screens, characterized by horizontal lines (scanlines), pixelation, and color bleed.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 4, [AXIS_3_ID]: 6, [AXIS_4_ID]: 4, [AXIS_5_ID]: 8, [AXIS_6_ID]: 4, [AXIS_7_ID]: 8, [AXIS_8_ID]: 6, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "eb1f94d1-0c0f-4a02-a19e-e3350eb147cb", name: "Claymation (клеймейшн)",
      description: "A stop-motion animation technique using posable figures made of a malleable material like plasticine clay.",
      scores: { [AXIS_1_ID]: 4, [AXIS_2_ID]: 7, [AXIS_3_ID]: 7, [AXIS_4_ID]: 5, [AXIS_5_ID]: 8, [AXIS_6_ID]: 2, [AXIS_7_ID]: 3, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "244436e4-7594-4da0-b03d-a05a5a8ec0a4", name: "NPR-шейдинг",
      description: "Non-Photorealistic Rendering is a computer graphics style that focuses on artistic, stylized looks rather than realism. Often mimics painting or illustration.",
      scores: { [AXIS_1_ID]: 4, [AXIS_2_ID]: 2, [AXIS_3_ID]: 4, [AXIS_4_ID]: 5, [AXIS_5_ID]: 3, [AXIS_6_ID]: 3, [AXIS_7_ID]: 5, [AXIS_8_ID]: 5, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "ea91d89f-6da8-4634-be3a-42f469b9067a", name: "Абстракционизм",
      description: "Art that does not attempt to represent an accurate depiction of a visual reality but instead uses shapes, colours, forms and gestural marks to achieve its effect.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 7, [AXIS_3_ID]: 8, [AXIS_4_ID]: 7, [AXIS_5_ID]: 4, [AXIS_6_ID]: 9, [AXIS_7_ID]: 6, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "10bdcf9a-4cd5-494a-bb63-7fbc32b6ca52", name: "Авангард",
      description: "Represents a push into new and experimental ideas in art, often characterized by unconventional forms and bold colors.",
      scores: { [AXIS_1_ID]: 3, [AXIS_2_ID]: 9, [AXIS_3_ID]: 9, [AXIS_4_ID]: 7, [AXIS_5_ID]: 4, [AXIS_6_ID]: 8, [AXIS_7_ID]: 8, [AXIS_8_ID]: 8, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "269251e5-ec62-4854-8b5e-4556968cdc61", name: "Арт-брют",
      description: "French for 'raw art,' it's art created outside the boundaries of official culture by self-taught or naive art makers.",
      scores: { [AXIS_1_ID]: 3, [AXIS_2_ID]: 7, [AXIS_3_ID]: 6, [AXIS_4_ID]: 5, [AXIS_5_ID]: 9, [AXIS_6_ID]: 6, [AXIS_7_ID]: 2, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "c9fe7158-c36d-4770-8dab-cbdb4ec06fba", name: "Ар-нуво",
      description: "An ornamental style of art characterized by its use of long, sinuous, organic lines and floral or plant-inspired motifs.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 9, [AXIS_3_ID]: 7, [AXIS_4_ID]: 7, [AXIS_5_ID]: 6, [AXIS_6_ID]: 3, [AXIS_7_ID]: 2, [AXIS_8_ID]: 4, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "94dd20ec-d3b1-407f-a5cc-ece297f25559", name: "Ар-деко",
      description: "A style of visual arts that combines traditional craft motifs with Machine Age imagery and materials. Characterized by rich colors, bold geometry, and decadent detail work.",
      scores: { [AXIS_1_ID]: 4, [AXIS_2_ID]: 7, [AXIS_3_ID]: 8, [AXIS_4_ID]: 4, [AXIS_5_ID]: 5, [AXIS_6_ID]: 4, [AXIS_7_ID]: 9, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "6df09344-b06e-4cc7-a311-4719c52ae5c5", name: "Барокко",
      description: "A highly ornate and often extravagant style of architecture, art and music that flourished in Europe from the early 17th until the mid-18th century.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 7, [AXIS_3_ID]: 7, [AXIS_4_ID]: 4, [AXIS_5_ID]: 7, [AXIS_6_ID]: 2, [AXIS_7_ID]: 3, [AXIS_8_ID]: 9, [AXIS_9_ID]: 9 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "c0d7b6e6-650e-4dd1-a669-f464c8764328", name: "Баухауз",
      description: "A German art school operational from 1919 to 1933 that combined crafts and the fine arts, famous for its approach to design which attempted to unify mass production with individual artistic vision.",
      scores: { [AXIS_1_ID]: 2, [AXIS_2_ID]: 7, [AXIS_3_ID]: 8, [AXIS_4_ID]: 7, [AXIS_5_ID]: 2, [AXIS_6_ID]: 8, [AXIS_7_ID]: 10, [AXIS_8_ID]: 2, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "f6b49778-dc53-46f6-ac0a-7b519bd24b4d", name: "Брутализм",
      description: "An architectural style characterized by massive, monolithic and 'blocky' appearance with a rigid geometric style and large-scale use of poured concrete.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 3, [AXIS_3_ID]: 2, [AXIS_4_ID]: 5, [AXIS_5_ID]: 10, [AXIS_6_ID]: 9, [AXIS_7_ID]: 10, [AXIS_8_ID]: 2, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "f6a332eb-a44e-4428-8a76-489f15ff28a2", name: "Вапорвейв",
      description: "A microgenre of electronic music and an Internet meme that emerged in the early 2010s. Its visual style often includes classical statues, 90s web design, and glitch art.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 10, [AXIS_3_ID]: 9, [AXIS_4_ID]: 7, [AXIS_5_ID]: 3, [AXIS_6_ID]: 7, [AXIS_7_ID]: 5, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "8e2d2908-4d1d-4926-ab3b-c067d9ef413a", name: "Витраж",
      description: "The art of stained glass, where colored glass is used to create pictures or patterns in windows or other structures.",
      scores: { [AXIS_1_ID]: 3, [AXIS_2_ID]: 10, [AXIS_3_ID]: 9, [AXIS_4_ID]: 6, [AXIS_5_ID]: 7, [AXIS_6_ID]: 3, [AXIS_7_ID]: 7, [AXIS_8_ID]: 2, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "c5c17cbb-fe1d-4c08-92c0-748b3f414f0a", name: "Воксел-арт",
      description: "Art created using voxels (volumetric pixels), the 3D equivalent of pixels. It often results in a blocky, 3D pixelated look.",
      scores: { [AXIS_1_ID]: 3, [AXIS_2_ID]: 8, [AXIS_3_ID]: 8, [AXIS_4_ID]: 8, [AXIS_5_ID]: 3, [AXIS_6_ID]: 4, [AXIS_7_ID]: 10, [AXIS_8_ID]: 3, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "57095190-5e40-47f4-afb9-a02ce22b2a67", name: "Гиперреализм",
      description: "A genre of painting and sculpture resembling a high-resolution photograph. Hyperrealism is considered an advancement of Photorealism.",
      scores: { [AXIS_1_ID]: 10, [AXIS_2_ID]: 5, [AXIS_3_ID]: 6, [AXIS_4_ID]: 5, [AXIS_5_ID]: 9, [AXIS_6_ID]: 1, [AXIS_7_ID]: 4, [AXIS_8_ID]: 2, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "25ca5d0c-bc31-4a0c-b9fa-2d5a0109c248", name: "Глитч-Арт",
      description: "The aestheticization of digital or analog errors, such as artifacts and other 'bugs,' for artistic purposes.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 9, [AXIS_3_ID]: 10, [AXIS_4_ID]: 6, [AXIS_5_ID]: 9, [AXIS_6_ID]: 7, [AXIS_7_ID]: 7, [AXIS_8_ID]: 9, [AXIS_9_ID]: 9 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "84556298-6d3d-4eff-95cc-088f4e70dff9", name: "Готика",
      description: "A style of medieval art that developed in Northern France out of Romanesque art in the 12th century AD, characterized by pointed arches, ribbed vaults, and flying buttresses.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 5, [AXIS_3_ID]: 4, [AXIS_4_ID]: 5, [AXIS_5_ID]: 5, [AXIS_6_ID]: 2, [AXIS_7_ID]: 8, [AXIS_8_ID]: 3, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "b5ac7b70-9d34-4f9b-9779-e0aa5fe15e8e", name: "Гравюра (обобщённо)",
      description: "The practice of incising a design onto a hard, usually flat surface by cutting grooves into it. Often involves monochrome and fine line work.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 2, [AXIS_3_ID]: 2, [AXIS_4_ID]: 3, [AXIS_5_ID]: 8, [AXIS_6_ID]: 2, [AXIS_7_ID]: 4, [AXIS_8_ID]: 4, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "add9987c-239e-4461-afac-427c29485111", name: "Гранж",
      description: "An aesthetic characterized by a dirty, worn, and textured look. Often includes distressed elements, muted colors, and a sense of decay.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 6, [AXIS_3_ID]: 4, [AXIS_4_ID]: 4, [AXIS_5_ID]: 10, [AXIS_6_ID]: 4, [AXIS_7_ID]: 3, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "c3249c43-bc8f-4fa0-b860-95506dd24f60", name: "Дадаизм",
      description: "An early 20th-century avant-garde movement characterized by anti-art, absurdity, and collage. It rejected logic and reason.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 4, [AXIS_3_ID]: 3, [AXIS_4_ID]: 4, [AXIS_5_ID]: 7, [AXIS_6_ID]: 8, [AXIS_7_ID]: 5, [AXIS_8_ID]: 8, [AXIS_9_ID]: 9 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "3e2d63ca-e7be-428a-98b0-a879517ea964", name: "Датамош",
      description: "The process of manipulating the data of media files to achieve visual or auditory effects when the file is decoded.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 8, [AXIS_3_ID]: 9, [AXIS_4_ID]: 7, [AXIS_5_ID]: 10, [AXIS_6_ID]: 8, [AXIS_7_ID]: 8, [AXIS_8_ID]: 10, [AXIS_9_ID]: 10 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "34ac3089-1171-4f4c-af33-733f53fe1e91", name: "Деконструктивизм",
      description: "A movement of postmodern architecture which appeared in the 1980s. It gives the impression of the fragmentation of the constructed building.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 4, [AXIS_3_ID]: 3, [AXIS_4_ID]: 6, [AXIS_5_ID]: 5, [AXIS_6_ID]: 10, [AXIS_7_ID]: 9, [AXIS_8_ID]: 7, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "36879f46-9b56-4735-b39c-78a01331bdd5", name: "Дизельпанк",
      description: "Similar to steampunk, but based on the aesthetics of the interwar period through to the 1950s. Think diesel-powered machinery and Art Deco design.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 5, [AXIS_3_ID]: 5, [AXIS_4_ID]: 5, [AXIS_5_ID]: 8, [AXIS_6_ID]: 2, [AXIS_7_ID]: 6, [AXIS_8_ID]: 6, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "bad3d733-ce4a-4da1-88d5-6a6059a48616", name: "Дримкор",
      description: "An aesthetic that revolves around dreams, surrealism, and nostalgia. Often features soft, hazy visuals and pastel colors.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 7, [AXIS_3_ID]: 6, [AXIS_4_ID]: 7, [AXIS_5_ID]: 6, [AXIS_6_ID]: 5, [AXIS_7_ID]: 3, [AXIS_8_ID]: 2, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "98d3933a-00e4-4ac8-a199-8c4295fcd29b", name: "Живопись маслом",
      description: "The process of painting with pigments with a medium of drying oil as the binder. Known for rich colors and visible brush textures.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 9, [AXIS_3_ID]: 8, [AXIS_4_ID]: 7, [AXIS_5_ID]: 9, [AXIS_6_ID]: 2, [AXIS_7_ID]: 4, [AXIS_8_ID]: 5, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "b052ef1b-b9be-44d4-bb04-85d2c96d1a6a", name: "Изометрия",
      description: "A method for visually representing three-dimensional objects in two dimensions in technical and engineering drawings.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 7, [AXIS_3_ID]: 7, [AXIS_4_ID]: 5, [AXIS_5_ID]: 5, [AXIS_6_ID]: 2, [AXIS_7_ID]: 10, [AXIS_8_ID]: 3, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "28e29912-2608-48a9-b153-66f06360513e", name: "Акварель-арт",
      description: "A painting method in which the paints are made of pigments suspended in a water-based solution. Known for its transparency and luminosity.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 8, [AXIS_3_ID]: 6, [AXIS_4_ID]: 9, [AXIS_5_ID]: 8, [AXIS_6_ID]: 3, [AXIS_7_ID]: 2, [AXIS_8_ID]: 4, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "a35239b8-8bd9-4b7d-b9b7-5d67ebb81796", name: "Гуашь-арт",
      description: "A method of painting using opaque pigments ground in water and thickened with a glue-like substance. It has a matte finish.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 9, [AXIS_3_ID]: 8, [AXIS_4_ID]: 8, [AXIS_5_ID]: 8, [AXIS_6_ID]: 3, [AXIS_7_ID]: 3, [AXIS_8_ID]: 5, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "bbe402c8-79b2-4d83-97a3-d74014829477", name: "Импрессионизм",
      description: "A 19th-century art movement characterized by relatively small, thin, yet visible brush strokes and an accurate depiction of light.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 10, [AXIS_3_ID]: 8, [AXIS_4_ID]: 7, [AXIS_5_ID]: 8, [AXIS_6_ID]: 3, [AXIS_7_ID]: 2, [AXIS_8_ID]: 6, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "1d74ce5f-a5ad-4668-9dbc-048b749e2208", name: "Инфракрасная съёмка",
      description: "A photographic technique where the film or image sensor used is sensitive to infrared light, resulting in false-color or black-and-white images with a dreamlike quality.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 2, [AXIS_3_ID]: 5, [AXIS_4_ID]: 6, [AXIS_5_ID]: 7, [AXIS_6_ID]: 2, [AXIS_7_ID]: 3, [AXIS_8_ID]: 2, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "82428b20-fa5f-44b9-ab9c-d171dd20f68f", name: "Исламская геометрия",
      description: "Characterized by the use of intricate geometric patterns which are often repeated and tessellated.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 7, [AXIS_3_ID]: 7, [AXIS_4_ID]: 5, [AXIS_5_ID]: 5, [AXIS_6_ID]: 10, [AXIS_7_ID]: 10, [AXIS_8_ID]: 2, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "84f35297-beca-46dc-abb0-6be6cb1bfa7a", name: "Киберпанк",
      description: "A subgenre of science fiction in a futuristic setting that tends to focus on a 'combination of low-life and high tech'.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 9, [AXIS_3_ID]: 9, [AXIS_4_ID]: 5, [AXIS_5_ID]: 6, [AXIS_6_ID]: 2, [AXIS_7_ID]: 7, [AXIS_8_ID]: 8, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "2f81163a-9c07-4416-acdd-5e35863ab8cd", name: "Клуазоне",
      description: "An ancient technique for decorating metalwork objects with colored material held in place or separated by metal strips or wire, normally of gold.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 8, [AXIS_3_ID]: 9, [AXIS_4_ID]: 5, [AXIS_5_ID]: 9, [AXIS_6_ID]: 4, [AXIS_7_ID]: 5, [AXIS_8_ID]: 3, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "17e53e44-b1d8-41fd-80df-d268cf7a41bb", name: "Коллаж",
      description: "Artwork made from an assemblage of different forms, thus creating a new whole. A collage may sometimes include magazine and newspaper clippings, ribbons, paint, bits of colored or handmade papers, portions of other artwork or texts, photographs and other found objects.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 8, [AXIS_3_ID]: 7, [AXIS_4_ID]: 5, [AXIS_5_ID]: 9, [AXIS_6_ID]: 6, [AXIS_7_ID]: 6, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "9d720508-5e76-4f19-8b5b-49e6a0c785c7", name: "Комик",
      description: "A style characterized by line art, often with flat colors, speech bubbles, and panel layouts, typical of comic books and graphic novels.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 7, [AXIS_3_ID]: 8, [AXIS_4_ID]: 5, [AXIS_5_ID]: 3, [AXIS_6_ID]: 2, [AXIS_7_ID]: 4, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "aec38f67-ccdb-46f9-8412-0dc234e7a73e", name: "Кракелюр",
      description: "A network of fine cracks on the surface of a material, often seen in old paintings, which can be deliberately created for an aged, textural effect.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 5, [AXIS_3_ID]: 3, [AXIS_4_ID]: 5, [AXIS_5_ID]: 10, [AXIS_6_ID]: 5, [AXIS_7_ID]: 2, [AXIS_8_ID]: 1, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "31ec2842-eb2f-4db0-aacd-e9939050fef5", name: "Кубизм",
      description: "An early-20th-century avant-garde art movement that revolutionized European painting and sculpture, and inspired related movements in music, literature and architecture. Objects are analyzed, broken up and reassembled in an abstracted form.",
      scores: { [AXIS_1_ID]: 3, [AXIS_2_ID]: 8, [AXIS_3_ID]: 6, [AXIS_4_ID]: 6, [AXIS_5_ID]: 2, [AXIS_6_ID]: 7, [AXIS_7_ID]: 9, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "e14e3ba8-ed29-4d62-ac51-40d1609a00eb", name: "Лоу-поли",
      description: "A polygon mesh in 3D computer graphics that has a relatively small number of polygons. The aesthetic emphasizes the sharp, geometric shapes.",
      scores: { [AXIS_1_ID]: 2, [AXIS_2_ID]: 7, [AXIS_3_ID]: 7, [AXIS_4_ID]: 7, [AXIS_5_ID]: 1, [AXIS_6_ID]: 4, [AXIS_7_ID]: 10, [AXIS_8_ID]: 3, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "446b7ae0-f82a-4a9f-b9c1-6dd22b2f87b5", name: "Люминесцентный",
      description: "Art that uses luminescence—the emission of light by a substance that has not been heated—to create glowing, often ethereal effects.",
      scores: { [AXIS_1_ID]: 4, [AXIS_2_ID]: 9, [AXIS_3_ID]: 10, [AXIS_4_ID]: 2, [AXIS_5_ID]: 3, [AXIS_6_ID]: 6, [AXIS_7_ID]: 4, [AXIS_8_ID]: 6, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "f2ed4561-b8b5-4426-8053-437ccefbfb98", name: "Необарокко",
      description: "A late 19th-century revival of Baroque style, characterized by its dramatic, ornate, and grand qualities, often with a modern twist.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 6, [AXIS_3_ID]: 7, [AXIS_4_ID]: 4, [AXIS_5_ID]: 8, [AXIS_6_ID]: 3, [AXIS_7_ID]: 4, [AXIS_8_ID]: 8, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "2e5e8bdd-8594-43c3-a23c-d31146aa7e8e", name: "Неон-арт",
      description: "Art that incorporates neon lighting. It is often associated with vibrant colors and a futuristic or retro-futuristic aesthetic.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 9, [AXIS_3_ID]: 10, [AXIS_4_ID]: 3, [AXIS_5_ID]: 2, [AXIS_6_ID]: 5, [AXIS_7_ID]: 6, [AXIS_8_ID]: 7, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "1fe226bf-1ff6-4e74-af04-2c25d2684eff", name: "Неопластицизм",
      description: "A style of abstract painting developed by Piet Mondrian, using only vertical and horizontal lines and rectangular shapes in black, white, gray, and primary colors.",
      scores: { [AXIS_1_ID]: 2, [AXIS_2_ID]: 8, [AXIS_3_ID]: 10, [AXIS_4_ID]: 8, [AXIS_5_ID]: 1, [AXIS_6_ID]: 10, [AXIS_7_ID]: 10, [AXIS_8_ID]: 1, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "130f9718-e27f-4ac6-b8b3-3c84b2d1aabe", name: "Неореализм",
      description: "A national film movement characterized by stories set amongst the poor and the working class, filmed on location, frequently using non-professional actors.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 7, [AXIS_3_ID]: 4, [AXIS_4_ID]: 5, [AXIS_5_ID]: 9, [AXIS_6_ID]: 1, [AXIS_7_ID]: 3, [AXIS_8_ID]: 4, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "5e135551-b99f-4e9a-bc7e-e36c85a356b6", name: "Нихонга",
      description: "A traditional Japanese painting style using conventional techniques, materials, and subjects.",
      scores: { [AXIS_1_ID]: 3, [AXIS_2_ID]: 4, [AXIS_3_ID]: 5, [AXIS_4_ID]: 8, [AXIS_5_ID]: 4, [AXIS_6_ID]: 3, [AXIS_7_ID]: 3, [AXIS_8_ID]: 2, [AXIS_9_ID]: 1 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "7d8ab9d7-3d95-43ed-a40b-4c5afeafa819", name: "Персидская миниатюра",
      description: "A small painting on paper, whether a book illustration or a separate work of art intended to be kept in an album of such works.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 9, [AXIS_3_ID]: 8, [AXIS_4_ID]: 5, [AXIS_5_ID]: 3, [AXIS_6_ID]: 2, [AXIS_7_ID]: 4, [AXIS_8_ID]: 4, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "c9e3feb3-1eb8-47d1-9ce5-f2aab54910a9", name: "Петриковская роспись",
      description: "A traditional Ukrainian decorative painting style, originating from the village of Petrykivka. Characterized by floral and plant motifs.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 10, [AXIS_3_ID]: 9, [AXIS_4_ID]: 8, [AXIS_5_ID]: 6, [AXIS_6_ID]: 3, [AXIS_7_ID]: 2, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "cb1aa731-65c2-4b0a-a684-27219d95a9e5", name: "Пиксель-арт",
      description: "A form of digital art, created through the use of software, where images are edited on the pixel level.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 7, [AXIS_3_ID]: 8, [AXIS_4_ID]: 7, [AXIS_5_ID]: 1, [AXIS_6_ID]: 4, [AXIS_7_ID]: 10, [AXIS_8_ID]: 4, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "9c1eafee-39fd-458a-a98a-1ea630039471", name: "Пластик-арт",
      description: "Art created using plastic as the primary medium, often with bright colors and smooth, glossy surfaces.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 9, [AXIS_3_ID]: 9, [AXIS_4_ID]: 9, [AXIS_5_ID]: 3, [AXIS_6_ID]: 5, [AXIS_7_ID]: 6, [AXIS_8_ID]: 5, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "a2e3b900-d5c7-4b89-bb13-aac187e83ed1", name: "Поп-арт",
      description: "An art movement that emerged in the 1950s and flourished in the 1960s in America and Britain, drawing inspiration from sources in popular and commercial culture.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 10, [AXIS_3_ID]: 10, [AXIS_4_ID]: 9, [AXIS_5_ID]: 4, [AXIS_6_ID]: 2, [AXIS_7_ID]: 6, [AXIS_8_ID]: 7, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "789e7a94-ae08-4c8c-a7c6-699d71ccb93e", name: "Постмодернизм",
      description: "A late-20th-century style and concept in the arts, architecture, and criticism, which represents a departure from modernism and has at its heart a general distrust of grand theories and ideologies.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 8, [AXIS_3_ID]: 7, [AXIS_4_ID]: 7, [AXIS_5_ID]: 6, [AXIS_6_ID]: 7, [AXIS_7_ID]: 6, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "28ca3322-09bb-47c1-9c01-1ce64cc435ca", name: "Психоделика",
      description: "Art, graphics, and literature that are inspired by or attempt to replicate the inner world of the psychedelic experience.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 10, [AXIS_3_ID]: 10, [AXIS_4_ID]: 8, [AXIS_5_ID]: 7, [AXIS_6_ID]: 8, [AXIS_7_ID]: 2, [AXIS_8_ID]: 9, [AXIS_9_ID]: 10 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "7ef21376-9c14-4eb2-984e-9ddff06bc621", name: "Реализм",
      description: "The attempt to represent subject matter truthfully, without artificiality and avoiding artistic conventions, implausible, exotic, and supernatural elements.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 8, [AXIS_3_ID]: 6, [AXIS_4_ID]: 7, [AXIS_5_ID]: 7, [AXIS_6_ID]: 1, [AXIS_7_ID]: 3, [AXIS_8_ID]: 3, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "ef9ffb5a-f6c5-484c-aff8-d15d88f947ab", name: "Ренессанс",
      description: "A period in European history marking the transition from the Middle Ages to modernity, covering the 15th and 16th centuries, characterized by an effort to revive and surpass ideas and achievements of classical antiquity.",
      scores: { [AXIS_1_ID]: 10, [AXIS_2_ID]: 9, [AXIS_3_ID]: 7, [AXIS_4_ID]: 7, [AXIS_5_ID]: 8, [AXIS_6_ID]: 1, [AXIS_7_ID]: 4, [AXIS_8_ID]: 3, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "ad7cb872-dbe5-4309-8cef-45f86daa8954", name: "Ретрофутуризм",
      description: "A movement in the creative arts showing the influence of depictions of the future produced in an earlier era.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 8, [AXIS_3_ID]: 8, [AXIS_4_ID]: 7, [AXIS_5_ID]: 5, [AXIS_6_ID]: 3, [AXIS_7_ID]: 6, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "de9203dd-f914-4273-82f5-3207bcf3dc61", name: "Русский конструктивизм",
      description: "An artistic and architectural philosophy that originated in Russia beginning in 1913, characterized by geometric abstraction and a rejection of the idea of autonomous art.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 7, [AXIS_3_ID]: 8, [AXIS_4_ID]: 8, [AXIS_5_ID]: 2, [AXIS_6_ID]: 8, [AXIS_7_ID]: 9, [AXIS_8_ID]: 6, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "952b3d51-7c49-49c8-b6e4-324cbcd2a74d", name: "Сепия-тонирование",
      description: "A photographic printing process that makes prints appear reddish-brown, mimicking the effect of aging.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 5, [AXIS_3_ID]: 3, [AXIS_4_ID]: 5, [AXIS_5_ID]: 6, [AXIS_6_ID]: 2, [AXIS_7_ID]: 3, [AXIS_8_ID]: 2, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "70f94ab0-2cc7-4182-9a73-18488aeccec4", name: "Синтвейв",
      description: "An electronic music microgenre that is based predominantly on the music associated with action, science-fiction, and horror film soundtracks of the 1980s.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 10, [AXIS_3_ID]: 9, [AXIS_4_ID]: 6, [AXIS_5_ID]: 3, [AXIS_6_ID]: 5, [AXIS_7_ID]: 6, [AXIS_8_ID]: 8, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "6cc49f8c-7b6b-49c7-b618-002382c2d782", name: "Соларпанк",
      description: "A science fiction literary subgenre and art movement that envisions how the future might look if humanity succeeded in solving major contemporary challenges.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 9, [AXIS_3_ID]: 8, [AXIS_4_ID]: 10, [AXIS_5_ID]: 6, [AXIS_6_ID]: 2, [AXIS_7_ID]: 4, [AXIS_8_ID]: 6, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "5be96eab-cae3-4e45-a319-b0d0c75f7dd4", name: "Стимпанк",
      description: "A subgenre of science fiction that incorporates retrofuturistic technology and aesthetics inspired by 19th-century industrial steam-powered machinery.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 7, [AXIS_3_ID]: 6, [AXIS_4_ID]: 5, [AXIS_5_ID]: 9, [AXIS_6_ID]: 2, [AXIS_7_ID]: 5, [AXIS_8_ID]: 7, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "13e654f3-d03b-48d1-8f20-4cdff8c1410d", name: "Суми-э",
      description: "A type of East Asian brush painting that uses black ink in various concentrations. It emphasizes brushwork and simplicity.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 3, [AXIS_3_ID]: 2, [AXIS_4_ID]: 6, [AXIS_5_ID]: 7, [AXIS_6_ID]: 3, [AXIS_7_ID]: 2, [AXIS_8_ID]: 4, [AXIS_9_ID]: 1 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "a8b98b32-3571-4a60-abdf-4ccbda5e46e2", name: "Супрематизм",
      description: "An art movement, focused on basic geometric forms, such as circles, squares, lines, and rectangles, painted in a limited range of colors.",
      scores: { [AXIS_1_ID]: 2, [AXIS_2_ID]: 5, [AXIS_3_ID]: 8, [AXIS_4_ID]: 8, [AXIS_5_ID]: 1, [AXIS_6_ID]: 10, [AXIS_7_ID]: 10, [AXIS_8_ID]: 1, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "3725cbde-e8a8-4e08-b0d8-dbf2c2c3cb0d", name: "Сюрреализм",
      description: "A cultural movement which developed in Europe in the aftermath of World War I and was largely influenced by Dada. The movement is best known for its visual artworks and writings which feature element of surprise, unexpected juxtapositions and non-sequitur.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 9, [AXIS_3_ID]: 7, [AXIS_4_ID]: 7, [AXIS_5_ID]: 7, [AXIS_6_ID]: 6, [AXIS_7_ID]: 3, [AXIS_8_ID]: 5, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "f02623ab-2adc-4f11-a28a-fad5ee6698d8", name: "Терраццо",
      description: "A composite material, poured in place or precast, which is used for floor and wall treatments. It consists of chips of marble, quartz, granite, glass, or other suitable material, poured with a cementitious binder.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 9, [AXIS_3_ID]: 7, [AXIS_4_ID]: 8, [AXIS_5_ID]: 9, [AXIS_6_ID]: 9, [AXIS_7_ID]: 5, [AXIS_8_ID]: 2, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "b423b8d6-0a7f-4e8c-9bf0-a90f70929a33", name: "Тиснение фольгой",
      description: "The application of metallic foil, often gold or silver, to paper where a heated die is stamped onto the foil, making it adhere to the surface and leaving the design of the die on the paper.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 8, [AXIS_3_ID]: 8, [AXIS_4_ID]: 9, [AXIS_5_ID]: 8, [AXIS_6_ID]: 4, [AXIS_7_ID]: 6, [AXIS_8_ID]: 3, [AXIS_9_ID]: 4 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "ef3fbc6d-bb21-424e-ba2e-e7bd05db0d91", name: "Укиё-э",
      description: "A genre of Japanese art which flourished from the 17th through 19th centuries. Its artists produced woodblock prints and paintings of such subjects as female beauties; kabuki actors and sumo wrestlers; scenes from history and folk tales; travel scenes and landscapes.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 9, [AXIS_3_ID]: 6, [AXIS_4_ID]: 7, [AXIS_5_ID]: 6, [AXIS_6_ID]: 2, [AXIS_7_ID]: 3, [AXIS_8_ID]: 5, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "612e03b5-0566-4f5e-bd02-19472aeff102", name: "Фовизм",
      description: "A style of painting that flourished in France around the turn of the 20th century. Fauve painters used pure, brilliant color aggressively applied straight from the paint tubes to create a sense of an explosion on the canvas.",
      scores: { [AXIS_1_ID]: 6, [AXIS_2_ID]: 10, [AXIS_3_ID]: 10, [AXIS_4_ID]: 8, [AXIS_5_ID]: 8, [AXIS_6_ID]: 5, [AXIS_7_ID]: 3, [AXIS_8_ID]: 8, [AXIS_9_ID]: 9 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "69b9598a-a79c-4b39-aae5-ae36f8a2dd09", name: "Фрактал-арт",
      description: "A form of algorithmic art created by calculating fractal objects and representing the calculation results as still images, animations, and media.",
      scores: { [AXIS_1_ID]: 9, [AXIS_2_ID]: 10, [AXIS_3_ID]: 9, [AXIS_4_ID]: 7, [AXIS_5_ID]: 6, [AXIS_6_ID]: 10, [AXIS_7_ID]: 7, [AXIS_8_ID]: 7, [AXIS_9_ID]: 8 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "c686e2e6-d37a-44d0-af01-20870fe67c97", name: "Футуризм",
      description: "An artistic and social movement that originated in Italy in the early 20th century. It emphasized dynamism, speed, technology, youth, and violence, and objects such as the car, the airplane, and the industrial city.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 8, [AXIS_3_ID]: 8, [AXIS_4_ID]: 8, [AXIS_5_ID]: 5, [AXIS_6_ID]: 7, [AXIS_7_ID]: 7, [AXIS_8_ID]: 10, [AXIS_9_ID]: 9 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "880d225e-6aa9-4bdd-b8a4-3b79ad61cd96", name: "Хай-тек",
      description: "A style of architecture and design that emerged in the 1970s, incorporating elements of high-tech industry and technology into building design.",
      scores: { [AXIS_1_ID]: 8, [AXIS_2_ID]: 7, [AXIS_3_ID]: 5, [AXIS_4_ID]: 9, [AXIS_5_ID]: 3, [AXIS_6_ID]: 6, [AXIS_7_ID]: 9, [AXIS_8_ID]: 4, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "d9266e73-57c3-4f43-b8bf-2fc6c2a6caac", name: "Цел-шейдинг",
      description: "A type of non-photorealistic rendering designed to make 3-D computer graphics appear to be flat by using a small number of discrete shades of color rather than a continuous gradient.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 8, [AXIS_3_ID]: 8, [AXIS_4_ID]: 8, [AXIS_5_ID]: 1, [AXIS_6_ID]: 3, [AXIS_7_ID]: 5, [AXIS_8_ID]: 5, [AXIS_9_ID]: 6 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "b537a7eb-f80a-4946-ae9d-f771684173d9", name: "Цианотипия",
      description: "A photographic printing process that produces a cyan-blue print. Engineers used the process well into the 20th century as a simple and low-cost process to produce copies of drawings, referred to as blueprints.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 4, [AXIS_3_ID]: 3, [AXIS_4_ID]: 6, [AXIS_5_ID]: 6, [AXIS_6_ID]: 2, [AXIS_7_ID]: 4, [AXIS_8_ID]: 3, [AXIS_9_ID]: 2 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "1fdfc200-04dd-4844-bff2-de6e5de8ac17", name: "Штамп-арт",
      description: "Art created using stamps, which can be made from various materials like rubber or wood, to apply ink or paint to a surface.",
      scores: { [AXIS_1_ID]: 5, [AXIS_2_ID]: 6, [AXIS_3_ID]: 7, [AXIS_4_ID]: 6, [AXIS_5_ID]: 8, [AXIS_6_ID]: 5, [AXIS_7_ID]: 5, [AXIS_8_ID]: 4, [AXIS_9_ID]: 5 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "68367f55-45cc-4675-829b-05b0cb1b9ea8", name: "Эмбоссинг",
      description: "The process of creating either raised or recessed relief images and designs in paper and other materials.",
      scores: { [AXIS_1_ID]: 7, [AXIS_2_ID]: 6, [AXIS_3_ID]: 4, [AXIS_4_ID]: 7, [AXIS_5_ID]: 10, [AXIS_6_ID]: 6, [AXIS_7_ID]: 6, [AXIS_8_ID]: 2, [AXIS_9_ID]: 3 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    },
    {
      id: "09187393-aea9-46ef-ba76-6fcd4d2e69af", name: "Эмодзи-арт",
      description: "Art created using emojis as the primary visual elements, often arranged to form larger pictures or patterns.",
      scores: { [AXIS_1_ID]: 4, [AXIS_2_ID]: 10, [AXIS_3_ID]: 9, [AXIS_4_ID]: 9, [AXIS_5_ID]: 1, [AXIS_6_ID]: 6, [AXIS_7_ID]: 7, [AXIS_8_ID]: 6, [AXIS_9_ID]: 7 },
      images: [], coverImageIndex: 0, generationPrompt: 'A high-quality, artistic photograph of a single cup.', generatedImageUrls: [],
    }
  ],
};

export const AXIS_SCORE_MIN = 1;
export const AXIS_SCORE_MAX = 10;