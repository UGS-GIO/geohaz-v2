export interface MapPoint {
    x: number;
    y: number;
    spatialReference?: {
        wkid: number;
    };
}

export interface ScreenPoint {
    x: number;
    y: number;
}

export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

// Abstract coordinate adapter interface
export interface CoordinateAdapter {
    screenToMap(screenPoint: ScreenPoint, view: any): MapPoint;
    createBoundingBox(params: {
        mapPoint: MapPoint;
        resolution: number;
        buffer: number;
    }): BoundingBox;
    toJSON(point: MapPoint | null): any;
}

// ArcGIS implementation
export class ArcGISCoordinateAdapter implements CoordinateAdapter {
    screenToMap(screenPoint: ScreenPoint, view: __esri.MapView | __esri.SceneView): MapPoint {

        const arcgisPoint = view.toMap(screenPoint);
        if (!arcgisPoint) {
            // Fallback if conversion fails
            return {
                x: 0,
                y: 0,
                spatialReference: { wkid: 3857 }
            };
        }

        return {
            x: arcgisPoint.x,
            y: arcgisPoint.y,
            spatialReference: {
                wkid: arcgisPoint.spatialReference?.wkid || 3857
            }
        };
    }

    createBoundingBox({ mapPoint, resolution, buffer }: {
        mapPoint: MapPoint;
        resolution: number;
        buffer: number;
    }): BoundingBox {
        const halfWidth = (buffer * resolution) / 2;
        const halfHeight = (buffer * resolution) / 2;

        return {
            minX: mapPoint.x - halfWidth,
            minY: mapPoint.y - halfHeight,
            maxX: mapPoint.x + halfWidth,
            maxY: mapPoint.y + halfHeight,
        };
    }

    toJSON(point: MapPoint | null): any {

        if (!point) return null;
        return {
            x: point.x,
            y: point.y,
            spatialReference: point.spatialReference
        };
    }
}

// Future MapLibre implementation
export class MapLibreCoordinateAdapter implements CoordinateAdapter {
    screenToMap(screenPoint: ScreenPoint, view: any /* maplibre.Map */): MapPoint {
        // TODO: Maplibre implementation
        // const lngLat = view.unproject([screenPoint.x, screenPoint.y]);
        // return { x: lngLat.lng, y: lngLat.lat, spatialReference: { wkid: 4326 } };
        console.log(screenPoint, view);

        throw new Error('MapLibre adapter not yet implemented');
    }

    createBoundingBox({ mapPoint, resolution, buffer }: {
        mapPoint: MapPoint;
        resolution: number;
        buffer: number;
    }): BoundingBox {
        console.log(mapPoint, resolution, buffer);

        // TODO: MapLibre-specific bounding box calculation
        throw new Error('MapLibre adapter not yet implemented');
    }

    toJSON(point: MapPoint | null): any {
        if (!point) return null;
        return { x: point.x, y: point.y };
    }
}

// Factory function
export function createCoordinateAdapter(mapType: 'arcgis' | 'maplibre'): CoordinateAdapter {
    switch (mapType) {
        case 'arcgis':
            return new ArcGISCoordinateAdapter();
        case 'maplibre':
            return new MapLibreCoordinateAdapter();
        default:
            throw new Error(`Unknown map type: ${mapType}`);
    }
}