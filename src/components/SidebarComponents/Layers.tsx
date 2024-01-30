import {
  CalciteBlock,
} from '@esri/calcite-components-react';
import useCustomLayerList from '../../hooks/useCustomLayerList';

const Layers: React.FC = () => {
  const layerList = useCustomLayerList();

  if (!layerList?.length) {
    return <div>Loading layers...</div>;
  }

  return (
    <>
      <CalciteBlock heading='Layer List and Controls' className='mb-1' />
      {layerList}
    </>
  );
};

export default Layers;
