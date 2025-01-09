import { useContext, useState, useEffect, useRef } from "react";
import { MapContext } from '@/context/map-provider';
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Layer from "@arcgis/core/layers/Layer";
import { Button } from '@/components/custom/button';
import { BackToMenuButton } from "@/components/custom/back-to-menu-button";

function addGraphic(
  event: __esri.SketchViewModelCreateEvent,
  tempGraphicsLayer: __esri.GraphicsLayer | undefined,
  setActiveButton: React.Dispatch<React.SetStateAction<ActiveButtonOptions | undefined>>
) {
  if (event.state === "complete" && event.graphic) {
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
    // console.log("addGraphic: Drawing started");
  }
}

type ActiveButtonOptions = 'currentMapExtent' | 'customArea' | 'reset';

function ReportGenerator() {
  const { view, setIsSketching } = useContext(MapContext);
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
    handleResetButton()
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
      handleResetButton();
    }
  };

  const handleCustomAreaButton = () => {
    handleResetButton()
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

    sketchVM.current.on('create', (event) => {
      if (event.state === "start") {
        setIsSketching?.(true);
      }

      if (event.state === "active") {
        addGraphic(event, tempGraphicsLayer.current, setActiveButton);
      }

      if (event.state === "complete") {
        setIsSketching?.(true); // Ensure it remains true immediately after completion

        const extent = event.graphic.geometry.extent;
        const areaHeight = extent?.height;
        const areaWidth = extent?.width;
        const geometry = event.graphic.geometry as __esri.Polygon;

        if (areaHeight && areaWidth && areaHeight < 12000 && areaWidth < 18000) {

          const aoi = {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            rings: geometry.rings
          };

          const params = {
            description: "Test",
            polygon: aoi,
          };

          localStorage.setItem('aoi', JSON.stringify(params));
          window.open('./report');
        } else {
          console.log("Area of interest is too large, try again");
          alert("Area of interest is too large, try drawing a smaller area.");
          handleResetButton();
        }

      }

      return;
    });

    sketchVM.current.create("polygon", {
      mode: "click"
    });
  };

  const handleResetButton = () => {
    sketchVM.current?.cancel();
    if (tempGraphicsLayer.current) {
      tempGraphicsLayer.current?.removeAll();
    }
    setActiveButton(undefined);
    requestAnimationFrame(() => {
      setIsSketching?.(false);
    })
  };

  const buttonText = (buttonName: ActiveButtonOptions, defaultText: string) => {
    return (
      activeButton === buttonName ? `✓ ${defaultText}` : defaultText
    );
  }

  return (
    <div>
      <BackToMenuButton />
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Report Generator</h3>
          <p>
            The Report Generator is designed to provide a summary of information for small areas. If your area of interest is larger than that, you will see a notification prompting you to select a smaller area.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap justify-start items-center md:space-x-4">
            <Button onClick={handleCurrentMapExtentButton} variant="default" className="w-full md:w-auto flex-grow mb-2 md:mb-0">
              {buttonText('currentMapExtent', 'Current Map Extent')}
            </Button>
            <Button onClick={handleCustomAreaButton} variant="default" className="w-full md:w-auto flex-grow mb-2 md:mb-0">
              {buttonText('customArea', 'Draw Custom Area')}
            </Button>
          </div>
          <div className="flex w-full">
            <Button onClick={handleResetButton} variant="secondary" className="w-full flex-grow mb-2 md:mb-0">
              {buttonText('reset', 'Reset')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportGenerator;
