import useCustomLayerList from '../../hooks/useCustomLayerList';

function Layers() {
  const layerList = useCustomLayerList();

  if (!layerList?.length) {
    return <div>Loading layers...</div>;
  }

  return (
    <div className='mx-2'>
      {layerList}
    </div>
  );
};

export default Layers;
