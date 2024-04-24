import { useRef, useEffect, useContext } from 'react'
import { MapContext } from '../contexts/MapProvider'
import MapWidgets from './widgets/MapWidgets'
import MouseInfo from './widgets/MouseInfo'

function FullScreenMap() {
  const mapRef = useRef(null)
  const { loadMap } = useContext(MapContext)

  useEffect(() => {
    if (mapRef.current && loadMap) {
      loadMap(mapRef.current as HTMLDivElement)
    }

  }, [mapRef, loadMap])

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }}>
    <MapWidgets />
    <MouseInfo />
  </div>
}

export default FullScreenMap
