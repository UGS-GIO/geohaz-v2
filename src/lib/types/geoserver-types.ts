import { GeoJSON, FeatureCollection, Feature } from 'geojson';

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
    "external-graphic-url"?: string;
    "external-graphic-type"?: string;
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

/**
 * GeoServer-specific CRS object that extends the standard GeoJSON format
 */
export interface GeoServerCRS {
    type: 'name';
    properties: {
        name: string; // Usually in format like "EPSG:4326" or "urn:ogc:def:crs:EPSG::4326"
    };
}

/**
 * Base interface for GeoServer extensions to GeoJSON objects
 */
export interface GeoServerExtensions {
    crs?: GeoServerCRS;
    totalFeatures?: number;
    numberMatched?: number;
    numberReturned?: number;
    timeStamp?: string;
}

/**
 * GeoServer's extended FeatureCollection (most common response type)
 */
export interface GeoServerFeatureCollection extends FeatureCollection, GeoServerExtensions {
    features: Feature[];
}

/**
 * Union type for any GeoServer GeoJSON response
 */
export type GeoServerGeoJSON =
    | (GeoJSON & GeoServerExtensions)
    | GeoServerFeatureCollection;
