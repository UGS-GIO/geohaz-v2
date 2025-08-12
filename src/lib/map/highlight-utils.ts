import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { MAP_PIN_ICON } from '@/assets/icons';
import { ExtendedFeature } from '@/components/custom/popups/popup-content-with-pagination';
import { convertGeometryToWGS84 } from '@/lib/map/conversion-utils';




// --- Create Esri Geometry from GeoJSON + SR ---
const createEsriGeometry = (
    geoJsonGeometry: Geometry,
    spatialReference: SpatialReference
): __esri.Geometry | null => {
    if (!geoJsonGeometry) return null;
    try {
        switch (geoJsonGeometry.type) {
            case 'Point':
                return new Point({
                    x: geoJsonGeometry.coordinates[0],
                    y: geoJsonGeometry.coordinates[1],
                    spatialReference: spatialReference,
                });
            case 'LineString':
                return new Polyline({
                    paths: [geoJsonGeometry.coordinates],
                    spatialReference: spatialReference,
                });
            case 'Polygon':
                return new Polygon({
                    rings: geoJsonGeometry.coordinates,
                    spatialReference: spatialReference,
                });
            case 'MultiPolygon':
                return new Polygon({
                    rings: geoJsonGeometry.coordinates.flat(1) as number[][][],
                    spatialReference: spatialReference,
                });
            case 'MultiLineString':
                return new Polyline({
                    paths: geoJsonGeometry.coordinates,
                    spatialReference: spatialReference,
                });
            default:
                console.warn(`createEsriGeometry: Unsupported GeoJSON geometry type for Esri conversion: ${geoJsonGeometry.type}`);
                return null;
        }
    } catch (error) {
        console.error("createEsriGeometry: Error converting GeoJSON to Esri geometry:", error);
        return null;
    }
};

// --- HELPER 3: Create Styled Esri Graphics ---
export interface HighlightOptions {
    fillColor?: __esri.Color | number[];
    outlineColor?: __esri.Color | number[];
    outlineWidth?: number;
    pointSize?: number;
}

const createEsriGraphics = (
    esriGeometry: __esri.Geometry,
    options: Required<HighlightOptions>
): Graphic[] => {
    if (!esriGeometry) return [];
    try {
        switch (esriGeometry.type) {
            case 'point':
            case 'multipoint': {
                const pointSymbol = new SimpleMarkerSymbol({
                    color: options.fillColor,
                    size: options.pointSize,
                    outline: { color: options.outlineColor, width: options.outlineWidth > 0 ? 2 : 0 }
                });
                const outlineSymbol = new SimpleMarkerSymbol({
                    color: options.fillColor,
                    size: options.pointSize + 2,
                    outline: { color: [0, 0, 0, .5], width: options.outlineWidth / 2 }
                });
                return [
                    new Graphic({ geometry: esriGeometry, symbol: pointSymbol }),
                    new Graphic({ geometry: esriGeometry, symbol: outlineSymbol })
                ];
            }
            case 'polyline': {
                const lineSymbol = new SimpleLineSymbol({ color: options.outlineColor, width: options.outlineWidth });
                const outlineSymbol = new SimpleLineSymbol({
                    color: [0, 0, 0, .5],
                    width: options.outlineWidth + 2
                });
                return [
                    new Graphic({ geometry: esriGeometry, symbol: outlineSymbol }),
                    new Graphic({ geometry: esriGeometry, symbol: lineSymbol })
                ];
            }
            case 'polygon': {
                const fillSymbol = new SimpleFillSymbol({
                    color: options.fillColor,
                    outline: { color: options.outlineColor, width: options.outlineWidth }
                });
                const outlineSymbol = new SimpleFillSymbol({
                    color: [0, 0, 0, 0],
                    outline: { color: [0, 0, 0, 1], width: options.outlineWidth + 2 }
                });
                return [
                    new Graphic({ geometry: esriGeometry, symbol: outlineSymbol }),
                    new Graphic({ geometry: esriGeometry, symbol: fillSymbol })
                ];
            }
            default:
                console.warn(`createEsriGraphics: Unsupported Esri geometry type for default symbol generation: ${esriGeometry.type}`);
                return [];
        }
    } catch (error) {
        console.error("createEsriGraphics: Error creating Esri symbol or graphic:", error);
        return [];
    }
};

