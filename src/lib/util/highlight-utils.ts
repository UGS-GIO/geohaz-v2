import { Feature, Geometry, GeoJsonProperties, Position } from 'geojson';
// Import necessary Esri modules
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import type MapView from '@arcgis/core/views/MapView'; // Use 'type' for type-only imports
import type SceneView from '@arcgis/core/views/SceneView';
// Adjust path as needed for your utility functions
import { extractCoordinates } from '../mapping-utils';
// Adjust path as needed for your custom type
import { ExtendedGeometry } from '@/components/sidebar/filter/search-combobox';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { MAP_PIN_ICON } from '@/assets/icons';
import { clone, coordEach } from '@turf/turf';
import proj4 from 'proj4';

// --- Helper Types ---

// Define Highlight Options
interface HighlightOptions {
    fillColor?: __esri.Color | number[];
    outlineColor?: __esri.Color | number[];
    outlineWidth?: number;
    pointSize?: number;
}

// --- Helper Functions ---

// Define a helper to create Esri geometry from GeoJSON geometry + SR
const createEsriGeometry = (
    geoJsonGeometry: Geometry, // Input is standard GeoJSON Geometry (post-conversion)
    spatialReference: SpatialReference
): __esri.Geometry | null => {
    if (!geoJsonGeometry) return null;

    console.log("createEsriGeometry: Converting GeoJSON to Esri geometry:", geoJsonGeometry);


    try {
        switch (geoJsonGeometry.type) {
            case 'Point':
                return new Point({
                    x: geoJsonGeometry.coordinates[0],
                    y: geoJsonGeometry.coordinates[1],
                    spatialReference: spatialReference,
                });
            case 'LineString':
                // Note: Assumes simple LineString. MultiLineString might need iteration.
                return new Polyline({
                    paths: [geoJsonGeometry.coordinates], // Esri paths are arrays of points
                    spatialReference: spatialReference,
                });
            case 'Polygon':
                // Note: Assumes simple Polygon. MultiPolygon might need iteration.
                return new Polygon({
                    rings: geoJsonGeometry.coordinates, // Esri rings are arrays of points
                    spatialReference: spatialReference,
                });
            // TODO: Add cases for MultiPoint, MultiLineString, MultiPolygon if needed
            // Example for MultiLineString:
            case 'MultiLineString':
                return new Polyline({
                    paths: geoJsonGeometry.coordinates, // Already array of paths
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

// Define a helper to create Esri Graphics from Esri Geometry + Options
const createEsriGraphics = (
    esriGeometry: __esri.Geometry,
    options: Required<HighlightOptions> // Use Required since we have defaults
): Graphic[] => { // Return array
    if (!esriGeometry) {
        return [];
    }

    try {
        switch (esriGeometry.type) {
            case 'point':
            case 'multipoint': { // Use block scope for constants
                const pointSymbol = new SimpleMarkerSymbol({
                    color: options.fillColor,
                    size: options.pointSize,
                    outline: {
                        color: options.outlineColor,
                        width: options.outlineWidth > 0 ? 1 : 0 // Point outlines often thin
                    }
                });
                return [new Graphic({ geometry: esriGeometry, symbol: pointSymbol })];
            }

            case 'polyline': { // Use block scope
                const lineSymbol = new SimpleLineSymbol({
                    color: options.outlineColor,
                    width: options.outlineWidth
                });
                return [new Graphic({ geometry: esriGeometry, symbol: lineSymbol })];
            }

            case 'polygon': { // Use block scope
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


// --- Main Highlight Function ---

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
    view: MapView | SceneView,
    clearGraphics: boolean = true,
    options?: HighlightOptions
): Promise<Position | Position[] | Position[][] | Position[][][] | null> => {

    // 1. Validate Input & Get Geometry/CRS
    if (!searchResult?.geometry) {
        console.warn('highlightSearchResult: Invalid searchResult or missing geometry. Cannot highlight.');
        return null;
    }
    // Use the specific ExtendedGeometry type for the original geometry
    const originalGeometry: ExtendedGeometry = searchResult.geometry;

    // Get source CRS only from the geometry object
    const sourceCRS = originalGeometry.crs?.properties?.name;
    const effectiveSourceCRS = sourceCRS || "EPSG:4326"; // Assume WGS84 if undefined

    if (!sourceCRS) {
        console.warn(`highlightSearchResult: Source CRS is undefined on geometry. Assuming WGS84 (${effectiveSourceCRS}). Highlighting might be inaccurate if assumption is wrong.`);
    }

    // 2. Convert Geometry to WGS84 *FIRST*
    // Use the correct input type (ExtendedGeometry) and specify output type (Geometry)
    const wgs84Geometry = convertGeometryToWGS84<Geometry>(
        originalGeometry,
        effectiveSourceCRS
    );

    // 3. Handle Conversion Failure
    if (!wgs84Geometry) {
        console.error(`highlightSearchResult: Failed to convert geometry from ${effectiveSourceCRS} to WGS84. Cannot highlight accurately.`);
        clearGraphics && view.graphics.removeAll(); // Clear graphics even on failure if requested
        return null; // Indicate failure
    }

    // 4. Create Esri Geometry (WGS84)
    const wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
    const esriGeom = createEsriGeometry(wgs84Geometry, wgs84SpatialReference); // Use the converted geometry

    if (!esriGeom) {
        console.error("highlightSearchResult: Failed to create Esri geometry from converted WGS84 GeoJSON.");
        clearGraphics && view.graphics.removeAll();
        return null;
    }

    // 5. Prepare Options & Create Esri Graphics (Symbolized)
    const defaultHighlightOptions: Required<HighlightOptions> = {
        fillColor: [255, 255, 0, 0.5], // Slightly transparent yellow fill
        outlineColor: [255, 255, 0, 1],  // Solid yellow outline
        outlineWidth: 2,
        pointSize: 8
    };
    const highlightOptions: Required<HighlightOptions> = { ...defaultHighlightOptions, ...options };
    const graphics = createEsriGraphics(esriGeom, highlightOptions); // Use the Esri geometry

    if (!graphics || graphics.length === 0) {
        console.warn("highlightSearchResult: No graphics were generated for highlighting (geometry type unsupported?).");
        clearGraphics && view.graphics.removeAll();
        // Return coords since conversion succeeded, even if highlight failed (e.g., unsupported type)
        return extractCoordinates(wgs84Geometry);
    }

    // 6. Add Graphics to View
    if (clearGraphics) {
        view.graphics.removeAll();
    }
    view.graphics.addMany(graphics); // Use addMany for efficiency

    // --- Optional: Zoom/Go To ---
    // Consider adding view.goTo(graphics).catch(err => console.error("Error zooming:", err));

    // 7. Extract Coordinates from WGS84 Geometry for Return
    const wgs84Coordinates = extractCoordinates(wgs84Geometry);

    // 8. Return Coordinates
    console.log("highlightSearchResult: Highlight successful. Returning WGS84 coordinates.");
    return wgs84Coordinates;
};

// Remove all graphics from the view
export function removeGraphics(view: SceneView | MapView) {
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

    // Add the graphics to the view's graphics layer
    view.graphics.add(pointGraphic);
}

export function convertGeometryToWGS84<G extends Geometry | null | undefined>(
    geometry: G, // Allow null/undefined input type
    sourceCRS = "EPSG:4326" // Default source CRS
): Exclude<G, null | undefined> { // Return type promises the original type, excluding null/undefined
    // 1. Validate non-null input immediately
    if (!geometry) {
        throw new Error("Input geometry cannot be null or undefined.");
    }

    // Ensure the return type matches the non-null input type.
    // We cast here because TS doesn't automatically know !geometry narrows G
    // to Exclude<G, null|undefined> inside the function scope for the return.
    const nonNullGeometry = geometry as Exclude<G, null | undefined>;

    const targetCRS = "EPSG:4326"; // Target is always WGS84

    // 2. Handle cases where no conversion is needed
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

    // 3. Perform Conversion
    let clonedGeometry: Exclude<G, null | undefined>;
    try {
        // Verify proj4 definitions are loaded before proceeding
        proj4.defs(sourceCRS);
        proj4.defs(targetCRS);

        // Create a deep copy to modify
        clonedGeometry = clone(nonNullGeometry);
    } catch (setupError: any) {
        // Catch errors from proj4 setup or cloning
        console.error(`Error during geometry conversion setup for ${sourceCRS}:`, setupError);
        throw new Error(`Setup failed for conversion from ${sourceCRS}: ${setupError?.message || setupError}`);
    }

    let conversionErrorFound: Error | null = null; // Store the first error

    // Iterate over each coordinate pair [x, y]
    coordEach(clonedGeometry, (currentCoord /* Position */, coordIndex /* number */) => {
        // Stop processing if an error was already found
        if (conversionErrorFound) return;

        // Basic validation of coordinate structure
        if (
            Array.isArray(currentCoord) &&
            currentCoord.length >= 2 &&
            typeof currentCoord[0] === 'number' &&
            typeof currentCoord[1] === 'number'
        ) {
            const originalCoord: Position = [currentCoord[0], currentCoord[1]];
            try {
                // Convert: proj4 expects [x, y] order matching source definition
                const convertedCoord = proj4(sourceCRS, targetCRS, originalCoord);

                // Mutate the coordinate *in the cloned geometry*
                currentCoord[0] = convertedCoord[0];
                currentCoord[1] = convertedCoord[1];

            } catch (projError: any) {
                const errorMsg = `Coordinate conversion failed for ${JSON.stringify(originalCoord)} from ${sourceCRS}: ${projError?.message || projError}`;
                console.error(errorMsg);
                conversionErrorFound = new Error(errorMsg); // Store the error
            }
        } else {
            // Decide how to handle invalid structures: warning vs error
            const errorMsg = `Invalid coordinate structure encountered at index ${coordIndex}: ${JSON.stringify(currentCoord)}`;
            console.error(errorMsg);
            // Option 1: Treat as fatal error
            conversionErrorFound = new Error(errorMsg);
            // Option 2: Warn and skip (as in original) - if you do this, you can't guarantee the whole geometry is valid
            // console.warn(`Skipping conversion for invalid coordinate structure at index ${coordIndex}:`, currentCoord);
        }
    }); // End coordEach

    // If any coordinate failed, throw the stored error
    if (conversionErrorFound) {
        throw conversionErrorFound;
    }

    // Return the successfully modified clone
    console.log("Geometry successfully converted to WGS84.", clonedGeometry);

    return clonedGeometry;
}