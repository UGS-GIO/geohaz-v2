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


export const convertCoordinate = (point: number[], sourceEPSG: string = "EPSG:26912", targetEPSG: string = "EPSG:4326"): number[] => {
    try {
        const converted = proj4(
            sourceEPSG,
            targetEPSG,
            point
        );

        console.log('Converted coordinates:', converted);


        return converted;
    } catch (error) {
        console.error('Coordinate conversion error:', error);
        return point; // fallback to original point
    }
};

export const convertBbox = (bbox: number[], sourceEPSG: string = "EPSG:26912", targetEPSG: string = "EPSG:4326"): number[] => {
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

export const convertCoordinates = (coordinates: number[][][]): number[][] => {
    return coordinates.flatMap(linestring =>
        linestring.map(point => {
            try {
                // Explicitly convert with more verbose proj4 definition
                const converted = proj4(
                    "+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs",
                    "+proj=longlat +datum=WGS84 +no_defs",
                    point
                );

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
