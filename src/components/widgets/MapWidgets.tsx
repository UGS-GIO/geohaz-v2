import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '../../hooks/useArcGISWidget';
import Feature from "@arcgis/core/widgets/Feature.js";
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import { useContext } from 'react';
import { MapContext } from '../../contexts/MapProvider';
import Legend from '@arcgis/core/widgets/Legend';
import Search from '@arcgis/core/widgets/Search';
import Extent from "@arcgis/core/geometry/Extent.js";
import SearchSource from "@arcgis/core/widgets/Search/SearchSource.js";
import Graphic from "@arcgis/core/Graphic.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import Color from "@arcgis/core/Color.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";



// ArcGIS JS SDK Widgets that are overlaid on the map
const MapWidgets: React.FC = () => {
    const { view, isMobile } = useContext(MapContext);

    const coordinateFeatureConfig = {
        id: 'coordinate-feature-widget',
        graphic: {
            popupTemplate: {
                content: isMobile ? '' : 'Mouse over the map to update the coordinates.'
            }
        },
        map: view?.map,
        spatialReference: view?.spatialReference
    };

    const basemapExpandConfig = {
        id: 'basemap-gallery-expand',
        view: view,
        content: new BasemapGallery({
            view: view,
            container: document.createElement("div"),
            id: 'basemap-gallery-widget',
        })
    }

    const searchExpandConfig = {
        id: 'search-expand',
        view: view,
        content: new Search({
            view: view,
            container: document.createElement("div"),
            id: 'search-widget',
            popupEnabled: false,
            includeDefaultSources: false,
            sources: [
                {
                    url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                    singleLineFieldName: "SingleLine",
                    outFields: ["RegionAbbr"],
                    name: "Utah Geocoding Service",
                    placeholder: "Address",
                    filter: {
                        // bounding box of Utah
                        geometry: new Extent({
                            xmin: -114.05015918679902,
                            ymin: 37.00019802842964,
                            xmax: -109.07096511303821,
                            ymax: 42.00611147170977,
                            spatialReference: {
                                wkid: 4326
                            }
                        })
                    },
                } as __esri.LocatorSearchSourceProperties,
                new SearchSource({
                    placeholder: "ex: Wasatch Fault Zone",
                    name: "Fault Search",
                    // Function that executes when user types in the search box
                    getSuggestions: async (params: { suggestTerm: string, sourceIndex: number }) => {
                        const response = await fetch(`https://pgfeatureserv-souochdo6a-wm.a.run.app/functions/postgisftw.search_fault_data/items.json?search_term=${encodeURIComponent(params.suggestTerm)}`);
                        const data = await response.json();

                        return data.features.map((item: any) => {
                            return {
                                text: '<b>' + item.properties.concatnames + '</b>',
                                key: item.properties.concatnames,
                                sourceIndex: params.sourceIndex,
                            };
                        });
                    },
                    // Function that executes when user selects a search suggestion or presses enter
                    getResults: async (params) => {
                        let url = `https://pgfeatureserv-souochdo6a-wm.a.run.app/functions/postgisftw.search_fault_data/items.json`;
                        console.log({ params });

                        // Check if a specific suggestion has been selected
                        // If a suggestion was selected (versus just pressing enter on the search box), a sourceIndex will be included in the params
                        if (params.sourceIndex !== undefined) {
                            const searchTerm = params.suggestResult.key ? params.suggestResult.key : '';
                            url += `?search_key=${encodeURIComponent(searchTerm)}`;
                        } else {
                            const searchTerm = params.suggestResult.text
                            url += `?search_term=${encodeURIComponent(searchTerm)}`;
                        }


                        const response = await fetch(url);
                        const data = await response.json();

                        return data.features.map((item: any) => {
                            console.log({ 'resultsItem': item });

                            const polyline = new Polyline({
                                paths: item.geometry.coordinates,
                                spatialReference: new SpatialReference({
                                    wkid: 4326 // WGS84 projection
                                }),
                            });

                            const simpleLineSymbol = new SimpleLineSymbol({
                                cap: "round",
                                color: new Color([0, 122, 194, 1]),
                                join: "round",
                                miterLimit: 1,
                                style: "solid",
                                width: 1
                            });

                            const target = new Graphic({
                                geometry: polyline,
                                attributes: item.attributes,
                                symbol: simpleLineSymbol
                            });

                            return {
                                // Include extent, feature, name, target
                                extent: polyline.extent,
                                name: item.properties.concatnames,
                                feature: target,
                                target: target
                            };
                        });
                    },
                } as __esri.LayerSearchSourceProperties)
            ]
        })
    }

    useArcGISWidget([
        { WrappedWidget: Home, position: 'top-left' },
        { WrappedWidget: Locate, position: 'top-left' },
        {
            WrappedWidget: Feature,
            position: isMobile ? 'top-right' : 'bottom-right',
            config: coordinateFeatureConfig
        },
        {
            WrappedWidget: Expand,
            position: isMobile ? 'top-left' : 'top-right',
            config: basemapExpandConfig
        },
        { WrappedWidget: Legend, position: 'top-left' },
        { WrappedWidget: Expand, position: 'top-right', config: searchExpandConfig }
    ]);

    return null;
};

