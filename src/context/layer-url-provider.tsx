import { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useSearch, useNavigate, useLocation } from '@tanstack/react-router';
import { LayerProps } from '@/lib/types/mapping-types';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

interface LayerUrlContextType {
    selectedLayerTitles: Set<string>;
    hiddenGroupTitles: Set<string>;
    updateLayerSelection: (titles: string | string[], shouldBeSelected: boolean) => void;
    toggleGroupVisibility: (title: string) => void;
}

const LayerUrlContext = createContext<LayerUrlContextType | undefined>(undefined);

const getAllValidTitles = (layers: LayerProps[], groupsOnly = false): Set<string> => {
    const titles = new Set<string>();
    layers.forEach(layer => {
        if (layer.type === 'group' && layer.title) {
            titles.add(layer.title);
            if ('layers' in layer && layer.layers) {
                getAllValidTitles(layer.layers, groupsOnly).forEach(t => titles.add(t));
            }
        } else if (!groupsOnly && layer.title) {
            titles.add(layer.title);
        }
    });
    return titles;
};

const getDefaultVisible = (layers: LayerProps[]): string[] => {
    let visible: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && 'layers' in layer && layer.layers) {
            visible.push(...getDefaultVisible(layer.layers));
        } else if (layer.visible && layer.title) {
            visible.push(layer.title);
        }
    });
    return visible;
};

const getDefaultHiddenGroups = (layers: LayerProps[]): string[] => {
    let hidden: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && layer.title) {
            if (layer.visible === false) {
                hidden.push(layer.title);
            }
            if ('layers' in layer && layer.layers) {
                hidden.push(...getDefaultHiddenGroups(layer.layers));
            }
        }
    });
    return hidden;
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { visibility: urlVisibility } = useSearch({ from: '__root__' });
    const layersConfig = useGetLayerConfig();
    const hasInitialized = useRef(false);
    const location = useLocation();
    const pathnameRef = useRef(location.pathname);

    // If the pathname has changed, the user switched apps, so we must re-initialize.
    if (location.pathname !== pathnameRef.current) {
        hasInitialized.current = false;
        pathnameRef.current = location.pathname;
    }

    const selectedLayerTitles = useMemo(() => new Set(urlVisibility?.selected || []), [urlVisibility]);
    const hiddenGroupTitles = useMemo(() => new Set(urlVisibility?.hidden || []), [urlVisibility]);

    useEffect(() => {
        if (!layersConfig || hasInitialized.current) return;

        const allValidLayerTitles = getAllValidTitles(layersConfig);
        const allValidGroupTitles = getAllValidTitles(layersConfig, true);
        const defaultSelected = getDefaultVisible(layersConfig);
        const defaultHidden = getDefaultHiddenGroups(layersConfig);

        let finalVisibility: { selected?: string[], hidden?: string[] } = {};
        let needsUpdate = false;

        if (!urlVisibility) {
            if (defaultSelected.length > 0) finalVisibility.selected = defaultSelected;
            if (defaultHidden.length > 0) finalVisibility.hidden = defaultHidden;
            needsUpdate = true;
        }
        else {
            const currentSelected = urlVisibility.selected || [];
            const currentHidden = urlVisibility.hidden || [];

            let validSelected = currentSelected.filter(title => allValidLayerTitles.has(title));
            const validHidden = currentHidden.filter(title => allValidGroupTitles.has(title));

            if (currentSelected.length > 0 && validSelected.length === 0) {
                validSelected = defaultSelected;
            }

            if (validSelected.length !== currentSelected.length || validHidden.length !== currentHidden.length) {
                needsUpdate = true;
            }

            if (validSelected.length > 0) finalVisibility.selected = validSelected;
            if (validHidden.length > 0) finalVisibility.hidden = validHidden;
        }

        if (needsUpdate) {
            const finalVisibilityString = Object.keys(finalVisibility).length > 0 ? JSON.stringify(finalVisibility) : undefined;
            navigate({
                to: '.',
                search: (prev) => ({ ...prev, visibility: finalVisibilityString }),
                replace: true
            });
        }

        hasInitialized.current = true;
    }, [layersConfig, navigate, urlVisibility]);

    const updateLayerSelection = useCallback((titles: string | string[], shouldBeSelected: boolean) => {
        const newSelectedSet = new Set(selectedLayerTitles);
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];
        if (shouldBeSelected) {
            titlesToUpdate.forEach(title => newSelectedSet.add(title));
        } else {
            titlesToUpdate.forEach(title => newSelectedSet.delete(title));
        }

        const { selected, ...restOfVisibility } = urlVisibility || {};
        const newVisibility = { ...restOfVisibility, ...(newSelectedSet.size > 0 && { selected: Array.from(newSelectedSet) }) };
        const newVisibilityString = Object.keys(newVisibility).length > 0 ? JSON.stringify(newVisibility) : undefined;
        navigate({ to: '.', search: (prev) => ({ ...prev, visibility: newVisibilityString }), replace: true });
    }, [navigate, selectedLayerTitles, urlVisibility]);

    const toggleGroupVisibility = useCallback((title: string) => {
        const newHiddenSet = new Set(hiddenGroupTitles);
        if (newHiddenSet.has(title)) {
            newHiddenSet.delete(title);
        } else {
            newHiddenSet.add(title);
        }

        const { hidden, ...restOfVisibility } = urlVisibility || {};
        const newVisibility = { ...restOfVisibility, ...(newHiddenSet.size > 0 && { hidden: Array.from(newHiddenSet) }) };
        const newVisibilityString = Object.keys(newVisibility).length > 0 ? JSON.stringify(newVisibility) : undefined;
        navigate({ to: '.', search: (prev) => ({ ...prev, visibility: newVisibilityString }), replace: true });
    }, [navigate, hiddenGroupTitles, urlVisibility]);

    return (
        <LayerUrlContext.Provider value={{ selectedLayerTitles, hiddenGroupTitles, updateLayerSelection, toggleGroupVisibility }}>
            {children}
        </LayerUrlContext.Provider>
    );
};

export const useLayerUrl = () => {
    const context = useContext(LayerUrlContext);
    if (!context) throw new Error('useLayerUrl must be used within a LayerUrlProvider');
    return context;
};