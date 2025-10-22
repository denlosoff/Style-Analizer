export interface Style {
    id: string;
    name: string;
    scores: Record<string, number>; // { axis_id: score }
    images: string[];
    description: string;
    coverImageIndex: number;
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