// --- WFS FETCH FUNCTION ---
export async function fetchWfsGeometry({ namespace, feature, sourceCRS }: { namespace: string; feature: Feature<Geometry, GeoJsonProperties>; sourceCRS: string }) {
    const featureId = feature.id!.toString()
    const layerName = featureId.split('.')[0];
    const ogcFid = feature.properties?.ogc_fid;
    const baseUrl = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/wfs'
    const params = new URLSearchParams({
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        VERSION: '2.0.0',
        TYPENAMES: `${namespace}:${layerName}`,
        OUTPUTFORMAT: 'application/json',
        SRSNAME: sourceCRS,
    })
    if (feature.properties?.ogc_fid) {
        params.append('CQL_FILTER', `ogc_fid=${ogcFid}`);
    } else {
        params.append('FEATUREID', featureId);
    }
    const url = `${baseUrl}?${params.toString()}`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch WFS feature: ${response.status}`)
    }
    return response.json()
}

// --- ORCHESTRATOR FUNCTION ---
// This function determines if a fetch is needed before highlighting.
export const handleFeatureHighlight = async (
    feature: ExtendedFeature,
    view: __esri.MapView | __esri.SceneView,
    sourceCRS: string,
    options?: HighlightOptions
): Promise<Graphic | null> => {
    // 1. Get the full feature geometry, fetching from WFS if necessary
    let targetFeature: Feature<Geometry, GeoJsonProperties> = feature;
    if ('namespace' in feature && feature.namespace) {
        try {
            const wfsResponse = await fetchWfsGeometry({ namespace: feature.namespace, feature: feature, sourceCRS: sourceCRS });
            if (!wfsResponse.features?.length) {
                console.warn("WFS fetch returned no features.");
                return null;
            }
            targetFeature = wfsResponse.features[0];
        } catch (error) {
            console.error("Failed to fetch WFS geometry for highlighting:", error);
            return null;
        }
    }

    // 2. Now call the simplified highlightFeature function
    return highlightFeature(targetFeature, view, sourceCRS, options);
}


// --- HIGHLIGHT FUNCTION ---
// Its only responsibility is to take a complete feature and highlight it.
export const highlightFeature = async (
    feature: Feature<Geometry, GeoJsonProperties>,
    view: __esri.MapView | __esri.SceneView,
    sourceCRS: string,
    options?: HighlightOptions
): Promise<Graphic | null> => {

    if (!feature || !feature.geometry || !view) {
        console.warn("Invalid feature or view provided for highlighting.");
        return null;
    }

    // 1. Convert the geometry to WGS84 using our robust utility
    const wgs84Geometry = convertGeometryToWGS84(feature.geometry, sourceCRS);
    if (!wgs84Geometry) return null;

    // 2. Create an Esri geometry object from the WGS84 GeoJSON
    const wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
    const esriGeom = createEsriGeometry(wgs84Geometry, wgs84SpatialReference);
    if (!esriGeom) return null;

    // 3. Create the styled Esri graphic
    const defaultHighlightOptions: Required<HighlightOptions> = {
        fillColor: [0, 0, 0, 0],
        outlineColor: [255, 255, 0, 1],
        outlineWidth: 4,
        pointSize: 12
    };
    const finalOptions = { ...defaultHighlightOptions, ...options };
    const graphics = createEsriGraphics(esriGeom, finalOptions);
    if (!graphics || graphics.length === 0) return null;

    // 4. Add the graphics to the view
    view.graphics.addMany(graphics);

    // Return the first graphic for consistency, or null if none were created
    return graphics[0];
};

// --- Other Utility Functions ---
export const clearGraphics = (view: __esri.MapView | __esri.SceneView) => {
    if (view && view.graphics) {
        view.graphics.removeAll();
    } else {
        console.warn("clearGraphics: View or graphics layer is not available.");
    }
}

export function createPinGraphic(lat: number, long: number, view: __esri.SceneView | __esri.MapView) {
    const markerSymbol = new PictureMarkerSymbol({
        url: `${MAP_PIN_ICON}`,
        width: "20px",
        height: "20px",
        yoffset: 10
    });
    const pointGraphic = new Graphic({
        geometry: new Point({ longitude: long, latitude: lat }),
        symbol: markerSymbol
    });
    view.graphics.add(pointGraphic);
}