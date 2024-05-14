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
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { poopTemplate } from '../../config/popups';
import SearchSource from "@arcgis/core/widgets/Search/SearchSource.js";
import esriRequest from "@arcgis/core/request.js";
import Graphic from "@arcgis/core/Graphic.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import { toTitleCase } from '../../config/util/utils';

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

    const UGRCParcelUrl = 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStatewideParcels/FeatureServer/0/query';

    const searchExpandConfig = {
        id: 'search-expand',
        view: view,
        content: new Search({
            view: view,
            container: document.createElement("div"),
            id: 'search-widget',
            popupEnabled: false,
            sources: [
                {
                    layer:
                        new FeatureLayer({
                            url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Hazards/quaternary_faults_with_labels/MapServer/0",
                        }),
                    exactMatch: false,
                    displayField: "FaultName",
                    searchFields: ["FaultZone", "FaultName", "SectionName", "StrandName"],
                    outFields: ["*"],
                    name: "Fault Search",
                    popupTemplate: {
                        title: "Hazardous (Quaternary age) Faults",
                        content: poopTemplate
                    },
                    placeholder: "ex: Wasatch Fault Zone",
                    searchTemplate: "{FaultZone}, {FaultName}, {SectionName}, {StrandName}",
                    suggestionTemplate: "<b>Fault Zone:</b> {FaultZone}, <b>Fault Name:</b> {FaultName}, <b>Section Name:</b> {SectionName}, <b>Strand Name:</b> {StrandName}",
                    maxSuggestions: 5000,
                    minSuggestCharacters: 3,

                } as __esri.LayerSearchSourceProperties,
                // the default results from the UGRC parcel service are returned in all caps
                // so we need to implement our own custom search source in order to rewrite the 
                // suggestions and results to be more user friendly
                new SearchSource({
                    placeholder: "Search for a parcel",
                    name: "Parcel Search",
                    // function that executes when user types in the search box
                    getSuggestions: (params) => {
                        // Make a request to search for the parcel
                        return esriRequest(UGRCParcelUrl, {
                            query: {
                                f: "pjson",
                                resultRecordCount: 6,
                                where: `(PARCEL_ADD LIKE '${params.suggestTerm.replace(/ /g, " ")}%')`,
                                outFields: 'PARCEL_ADD,PARCEL_CITY,PARCEL_ZIP,PARCEL_ID,County,OBJECTID',
                                outSR: 102100,
                                returnGeometry: false,
                                spatialRel: "esriSpatialRelIntersects"
                            },
                        }).then((results) => {
                            return results.data.features.map((feature: { attributes: { PARCEL_ADD: string, PARCEL_CITY: string, PARCEL_ZIP: string, County: string, PARCEL_ID: string } }) => {
                                const { PARCEL_ADD, PARCEL_CITY, PARCEL_ZIP, County } = feature.attributes;
                                const formattedAddress = `${toTitleCase(PARCEL_ADD)}, ${toTitleCase(PARCEL_CITY)}, ${PARCEL_ZIP} - ${toTitleCase(County)}`;
                                return {
                                    key: "name",
                                    text: `<span class="my-suggest">${formattedAddress}</span>`,
                                    PARCEL_ID: feature.attributes.PARCEL_ID,
                                    sourceIndex: params.sourceIndex,
                                };
                            });
                        });
                    },
                    // function that executes when user selects a search suggestion
                    getResults: async (params) => {
                        console.log({ params });

                        // Make a request to search for the parcel
                        const searchResults = await esriRequest(UGRCParcelUrl, {
                            query: {
                                f: "pjson",
                                resultRecordCount: 6,
                                where: `(PARCEL_ID LIKE '${params.suggestResult.PARCEL_ID.replace(/ /g, " ")}%')`,
                                outFields: 'PARCEL_ADD,PARCEL_CITY,PARCEL_ZIP,PARCEL_ID,County,OBJECTID',
                                outSR: 102100,
                                returnGeometry: true,
                                returnZ: true,
                                spatialRel: "esriSpatialRelIntersects"
                            },
                        });
                        return searchResults.data.features.map((feature: any) => {
                            const { PARCEL_ADD, PARCEL_CITY, PARCEL_ZIP, County } = feature.attributes;
                            const formattedAddress = `${toTitleCase(PARCEL_ADD)}, ${toTitleCase(PARCEL_CITY)}, ${PARCEL_ZIP} - ${toTitleCase(County)}`;

                            const polygon = new Polygon({
                                rings: feature.geometry.rings,
                                spatialReference: view?.spatialReference
                            });

                            const graphic = new Graphic({
                                geometry: polygon,
                                attributes: feature.attributes,
                            });

                            // Open a popup with the parcel's information
                            view?.openPopup({
                                title: "Parcel Information",
                                content: `This is ${formattedAddress}`,
                                location: graphic.geometry.extent.center

                            });

                            // Return a search result
                            return {
                                extent: graphic.geometry.extent,
                                name: `Parcel: ${formattedAddress}`,
                                feature: graphic
                            };
                        });
                    }

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