import { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { LayerProps } from '@/lib/types/mapping-types';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

interface LayerUrlContextType {
    visibleLayerTitles: Set<string>;
    updateLayerVisibility: (titles: string | string[], shouldBeVisible: boolean) => void;
}

const LayerUrlContext = createContext<LayerUrlContextType | undefined>(undefined);

const getDefaultVisible = (layers: LayerProps[]): string[] => {
    let visible: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && 'layers' in layer && layer.layers) {
            visible = [...visible, ...getDefaultVisible(layer.layers)];
        } else if (layer.visible && layer.title) {
            visible.push(layer.title);
        }
    });
    return visible;
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { layers: urlLayers } = useSearch({ from: '__root__' });
    const layersConfig = useGetLayerConfig();
    const hasInitialized = useRef(false);

    const visibleLayerTitles = useMemo(() => {
        if (urlLayers == null) return new Set<string>();
        const layersArray = Array.isArray(urlLayers) ? urlLayers : [urlLayers];
        return new Set(layersArray);
    }, [urlLayers]);

    useEffect(() => {
        if (!layersConfig || hasInitialized.current) return;
        const layersParamExists = new URL(window.location.href).searchParams.has('layers');
        if (!layersParamExists) {
            const defaults = getDefaultVisible(layersConfig);
            if (defaults.length > 0) {
                navigate({ to: '.', search: (prev) => ({ ...prev, layers: defaults }), replace: true });
            }
        }
        hasInitialized.current = true;
    }, [layersConfig, navigate]);

    const updateLayerVisibility = useCallback((titles: string | string[], shouldBeVisible: boolean) => {
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];
        const newVisibleSet = new Set(visibleLayerTitles);

        if (shouldBeVisible) {
            titlesToUpdate.forEach(title => newVisibleSet.add(title));
        } else {
            titlesToUpdate.forEach(title => newVisibleSet.delete(title));
        }

        const newLayers = Array.from(newVisibleSet);

        if (newLayers.length === 0) {
            navigate({
                to: '.',
                search: (prev) => { const { layers, ...rest } = prev; return rest; },
                replace: true,
            });
        } else {
            navigate({
                to: '.',
                search: (prev) => ({ ...prev, layers: newLayers }),
                replace: true,
            });
        }
    }, [navigate, visibleLayerTitles]);

    return (
        <LayerUrlContext.Provider value={{ visibleLayerTitles, updateLayerVisibility }}>
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