import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import layers from '../config/layers'
import { MapApp } from './types/mappingTypes'
import { addLayersToMap, createMap, createView, setPopupAlignment } from './util/mappingUtils'

// Create a global app object to store the view
const app: MapApp = {}

// Initialize the app
export function init(container: HTMLDivElement, initialView: 'map' | 'scene'): SceneView | MapView {
    // // Destroy the view if it exists
    // if (app.view) {
    //     app.view.destroy()
    // }

    // Create a new map and view
    const map = createMap()

    // Create the view
    const view = createView(container, map, initialView)

    // Add layers to the map
    addLayersToMap(map, layers)

    // prevent collision with the edges of the view
    setPopupAlignment(view);

    return view
}