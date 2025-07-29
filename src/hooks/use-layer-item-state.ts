import { useLayerUrl } from '@/context/layer-url-provider';
import { LayerProps } from '@/lib/types/mapping-types';

const getChildLayerTitles = (layer: LayerProps): string[] => {
    if ('layers' in layer && layer.type === 'group') {
        return (layer.layers || []).flatMap(child => getChildLayerTitles(child));
    }
    return layer.title ? [layer.title] : [];
};

export const useLayerItemState = (layerConfig: LayerProps) => {
    const { selectedLayerTitles, hiddenGroupTitles, updateLayerSelection, toggleGroupVisibility } = useLayerUrl();

    // SINGLE LAYER LOGIC
    if (layerConfig.type !== 'group') {
        const isSelected = selectedLayerTitles.has(layerConfig.title || '');
        const handleToggleSelection = (select: boolean) => {
            if (layerConfig.title) updateLayerSelection(layerConfig.title, select);
        };
        return { isSelected, handleToggleSelection, isGroupVisible: true, handleToggleGroupVisibility: () => { }, groupCheckboxState: null, handleSelectAllToggle: () => { } };
    }

    // GROUP LAYER LOGIC
    else {
        const childTitles = getChildLayerTitles(layerConfig);
        const selectedChildrenCount = childTitles.filter(title => selectedLayerTitles.has(title)).length;
        let groupCheckboxState: 'all' | 'some' | 'none' = 'none';
        if (selectedChildrenCount === childTitles.length && childTitles.length > 0) {
            groupCheckboxState = 'all';
        } else if (selectedChildrenCount > 0) {
            groupCheckboxState = 'some';
        }

        const handleSelectAllToggle = () => {
            const shouldSelectAll = groupCheckboxState !== 'all';
            updateLayerSelection(childTitles, shouldSelectAll);
        };

        const isGroupVisible = !hiddenGroupTitles.has(layerConfig.title || '');

        const handleToggleGroupVisibility = () => {
            if (layerConfig.title) toggleGroupVisibility(layerConfig.title);
        };

        return {
            isSelected: false, // isSelected is not applicable to a group container
            handleToggleSelection: () => { },
            isGroupVisible,
            handleToggleGroupVisibility,
            groupCheckboxState,
            handleSelectAllToggle,
        };
    }
};