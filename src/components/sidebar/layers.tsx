import { useCustomLayerList } from "@/hooks/use-custom-layerlist";

function Layers() {
  const layerList = useCustomLayerList();

  if (!layerList?.length) {
    return <div>Loading layers...</div>;
  }

  return (
    <div key='layer-list' className='ml-2 overflow-y-visible max-h-[calc(100vh)]    '>
      {layerList}
    </div>
  );
};

export default Layers;
