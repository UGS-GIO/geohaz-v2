export interface LegendProps {
    layerName: string;
    title: string;
    rules: LegendRule[];
}

export interface LegendRule {

    name: string;
    title: string;
    filter: string;
    symbolizers: Symbolizer[];

}

export interface Legend {
    Legend: LegendProps[];
}

export interface Symbolizer {
    Line?: StrokeSymbolizer;
    Polygon?: FillSymbolizer | StrokeSymbolizer;
    Point?: PointSymbolizer;
}
export interface PointSymbolizer {
    size: string;
    opacity: string;
    rotation: string;
    graphics: PointGraphic[];
    url?: string;
    title?: string;
    displacement?: Displacement;
}

interface Displacement {
    "displacement-x": string;
    "displacement-y": string;
}

interface PointGraphic {
    fill: string;
    "fill-opacity": string;
    mark: string;
    stroke: string;
    "stroke-linecap": LineCap;
    "stroke-linejoin": LineJoin;
    "stroke-opacity": string;
    "stroke-width": string;
}

export type LineCap = "butt" | "round" | "square";
export type LineJoin = "round" | "miter" | "bevel";

export interface StrokeSymbolizer {
    "stroke": string,
    "stroke-width": string,
    "stroke-opacity": string,
    "stroke-linecap": LineCap,
    "stroke-linejoin": LineJoin,
    "stroke-dasharray": string[],
    "stroke-dashoffset": string
}

export interface FillSymbolizer {
    "fill": string,
    "fill-opacity": string
}

export type PolygonSymbolizer = FillSymbolizer | StrokeSymbolizer;

export interface Feature {
    type: string;
    id: string;
    geometry: Geometry;
    geometry_name: string;
    properties: Properties;
    bbox: number[];
}

interface Geometry {
    type: string;
    coordinates: number[][][][];
}

interface Properties {
    name: string;
    location: string;
    ohio_code: string;
    tile: string;
    path: string;
    ext: string;
    size: number;
    shape_length: number;
    shape_area: number;
}