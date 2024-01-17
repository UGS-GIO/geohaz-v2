import Home from '@arcgis/core/widgets/Home';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '../../hooks/UseArcGISWidget';

// Arcgos JS API Widgets that are overlaid on the map
const MapWidgets: React.FC = () => {
    useArcGISWidget([
        { WrappedWidget: Home, position: 'top-left' },
        { WrappedWidget: BasemapToggle, position: 'bottom-right', config: { secondBasemap: 'satellite' } },
        { WrappedWidget: Locate, position: 'top-left' },
    ]);

    return null;
};

export default MapWidgets;