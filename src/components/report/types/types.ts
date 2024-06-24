
// export interface VisualAssets {
//     mapImage: string,
//     renderer: __esri.Renderer,
//     scale: number,
//     scaleBarDom: HTMLDivElement
// }

export interface VisualAssets {
    [key: string]: {
        renderer: __esri.Renderer;
        mapImage: string;
        scale: number;
        scaleBarDom: HTMLDivElement | null;
    };
}

// export type VisualAssetsMap = Record<string, VisualAssets>;
export interface VisualAssetsMap { [key: string]: VisualAssets };

export interface Aoi {
    description: string;
    polygon: Polygon;
}

export interface Polygon {
    rings: number[][][];
    spatialReference: SpatialReference;
}

export interface SpatialReference {
    wkid: number;
    latestWkid?: number;
}

interface UniqueIdField {
    name: string;
    isSystemMaintained: boolean;
}

interface Field {
    name: string;
    type: string;
    alias: string;
    sqlType: string;
    length: number;
    domain: null;
    defaultValue: null;
}

interface Attributes extends Record<string, string> { }

interface Feature {
    attributes: Attributes;
}

export interface JsonResponse {
    objectIdFieldName: string;
    uniqueIdField: UniqueIdField;
    globalIdFieldName: string;
    geometryType?: string;
    spatialReference?: SpatialReference;
    fields?: Field[];
    features: Feature[];
    error?: {
        code: number;
        message: string;
    };
}