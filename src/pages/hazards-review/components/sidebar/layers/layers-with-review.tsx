import Layers from "@/components/sidebar/layers";
import MapConfigurations from "@/pages/hazards-review/components/sidebar/map-configurations/map-configurations";

const LayersWithReview = () => {
    return (
        <div>
            <MapConfigurations />
            <Layers />
        </div>
    );
}

export { LayersWithReview };