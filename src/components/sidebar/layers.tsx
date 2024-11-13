import { useCustomLayerList } from "@/hooks/use-custom-layerlist";
import { BackToMenuButton } from "../custom/back-to-menu-button";

function Layers() {
  const layerList = useCustomLayerList();

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
