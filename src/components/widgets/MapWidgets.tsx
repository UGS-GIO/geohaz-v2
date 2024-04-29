import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '../../hooks/useArcGISWidget';
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import { useContext, useEffect } from 'react';
import { MapContext } from '../../contexts/MapProvider';
import ReactDOM from 'react-dom/client';
import MouseInfo from './MouseInfo';


// ArcGIS JS SDK Widgets that are overlaid on the map
const MapWidgets: React.FC = () => {

    const { view } = useContext(MapContext);

    useEffect(() => {
        if (view !== undefined) {
            let widgetNode = document.createElement('div');
            let widgetRoot = ReactDOM.createRoot(widgetNode);
            view?.ui.add(widgetNode, 'top-left');
            widgetRoot.render(<MouseInfo view={view} />);
            return () => {
                view?.ui.remove(widgetNode);
                widgetRoot.unmount();
            }
        }
    }, [view]);





    // const coordinateFeatureConfig = {
    //     id: 'coordinate-feature-widget',
    //     graphic: {
    //         popupTemplate: {
    //             title: 'Coordinates',
    //             content: 'Mouse over the map to show coordinates...'
    //         }
    //     },
    //     map: view?.map,
    //     spatialReference: view?.spatialReference
    // };

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
        // {
        //     WrappedWidget: Feature, // mouse over the map to show coordinates
        //     position: 'bottom-right',
        //     config: coordinateFeatureConfig
        // },
        {
            WrappedWidget: Expand,
            position: 'top-right',
            config: expandConfig
        }
    ]);

    return null;
};

export default MapWidgets;