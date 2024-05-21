import {
  CalciteBlock,
} from '@esri/calcite-components-react';
import useCustomLayerList from '../../hooks/useCustomLayerList';

function Layers() {
  const layerList = useCustomLayerList();

  if (!layerList?.length) {
    return <div>Loading layers...</div>;
  }

  return (
    <div className='overflow-y-auto'>
      <CalciteBlock heading='Layer List and Controls' className='mb-1' />
      {layerList}
    </div>
  );
};

export default Layers;
