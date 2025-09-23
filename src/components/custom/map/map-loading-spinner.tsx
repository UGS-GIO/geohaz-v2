import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { useIsMapLoading } from "@/hooks/use-is-map-loading";
import { useMap } from "@/hooks/use-map";

const MapLoadingSpinner = () => {
    const { view } = useMap();
    const isMapLoading = useIsMapLoading({
        view: view,
    });

    return (
        <>
            {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-50 bg-opacity-75">
                    <LoadingSpinner />
                </div>
            )}
        </>
    )
}
export default MapLoadingSpinner;