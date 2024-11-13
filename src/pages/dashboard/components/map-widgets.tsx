import React from 'react';
import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '@/hooks/use-arcgis-widget';

const MapWidgets: React.FC = () => {
    useArcGISWidget([
        { WrappedWidget: Home, position: 'top-left' },
        { WrappedWidget: Locate, position: 'top-left' },
    ]);

    return null;
};

export default MapWidgets;
