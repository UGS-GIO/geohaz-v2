import { useQuery } from "@tanstack/react-query";

const useFetchLayerDescriptions = () => {
    const fetchLayerDescriptions = async () => {
        const outfieds = 'content,title';
        const url = `https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app/hazlayerinfo?select=${outfieds}`;
        const acceptProfile = 'hazards';

        const response = await fetch(url, {
            headers: {
                "Accept-Profile": acceptProfile,
                "Accept": "application/json",
                "Cache-Control": "no-cache",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch layer descriptions: ${response.statusText}`);
        }

        return await response.json();
    };

    const { data = [], isLoading, error } = useQuery({
        queryKey: ['layerDescriptions'],
        queryFn: fetchLayerDescriptions,
        staleTime: 1000 * 60 * 60 * 1, // Cache for 1 hour
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

    // Log data when it becomes available
    if (!isLoading && data.length > 0) {
        console.log('Fetched data:', data);
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
