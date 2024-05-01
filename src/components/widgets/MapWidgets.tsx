import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '../../hooks/useArcGISWidget';
import Feature from "@arcgis/core/widgets/Feature.js";
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import { useContext } from 'react';
import { MapContext } from '../../contexts/MapProvider';

// ArcGIS JS SDK Widgets that are overlaid on the map
const MapWidgets: React.FC = () => {
    const { view, isMobile } = useContext(MapContext);


    const coordinateFeatureConfig = {
        id: 'coordinate-feature-widget',
        graphic: {
            popupTemplate: {
                content: isMobile ? 'Pan around the map to update the coordinates.' : 'Mouse over the map to update the coordinates.'
            }
        },
        map: view?.map,
        spatialReference: view?.spatialReference
    };

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
            WrappedWidget: Feature,
            position: isMobile ? 'top-right' : 'bottom-right',
            config: coordinateFeatureConfig
        },
        {
            WrappedWidget: Expand,
            position: isMobile ? 'top-left' : 'top-right',
            config: expandConfig
        }
    ]);

    return null;
};

export default MapWidgets;