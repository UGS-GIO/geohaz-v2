import { useRef, useMemo, useCallback, useState } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PROD_GEOSERVER_URL } from '@/lib/constants';

const HAZARDS_WORKSPACE = 'hazards';
const hazardLayerNameMap: Record<string, string> = {
    'QFF': `${HAZARDS_WORKSPACE}:quaternaryfaults_current`,
    'LQS': `${HAZARDS_WORKSPACE}:liquefaction_current`,
    'SFR': `${HAZARDS_WORKSPACE}:surfacefaultrupture_current`,
    'EGS': `${HAZARDS_WORKSPACE}:groundshaking_current`,
    'FLH': `${HAZARDS_WORKSPACE}:floodanddebrisflow_current`,
    'SGS': `${HAZARDS_WORKSPACE}:shallowgroundwater_current`,
    'AAF': `${HAZARDS_WORKSPACE}:alluvialfan_current`,
    'LSS': `${HAZARDS_WORKSPACE}:landslidesusceptibility_current`,
    'LSF': `${HAZARDS_WORKSPACE}:landslideinventory_current`,
    'LSC': `${HAZARDS_WORKSPACE}:landslidelegacy_current`,
    'RFH': `${HAZARDS_WORKSPACE}:rockfall_current`,
    'CSS': `${HAZARDS_WORKSPACE}:collapsiblesoil_current`,
    'CRS': `${HAZARDS_WORKSPACE}:corrosivesoilrock_current`,
    'EFH': `${HAZARDS_WORKSPACE}:earthfissure_current`,
    'ERZ': `${HAZARDS_WORKSPACE}:erosionhazardzone_current`,
    'EXS': `${HAZARDS_WORKSPACE}:expansivesoilrock_current`,
    'MKF': `${HAZARDS_WORKSPACE}:karstfeatures_current`,
    'PES': `${HAZARDS_WORKSPACE}:pipinganderosion_current`,
    'GRS': `${HAZARDS_WORKSPACE}:radonsusceptibility_current`,
    'SDH': `${HAZARDS_WORKSPACE}:salttectonicsdeformation_current`,
    'SBP': `${HAZARDS_WORKSPACE}:shallowbedrock_current`,
    'SLS': `${HAZARDS_WORKSPACE}:solublesoilandrock_current`,
    'WSS': `${HAZARDS_WORKSPACE}:windblownsand_current`,
};

const hazardColorMap: Record<string, string> = {
    'QFF': '#ef4444',
    'LQS': '#f97316',
    'SFR': '#dc2626',
    'EGS': '#ea580c',
    'FLH': '#3b82f6',
    'SGS': '#0ea5e9',
    'AAF': '#06b6d4',
    'LSS': '#84cc16',
    'LSF': '#65a30d',
    'LSC': '#4d7c0f',
    'RFH': '#a16207',
    'CSS': '#eab308',
    'CRS': '#ca8a04',
    'EFH': '#d97706',
    'ERZ': '#b45309',
    'EXS': '#92400e',
    'MKF': '#78350f',
    'PES': '#9333ea',
    'GRS': '#7c3aed',
    'SDH': '#6366f1',
    'SBP': '#8b5cf6',
    'SLS': '#a855f7',
    'WSS': '#c084fc',
};

interface ReportMapProps {
    title?: string;
    polygon?: string;
    hazardCodes?: string[];
    height?: number;
    showControls?: boolean;
    geoserverUrl?: string;
}

