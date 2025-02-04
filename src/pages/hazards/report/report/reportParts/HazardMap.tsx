/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState, useEffect, FC, ReactNode } from 'react';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import config from '../config';
import WebMap from "@arcgis/core/WebMap.js";
import MapView from "@arcgis/core/views/MapView.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import Graphic from "@arcgis/core/Graphic.js";
import ScaleBar from "@arcgis/core/widgets/ScaleBar.js";
// import getModules from '../esriModules';
import './HazardMap.scss';
import { Polygon as PolygonType } from '../types/types';
import { ProgressContext } from '../contexts/ProgressContext';
import { HazardMapContext } from '../contexts/HazardMapContext';

interface VisualAssets {
  [key: string]: any;
}

interface HazardMapProps {
  aoi: PolygonType;
  queriesWithResults: string[][];
  children?: ReactNode;
}

interface Screenshot {
  mapImage: string;
  renderer?: any; // replace with actual type
  scale: number; // replace with actual type
  scaleBarDom: any; // replace with actual type
}

// export const HazardMapContext = createContext<{ visualAssets: VisualAssets }>({
//   visualAssets: {}
// });

let map: any;
let view: MapView;
let scaleBar: any;

const HazardMap: FC<HazardMapProps> = ({ aoi, queriesWithResults, children }) => {
  // // console.log('HazardMap.render', { aoi, queriesWithResults });
  const [visualAssets, setVisualAssets] = useState<Partial<VisualAssets>>({});
  const [mapLoading, setMapLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { registerProgressItem, setProgressItemAsComplete } = useContext(ProgressContext);


  const createMap = async () => {
    // // console.log('HazardMap.createMap');

    setMapLoading(true);

    // const { WebMap, MapView, Polygon, Graphic, ScaleBar } = await getModules();

    const mapDiv = document.createElement('div');
    document.body.appendChild(mapDiv);

    const polylineSymbol = {
      type: 'simple-line',
      color: '#f012be',
      width: 4
    };

    const polygon = new Polygon(aoi);
    const polylineGraphic = new Graphic({
      geometry: polygon,
      symbol: polylineSymbol
    });

    map = new WebMap({
      portalItem: { id: config.webMaps.hazard }
    });

    const extentClone = polygon.extent.clone();

    view = new MapView({
      map,
      container: mapDiv,
      ui: {
        components: ['attribution']
      },
      extent: extentClone.expand(3),
      graphics: [polylineGraphic],
      constraints: {
        snapToZoom: false
      }
    });

    // make map scale a multiple of 2500
    view.when(() => {
      const extent = polygon.extent;
      const expandedExtent = extent.expand(3);
      view.extent = expandedExtent;
    });
    const remainder = view.scale % config.scaleMultiple;
    view.scale += config.scaleMultiple - remainder;

    scaleBar = new ScaleBar({
      view,
      container: document.createElement('div'),
      unit: 'dual'
    });

    setMapLoaded(true);
  }

  const getProgressId = (url: string) => `screenshot-${url}`;
  useEffect(() => {
    for (let index = 0; index < queriesWithResults.length; index++) {
      const [url] = queriesWithResults[index];

      registerProgressItem(getProgressId(url));
    }

    Object.keys(config.mapKeys).forEach(key => {
      const mapKeys = config.mapKeys as Record<string, string>;
      const mapKey = mapKeys[key];
      registerProgressItem(getProgressId(mapKey));
    });
  }, [queriesWithResults, registerProgressItem]);

  useEffect(() => {
    const getScreenshots = async () => {
      // console.log('getScreenshots', queriesWithResults);

      const newScreenshots: Record<string, Screenshot> = {};
      for (let index = 0; index < queriesWithResults.length; index++) {
        const [url, hazardCode] = queriesWithResults[index];
        const { screenshot, renderer, scale, scaleBarDom } = await getScreenshot(url, hazardCode);
        setProgressItemAsComplete(getProgressId(url));

        newScreenshots[hazardCode] = {
          mapImage: screenshot.dataUrl,
          renderer,
          scale,
          scaleBarDom
        };
      }

      const getExtraScreenshot = async (key: string, url?: string) => {
        // generate overview map
        const { screenshot, scale, scaleBarDom } = await getScreenshot(url);
        newScreenshots[key] = { mapImage: screenshot.dataUrl, scale, scaleBarDom };
        setProgressItemAsComplete(getProgressId(key));
      };

      await getExtraScreenshot(config.mapKeys.overview);
      await getExtraScreenshot(config.mapKeys.lidar, config.urls.lidarExtents);
      await getExtraScreenshot(config.mapKeys.aerials, config.urls.aerialImageryCenterPoints);

      setVisualAssets(newScreenshots);
      // console.log('newScreenshots', newScreenshots);

    };

    if (mapLoaded && queriesWithResults.length > 0) {
      getScreenshots();
    }
  }, [queriesWithResults, mapLoaded, setProgressItemAsComplete]);

  if (!mapLoading) {
    createMap();
  }

  return (
    <>
      <HazardMapContext.Provider value={{ visualAssets }}>
        {children}
      </HazardMapContext.Provider>
    </>
  );
};

const getScreenshot = async function (url?: string, hazardCode?: string) {
  // console.log('HazardMap.getScreenshot', url);

  let renderer;

  await map.when();

  map.layers.forEach(async (__: any, index: any) => {
    let layer = map.layers.getItemAt(index);
    let testUrl;
    let loadLayer;
    if (layer.type === 'map-image') {
      layer = layer.sublayers.items[0];
      testUrl = layer.url;
      loadLayer = layer.parent;
    } else {
      testUrl = `${layer.url}/${layer.layerId}`;
      loadLayer = layer;
    }

    if (url) {
      layer.visible = new RegExp(`${url.toUpperCase()}$`).test(testUrl.toUpperCase());
    } else {
      layer.visible = false;
    }

    if (layer.visible) {
      await loadLayer.load();

      renderer = layer.renderer;

      if (layer.parent) {
        layer.parent.visible = layer.visible;
      }
    }
  })

  let originalScale;
  if (hazardCode === config.groundshakingHazardCode) {
    originalScale = view.scale;

    // goTo works better than setting the scale prop directly since we can await it
    await view.goTo({
      scale: view.scale * 2
    });
  }

  await reactiveUtils.whenOnce(
    () => !view.updating
  );

  // this is not working so we are sticking with the above watchUtils.whenFalseOnce for now
  // reactiveUtils.when(
  //   () => !view.updating,
  //   () => // console.log("view is now stationary"),
  //   { once: true }
  // );

  // map width is 8.5" - 0.78" (default print margins for Chrome on macOS) * 300 dpi
  // height is golden ratio
  const screenshot = await view.takeScreenshot({ width: 2316, height: 1431 });
  // cache scale bar dom since it could be different for different maps
  scaleBar.renderNow();
  const scaleBarDom = scaleBar.container.cloneNode(true);
  const scale = view.scale;

  if (originalScale) {
    await view.goTo({
      scale: originalScale
    });
  }

  // console.log('view.scale', scale, hazardCode, renderer);
  return { screenshot, renderer, scale, scaleBarDom };
};

export default HazardMap;
