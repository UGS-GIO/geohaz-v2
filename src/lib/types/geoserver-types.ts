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

export interface Symbolizer {
    Line?: LineSymbolizer;
    Polygon?: PolygonSymbolizer;
    Point?: PointSymbolizer;
}

export interface LineSymbolizer {
    stroke: string;
    "stroke-width": string;
    "stroke-linecap": "butt" | "round" | "square" | undefined;
    "stroke-linejoin": "round" | "miter" | "bevel" | undefined;
    "stroke-dasharray": string;

}

export interface PolygonSymbolizer {
    fill: string;
    fillOpacity: string;
}

export interface PointSymbolizer {
    size: string;
    opacity: string;
    rotation: string;
    graphics: PointGraphic[];
}

interface PointGraphic {
    fill: string;
    "fill-opacity": string;
    mark: string;
}