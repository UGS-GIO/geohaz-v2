import { Feature, Geometry, GeoJsonProperties, Position } from 'geojson';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { convertCoordinates, extractCoordinates } from '@/lib/map/conversion-utils';
import { ExtendedGeometry } from '@/components/sidebar/filter/search-combobox';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { MAP_PIN_ICON } from '@/assets/icons';
import { clone, coordEach } from '@turf/turf';
import proj4 from 'proj4';
import { ExtendedFeature } from '@/components/custom/popups/popup-content-with-pagination';

interface HighlightOptions {
    fillColor?: __esri.Color | number[];
    outlineColor?: __esri.Color | number[];
    outlineWidth?: number;
    pointSize?: number;
}

// create Esri geometry from GeoJSON geometry + SR
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

// create esri graphics from esri geometry
const createEsriGraphics = (
    esriGeometry: __esri.Geometry,
    options: Required<HighlightOptions>
): Graphic[] => { // Return array
    if (!esriGeometry) {
        return [];
    }

    try {
        switch (esriGeometry.type) {
            case 'point':
            case 'multipoint': {
                // point and multipoint are handled the same way
                const pointSymbol = new SimpleMarkerSymbol({
                    color: options.fillColor,
                    size: options.pointSize,
                    outline: {
                        color: options.outlineColor,
                        width: options.outlineWidth > 0 ? 1 : 0,
                    }
                });
                return [new Graphic({ geometry: esriGeometry, symbol: pointSymbol })];
            }

            case 'polyline': {
                const lineSymbol = new SimpleLineSymbol({
                    color: options.outlineColor,
                    width: options.outlineWidth
                });
                return [new Graphic({ geometry: esriGeometry, symbol: lineSymbol })];
            }

            case 'polygon': {
                const fillSymbol = new SimpleFillSymbol({
                    color: options.fillColor,
                    outline: {
                        color: options.outlineColor,
                        width: options.outlineWidth
                    }
                });
                return [new Graphic({ geometry: esriGeometry, symbol: fillSymbol })];
            }

            // TODO: Add other Esri geometry types if needed (e.g., 'extent', 'mesh')

            default:
                console.warn(`createEsriGraphics: Unsupported Esri geometry type for default symbol generation: ${esriGeometry.type}`);
                return [];
        }
    } catch (error) {
        console.error("createEsriGraphics: Error creating Esri symbol or graphic:", error);
        return [];
    }
};

/**
 * Highlights a search result feature on the map and returns its WGS84 coordinates.
 *
 * @param searchResult The GeoJSON Feature search result. Geometry CRS expected in `geometry.crs`.
 * @param view The Esri MapView or SceneView instance.
 * @param clearGraphics If true, removes existing graphics from the view's graphics layer. Default: true.
 * @param options Optional styling for the highlight graphic.
 * @returns A Promise resolving to the WGS84 coordinates (Position | Position[] | ...)
 * or null if the input geometry is invalid or conversion/highlighting fails.
 */
export const highlightSearchResult = async (
    searchResult: Feature<ExtendedGeometry, GeoJsonProperties> | null | undefined,
    view: __esri.MapView | __esri.SceneView,
    clearGraphics: boolean = true,
    options?: HighlightOptions
): Promise<Position | Position[] | Position[][] | Position[][][] | null> => {

    if (!searchResult?.geometry) {
        console.warn('highlightSearchResult: Invalid searchResult or missing geometry. Cannot highlight.');
        return null;
    }

    const originalGeometry: ExtendedGeometry = searchResult.geometry;
    const sourceCRS = originalGeometry.crs?.properties?.name;
    const effectiveSourceCRS = sourceCRS || "EPSG:4326"; // Assume WGS84 if undefined https://datatracker.ietf.org/doc/html/rfc7946#section-4

    if (!sourceCRS) {
        console.warn(`highlightSearchResult: Source CRS is undefined on geometry. Assuming WGS84 (${effectiveSourceCRS}). Highlighting might be inaccurate if assumption is wrong.`);
    }

    const wgs84Geometry = convertGeometryToWGS84(
        originalGeometry,
        effectiveSourceCRS
    );

    if (!wgs84Geometry) {
        console.error(`highlightSearchResult: Failed to convert geometry from ${effectiveSourceCRS} to WGS84. Cannot highlight accurately.`);
        clearGraphics && removeGraphics(view);
        return null;
    }

    const wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
    const esriGeom = createEsriGeometry(wgs84Geometry, wgs84SpatialReference);

    if (!esriGeom) {
        console.error("highlightSearchResult: Failed to create Esri geometry from converted WGS84 GeoJSON.");
        clearGraphics && removeGraphics(view);
        return null;
    }

    const defaultSearchHighlightOptions: Required<HighlightOptions> = {
        fillColor: [255, 255, 0, 0.5], // Slightly transparent yellow fill
        outlineColor: [255, 255, 0, 1],  // Solid yellow outline
        outlineWidth: 2,
        pointSize: 8
    };
    const highlightOptions: Required<HighlightOptions> = { ...defaultSearchHighlightOptions, ...options };
    const graphics = createEsriGraphics(esriGeom, highlightOptions);

    if (!graphics || graphics.length === 0) {
        console.warn("highlightSearchResult: No graphics were generated for highlighting (geometry type unsupported?).");
        clearGraphics && removeGraphics(view);
        return extractCoordinates(wgs84Geometry);
    }

    if (clearGraphics) {
        removeGraphics(view);
    }
    view.graphics.addMany(graphics);

    const wgs84Coordinates = extractCoordinates(wgs84Geometry);

    return wgs84Coordinates;
};

