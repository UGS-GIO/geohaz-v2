import { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { GroupLayerProps, LayerProps } from '@/lib/types/mapping-types';

interface LayerUrlContextType {
    visibleLayerTitles: Set<string>;
    updateLayerVisibility: (titles: string | string[], shouldBeVisible: boolean) => void;
    initializeDefaultLayers: (layersConfig: LayerProps[]) => void;
}

const LayerUrlContext = createContext<LayerUrlContextType | undefined>(undefined);

// Helper to get all default visible layer titles from the config
const getDefaultVisible = (layers: LayerProps[]): string[] => {
    let visible: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group') {
            const groupLayer = layer as GroupLayerProps;
            visible = [...visible, ...getDefaultVisible(groupLayer.layers || [])];
        } else if (layer.visible && layer.title) {
            visible.push(layer.title);
        }
    });
    return visible;
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const search = useSearch({ from: '__root__' });
    const urlLayers = search.layers;

    const visibleLayerTitles = useMemo(() => new Set(urlLayers || []), [urlLayers]);

    // initialize the default layers if not set in the URL
    const initializeDefaultLayers = useCallback((layersConfig: LayerProps[]) => {
        if (urlLayers === undefined) {
            const defaults = getDefaultVisible(layersConfig);
            if (defaults.length > 0) {
                navigate({
                    to: '.',
                    search: (prev) => ({ ...prev, layers: defaults }),
                    replace: true,
                });
            }
        }
    }, [urlLayers, navigate]);

    const updateLayerVisibility = useCallback((titles: string | string[], shouldBeVisible: boolean) => {
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];
        const newVisibleSet = new Set(visibleLayerTitles);

        if (shouldBeVisible) {
            titlesToUpdate.forEach(title => newVisibleSet.add(title));
        } else {
            titlesToUpdate.forEach(title => newVisibleSet.delete(title));
        }

        navigate({
            to: '.',
            search: (prev) => ({ ...prev, layers: Array.from(newVisibleSet) }),
            replace: true,
        });
    }, [navigate, visibleLayerTitles]);

    return (
        <LayerUrlContext.Provider value={{ visibleLayerTitles, updateLayerVisibility, initializeDefaultLayers }}>
            {children}
        </LayerUrlContext.Provider>
    );
};

export const useLayerUrl = () => {
    const context = useContext(LayerUrlContext);
    if (context === undefined) {
        throw new Error('useLayerUrl must be used within a LayerUrlProvider');
    }
    return context;
};