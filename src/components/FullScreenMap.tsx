// import { useRef, useEffect, useContext } from 'react'
import { MapContext } from '../contexts/MapProvider'
// import MapWidgets from './widgets/MapWidgets'
// import MouseInfo from './widgets/MouseInfo'

// function FullScreenMap() {
//   const mapRef = useRef(null)
//   const { loadMap } = useContext(MapContext)

//   useEffect(() => {
//     if (mapRef.current && loadMap) {
//       loadMap(mapRef.current as HTMLDivElement)
//     }

//     console.log('mapRef', mapRef.current);


//   }, [mapRef, loadMap])
//   // return <div ref={mapRef} className='h-full w-full'>

//   //   {/* <MapWidgets />
//   //   <MouseInfo /> */}
//   // </div>
//   return (<div className="w-full h-full" ref={mapRef}></div>)
// }

// export default FullScreenMap

import { useContext, useEffect, useRef } from "react";
import MapWidgets from './widgets/MapWidgets';

export default function ArcGISMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { loadMap } = useContext(MapContext)

  useEffect(() => {
    if (mapRef.current && loadMap) {
      loadMap(mapRef.current);
    }
  }, [mapRef, loadMap]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={mapRef}>
      <MapWidgets />
    </div>
  );
}
