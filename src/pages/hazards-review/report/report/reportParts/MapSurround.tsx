import { useRef, useContext, useEffect, useState, FC } from 'react';
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
  const scale = mapImage ? visualAssets[mapKey].scale : 0;
  const scaleBarDom = mapImage ? visualAssets[mapKey].scaleBarDom : null;
  const [compressedImageURL, setCompressedImageURL] = useState<string | null>(null);

  useEffect(() => {
    if (mapImage) {
      // Compress the image if it exists
      const compressImage = async () => {
        const img = new Image();
        img.src = mapImage;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 1000; // Max width for compression

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((maxWidth / width) * height);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          // Use toBlob() to avoid large Base64 strings
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedImageURL = URL.createObjectURL(blob);
              setCompressedImageURL(compressedImageURL);
            }
          }, 'image/png', 1);
        };
      };

      compressImage();
    }
  }, [mapImage]);

  useEffect(() => {
    if (scaleBarDom && scaleBarRef.current) {
      scaleBarRef.current.innerHTML = ''; // clear the div
      scaleBarRef.current.appendChild(scaleBarDom); // append the new scale bar
    }
  }, [scaleBarDom]);

  if (compressedImageURL) {
    return (
      <>
        <img src={compressedImageURL} alt="map" className="map-surround__image" />
        <div className="map-surround__parts">
          <div ref={scaleBarRef}></div>
          <div className="map-surround__scale-text">Scale 1:{Math.round(scale).toLocaleString()}</div>
        </div>
      </>
    );
  }

  return <Loader />;
};

export default MapSurround;
