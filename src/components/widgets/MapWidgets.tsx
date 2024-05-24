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
                        if (params.suggestResult.sourceIndex) {
                            const searchTerm = params.suggestResult.key ? params.suggestResult.key : '';
                            url += `?search_key=${encodeURIComponent(searchTerm)}`;
                        } else {
                            const searchTerm = params.suggestResult.text ? params.suggestResult.text : '';
                            url += `?search_term=${encodeURIComponent(searchTerm)}`;
                        }


                        const response = await fetch(url);
                        const data = await response.json();

                        return data.features.map((item: any) => {
                            console.log({ 'resultsItem': item });

                            const polyline = new Polyline({
                                paths: item.geometry.coordinates,
                                spatialReference: new SpatialReference({
                                    wkid: 4326
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