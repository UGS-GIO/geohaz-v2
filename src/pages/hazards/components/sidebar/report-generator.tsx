import { useContext, useState, useEffect, useRef } from "react";
import { MapContext } from '@/context/map-provider';
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Layer from "@arcgis/core/layers/Layer";
import { Button } from '@/components/custom/button';
import { BackToMenuButton } from "@/components/custom/back-to-menu-button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Polygon from "@arcgis/core/geometry/Polygon";



type ActiveButtonOptions = 'currentMapExtent' | 'customArea' | 'reset';

function ReportGenerator() {
  const { view, setIsSketching } = useContext(MapContext);
  const [activeButton, setActiveButton] = useState<ActiveButtonOptions>();
  const tempGraphicsLayer = useRef<__esri.GraphicsLayer | undefined>(undefined);
  const sketchVM = useRef<__esri.SketchViewModel | undefined>(undefined);
  const { setNavOpened } = useSidebar();
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);

  const handleNavigate = (aoi: __esri.Geometry) => {
    const aoiString = JSON.stringify(aoi);
    // Navigate to the report page with the aoi parameter
    handleReset();
    window.open('/hazards/report/' + aoiString, '_blank');
  };

  function addGraphic(
    event: __esri.SketchViewModelCreateEvent,
    tempGraphicsLayer: __esri.GraphicsLayer | undefined,
    setActiveButton: React.Dispatch<React.SetStateAction<ActiveButtonOptions | undefined>>,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (event.state === "complete" && event.graphic) {
      tempGraphicsLayer?.remove(event.graphic);
      const drawAOIHeight = event.graphic.geometry.extent.height;
      const drawAOIWidth = event.graphic.geometry.extent.width;
      const aoi = event.graphic.geometry;

      if (drawAOIHeight < 12000 && drawAOIWidth < 18000) {

        handleNavigate(aoi);
        setActiveButton(undefined);
      } else {
        setModalOpen(true);
        setActiveButton(undefined);
      }
    } else if (event.state === "start" && event.graphic) {
      // console.log("addGraphic: Drawing started");
    }
  }

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
    handleReset()
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

      const aoi = new Polygon({
        spatialReference: {
          wkid: 102100
        },
        rings: [newRings]
      });
      handleNavigate(aoi);
    } else {
      setModalOpen(true);
      handleReset();
    }
  };

  const handleCustomAreaButton = () => {
    handleReset()
    handleActiveButton('customArea');
    if (isMobile) setNavOpened(false); // Close the sidebar on mobile so user can see the map

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
        if (isMobile) {
          const completeButton = document.createElement("button");
          // onclick to complete the sketch
          completeButton.onclick = () => {
            sketchVM.current?.complete();
          };
          completeButton.innerHTML = "Complete";
          completeButton.id = "complete-button";
          completeButton.classList.add("esri-widget-button", "esri-widget", "esri-interactive", "p-2", "bg-background");

          view?.ui.add(completeButton, "top-right");
        }
        setIsSketching?.(true);
      }

      if (event.state === "active") {
        addGraphic(event, tempGraphicsLayer.current, setActiveButton, setModalOpen);
      }

      if (event.state === "complete") {
        setIsSketching?.(true); // Ensure it remains true immediately after completion
        view?.ui.remove(view?.ui.find("complete-button"));

        const extent = event.graphic.geometry.extent;
        const areaHeight = extent?.height;
        const areaWidth = extent?.width;
        const geometry = event.graphic.geometry as __esri.Polygon;

        if (areaHeight && areaWidth && areaHeight < 12000 && areaWidth < 18000) {

          const aoi = new Polygon({
            spatialReference: {
              wkid: 102100
            },
            rings: geometry.rings
          });
          handleNavigate(aoi);
        } else {
          console.log("Area of interest is too large, try again");
          setModalOpen(true);
        }

      }

      return;
    });

    sketchVM.current.create("polygon", {
      mode: "click"
    });
  };

  const handleReset = () => {
    sketchVM.current?.cancel();
    if (tempGraphicsLayer.current) {
      tempGraphicsLayer.current?.removeAll();
    }
    setActiveButton(undefined);
    requestAnimationFrame(() => {
      setIsSketching?.(false);
    })
    if (modalOpen) setModalOpen(false);
  };

  const buttonText = (buttonName: ActiveButtonOptions, defaultText: string) => {
    return (
      activeButton === buttonName ? `✓ ${defaultText}` : defaultText
    );
  }

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleResetDrawing = () => {
    setIsSketching?.(true);
    handleCustomAreaButton();
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
            <Button onClick={handleReset} variant="secondary" className="w-full flex-grow mb-2 md:mb-0">
              {buttonText('reset', 'Reset')}
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogTrigger asChild>
          <div className="hidden"></div>
        </DialogTrigger>
        <DialogContent className="w-4/5">
          <DialogHeader>
            <DialogTitle>Area too large</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            The map area is too large. Please draw a smaller custom area or zoom in.
            <div className="flex flex-row space-x-2 mt-4 justify-end">
              <Button onClick={handleResetDrawing} variant="default" >
                Create a new area
              </Button>
              <Button onClick={handleReset} variant="secondary" >
                Close
              </Button>
            </div>
          </DialogDescription>
          <DialogClose />

        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReportGenerator;