// Parse polygon coordinates
function parsePolygonCoordinates(polygon: string | undefined): number[][] | null {
    if (!polygon) return null;

    try {
        const parsed = JSON.parse(polygon);

        // Handle Esri/ArcGIS format: { spatialReference: {...}, rings: [[[x, y], ...]] }
        if (parsed.rings && Array.isArray(parsed.rings[0])) {
            const coords = parsed.rings[0];
            const wkid = parsed.spatialReference?.wkid || parsed.spatialReference?.latestWkid;

            // If it's Web Mercator (3857) or other projected system, we might need conversion
            if (wkid && wkid !== 4326) {
                console.warn(`Polygon is in EPSG:${wkid}, conversion to EPSG:4326 may be needed`);
                // For Web Mercator (3857) to WGS84 (4326) conversion
                if (wkid === 3857 || wkid === 102100) {
                    return coords.map(([x, y]: number[]) => {
                        const lng = (x / 20037508.34) * 180;
                        const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360) / Math.PI - 90;
                        return [lng, lat];
                    });
                }
            }

            return coords;
        }

        // Handle different formats:
        // 1. Already an array of coordinates: [[lng, lat], [lng, lat], ...]
        if (Array.isArray(parsed) && Array.isArray(parsed[0]) && typeof parsed[0][0] === 'number') {
            return parsed;
        }

        // 2. GeoJSON Polygon: { type: "Polygon", coordinates: [[[lng, lat], ...]] }
        if (parsed.type === 'Polygon' && Array.isArray(parsed.coordinates?.[0])) {
            return parsed.coordinates[0];
        }

        // 3. Nested array (Polygon coordinates): [[[lng, lat], [lng, lat], ...]]
        if (Array.isArray(parsed[0]?.[0]) && typeof parsed[0][0][0] === 'number') {
            return parsed[0];
        }

        // 4. GeoJSON Feature with Polygon geometry
        if (parsed.geometry?.type === 'Polygon' && Array.isArray(parsed.geometry.coordinates?.[0])) {
            return parsed.geometry.coordinates[0];
        }

        console.warn('Unrecognized polygon format:', parsed);
        return null;
    } catch (e) {
        console.error('Error parsing polygon:', e);
        return null;
    }
}

// Calculate bounding box from coordinates
function calculateBounds(coordinates: number[][]): [[number, number], [number, number]] | null {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
        return null;
    }

    const lngs = coordinates.map(coord => coord[0]).filter(v => typeof v === 'number');
    const lats = coordinates.map(coord => coord[1]).filter(v => typeof v === 'number');

    if (lngs.length === 0 || lats.length === 0) {
        return null;
    }

    return [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)]
    ];
}

// Create GeoJSON feature from coordinates
function createPolygonFeature(coordinates: number[][]) {
    return {
        type: 'Feature' as const,
        geometry: {
            type: 'Polygon' as const,
            coordinates: [coordinates]
        },
        properties: {}
    };
}

