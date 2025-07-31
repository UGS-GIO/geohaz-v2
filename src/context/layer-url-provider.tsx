import { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useSearch, useNavigate, useLocation } from '@tanstack/react-router';
import { LayerProps } from '@/lib/types/mapping-types';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

type ActiveFilters = Record<string, string>;

interface LayerUrlContextType {
    selectedLayerTitles: Set<string>;
    hiddenGroupTitles: Set<string>;
    activeFilters: ActiveFilters;
    updateLayerSelection: (titles: string | string[], shouldBeSelected: boolean) => void;
    toggleGroupVisibility: (title: string) => void;
    updateFilter: (layerTitle: string, filterValue: string | undefined) => void;
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

const getDefaultVisible = (layers: LayerProps[]): { selected: string[], hidden: string[] } => {
    let selected: string[] = [];
    let hidden: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && 'layers' in layer && layer.layers) {
            if (layer.visible === false && layer.title) hidden.push(layer.title);
            const children = getDefaultVisible(layer.layers);
            selected.push(...children.selected);
            hidden.push(...children.hidden);
        } else if (layer.visible && layer.title) {
            selected.push(layer.title);
        }
    });
    return { selected, hidden };
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { layers: urlLayers, filters: urlFilters } = useSearch({ from: '__root__' });
    const layersConfig = useGetLayerConfig();
    const hasInitializedForPath = useRef<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        if (!layersConfig || hasInitializedForPath.current === location.pathname) return;
        if (!layersConfig || hasInitializedForPath.current === location.pathname) {
            return;
        }

        const allValidLayerTitles = getAllValidTitles(layersConfig);
        const defaults = getDefaultVisible(layersConfig);

        let finalLayers = urlLayers;
        let finalFilters = urlFilters;
        let needsUpdate = false;

        if (urlFilters) {
            const validFilterKeys = Object.keys(urlFilters).filter(key => allValidLayerTitles.has(key));
            if (validFilterKeys.length < Object.keys(urlFilters).length) {
                finalFilters = undefined;
                needsUpdate = true;
            }
        }

        if (!urlLayers || urlLayers.selected?.length === 0) {
            finalLayers = defaults;
            needsUpdate = true;
        } else {
            const currentSelected = urlLayers.selected || [];
            const validSelected = currentSelected.filter(title => allValidLayerTitles.has(title));
            if (currentSelected.length > 0 && validSelected.length === 0) {
                finalLayers = defaults;
                needsUpdate = true;
            } else if (validSelected.length !== currentSelected.length) {
                finalLayers = { ...urlLayers, selected: validSelected };
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const finalLayersString = Object.keys(finalLayers || {}).length > 0 ? JSON.stringify(finalLayers) : undefined;
            navigate({
                to: '.',
                search: (prev) => ({ ...prev, layers: finalLayersString, filters: finalFilters }),
                replace: true
            });
        }

        hasInitializedForPath.current = location.pathname;

    }, [layersConfig, navigate, urlLayers, urlFilters, location.pathname]);


    const selectedLayerTitles = useMemo(() => new Set(urlLayers?.selected || []), [urlLayers]);
    const hiddenGroupTitles = useMemo(() => new Set(urlLayers?.hidden || []), [urlLayers]);
    const activeFilters: ActiveFilters = useMemo(() => urlFilters || {}, [urlFilters]);

    const updateLayerSelection = useCallback((titles: string | string[], shouldBeSelected: boolean) => {
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];

        navigate({
            to: '.',
            search: (prev) => {
                const currentSelected = new Set(prev.layers?.selected || []);
                const currentFilters = { ...(prev.filters || {}) };

                if (shouldBeSelected) {
                    // Rule: Turning a layer ON does not affect filters.
                    titlesToUpdate.forEach(title => currentSelected.add(title));
                } else {
                    // Rule: Turning a layer OFF also clears its filter.
                    titlesToUpdate.forEach(title => {
                        currentSelected.delete(title);
                        delete currentFilters[title];
                    });
                }

                return {
                    ...prev,
                    layers: { ...prev.layers, selected: Array.from(currentSelected) },
                    filters: Object.keys(currentFilters).length > 0 ? currentFilters : undefined,
                };
            },
            replace: true,
        });
    }, [navigate]);

    const updateFilter = useCallback((layerTitle: string, filterValue: string | undefined) => {
        navigate({
            to: '.',
            search: (prev) => {
                const currentFilters = { ...(prev.filters || {}) };
                const currentSelected = new Set(prev.layers?.selected || []);

                if (filterValue) {
                    // Rule: Applying a filter also ensures the layer is ON.
                    currentFilters[layerTitle] = filterValue;
                    currentSelected.add(layerTitle);
                } else {
                    // Rule: Clearing a filter does not affect layer visibility.
                    delete currentFilters[layerTitle];
                }

                return {
                    ...prev,
                    layers: { ...prev.layers, selected: Array.from(currentSelected) },
                    filters: Object.keys(currentFilters).length > 0 ? currentFilters : undefined,
                };
            },
            replace: true
        });
    }, [navigate]);

    const toggleGroupVisibility = useCallback((title: string) => {
        navigate({
            to: '.',
            search: (prev) => {
                const newHiddenSet = new Set(prev.layers?.hidden || []);
                if (newHiddenSet.has(title)) {
                    newHiddenSet.delete(title);
                } else {
                    newHiddenSet.add(title);
                }
                return {
                    ...prev,
                    layers: { ...prev.layers, hidden: Array.from(newHiddenSet) }
                };
            },
            replace: true
        });
    }, [navigate]);

    const value = {
        selectedLayerTitles,
        hiddenGroupTitles,
        activeFilters,
        updateLayerSelection,
        toggleGroupVisibility,
        updateFilter,
    };

    return (
        <LayerUrlContext.Provider value={value}>
            {children}
        </LayerUrlContext.Provider>
    );
};

export const useLayerUrl = () => {
    const context = useContext(LayerUrlContext);
    if (!context) throw new Error('useLayerUrl must be used within a LayerUrlProvider');
    return context;
};