import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMap } from '@/context/map-provider';
import { convertDDToDMS } from '@/lib/map/conversion-utils';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import Point from '@arcgis/core/geometry/Point';
import { useIsMobile } from '@/hooks/use-mobile';

const COORD_PRECISION = 3;

const formatCoord = (coord: number | undefined | null): string => {
    const num = Number(coord);
    if (isNaN(num)) return "";
    return num.toFixed(COORD_PRECISION);
};

const convertToDisplayFormat = (x: string, y: string, isDD: boolean, convertDDToDMSFn: typeof convertDDToDMS) => {
    if (!x || !y) return { x: "", y: "" };
    if (isDD) {
        return { x, y };
    } else {
        const dmsX = convertDDToDMSFn(parseFloat(x), true);
        const dmsY = convertDDToDMSFn(parseFloat(y));
        return { x: dmsX, y: dmsY };
    }
};

export function useMapCoordinates() {
    const { view } = useMap();
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const search = useSearch({ from: '__root__' });
    const isDecimalDegrees = search.coordinate_format !== 'dms';
    const [scale, setScale] = useState<number>(view?.scale || 0);
    const [coordinates, setCoordinates] = useState<{ x: string; y: string }>({ x: "", y: "" });
    const lastDecimalCoordinates = useRef<{ x: string; y: string }>({ x: "", y: "" });

    const locationCoordinateFormat = isDecimalDegrees ? "Decimal Degrees" : "Degrees, Minutes, Seconds";

    useEffect(() => {
        const { x, y } = lastDecimalCoordinates.current;
        if (x && y) {
            setCoordinates(convertToDisplayFormat(x, y, isDecimalDegrees, convertDDToDMS));
        }
    }, [isDecimalDegrees]);

    const updateDisplayedCoordinatesAndScale = useCallback((point: __esri.Point | nullish, currentScale: number) => {
        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
            const geoPoint = webMercatorUtils.webMercatorToGeographic(point) as Point;
            if (geoPoint && typeof geoPoint.x === 'number' && typeof geoPoint.y === 'number') {
                lastDecimalCoordinates.current = {
                    x: formatCoord(geoPoint.x),
                    y: formatCoord(geoPoint.y),
                };
                setCoordinates(convertToDisplayFormat(lastDecimalCoordinates.current.x, lastDecimalCoordinates.current.y, isDecimalDegrees, convertDDToDMS));
            }
        }
        setScale(currentScale);
    }, [isDecimalDegrees]);

    const handleDesktopViewChange = useCallback(
        (currentView: __esri.MapView | __esri.SceneView) => {
            let zoomWatcher: __esri.WatchHandle;
            let pointerMoveHandler: __esri.WatchHandle;

            currentView.when(() => {
                updateDisplayedCoordinatesAndScale(currentView.center, currentView.scale);
                zoomWatcher = currentView.watch("zoom", () => {
                    updateDisplayedCoordinatesAndScale(
                        currentView.toMap(currentView.center) || currentView.center,
                        currentView.scale
                    );
                });
                pointerMoveHandler = currentView.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
                    const mapPoint = currentView.toMap({ x: event.x, y: event.y });
                    updateDisplayedCoordinatesAndScale(mapPoint, currentView.scale);
                });
            });
            return () => {
                zoomWatcher?.remove();
                pointerMoveHandler?.remove();
            };
        },
        [updateDisplayedCoordinatesAndScale]
    );

    const handleMobileViewChange = useCallback(
        (currentView: __esri.MapView | __esri.SceneView) => {
            let stationaryWatcher: __esri.WatchHandle;
            currentView.when(() => {
                updateDisplayedCoordinatesAndScale(currentView.center, currentView.scale);
                stationaryWatcher = currentView.watch("stationary", (isStationary) => {
                    if (isStationary) {
                        updateDisplayedCoordinatesAndScale(currentView.center, currentView.scale);
                    }
                });
            });
            return () => {
                stationaryWatcher?.remove();
            };
        },
        [updateDisplayedCoordinatesAndScale]
    );

    useEffect(() => {
        if (view) {
            let cleanupFunction: () => void;
            if (isMobile) {
                cleanupFunction = handleMobileViewChange(view);
            } else {
                cleanupFunction = handleDesktopViewChange(view);
            }
            return cleanupFunction;
        }
    }, [view, isMobile, handleDesktopViewChange, handleMobileViewChange]);

    const setCoordinateFormat = useCallback((newIsDecimalDegrees: boolean) => {
        navigate({
            to: ".",
            search: (prev) => ({
                ...prev,
                coordinate_format: newIsDecimalDegrees ? 'dd' : 'dms',
            }),
            replace: true,
        });
    }, [navigate]);

    return {
        isDecimalDegrees,
        setIsDecimalDegrees: setCoordinateFormat,
        coordinates,
        setCoordinates,
        scale,
        locationCoordinateFormat,
    };
}