export function ReportMap({
    title = 'Map',
    polygon,
    hazardCodes = [],
    height = 400,
    showControls = false,
    geoserverUrl
}: ReportMapProps) {
    const mapRef = useRef<MapRef>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Parse polygon coordinates with useMemo
    const polygonCoords = useMemo(() => parsePolygonCoordinates(polygon), [polygon]);

    // Calculate bounds with useMemo
    const bounds = useMemo(() => {
        if (!polygonCoords) return null;
        return calculateBounds(polygonCoords);
    }, [polygonCoords]);

    // Create GeoJSON feature with useMemo
    const polygonFeature = useMemo(() => {
        if (!polygonCoords) return null;
        return createPolygonFeature(polygonCoords);
    }, [polygonCoords]);

    // Fit bounds when map loads
    const onMapLoad = useCallback(() => {
        if (bounds && mapRef.current) {
            setTimeout(() => {
                mapRef.current?.fitBounds(bounds, { padding: 50, duration: 0 });
                setTimeout(() => {
                    setIsMapLoaded(true);
                }, 500);
            }, 100);
        } else {
            setTimeout(() => {
                setIsMapLoaded(true);
            }, 500);
        }
    }, [bounds]);

    // Filter valid hazard layers
    const validHazardLayers = useMemo(() => {
        return hazardCodes
            .filter(code => hazardLayerNameMap[code])
            .map(code => ({
                code,
                layerName: hazardLayerNameMap[code],
                color: hazardColorMap[code] || '#f97316'
            }));
    }, [hazardCodes]);

    // Generate WMS URL for a layer
    const getWmsUrl = useCallback((layerName: string) => {
        const baseUrl = geoserverUrl || PROD_GEOSERVER_URL;
        return `${baseUrl}/wms?` +
            `SERVICE=WMS&` +
            `VERSION=1.1.0&` +
            `REQUEST=GetMap&` +
            `FORMAT=image/png&` +
            `TRANSPARENT=true&` +
            `LAYERS=${layerName}&` +
            `SRS=EPSG:3857&` +
            `WIDTH=256&` +
            `HEIGHT=256&` +
            `BBOX={bbox-epsg-3857}`;
    }, [geoserverUrl]);

    // Calculate initial view state based on bounds
    const initialViewState = useMemo(() => {
        if (bounds) {
            const [[minLng, minLat], [maxLng, maxLat]] = bounds;
            const centerLng = (minLng + maxLng) / 2;
            const centerLat = (minLat + maxLat) / 2;

            // Calculate zoom level based on bounds size
            const lngDiff = maxLng - minLng;
            const latDiff = maxLat - minLat;
            const maxDiff = Math.max(lngDiff, latDiff);

            let zoom = 10;
            if (maxDiff > 1) zoom = 7;
            else if (maxDiff > 0.5) zoom = 8;
            else if (maxDiff > 0.2) zoom = 9;
            else if (maxDiff > 0.1) zoom = 10;
            else if (maxDiff > 0.05) zoom = 11;
            else if (maxDiff > 0.02) zoom = 12;
            else zoom = 13;

            return {
                longitude: centerLng,
                latitude: centerLat,
                zoom
            };
        }
        return {
            longitude: -111.8910,
            latitude: 40.7608,
            zoom: 7
        };
    }, [bounds]);

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm">
            {title && (
                <div className="bg-muted px-4 py-2 border-b">
                    <h4 className="font-semibold text-sm">{title}</h4>
                </div>
            )}
            <div style={{ height: `${height}px`, position: 'relative' }}>
                {/* Loading overlay */}
                {!isMapLoaded && (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading map...</p>
                        </div>
                    </div>
                )}

                <Map
                    ref={mapRef}
                    initialViewState={initialViewState}
                    onLoad={onMapLoad}
                    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                    attributionControl={false}
                    scrollZoom={false}
                    dragPan={false}
                    dragRotate={false}
                    doubleClickZoom={false}
                    touchZoomRotate={false}
                    keyboard={false}
                    style={{ opacity: isMapLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in' }}
                >
                    {/* Hazard Layers - WMS (render first, so they're below) */}
                    {validHazardLayers.map(({ code, layerName }) => (
                        <Source
                            key={code}
                            id={`hazard-${code}`}
                            type="raster"
                            tiles={[getWmsUrl(layerName)]}
                            tileSize={256}
                        >
                            <Layer
                                id={`hazard-layer-${code}`}
                                type="raster"
                                paint={{
                                    'raster-opacity': 0.7
                                }}
                            />
                        </Source>
                    ))}

                    {/* AOI Polygon (render last, so it's on top) */}
                    {polygonFeature && (
                        <Source
                            id="aoi-polygon"
                            type="geojson"
                            data={polygonFeature}
                        >
                            <Layer
                                id="aoi-fill"
                                type="fill"
                                paint={{
                                    'fill-color': '#3b82f6',
                                    'fill-opacity': 0.1
                                }}
                            />
                            <Layer
                                id="aoi-outline"
                                type="line"
                                paint={{
                                    'line-color': '#3b82f6',
                                    'line-width': 2.5,
                                    'line-dasharray': [2, 2]
                                }}
                            />
                        </Source>
                    )}
                </Map>
            </div>
            {showControls && (
                <div className="bg-muted px-4 py-2 text-xs text-muted-foreground flex justify-between">
                    <span>Use mouse to pan and zoom</span>
                    {bounds && (
                        <span>
                            Bounds: [{bounds[0][0].toFixed(4)}, {bounds[0][1].toFixed(4)}] -
                            [{bounds[1][0].toFixed(4)}, {bounds[1][1].toFixed(4)}]
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}