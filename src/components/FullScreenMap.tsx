import { useRef, useEffect } from 'react'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'

function FullScreenMap() {
  const mapDiv = useRef(null)

  useEffect(() => {
    if (mapDiv.current) {
      const map = new Map({
        basemap: 'topo-vector',
      })

      new MapView({
        container: mapDiv.current,
        map: map,
        zoom: 4,
        center: [15, 65], // Longitude, latitude
      })
    }
  }, [])

  return <div ref={mapDiv} style={{ height: '100vh', width: '100%' }} />
}

export default FullScreenMap
