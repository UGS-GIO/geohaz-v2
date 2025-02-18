import { useContext, useState, useEffect, useRef } from "react";
import { MapContext } from '@/context/map-provider';
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Layer from "@arcgis/core/layers/Layer";
import { Button } from '@/components/custom/button';
import { BackToMenuButton } from "@/components/custom/back-to-menu-button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Polygon from "@arcgis/core/geometry/Polygon";
import { useToast } from "@/hooks/use-toast";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";


type ActiveButtonOptions = 'currentMapExtent' | 'customArea' | 'reset';
type DialogType = 'areaTooLarge' | 'confirmation' | null;

function ReportGenerator() {
  const { view, setIsSketching } = useContext(MapContext);
  const [activeButton, setActiveButton] = useState<ActiveButtonOptions>();
  const tempGraphicsLayer = useRef<__esri.GraphicsLayer | undefined>(undefined);
  const sketchVM = useRef<__esri.SketchViewModel | undefined>(undefined);
  const { setNavOpened } = useSidebar();
  const isMobile = useIsMobile();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [screenshot, setScreenshot] = useState<string>("");
  const [pendingAoi, setPendingAoi] = useState<__esri.Geometry | null>(null);
  const { toast } = useToast()

  const createMap = async (aoi: string): Promise<{ view: __esri.MapView, cleanup: () => void }> => {
    // Remove any existing map containers
    const existingDiv = document.getElementById('screenshotMapDiv');
    if (existingDiv) {
      existingDiv.remove();
    }

    // Create new map container
    const mapDiv = document.createElement('div');
    mapDiv.id = 'screenshotMapDiv';
    // mapDiv.style.position = 'absolute';
    // mapDiv.style.left = '-9999px';
    mapDiv.style.width = '2316px';
    mapDiv.style.height = '1431px';
    document.body.appendChild(mapDiv);

    const polylineSymbol = {
      type: "simple-fill",
      color: "rgba(138,43,226, 0.8)",
      style: "solid",
      outline: {
        color: "white",
        width: 1
      }
    }

    const parsedAoi = JSON.parse(aoi);
    const polygon = new Polygon(parsedAoi);

    const polylineGraphic = new Graphic({
      geometry: polygon,
      symbol: polylineSymbol
    });

    const map = new Map({
      basemap: "topo"
    });

    const extentClone = polygon.extent.clone();

    const screenshotView = new MapView({
      map: map,
      container: mapDiv,
      ui: {
        components: ['attribution']
      },
      extent: extentClone.expand(2),
      constraints: {
        snapToZoom: false
      }
    });

    // Add graphic after view initialization
    screenshotView.graphics.add(polylineGraphic);

    // Wait for the view to be ready
    await screenshotView.when();

    // Wait for the basemap to load
    await map.basemap.load();

    // Important: Wait for ALL basemap layers to load
    const basemapLayerPromises = map.basemap.baseLayers.map(layer => layer.load());
    await Promise.all(basemapLayerPromises);

    // Go to extent after layers are loaded
    await screenshotView.goTo(extentClone.expand(2), {
      animate: false,
      duration: 0
    });

    // Give a small delay for final rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cleanup = () => {
      screenshotView.destroy();
      mapDiv.remove();
    };

    return { view: screenshotView, cleanup };
  };


  const getScreenshot = async (geometry: __esri.Geometry) => {
    try {
      console.log('Initializing map and view for screenshot...');

      const aoi = JSON.stringify(geometry);
      const { view: screenshotView, cleanup } = await createMap(aoi);

      const screenshot = await screenshotView.takeScreenshot({
        width: 2316,
        height: 1431,
        format: "png"
      });

      console.log('Screenshot captured!');


      // Clean up
      cleanup();

      return screenshot?.dataUrl;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  };



  const handleNavigate = async (aoi: __esri.Geometry) => {
    setPendingAoi(aoi);
    const screenshotDataUrl = await getScreenshot(aoi);
    console.log('aoi', aoi);

    console.log('screenshotDataUrl', screenshotDataUrl);


    if (screenshotDataUrl) {
      setScreenshot(screenshotDataUrl);
    }

    setActiveDialog('confirmation');
  };

  const handleConfirmNavigation = () => {
    if (!pendingAoi) return;

    const aoiString = JSON.stringify(pendingAoi);
    const reportUrl = '/hazards/report/' + aoiString;

    // Open in new tab
    window.open(reportUrl, '_blank');
    handleReset();
  };

  const handleCopyLink = () => {
    if (!pendingAoi) return;

    const aoiString = JSON.stringify(pendingAoi);
    const reportUrl = window.location.origin + '/hazards/report/' + aoiString;

    navigator.clipboard.writeText(reportUrl)
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a copying the link. Please try again.",
        })
        console.error('Failed to copy URL:', err)
      });

    toast({
      variant: "default",
      description: "Link copied!",
    })
  };

  function addGraphic(
    event: __esri.SketchViewModelCreateEvent,
    tempGraphicsLayer: __esri.GraphicsLayer | undefined,
    setActiveButton: React.Dispatch<React.SetStateAction<ActiveButtonOptions | undefined>>
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
        setActiveDialog('areaTooLarge');
        setActiveButton(undefined);
      }
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
      setActiveDialog('areaTooLarge');
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
        addGraphic(event, tempGraphicsLayer.current, setActiveButton);
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
          setActiveDialog('areaTooLarge');
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
    setActiveDialog(null);
  };

  const buttonText = (buttonName: ActiveButtonOptions, defaultText: string) => {
    return (
      activeButton === buttonName ? `✓ ${defaultText}` : defaultText
    );
  }

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setPendingAoi(null);
  }

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

      {/* Area Too Large Dialog */}
      <Dialog open={activeDialog === 'areaTooLarge'} onOpenChange={handleCloseDialog}>
        <DialogContent className="w-4/5">
          <DialogHeader>
            <DialogTitle>Area too large</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            The map area is too large. Please draw a smaller custom area or zoom in.
            <div className="flex flex-row space-x-2 mt-4 justify-end">
              <Button onClick={handleResetDrawing} variant="default">
                Create a new area
              </Button>
              <Button onClick={handleReset} variant="secondary">
                Close
              </Button>
            </div>
          </DialogDescription>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={activeDialog === 'confirmation'} onOpenChange={handleCloseDialog}>
        <DialogContent className="w-4/5">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
          </DialogHeader>
          {/* <DialogDescription> */}
          Generate report for the selected area?
          <img src={screenshot} alt="map" />
          <div className="flex flex-row space-x-2 mt-4 justify-end">
            <Button onClick={handleConfirmNavigation} variant="default">
              Generate Report
            </Button>
            <Button onClick={handleCopyLink} variant="secondary">
              Copy Link
            </Button>
            <Button onClick={handleCloseDialog} variant="secondary">
              Cancel
            </Button>
          </div>
          {/* </DialogDescription> */}
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReportGenerator;
