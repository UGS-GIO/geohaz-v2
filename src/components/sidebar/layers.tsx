import { useCustomLayerList } from "@/hooks/use-custom-layerlist";
import { BackToMenuButton } from "../custom/back-to-menu-button";
import { useGetLayerConfig } from "@/hooks/use-get-layer-config";

function Layers() {
  const layersConfig = useGetLayerConfig('layers');
  const layerList = useCustomLayerList({ config: layersConfig });

  if (!layerList?.length) {
    return <div>Loading layers...</div>;
  }

  return (
    <>
      <BackToMenuButton />
      <div key='layer-list' className='overflow-y-visible max-h-[calc(100vh)]'>
        {layerList}
      </div>
    </>
  )
}

export default Layers
