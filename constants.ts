import type { SpaceData } from './types';
import { v4 as uuidv4 } from 'uuid';

const AXIS_1_ID = uuidv4();
const AXIS_2_ID = uuidv4();
const AXIS_3_ID = uuidv4();

const STYLE_1_ID = uuidv4();
const STYLE_2_ID = uuidv4();
const STYLE_3_ID = uuidv4();
const STYLE_4_ID = uuidv4();
const STYLE_5_ID = uuidv4();

export const INITIAL_DATA: SpaceData = {
  axes: [
    { id: AXIS_1_ID, name: 'Complexity', description: 'Visual complexity and level of detail.', color: '#34d399' },
    { id: AXIS_2_ID, name: 'Modernity', description: 'How modern or traditional the style is.', color: '#60a5fa' },
    { id: AXIS_3_ID, name: 'Luminosity', description: 'The overall brightness or darkness.', color: '#facc15' },
  ],
  styles: [
    {
      id: STYLE_1_ID,
      name: 'Minimalism',
      description: 'Emphasizes simplicity, clean lines, and a monochromatic palette.',
      scores: {
        [AXIS_1_ID]: 2,
        [AXIS_2_ID]: 9,
        [AXIS_3_ID]: 8,
      },
      images: [],
      coverImageIndex: 0,
    },
    {
      id: STYLE_2_ID,
      name: 'Baroque',
      description: 'Characterized by grandeur, drama, and elaborate ornamental detail.',
      scores: {
        [AXIS_1_ID]: 9,
        [AXIS_2_ID]: 2,
        [AXIS_3_ID]: 4,
      },
      images: [],
      coverImageIndex: 0,
    },
    {
      id: STYLE_3_ID,
      name: 'Impressionism',
      description: 'Focuses on capturing the momentary effect of a scene, with visible brushstrokes and emphasis on light.',
      scores: {
        [AXIS_1_ID]: 6,
        [AXIS_2_ID]: 4,
        [AXIS_3_ID]: 7,
      },
      images: [],
      coverImageIndex: 0,
    },
    {
      id: STYLE_4_ID,
      name: 'Cyberpunk',
      description: 'A high-tech, low-life future with neon aesthetics, cybernetics, and urban dystopia.',
      scores: {
        [AXIS_1_ID]: 8,
        [AXIS_2_ID]: 10,
        [AXIS_3_ID]: 3,
      },
      images: [],
      coverImageIndex: 0,
    },
    {
        id: STYLE_5_ID,
        name: 'Art Deco',
        description: 'Sleek, geometric forms, lavish ornamentation, and strong, streamlined shapes.',
        scores: {
          [AXIS_1_ID]: 7,
          [AXIS_2_ID]: 6,
          [AXIS_3_ID]: 6,
        },
        images: [],
        coverImageIndex: 0,
      },
  ],
};

export const AXIS_SCORE_MIN = 1;
export const AXIS_SCORE_MAX = 10;