// hooks/use-hazard-legend.ts
import { useQuery } from '@tanstack/react-query';
import { hazardLayerNameMap } from '@/routes/_report/-data/hazard-unit-map';
import { createSVGSymbol } from '@/lib/legend/symbol-generator';
import { Legend } from '@/lib/types/geoserver-types';
import { PROD_GEOSERVER_URL } from '@/lib/constants';

export interface HazardLegendItem {
    unitCode: string;
    label: string;
    color?: string;
    symbol?: SVGSVGElement | HTMLElement;
    order?: number;
}

type HazardCode = keyof typeof hazardLayerNameMap;

const extractColorFromSymbolizer = (symbolizer: any): string | undefined => {
    try {
        if (symbolizer?.Polygon) return symbolizer.Polygon.fill;
        if (symbolizer?.Point) return symbolizer.Point.graphics?.[0]?.fill;
        if (symbolizer?.Line) return symbolizer.Line.stroke;
        return undefined;
    } catch {
        return undefined;
    }
};

const fetchGeoServerLegend = async (layerName: string): Promise<HazardLegendItem[]> => {
    try {
        const parts = layerName.split(':');
        if (parts.length !== 2) {
            console.error('Invalid layer name format:', layerName);
            return [];
        }

        const [workspace] = parts;
        const baseUrl = PROD_GEOSERVER_URL || window.location.origin + '/geoserver';
        const legendUrl = `${baseUrl}/${workspace}/wms?service=WMS&request=GetLegendGraphic&format=application/json&layer=${layerName}`;

        const response = await fetch(legendUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const legendData: Legend = await response.json();
        const rules = legendData?.Legend?.[0]?.rules || [];

        if (rules.length === 0) {
            console.warn('No rules found in legend data for', layerName);
            return [];
        }

        return rules.map((rule, index) => {
            const symbolizers = rule.symbolizers || [];
            let symbol: SVGSVGElement | HTMLElement | undefined;
            let color: string | undefined;

            if (symbolizers.length > 0) {
                try {
                    const svgResult = createSVGSymbol(symbolizers);
                    symbol = ('symbol' in svgResult && svgResult.symbol)
                        ? svgResult.symbol
                        : svgResult instanceof SVGSVGElement ? svgResult : undefined;
                    color = extractColorFromSymbolizer(symbolizers[0]);
                } catch (err) {
                    console.error('Error creating symbol:', err);
                }
            }

            return {
                unitCode: rule.name || `unit-${index}`,
                label: rule.title || rule.name || 'Unknown',
                color,
                symbol,
                order: index
            };
        });
    } catch (error) {
        console.error('Error fetching GeoServer legend:', error);
        return [];
    }
};

export const useHazardLegend = (hazardCode: string) => {
    const fetchHazardLegend = async (): Promise<HazardLegendItem[]> => {
        if (!(hazardCode in hazardLayerNameMap)) {
            console.warn(`Unknown hazard code: ${hazardCode}`);
            return [];
        }

        const layerName = hazardLayerNameMap[hazardCode as HazardCode];
        if (!layerName) {
            console.warn(`No layer found for hazard code: ${hazardCode}`);
            return [];
        }

        return await fetchGeoServerLegend(layerName);
    };

    const { data: legendItems = [], isLoading, error } = useQuery({
        queryKey: ['hazardLegend', hazardCode],
        queryFn: fetchHazardLegend,
        enabled: !!hazardCode,
        staleTime: 1000 * 60 * 60,
        retry: 1,
    });

    return { legendItems, isLoading, error };
};