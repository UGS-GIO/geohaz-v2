import { RelatedTable } from "@/lib/types/mapping-types";
import { useQueries, UseQueryResult } from "@tanstack/react-query";

// Define the shape of related data
type RelatedData = {
    [key: string]: any; // Adjust based on actual response data
};

type CombinedResult = {
    data: (RelatedData | undefined)[];
    isLoading: boolean;
    error: Error | null;
};

// Generalized hook to fetch multiple related tables with dynamic headers
const useRelatedTable = (configs: RelatedTable[]): CombinedResult => {
    const queryResults: UseQueryResult<RelatedData>[] = useQueries({
        queries: configs.map((config) => ({
            queryKey: ["relatedTable", config.targetField],
            queryFn: async (): Promise<RelatedData> => {
                const response = await fetch(config.url, {
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

                return response.json();
            },
            staleTime: 1000 * 60 * 60, // 1 hour
            enabled: configs.length > 0,
        })),
    });

    // Combine results for easier consumption
    const combinedResult: CombinedResult = {
        data: queryResults.map((results, idx) => idx < 10 ? results.data : undefined),
        isLoading: queryResults.some((result) => result.isLoading),
        error: queryResults.find((result) => result.error)?.error || null,
    };

    return combinedResult;
};

export { useRelatedTable };
