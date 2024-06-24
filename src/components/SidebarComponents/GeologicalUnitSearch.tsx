import { CalciteBlock, CalciteButton, CalcitePanel } from "@esri/calcite-components-react";
import { useContext } from "react";
import { MapContext } from '../../contexts/MapProvider'


// legacy app implementation
//grab current map extents for report generator
// var currentExtentButton = document.getElementById("currentButton");
// currentExtentButton.onclick = function() {
//     console.log(mapView.extent);
//     var areaHeight = mapView.extent.height;
//     var areaWidth = mapView.extent.width;

//     //check to be sure extents are not too large
//     if (areaHeight < 12000 && areaWidth < 18000) {

//         var xMini = mapView.extent.xmin;
//         var xMaxi = mapView.extent.xmax;
//         var yMini = mapView.extent.ymin;
//         var yMaxi = mapView.extent.ymax;

//         var newRings = [
//             [xMaxi, yMaxi],
//             [xMaxi, yMini],
//             [xMini, yMini],
//             [xMini, yMaxi],
//             [xMaxi, yMaxi]
//         ];

//         var aoi = {
//             spatialReference: {
//                 latestWkid: 3857,
//                 wkid: 102100
//             }
//         };


//         console.log(aoi);
//         aoi.rings = [newRings];
//         console.log(aoi);

//         var params = {
//             description: "Test",
//             polygon: aoi,

//         };
//         console.log(params);

//         localStorage.setItem('aoi', JSON.stringify(params));
//         console.log(localStorage);
//         window.open('./report');

//     } else {
//         console.log("Area of interest is too large, try again");
//         alert("Area of interest is too large, try a smaller extent.");
//     }
// };


function GeologicalUnitSearch() {
  const { view } = useContext(MapContext);

  const handleCurrentMapExtentButton = () => {
    const extent = view?.extent;
    console.log('Current Map Extent:', extent);
    const areaHeight = extent?.height;
    const areaWidth = extent?.width;

    //check to be sure extents are not too large
    if (areaHeight && areaWidth && areaHeight < 12000 && areaWidth < 18000) {
      const xMini = extent.xmin;
      const xMaxi = extent.xmax;
      const yMini = extent.ymin;
      const yMaxi = extent.ymax;

      const newRings = [
        [xMaxi, yMaxi],
        [xMaxi, yMini],
        [xMini, yMini],
        [xMini, yMaxi],
        [xMaxi, yMaxi]
      ];

      interface Aoi {
        spatialReference: {
          latestWkid: number,
          wkid: number
        },
        rings?: number[][][]
      }

      const aoi: Aoi = {
        spatialReference: {
          latestWkid: 3857,
          wkid: 102100
        },
      };

      console.log(aoi);
      aoi.rings = [newRings];
      console.log(aoi);

      const params = {
        description: "Test",
        polygon: aoi,
      };
      console.log(params);

      localStorage.setItem('aoi', JSON.stringify(params));
      console.log(localStorage);
      window.open('./report');
    } else {
      console.log("Area of interest is too large, try again");
      alert("Area of interest is too large, try a smaller extent.");
    }

  }

  return (
    <div>
      <CalcitePanel>

        <CalciteBlock open heading='Report Generator'>
          <p> The Report Generator is designed to provide a summary of information for small areas. If your area of interest is larger than that, you will see a notification prompting you to select a smaller area.</p>
          <div className="mt-2">
            <p><b>Generate a Report of the Current Map Extent:</b></p>
            <CalciteButton onClick={handleCurrentMapExtentButton}>Current Map Extent Button</CalciteButton>
          </div>

          <h1>
            Test Report Generator
          </h1>

          <div className="mt-2">
            <h3><b>Generate a Report of a Custom Area:</b></h3>
            <CalciteButton>Custom Area Button</CalciteButton>
          </div>
          <div className="mt-2">
            <CalciteButton>Reset</CalciteButton>
          </div>
        </CalciteBlock>
      </CalcitePanel>
    </div>
  );
};

export default GeologicalUnitSearch;