export function removeGraphics(view: __esri.SceneView | __esri.MapView) {
    view.graphics.removeAll();
}

// Create a graphic to display a point on the map
export function createPinGraphic(lat: number, long: number, view: __esri.SceneView | __esri.MapView) {
    // Create a symbol for drawing the point
    const markerSymbol = new PictureMarkerSymbol({
        url: `${MAP_PIN_ICON}`,
        width: "20px",
        height: "20px",
        yoffset: 10
    });
    // Create a graphic and add the geometry and symbol to it
    const pointGraphic = new Graphic({
        geometry: new Point({
            longitude: long,
            latitude: lat
        }),
        symbol: markerSymbol
    });

    view.graphics.add(pointGraphic);
}

export function convertGeometryToWGS84<G extends Geometry>(
    geometry: G | null | undefined,
    sourceCRS = "EPSG:4326"
): G | null {
    if (!geometry) {
        console.warn("convertGeometryToWGS84: Input geometry is null or undefined.");
        return null;
    }

    const targetCRS = "EPSG:4326"; // Target is always WGS84 to comply with geojson spec https://datatracker.ietf.org/doc/html/rfc7946#section-4

    // no conversion needed
    if (sourceCRS === targetCRS || sourceCRS.toUpperCase() === 'WGS84' || sourceCRS === '4326') {
        console.log("Source CRS is already WGS84, returning clone.");
        try {
            // Return a clone to ensure function purity
            return clone(geometry) as G;
        } catch (cloneError: any) {
            console.error("Error cloning geometry:", cloneError);
            return null;
        }
    }

    // conversion needed
    let clonedGeometry: G;
    try {
        // clone the geometry to avoid modifying the original
        clonedGeometry = clone(geometry);
    } catch (setupError: any) {
        console.error(`Error during geometry conversion setup for ${sourceCRS}:`, setupError);
        return null;
    }

    let conversionErrorFound: Error | null = null;

    // Iterate over each coordinate pair [x, y]
    coordEach(clonedGeometry, (currentCoord, coordIndex) => {
        if (conversionErrorFound) return;

        if (
            Array.isArray(currentCoord) &&
            currentCoord.length >= 2 &&
            typeof currentCoord[0] === 'number' &&
            typeof currentCoord[1] === 'number'
        ) {
            const originalCoord: Position = [currentCoord[0], currentCoord[1]];
            try {
                const convertedCoord = proj4(sourceCRS, targetCRS, originalCoord);
                currentCoord[0] = convertedCoord[0];
                currentCoord[1] = convertedCoord[1];

            } catch (projError: any) {
                const errorMsg = `Coordinate conversion failed for ${JSON.stringify(originalCoord)} from ${sourceCRS}: ${projError?.message || projError}`;
                console.error(errorMsg);
                conversionErrorFound = new Error(errorMsg);
            }
        } else {
            const errorMsg = `Invalid coordinate structure encountered at index ${coordIndex}: ${JSON.stringify(currentCoord)}`;
            console.error(errorMsg);
            conversionErrorFound = new Error(errorMsg);
        }
    });

    if (conversionErrorFound) {
        console.error("Conversion failed:", conversionErrorFound);
        return null;
    }
    return clonedGeometry;
}


export async function fetchWfsGeometry({ namespace, feature }: { namespace: string; feature: ExtendedFeature }) {
    const featureId = feature.id!.toString()
    const layerName = featureId.split('.')[0];
    const ogcFid = feature.properties?.ogc_fid;

    const baseUrl = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/wfs'
    const params = new URLSearchParams({
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        VERSION: '2.0.0',
        TYPENAMES: `${namespace}:${layerName}`, // Extract typename from featureId
        OUTPUTFORMAT: 'application/json',
        SRSNAME: 'EPSG:26912',
    })
    // in order to differentiate between normal layer and a view based layer
    // we need to check if the feature has ogc_fid property
    if (feature.properties?.ogc_fid) { // view based layer
        params.append('CQL_FILTER', `ogc_fid=${ogcFid}`);
    } else { // normal layer
        params.append('FEATUREID', featureId);
    }

    const url = `${baseUrl}?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch WFS feature: ${response.status}`)
    }

    return response.json()
}

