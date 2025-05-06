import { LayerFetchConfig, getLayerFetchConfig } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useGetCurrentPage } from "@/hooks/use-get-current-page";

const fetchLayerDescriptions = async (config: LayerFetchConfig | null) => {
    if (!config) {
        console.warn("No valid layer fetch configuration found.");
        return [];
    }

    const { tableName, acceptProfile } = config;
    const outfields = 'content,title';

    const url = `https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app/${tableName}?select=${outfields}`;

    const response = await fetch(url, {
        headers: {
            "Accept-Profile": acceptProfile,
            "Accept": "application/json",
            "Cache-Control": "no-cache",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch layer descriptions from ${tableName}: ${response.status} ${response.statusText}`);
    }

    return await response.json();
};

interface CombinedResult {
    data: Record<string, string>;
    isLoading: boolean;
    error: Error | null;
}

const useFetchLayerDescriptions = (): CombinedResult => {
    const currentPage = useGetCurrentPage();
    const fetchConfig = getLayerFetchConfig(currentPage);

    const { data = [], isLoading, error } = useQuery<FeatureAttributes[], Error>({
        queryKey: ['layerDescriptions', currentPage, fetchConfig?.tableName, fetchConfig?.acceptProfile],
        queryFn: () => fetchLayerDescriptions(fetchConfig),
        enabled: !!fetchConfig,
        staleTime: 1000 * 60 * 60 * 1, // 1 hour
    });

    type FeatureAttributes = {
        title: string;
        content: string;
    };

    interface CombinedResult {
        data: Record<string, string>;
        isLoading: boolean;
        error: Error | null;
    }

    // Combine results for easier consumption
    const combinedResult: CombinedResult = {
        data: data.reduce((acc: Record<string, string>, feature: FeatureAttributes) => {
            acc[feature.title] = feature.content;
            return acc;
        }, {}),
        isLoading,
        error,
    };

    return combinedResult;
};

export { useFetchLayerDescriptions };
