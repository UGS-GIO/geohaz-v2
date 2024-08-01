import { CalciteBlock, CalciteButton, CalcitePanel } from "@esri/calcite-components-react";
import { useContext, useState, useEffect, useRef } from "react";
import { MapContext } from '@/context/map-provider';
import Graphic from "@arcgis/core/Graphic";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Layer from "@arcgis/core/layers/Layer";

function addGraphic(event: __esri.SketchViewModelCreateEvent, sketchVM: __esri.SketchViewModel | undefined, tempGraphicsLayer: __esri.GraphicsLayer | undefined) {
  if (event.state === "complete" && event.graphic) {
    tempGraphicsLayer?.remove(event.graphic)
    const drawAOIHeight = event.graphic.geometry.extent.height;
    const drawAOIWidth = event.graphic.geometry.extent.width;
    const aoi = event.graphic.geometry.toJSON();

    if (drawAOIHeight < 12000 && drawAOIWidth < 18000) {
      const params = {
        description: "Test",
        polygon: aoi,
      };

      localStorage.setItem('aoi', JSON.stringify(params));
      window.open('./report');
    } else {
      console.log("Area of interest is too large, try again");
      alert("Area of interest is too large, try a smaller area.");
    }
  } else if (event.state !== "complete" && event.graphic) {

    const graphic = new Graphic({
      geometry: event.graphic.geometry,
      symbol: sketchVM?.polygonSymbol,
    });
    tempGraphicsLayer?.add(graphic);
  }
}

type activeButtonOptions = 'currentMapExtent' | 'customArea' | 'reset';

function GeologicalUnitSearch() {
  const { view } = useContext(MapContext);
  const [activeButton, setActiveButton] = useState<activeButtonOptions>();
  const tempGraphicsLayer = useRef<__esri.GraphicsLayer | undefined>(undefined);
  const sketchVM = useRef<__esri.SketchViewModel | undefined>(undefined);

  const handleActiveButton = (buttonName: activeButtonOptions) => {
    setActiveButton(buttonName);
    view?.focus();
  };

  useEffect(() => {
    tempGraphicsLayer.current = new GraphicsLayer();
    view?.map.add(tempGraphicsLayer.current as Layer);

    return () => {
      if (tempGraphicsLayer.current) {
        view?.map.remove(tempGraphicsLayer.current as Layer);
      }
    };
  }, [view]);

  useEffect(() => {
    if (sketchVM.current) {
      sketchVM.current.destroy();
    }
  }, []);

  const handleCurrentMapExtentButton = () => {
    handleActiveButton('currentMapExtent');

    const extent = view?.extent;
    const areaHeight = extent?.height;
    const areaWidth = extent?.width;

    if (areaHeight && areaWidth && areaHeight < 12000 && areaWidth < 18000) {
      const xMini = extent.xmin;
      const xMaxi = extent.xmax;
      const yMini = extent.ymin;
      const yMaxi = extent.ymax;

      const newRings = [
        [xMaxi, yMaxi],
        [xMaxi, yMini],
        [xMini, yMini],
        [xMini, yMaxi],
        [xMaxi, yMaxi]
      ];

      const aoi = {
        spatialReference: {
          latestWkid: 3857,
          wkid: 102100
        },
        rings: [newRings]
      };

      const params = {
        description: "Test",
        polygon: aoi,
      };

      localStorage.setItem('aoi', JSON.stringify(params));
      window.open('./report');
    } else {
      console.log("Area of interest is too large, try again");
      alert("Area of interest is too large, try a smaller extent.");
    }
  };

  const handleCustomAreaButton = () => {
    handleActiveButton('customArea');

    sketchVM.current = new SketchViewModel({
      view: view,
      layer: tempGraphicsLayer.current,
      updateOnGraphicClick: false,
      polygonSymbol: {
        type: "simple-fill",
        color: "rgba(138,43,226, 0.8)",
        style: "solid",
        outline: {
          color: "white",
          width: 1
        }
      }
    });

    sketchVM.current.on('create', (event) => addGraphic(event, sketchVM.current, tempGraphicsLayer.current));

    sketchVM.current.create("polygon", {
      mode: "click"
    });
  };

  const handleResetButton = () => {
    console.log('Reset Button Clicked');
    sketchVM.current?.cancel();
    // sketchVM.current?.delete();
    if (tempGraphicsLayer.current) {
      tempGraphicsLayer.current?.removeAll();
    }
    setActiveButton(undefined);
  };

  const buttonText = (buttonName: activeButtonOptions, defaultText: string) => {
    return (
      activeButton === buttonName ? `✓ ${defaultText}` : defaultText
    );
  }

  return (
    <div>
      <CalcitePanel>
        <CalciteBlock open heading='Report Generator'>
          <p>The Report Generator is designed to provide a summary of information for small areas. If your area of interest is larger than that, you will see a notification prompting you to select a smaller area.</p>
          <div className="mt-2">
            <p><b>Generate a Report of the Current Map Extent:</b></p>
            <CalciteButton onClick={handleCurrentMapExtentButton}>{buttonText('currentMapExtent', 'Current Map Extent')}</CalciteButton>
          </div>
          <div className="mt-2">
            <h3><b>Generate a Report of a Custom Area:</b></h3>
            <CalciteButton onClick={handleCustomAreaButton}>{buttonText('customArea', 'Draw Custom Area')}</CalciteButton>
          </div>
          <div className="mt-2">
            <CalciteButton onClick={handleResetButton}>{buttonText('reset', 'Reset')}</CalciteButton>
          </div>
        </CalciteBlock>
      </CalcitePanel>
    </div>
  );
}

export default GeologicalUnitSearch;
