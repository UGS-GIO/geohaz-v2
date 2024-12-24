import { RelatedTable } from "@/lib/types/mapping-types";
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { Feature, Geometry, GeoJsonProperties } from "geojson";

type RelatedData = {
    [key: string]: any;
};

type CombinedResult = {
    data: (RelatedData | undefined)[];
    isLoading: boolean;
    error: Error | null;
};

const useRelatedTable = (
    configs: RelatedTable[],
    feature?: Feature<Geometry, GeoJsonProperties>
): CombinedResult => {
    const queryResults: UseQueryResult<RelatedData>[] = useQueries({
        queries: configs.map((config) => ({
            queryKey: ["relatedTable", config.targetField, feature?.properties?.[config.targetField]],
            queryFn: async (): Promise<RelatedData> => {
                const targetValue = feature?.properties?.[config.targetField];
                const queryUrl = targetValue
                    ? `${config.url}?${config.matchingField}=eq.${targetValue}`
                    : config.url;

                const response = await fetch(queryUrl, {
                    headers: {
                        "Accept-Profile": config.acceptProfile,
                        "Accept": "application/json",
                        "Cache-Control": "no-cache",
                    },
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch related table for ${config.targetField}: ${response.statusText}`
                    );
                }

                const data = await response.json();
                const processedData = Array.isArray(data) ? data : [data];

                if (config.displayFields) {
                    return processedData.map(item => {
                        const displayValues = config.displayFields!.map(df => {
                            const value = item[df.field];
                            return df.format ? df.format(value) : value;
                        });
                        return {
                            ...item,
                            displayValue: displayValues.join(" - ")
                        };
                    });
                }

                return processedData;
            },
            staleTime: 1000 * 60 * 60,
            enabled: configs.length > 0 && Boolean(feature?.properties?.[config.targetField]),
        })),
    });

    const combinedResult: CombinedResult = {
        data: queryResults.map(result => result.data),
        isLoading: queryResults.some(result => result.isLoading),
        error: queryResults.find(result => result.error)?.error || null,
    };

    return combinedResult;
};

export { useRelatedTable };