export default MapWidgets;


// example of a custom search source below if use case arises

// the default results from the UGRC parcel service are returned in all caps
// so we need to implement our own custom search source in order to rewrite the
// suggestions and results to be more user friendly

// const UGRCParcelUrl = 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStatewideParcels/FeatureServer/0/query';

// new SearchSource({
//     placeholder: "Search for a parcel",
//     name: "Parcel Search",
//     // function that executes when user types in the search box
//     getSuggestions: (params) => {
//         // Make a request to search for the parcel
//         return esriRequest(UGRCParcelUrl, {
//             query: {
//                 f: "pjson",
//                 resultRecordCount: 6,
//                 where: `(PARCEL_ADD LIKE '${params.suggestTerm.replace(/ /g, " ")}%')`,
//                 outFields: 'PARCEL_ADD,PARCEL_CITY,PARCEL_ZIP,PARCEL_ID,County,OBJECTID',
//                 outSR: 102100,
//                 returnGeometry: false,
//                 spatialRel: "esriSpatialRelIntersects"
//             },
//         }).then((results) => {
//             return results.data.features.map((feature: { attributes: { PARCEL_ADD: string, PARCEL_CITY: string, PARCEL_ZIP: string, County: string, PARCEL_ID: string } }) => {
//                 const { PARCEL_ADD, PARCEL_CITY, PARCEL_ZIP, County } = feature.attributes;
//                 const formattedAddress = `${toTitleCase(PARCEL_ADD)}, ${toTitleCase(PARCEL_CITY)}, ${PARCEL_ZIP} - ${toTitleCase(County)}`;
//                 return {
//                     key: "name",
//                     text: `<span class="my-suggest">${formattedAddress}</span>`,
//                     PARCEL_ID: feature.attributes.PARCEL_ID,
//                     sourceIndex: params.sourceIndex,
//                 };
//             });
//         });
//     },
//     // function that executes when user selects a search suggestion
//     getResults: async (params) => {
//         console.log({ params });

//         // Make a request to search for the parcel
//         const searchResults = await esriRequest(UGRCParcelUrl, {
//             query: {
//                 f: "pjson",
//                 resultRecordCount: 6,
//                 where: `(PARCEL_ID LIKE '${params.suggestResult.PARCEL_ID.replace(/ /g, " ")}%')`,
//                 outFields: 'PARCEL_ADD,PARCEL_CITY,PARCEL_ZIP,PARCEL_ID,County,OBJECTID',
//                 outSR: 102100,
//                 returnGeometry: true,
//                 returnZ: true,
//                 spatialRel: "esriSpatialRelIntersects"
//             },
//         });
//         return searchResults.data.features.map((feature: any) => {
//             const { PARCEL_ADD, PARCEL_CITY, PARCEL_ZIP, County } = feature.attributes;
//             const formattedAddress = `${toTitleCase(PARCEL_ADD)}, ${toTitleCase(PARCEL_CITY)}, ${PARCEL_ZIP} - ${toTitleCase(County)}`;

//             const polygon = new Polygon({
//                 rings: feature.geometry.rings,
//                 spatialReference: view?.spatialReference
//             });

//             const graphic = new Graphic({
//                 geometry: polygon,
//                 attributes: feature.attributes,
//             });

//             // Open a popup with the parcel's information
//             view?.openPopup({
//                 title: "Parcel Information",
//                 content: `This is ${formattedAddress}`,
//                 location: graphic.geometry.extent.center

//             });

//             // Return a search result
//             return {
//                 extent: graphic.geometry.extent,
//                 name: `Parcel: ${formattedAddress}`,
//                 feature: graphic
//             };
//         });
//     }

// } as __esri.LayerSearchSourceProperties),