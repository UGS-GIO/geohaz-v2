import { useRef, useContext, useEffect, FC } from 'react';
import './MapSurround.scss';
import Loader from './Loader';
import { HazardMapContext } from '../contexts/HazardMapContext';

interface MapSurroundProps {
  mapKey: string;
}

const MapSurround: FC<MapSurroundProps> = ({ mapKey }) => {
  const scaleBarRef = useRef<HTMLDivElement>(null);
  const { visualAssets } = useContext(HazardMapContext);
  const mapImage = visualAssets && visualAssets[mapKey] && visualAssets[mapKey].mapImage;
  const scale = (mapImage) ? visualAssets[mapKey].scale : 0;
  const scaleBarDom = (mapImage) ? visualAssets[mapKey].scaleBarDom : null;

  useEffect(() => {
    if (scaleBarDom && scaleBarRef.current) {
      scaleBarRef.current.innerHTML = ''; // clear the div
      scaleBarRef.current.appendChild(scaleBarDom); // append the new scale bar
    }
  }, [scaleBarDom]);

  if (mapImage) {
    return (
      <>
        <img src={mapImage} alt="map" className="map-surround__image" />
        <div className="map-surround__parts">
          <div ref={scaleBarRef}></div>
          <div className="map-surround__scale-text">Scale 1:{Math.round(scale).toLocaleString()}</div>
        </div>
      </>
    );
  }

  return (<Loader />);
};

export default MapSurround;