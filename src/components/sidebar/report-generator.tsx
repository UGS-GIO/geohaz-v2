import { useContext, useState, useEffect, useRef } from "react";
import { MapContext } from '@/context/map-provider';
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Layer from "@arcgis/core/layers/Layer";
import { Button } from '@/components/custom/button';

function addGraphic(
  event: __esri.SketchViewModelCreateEvent,
  // sketchVM: __esri.SketchViewModel | undefined,
  tempGraphicsLayer: __esri.GraphicsLayer | undefined,
  setActiveButton: React.Dispatch<React.SetStateAction<ActiveButtonOptions | undefined>>
) {
  if (event.state === "complete" && event.graphic) {
    console.log("addGraphic: Drawing complete");
    tempGraphicsLayer?.remove(event.graphic);
    const drawAOIHeight = event.graphic.geometry.extent.height;
    const drawAOIWidth = event.graphic.geometry.extent.width;
    const aoi = event.graphic.geometry.toJSON();

    if (drawAOIHeight < 12000 && drawAOIWidth < 18000) {
      const params = {
        description: "Test",
        polygon: aoi,
      };

      localStorage.setItem("aoi", JSON.stringify(params));
      window.open("./report");
      setActiveButton(undefined);
    } else {
      console.log("Area of interest is too large, try again");
      alert("Area of interest is too large, try a smaller area.");
      setActiveButton(undefined);
    }
  } else if (event.state === "start" && event.graphic) {
    console.log("addGraphic: Drawing started");
  }
}

type ActiveButtonOptions = 'currentMapExtent' | 'customArea' | 'reset';

function GeologicalUnitSearch() {
  const { view } = useContext(MapContext);
  const [activeButton, setActiveButton] = useState<ActiveButtonOptions>();
  const tempGraphicsLayer = useRef<__esri.GraphicsLayer | undefined>(undefined);
  const sketchVM = useRef<__esri.SketchViewModel | undefined>(undefined);

  const handleActiveButton = (buttonName: ActiveButtonOptions) => {
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
      setActiveButton(undefined);
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

    sketchVM.current.on('create', (event) => addGraphic(event, tempGraphicsLayer.current, setActiveButton));

    sketchVM.current.create("polygon", {
      mode: "click"
    });
  };

  const handleResetButton = () => {
    console.log('Reset Button Clicked');
    sketchVM.current?.cancel();
    if (tempGraphicsLayer.current) {
      tempGraphicsLayer.current?.removeAll();
    }
    setActiveButton(undefined);
  };

  const buttonText = (buttonName: ActiveButtonOptions, defaultText: string) => {
    return (
      activeButton === buttonName ? `✓ ${defaultText}` : defaultText
    );
  }

  return (
    <div>
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Report Generator</h3>
          <p>
            The Report Generator is designed to provide a summary of information for small areas. If your area of interest is larger than that, you will see a notification prompting you to select a smaller area.
          </p>
        </div>

        <div className="flex flex-wrap justify-start items-center space-y-2 sm:space-y-0 sm:space-x-12 sm:justify-start">
          <div className="flex space-x-2">
            <Button onClick={handleCurrentMapExtentButton} variant="default" className="mb-2 md:mb-0">
              {buttonText('currentMapExtent', 'Current Map Extent')}
            </Button>
          </div>
          <div className="flex-none space-x-2">
            <Button onClick={handleCustomAreaButton} variant="default">
              {buttonText('customArea', 'Draw Custom Area')}
            </Button>
            <Button onClick={handleResetButton} variant="secondary">
              {buttonText('reset', 'Reset')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeologicalUnitSearch;
