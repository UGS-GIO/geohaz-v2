import Map from '@arcgis/core/Map'
import SceneView from '@arcgis/core/views/SceneView'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import MapImageLayer from '@arcgis/core/layers/MapImageLayer'
import TileLayer from '@arcgis/core/layers/TileLayer'
import GroupLayer from '@arcgis/core/layers/GroupLayer'
import layers from '../config/layers'
import Color from '@arcgis/core/Color'

interface LayerConfig {
    type: 'feature' | 'tile' | 'map-image' | 'group'
    url?: string
    options?: object
    title?: string
    visible?: boolean
    layers?: LayerConfig[]
}

interface MapApp {
    view?: SceneView
}

const createLayer = (layerConfig: LayerConfig): FeatureLayer | TileLayer | GroupLayer | MapImageLayer | undefined => {
    // Create a layer based on the layerConfig
    switch (layerConfig.type) {
        case 'feature':
            if ('url' in layerConfig) {
                return new FeatureLayer({
                    url: layerConfig.url,
                    ...layerConfig.options,
                })
            }
            break
        case 'tile':
            if ('url' in layerConfig) {
                return new TileLayer({
                    url: layerConfig.url,
                    ...layerConfig.options,
                })
            }
            break
        case 'map-image':
            if ('url' in layerConfig) {
                return new MapImageLayer({
                    url: layerConfig.url,
                    ...layerConfig.options,
                })
            }
            break
        case 'group':
            return new GroupLayer({
                title: layerConfig.title,
                visible: layerConfig.visible,
                layers: (layerConfig.layers?.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer)[]), // Remove undefined values
            })
        default:
            return undefined
    }
}

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
        padding: {
            top: 50,
            bottom: 0
        },
        highlightOptions: {
            color: new Color([255, 255, 0, 1]),
            haloColor: new Color("white"),
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }
    })

    // Add layers to the map
    layers.forEach((layerConfig: any) => {
        const layer = createLayer(layerConfig)
        if (layer) {
            map.add(layer)
        }
    })

    return view
}