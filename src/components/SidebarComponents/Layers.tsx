import { useContext, useState } from 'react';
import { MapContext } from '../../contexts/MapProvider';
import {
  CalciteBlock,
  CalciteLabel,
  CalciteSlider,
  CalciteSwitch,
  CalciteAccordion,
  CalciteAccordionItem
} from '@esri/calcite-components-react';
import {
  CalciteSliderCustomEvent,
} from "@esri/calcite-components";

interface LayerAccordionProps {
  layerName: string;
  symbology?: string;
  layerId?: string;
}

const LayerAccordion: React.FC<LayerAccordionProps> = ({ layerName, symbology = "symbology goes here", layerId }) => {
  console.log('layerId', layerId);

  const { activeLayers, setActiveLayers } = useContext(MapContext);

  const getLayer = () => {
    if (!activeLayers || !layerId) {
      console.log('Active Layers or Layer ID is not defined');
      return undefined;
    }

    const flatLayers = activeLayers.flatten(layer => layer.children || []);

    const layer = flatLayers.find(layer => String(layer.layer.id) === String(layerId));

    console.log('Found Layer:', layer); // Log the found layer

    if (!layer) {
      console.log('No Layer Found');
    }

    return layer;
  };

  const layer = getLayer();
  console.log('layer', layer);
  const layerOpacity1 = layer?.layer.opacity;
  console.log({ layerOpacity1 });



  const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>(layer?.visible);
  const [layerOpacity, setLayerOpacity] = useState<number>(layer?.layer.opacity || 1);

  const updateLayer = (updateFn: (layer: __esri.Layer) => void) => {
    const currentLayer = getLayer();
    console.log(currentLayer);


    if (currentLayer) {
      console.log('Current Layer before update:', currentLayer); // Log current layer before update
      updateFn(currentLayer.layer);
      console.log('Current Layer after update:', currentLayer); // Log current layer after update
      // setActiveLayers(activeLayers); // Use the existing Collection
      // setLayerVisibility(currentLayer.visible);
      // setLayerOpacity(currentLayer.layer.opacity || 1);
    }
  };

  const handleVisibilityToggle = () => updateLayer(layer => {
    console.log('Layer visibility before toggle:', layer.visible); // Log visibility before toggle
    layer.visible = !layer.visible;
    console.log('Layer visibility after toggle:', layer.visible); // Log visibility after toggle
    // layervisitibility needs to be undefined for not visibile state
    setLayerVisibility((layer.visible) ? layer.visible : undefined);
    console.log('Layer visibility after toggle:', layerVisibility);

  });

  const handleOpacityChange = (event: CalciteSliderCustomEvent<void>) => updateLayer(layer => {
    console.log('Layer opacity before change:', layer.opacity); // Log opacity before change
    console.log('Event target value:', event.target.value);

    layer.opacity = Number(event.target.value) / 100;
    console.log('Layer opacity after change:', layer.opacity); // Log opacity after change
    setLayerOpacity(layer.opacity);
    console.log('Layer opacity after change:', layerOpacity);
  });

  return (
    <CalciteBlock heading={`${layerName}`} collapsible >
      <CalciteAccordion>
        <CalciteAccordionItem heading={`${layerName} Legend`}>
          <div>{symbology}</div>
        </CalciteAccordionItem>
        <CalciteAccordionItem heading={`${layerName} Controls`}>
          <CalciteLabel layout="inline">
            Visibility
            <CalciteSwitch onCalciteSwitchChange={handleVisibilityToggle} checked={layerVisibility} />
          </CalciteLabel>
          <CalciteLabel>
            Opacity
            <CalciteSlider onCalciteSliderChange={(e) => handleOpacityChange(e)} value={layerOpacity * 100} />
          </CalciteLabel>
        </CalciteAccordionItem>
      </CalciteAccordion>
    </CalciteBlock >
  );
};

const Layers: React.FC = () => {
  const { activeLayers } = useContext(MapContext);

  if (!activeLayers) {
    return <div>Loading layers...</div>;
  }

  return (
    <>
      <CalciteBlock heading='Layer List and Controls' className='mb-1' />
      {activeLayers.map((layer, index) => {
        if (layer.layer.type === 'group') {
          console.log(layer.children.map(childLayer => console.log(childLayer.layer.id)));

          return (
            <CalciteBlock collapsible key={index} heading={layer.title} className='mb-1'>
              {layer.children.map((childLayer, childIndex) => (
                <LayerAccordion key={childIndex} layerName={childLayer.title} layerId={childLayer.layer.id} />
              ))}
            </CalciteBlock>
          );
        }

        return <LayerAccordion key={index} layerName={layer.layer.title} layerId={layer.layer.id} />;
      })}
    </>
  );
};

export default Layers;
