import { useRef, useEffect, useContext } from 'react'
import { MapContext } from '../contexts/MapProvider'
import Home from './widgets/Home'

function FullScreenMap() {
  const mapRef = useRef(null)
  const { loadMap } = useContext(MapContext)

  useEffect(() => {
    if (mapRef.current && loadMap) {
      loadMap(mapRef.current as HTMLDivElement)
    }
  }, [mapRef, loadMap])

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }}>
    <Home />
  </div>
}

export default FullScreenMap
