import Map from '@arcgis/core/Map'
import SceneView from '@arcgis/core/views/SceneView'
import layers from '../config/layers'
import Color from '@arcgis/core/Color'
import { LayerConfig, MapApp } from './types/mappingTypes'
import { createLayer, setPopupAlignment } from './util/mappingUtils'


// Create a global app object to store the view
const app: MapApp = {}

// Initialize the app
export function init(container: HTMLDivElement) {
    // Destroy the view if it exists
    if (app.view) {
        app.view.destroy()
    }

    // Create a new map and view
    const map = new Map({
        basemap: 'topo-vector',
    })

    const view = new SceneView({
        container: container,
        map: map,
        zoom: 8,
        center: [-112, 39.5],
        highlightOptions: {
            color: new Color([255, 255, 0, 1]),
            haloColor: new Color("white"),
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }
    })

    // Add layers to the map
    layers.forEach((layerConfig: LayerConfig) => {
        const layer = createLayer(layerConfig)
        if (layer) {
            map.add(layer)
        }
    })

    // prevent collision with the edges of the view
    setPopupAlignment(view);

    return view
}