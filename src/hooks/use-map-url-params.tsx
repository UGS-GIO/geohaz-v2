import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from '@tanstack/react-router';
import Point from "@arcgis/core/geometry/Point.js";


const useMapUrlParams = (view: __esri.MapView | __esri.SceneView | undefined) => {
    const navigate = useNavigate();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mapState, setMapState] = useState({ zoom: 8, center: [-112, 39.5] });

    // Update URL params for zoom and center
    const updateUrlParams = useCallback(() => {
        if (view) {
            const { latitude, longitude } = view.center;
            const zoom = view.zoom;

            const formattedLongitude = parseFloat(longitude.toFixed(3));
            const formattedLatitude = parseFloat(latitude.toFixed(3));

            // Update local state
            setMapState({ zoom, center: [formattedLongitude, formattedLatitude] });

            navigate({
                to: ".",
                search: { zoom: zoom, lat: formattedLatitude, lon: formattedLongitude },
                replace: true,
            });
        }
    }, [view, navigate]);

    // Set up watchers for zoom and center changes
    useEffect(() => {
        if (!view) return;

        const handleUpdate = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(updateUrlParams, 300);
        };

        const zoomWatcher = view.watch("zoom", handleUpdate);
        const centerWatcher = view.watch("center", handleUpdate);

        return () => {
            zoomWatcher.remove();
            centerWatcher.remove();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [view, updateUrlParams]);

    // Initialize map view based on URL parameters
    useEffect(() => {
        if (view) {
            const urlParams = new URLSearchParams(window.location.search);
            const zoom = parseFloat(urlParams.get('zoom') || '');
            const lat = parseFloat(urlParams.get('lat') || '');
            const lon = parseFloat(urlParams.get('lon') || '');

            // Only go to if zoom and coordinates are valid numbers
            if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lon)) {
                setMapState({ zoom, center: [lon, lat] });

                // Only change the view if it's different from the current state
                if (view.zoom !== zoom || view.center.latitude !== lat || view.center.longitude !== lon) {
                    view.center = new Point({
                        latitude: lat,
                        longitude: lon
                    });
                    view.zoom = zoom;
                }
                view.zoom = zoom;
            }
        }
    }, [view]);

    // Return the current map state
    return { zoom: mapState.zoom, center: mapState.center as [number, number] };
};

export { useMapUrlParams };
