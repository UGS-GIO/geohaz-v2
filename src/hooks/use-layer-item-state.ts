import { useLayerUrl } from '@/context/layer-url-provider';
import { LayerProps } from '@/lib/types/mapping-types';

// Helper function to get all child titles of a group
const getChildLayerTitles = (layer: LayerProps): string[] => {
    if ('layers' in layer && layer.type === 'group') {
        return (layer.layers || []).flatMap(child =>
            getChildLayerTitles(child)
        );
    }

    // This is the base case for non-group layers.
    return layer.title ? [layer.title] : [];
};

export const useLayerItemState = (layerConfig: LayerProps) => {
    const { visibleLayerTitles, updateLayerVisibility } = useLayerUrl();

    if (layerConfig.type !== 'group') {
        // logic for a single layer
        const isVisible = visibleLayerTitles.has(layerConfig.title || '');

        const toggleVisibility = () => {
            if (layerConfig.title) {
                updateLayerVisibility(layerConfig.title, !isVisible);
            }
        };

        return { isVisible, toggleVisibility, groupState: null };
    } else {

        const childTitles = getChildLayerTitles(layerConfig);
        const visibleChildrenCount = childTitles.filter(title => visibleLayerTitles.has(title)).length;

        let groupState: 'all' | 'some' | 'none' = 'none';
        if (visibleChildrenCount === childTitles.length && childTitles.length > 0) {
            groupState = 'all';
        } else if (visibleChildrenCount > 0) {
            groupState = 'some';
        }

        const toggleGroupVisibility = () => {
            // If some or none are selected, turn all on. Otherwise, turn all off.
            const shouldBeVisible = groupState !== 'all';
            updateLayerVisibility(childTitles, shouldBeVisible);
        };

        return { isVisible: groupState !== 'none', toggleVisibility: toggleGroupVisibility, groupState };
    }
};