// export interface HighlightOptions {
//     fillColor?: [number, number, number, number];
//     outlineColor?: [number, number, number, number];
//     outlineWidth?: number;
//     pointSize?: number;
// }
const defaultSearchResultHighlightOptions: HighlightOptions = {
    fillColor: [255, 255, 0, 1],
    outlineColor: [255, 255, 0, 1],
    outlineWidth: 4,
    pointSize: 5
}

export const createHighlightGraphic = (
    feature: Feature<Geometry, GeoJsonProperties>,
    options: HighlightOptions = {}
): Graphic[] => {
    const mergedOptions = { ...defaultSearchResultHighlightOptions, ...options };
    const coordinates = extractCoordinates(feature.geometry);
    const convertedCoordinates = convertCoordinates(coordinates);
    const graphics: Graphic[] = [];

    switch (feature.geometry.type) {
        case 'Point':
            const pointSymbol = new SimpleMarkerSymbol({
                color: mergedOptions.fillColor,
                size: mergedOptions.pointSize,
                outline: {
                    color: mergedOptions.outlineColor,
                    width: mergedOptions.outlineWidth
                }
            });

            graphics.push(new Graphic({
                geometry: new Point({
                    x: convertedCoordinates[0][0],
                    y: convertedCoordinates[0][1],
                    spatialReference: { wkid: 4326 }
                }),
                symbol: pointSymbol
            }));
            break;

        case 'LineString':
        case 'MultiLineString':
            coordinates.forEach(lineSegment => {
                const convertedSegment = convertCoordinates([lineSegment]);

                const polylineSymbol = new SimpleLineSymbol({
                    color: mergedOptions.outlineColor,
                    width: mergedOptions.outlineWidth
                });

                graphics.push(new Graphic({
                    geometry: new Polyline({
                        paths: [convertedSegment],
                        spatialReference: { wkid: 4326 }
                    }),
                    symbol: polylineSymbol
                }));
            });
            break;

        case 'Polygon':
        case 'MultiPolygon':
            coordinates.forEach(polygonRing => {
                const convertedRing = convertCoordinates([polygonRing]);
                const polygonSymbol = new SimpleFillSymbol({
                    color: mergedOptions.fillColor,
                    outline: {
                        color: mergedOptions.outlineColor,
                        width: mergedOptions.outlineWidth
                    }
                });

                graphics.push(new Graphic({
                    geometry: new Polygon({
                        rings: [convertedRing],
                        spatialReference: { wkid: 4326 }
                    }),
                    symbol: polygonSymbol
                }));
            });
            break;
    }

    return graphics;
};


export const highlightFeature = async (
    feature: ExtendedFeature,
    view: __esri.MapView | __esri.SceneView,
    options?: HighlightOptions
) => {
    // If the feature requires WFS geometry fetching
    let targetFeature: Feature<Geometry, GeoJsonProperties>;
    if ('namespace' in feature) {
        const wfsGeometry = await fetchWfsGeometry({
            namespace: feature.namespace,
            feature: feature
        });
        targetFeature = wfsGeometry.features[0];
    } else {
        targetFeature = feature;
    }

    console.log('highlightFeature', feature);
    console.log('targetFeature', targetFeature);


    // Clear previous highlights
    view.graphics.removeAll();

    // Create and add new highlight graphics with default or provided options
    // click highlight defaults to yellow
    const defaultHighlightOptions: HighlightOptions = {
        fillColor: [0, 0, 0, 0],
        outlineColor: [255, 255, 0, 1],
        outlineWidth: 4,
        pointSize: 12
    }

    const highlightOptions = { ...defaultHighlightOptions, ...options };
    const graphics = createHighlightGraphic(targetFeature, highlightOptions);
    graphics.forEach(graphic => view.graphics.add(graphic));

    // Return the converted coordinates if needed
    const coordinates = extractCoordinates(targetFeature.geometry);
    console.log('Extracted coordinates:', coordinates);

    return convertCoordinates(coordinates);
}

export const clearGraphics = (view: __esri.MapView | __esri.SceneView) => {
    if (view && view.graphics) {
        view.graphics.removeAll();
    } else {
        console.warn("clearGraphics: View or graphics layer is not available.");
    }
}
