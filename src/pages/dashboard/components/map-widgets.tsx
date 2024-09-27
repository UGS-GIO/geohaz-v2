import React, { useContext } from 'react';
import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '@/hooks/use-arcgis-widget';
import Feature from "@arcgis/core/widgets/Feature.js";
import { MapContext } from '@/context/map-provider';

// Base type for common widget configuration properties
interface BaseWidgetConfig {
    id: string;
    view: __esri.View;
}

interface CoordinateFeatureConfig extends BaseWidgetConfig {
    graphic: {
        popupTemplate: {
            content: string;
        };
    };
    map: __esri.Map | undefined;
    spatialReference: __esri.SpatialReference | undefined;
}

export type WidgetConfig = CoordinateFeatureConfig;



const MapWidgets: React.FC = () => {
    const { view, isMobile } = useContext(MapContext);

    const coordinateFeatureConfig: CoordinateFeatureConfig = {
        id: 'coordinate-feature-widget',
        view: view!,
        graphic: {
            popupTemplate: {
                content: isMobile ? '' : 'Mouse over the map to update the coordinates.',
            },
        },
        map: view?.map,
        spatialReference: view?.spatialReference,
    };
    useArcGISWidget([
        {
            WrappedWidget: Feature,
            position: 'bottom-right',
            config: coordinateFeatureConfig,
        }, { WrappedWidget: Home, position: 'top-left' },
        { WrappedWidget: Locate, position: 'top-left' },
    ]);

    return null;
};

export default MapWidgets;
