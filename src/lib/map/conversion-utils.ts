import { clone, coordEach } from "@turf/turf";
import { Geometry } from "geojson";
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
                // Explicitly convert with more verbose proj4 definition
                // const converted = proj4(
                //     "+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs",
                //     "+proj=longlat +datum=WGS84 +no_defs",
                //     point
                // );
                const converted = proj4(sourceCRS, "EPSG:4326", point);

                console.log('Converted coordinates:', converted, 'from:', sourceCRS, 'to: EPSG:4326', 'for point:', point);


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
export function convertGeometryToWGS84<G extends Geometry>(
    geometry: G | null | undefined,
    sourceCRS: string
): G | null {
    if (!geometry) {
        console.warn("convertGeometryToWGS84: Input geometry is null or undefined.");
        return null;
    }

    const targetCRS = "EPSG:4326";

    // No conversion needed, return a clone to ensure function purity.
    if (sourceCRS === targetCRS || sourceCRS.toUpperCase() === 'WGS84' || sourceCRS.includes('4326')) {
        return clone(geometry) as G;
    }

    try {
        const converter = proj4(sourceCRS, targetCRS);
        const clonedGeometry = clone(geometry) as G;

        coordEach(clonedGeometry, (currentCoord) => {
            const [x, y] = currentCoord;
            if (typeof x === 'number' && typeof y === 'number') {
                const convertedCoord = converter.forward([x, y]);
                currentCoord[0] = convertedCoord[0];
                currentCoord[1] = convertedCoord[1];
            } else {
                throw new Error(`Invalid coordinate structure: ${JSON.stringify(currentCoord)}`);
            }
        });

        return clonedGeometry;

    } catch (error: any) {
        console.error(`Error during geometry conversion from ${sourceCRS} to ${targetCRS}:`, error.message || error);
        return null;
    }
}

