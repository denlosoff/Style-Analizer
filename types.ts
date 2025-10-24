export interface Style {
    id: string;
    name: string;
    scores: Record<string, number>; // { axis_id: score }
    images: string[];
    description: string;
    generationPrompt: string;
    coverImageIndex: number;
    generatedImageUrls?: string[];
}

export interface Axis {
    id: string;
    name: string;
    description: string;
    color: string; // Hex color string e.g., '#FF0000'
}

export interface SpaceData {
    axes: Axis[];
    styles: Style[];
}

export type ProjectionMode = 'manual' | 'umap' | 'pca';

export interface Filter {
    id: string;
    axisId: string;
    min: number;
    max: number;
}