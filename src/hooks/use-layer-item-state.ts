import { useLayerUrl } from '@/context/layer-url-provider';
import { LayerProps } from '@/lib/types/mapping-types';

const getChildLayerTitles = (layer: LayerProps): string[] => {
    if ('layers' in layer && layer.type === 'group') {
        return (layer.layers || []).flatMap(child => getChildLayerTitles(child));
    }
    return layer.title ? [layer.title] : [];
};

export const useLayerItemState = (layerConfig: LayerProps) => {
    const { visibleLayerTitles, updateLayerVisibility } = useLayerUrl();

    if (layerConfig.type !== 'group') {
        const isSelected = visibleLayerTitles.has(layerConfig.title || '');
        // This handler for single layers expects a boolean
        const handleToggleSelection = (select: boolean) => {
            if (layerConfig.title) updateLayerVisibility(layerConfig.title, select);
        };
        return {
            isSelected,
            handleToggleSelection,
            groupIsSelected: false,
            handleSelectAllToggle: () => { }, // Provide a no-op for type consistency
        };
    } else {
        const childTitles = getChildLayerTitles(layerConfig);
        const visibleChildrenCount = childTitles.filter(title => visibleLayerTitles.has(title)).length;
        const groupIsSelected = visibleChildrenCount > 0;

        // This handler for "Select All" takes no arguments
        const handleSelectAllToggle = () => {
            updateLayerVisibility(childTitles, !groupIsSelected);
        };

        return {
            isSelected: false,
            handleToggleSelection: () => { }, // Provide a no-op
            groupIsSelected,
            handleSelectAllToggle,
        };
    }
};