import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '../../hooks/useArcGISWidget';
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import { useContext, useEffect, useRef } from 'react';
import { MapContext } from '../../contexts/MapProvider';
import ReactDOM from 'react-dom/client';
import MouseInfo from './MouseInfo';
import MouseInfoPortal from '../../config/portals/MouseInfoPortal';
import Feature from '@arcgis/core/widgets/Feature';

// ArcGIS JS SDK Widgets that are overlaid on the map
const MapWidgets: React.FC = () => {
    const { view } = useContext(MapContext);
    const coordinateFeatureRoot = useRef<HTMLElement | null>(null);
    const root = useRef<ReactDOM.Root | null>(null);

    useEffect(() => {
        if (view !== undefined) {
            // Create a new DOM node
            coordinateFeatureRoot.current = document.createElement('div');

            // Render the MouseInfoPortal component into this node
            root.current = ReactDOM.createRoot(coordinateFeatureRoot.current);

            // Render the MouseInfoPortal component with MouseInfo as a child into this root
            root.current.render(
                <MouseInfoPortal mount={coordinateFeatureRoot.current}>
                    <MouseInfo view={view} />
                </MouseInfoPortal>
            );
        }

        return () => {
            // Clean up on unmount
            root.current?.unmount();
            coordinateFeatureRoot.current?.remove();
        };
    }, [view]);

    let coordinateFeatureConfig;

    if (view !== undefined && coordinateFeatureRoot.current !== null) {
        // Create the configuration for the Feature widget
        coordinateFeatureConfig = {
            id: 'coordinate-feature-widget',
            graphic: {
                popupTemplate: {
                    title: 'Coordinates',
                    content: coordinateFeatureRoot.current // Set the content to the DOM node
                }
            },
            map: view?.map,
            spatialReference: view?.spatialReference
        };
    }

    const expandConfig = {
        id: 'basemap-gallery-expand',
        view: view,
        content: new BasemapGallery({
            view: view,
            container: document.createElement("div"),
            id: 'basemap-gallery-widget',
        })
    }

    useArcGISWidget([
        { WrappedWidget: Home, position: 'top-left' },
        { WrappedWidget: Locate, position: 'top-left' },
        {
            WrappedWidget: Feature, // mouse over the map to show coordinates
            position: 'bottom-right',
            config: coordinateFeatureConfig
        },
        {
            WrappedWidget: Expand,
            position: 'top-right',
            config: expandConfig
        }
    ]);

    return null;
};

export default MapWidgets;