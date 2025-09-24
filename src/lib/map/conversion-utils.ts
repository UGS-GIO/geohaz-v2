import { coordEach } from "@turf/meta";
import { clone } from "@turf/clone";
import { Geometry, Position } from "geojson";
import proj4 from "proj4";

export function convertDDToDMS(dd: number, isLongitude: boolean = false) {
    const dir = dd < 0
        ? isLongitude ? 'W' : 'S'
        : isLongitude ? 'E' : 'N';

    const absDd = Math.abs(dd);
    const degrees = Math.floor(absDd);
    const minutes = Math.floor((absDd - degrees) * 60);
    const seconds = Math.round(((absDd - degrees) * 60 - minutes) * 60);

    // Pad degrees, minutes, and seconds with leading zeros if they're less than 10
    const degreesStr = degrees.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return `${degreesStr}° ${minutesStr}' ${secondsStr}" ${dir}`;
}


export const convertCoordinate = (point: number[], sourceEPSG: string, targetEPSG: string = "EPSG:4326"): number[] => {
    try {
        const converted = proj4(
            sourceEPSG,
            targetEPSG,
            point
        );

        return converted;
    } catch (error) {
        console.error('Coordinate conversion error:', error);
        return point; // fallback to original point
    }
};

export const convertBbox = (bbox: number[], sourceEPSG: string, targetEPSG: string = "EPSG:4326"): number[] => {

    try {
        // Convert each corner of the bbox
        const minXConverted = convertCoordinate([bbox[0], bbox[1]], sourceEPSG, targetEPSG);
        const maxXConverted = convertCoordinate([bbox[2], bbox[3]], sourceEPSG, targetEPSG);

        // Return in [minX, minY, maxX, maxY] format for target coordinate system
        return [
            minXConverted[0],
            minXConverted[1],
            maxXConverted[0],
            maxXConverted[1]
        ];
    } catch (error) {
        console.error('Bbox conversion error:', error);
        return bbox; // fallback to original bbox
    }
};

export const convertCoordinates = (coordinates: number[][][], sourceCRS: string): number[][] => {
    return coordinates.flatMap(linestring =>
        linestring.map(point => {
            try {
                const converted = proj4(sourceCRS, "EPSG:4326", point);
                return converted;
            } catch (error) {
                console.error('Conversion error:', error);
                return point; // fallback
            }
        })
    );
};

export const extractCoordinates = (geometry: Geometry): number[][][] => {
    switch (geometry.type) {
        case 'Point':
            return [[geometry.coordinates as number[]]];
        case 'LineString':
            return [geometry.coordinates as number[][]];
        case 'MultiLineString':
            return geometry.coordinates as number[][][];
        case 'Polygon':
            return geometry.coordinates;
        case 'MultiPolygon':
            return geometry.coordinates.flatMap(polygon => polygon);
        default:
            console.warn('Unsupported geometry type', geometry.type);
            return [];
    }
};


/**
 * Converts a GeoJSON geometry object from a source CRS to WGS84 (EPSG:4326).
 * This is the single source of truth for all coordinate conversions.
 */
// --- Reproject GeoJSON Geometry to WGS84 ---
export function convertGeometryToWGS84<G extends Geometry>(
    geometry: G | null | undefined,
    sourceCRS: string
): G | null {
    if (!geometry) {
        console.warn("convertGeometryToWGS84: Input geometry is null or undefined.");
        return null;
    }

    const targetCRS = "EPSG:4326";

    if (sourceCRS.toUpperCase() === targetCRS || sourceCRS.toUpperCase() === 'WGS84' || sourceCRS.toUpperCase() === '4326') {
        try {
            return clone(geometry) as G;
        } catch (cloneError: any) {
            console.error("Error cloning geometry:", cloneError);
            return null;
        }
    }

    let clonedGeometry: G;
    try {
        clonedGeometry = clone(geometry);
    } catch (setupError: any) {
        console.error(`Error during geometry conversion setup for ${sourceCRS}:`, setupError);
        return null;
    }

    let conversionErrorFound: Error | null = null;
    coordEach(clonedGeometry, (currentCoord, coordIndex) => {
        if (conversionErrorFound) return;
        if (Array.isArray(currentCoord) && currentCoord.length >= 2) {
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

