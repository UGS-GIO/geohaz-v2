import { Feature, Geometry, GeoJsonProperties, Position } from 'geojson';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { extractCoordinates } from '@/lib/mapping-utils';
import { ExtendedGeometry } from '@/components/sidebar/filter/search-combobox';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { MAP_PIN_ICON } from '@/assets/icons';
import { clone, coordEach } from '@turf/turf';
import proj4 from 'proj4';

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

    const wgs84Geometry = convertGeometryToWGS84<Geometry>(
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

    const defaulSearchtHighlightOptions: Required<HighlightOptions> = {
        fillColor: [255, 255, 0, 0.5], // Slightly transparent yellow fill
        outlineColor: [255, 255, 0, 1],  // Solid yellow outline
        outlineWidth: 2,
        pointSize: 8
    };
    const highlightOptions: Required<HighlightOptions> = { ...defaulSearchtHighlightOptions, ...options };
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

export function convertGeometryToWGS84<G extends Geometry | null | undefined>(
    geometry: G,
    sourceCRS = "EPSG:4326"
): Exclude<G, null | undefined> {
    if (!geometry) {
        throw new Error("Input geometry cannot be null or undefined.");
    }

    const nonNullGeometry = geometry as Exclude<G, null | undefined>;
    const targetCRS = "EPSG:4326"; // Target is always WGS84 to comply with geojson spec https://datatracker.ietf.org/doc/html/rfc7946#section-4

    // no conversion needed
    if (sourceCRS === targetCRS || sourceCRS.toUpperCase() === 'WGS84' || sourceCRS === '4326') {
        console.log("Source CRS is already WGS84, returning clone.");
        try {
            // Return a clone to ensure function purity
            return clone(nonNullGeometry);
        } catch (cloneError: any) {
            console.error("Error cloning geometry:", cloneError);
            // Re-throw as a more specific error if desired
            throw new Error(`Failed to clone geometry: ${cloneError?.message || cloneError}`);
        }
    }

    // conversion needed
    let clonedGeometry: Exclude<G, null | undefined>;
    try {
        proj4.defs(sourceCRS);
        proj4.defs(targetCRS);

        // clone the geometry to avoid modifying the original
        clonedGeometry = clone(nonNullGeometry);
    } catch (setupError: any) {
        console.error(`Error during geometry conversion setup for ${sourceCRS}:`, setupError);
        throw new Error(`Setup failed for conversion from ${sourceCRS}: ${setupError?.message || setupError}`);
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
        throw conversionErrorFound;
    }
    return clonedGeometry;
}