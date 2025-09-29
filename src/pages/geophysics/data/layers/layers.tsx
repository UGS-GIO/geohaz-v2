//import { PROD_GEOSERVER_URL, HAZARDS_WORKSPACE, PROD_POSTGREST_URL, GEN_GIS_WORKSPACE } from "@/lib/constants";
//import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";
//import GeoJSON from "geojson";

const IS_CURRENT_CQL = `is_current = 'Y'`;

import { Link } from "@/components/custom/link";
import { ENERGY_MINERALS_WORKSPACE, GEN_GIS_WORKSPACE, HAZARDS_WORKSPACE, MAPPING_WORKSPACE, PROD_GEOSERVER_URL, PROD_POSTGREST_URL } from "@/lib/constants";
import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";
import { addThousandsSeparator, toTitleCase, toSentenceCase } from "@/lib/utils";
import { GeoJsonProperties } from "geojson";

// GeoRegions WMS Layer
const basinNamesLayerName = 'basin_names';
const basinNamesWMSTitle = 'Geo-region Carbon Storage Ranking';
const basinNamesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: basinNamesWMSTitle,
    visible: true,
    opacity: 0.5,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${basinNamesLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' },
                'Report Link': { field: 'reportlink', type: 'string' },
                'Ranked Formation': { field: 'rankedformation', type: 'string' },
                'Rank': {
                    type: 'custom',
                    field: 'ranknumber',
                    transform: (properties: GeoJsonProperties): string => {
                        if (!properties) {
                            return '';
                        }

                        const rankNumber = properties.ranknumber;
                        const rankingText = properties.ranking;

                        if (rankNumber === null || rankNumber === undefined || rankNumber === 0) {
                            return "Coming Soon";
                        }

                        if (rankingText) {
                            return `${rankNumber} - ${rankingText}`;
                        } else {
                            return String(rankNumber);
                        }
                    }
                },
            },
            colorCodingMap: {
                'ranknumber': (value: string | number) => {
                    if (value === "Coming Soon") {
                        return "#808080"; // Gray for "Coming Soon"
                    }

                    const rank = typeof value === 'number' ? value : parseInt(value, 10);
                    if (isNaN(rank)) {
                        return "#808080"; // Default gray for non-numeric values
                    }

                    // Limited: <3 (Solid Orange)
                    if (rank < 3) {
                        return "#FFA500"; // Orange
                    }

                    // Moderate: 3-6 (Solid Yellow)
                    if (rank < 6) {
                        return "#FFFF00"; // Yellow
                    }

                    // Excellent: >=6 (Solid Green)
                    if (rank >= 6) {
                        return "#00FF00"; // Green
                    }

                    // Default case
                    return "#808080"; // Gray for any other cases
                }
            }
        },
    ],
};



// Pipelines WMS Layer
const pipelinesLayerName = 'pipelines';
const pipelinesWMSTitle = 'Pipelines';
const pipelinesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: pipelinesWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${pipelinesLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Operator': { field: 'operator', type: 'string' },
                'Commodity': { field: 'commodity', type: 'string' },
                'Acronym': { field: 'acronym', type: 'string' },
                'Code Remarks': { field: 'coderemarks', type: 'string' }
            },
        },
    ],
};


// Rivers WMS Layer
const riversLayerName = 'rivers';
const riversWMSTitle = 'Major Rivers';
const riversWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: riversWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${GEN_GIS_WORKSPACE}:${riversLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string', transform: (value) => toTitleCase(value || '') },
                'Water Right Area': { field: 'drainage_a', type: 'number' }
            },
        },
    ],
};

// Roads WMS Layer
const roadsLayerName = 'ccus_majorroads';
const roadsWMSTitle = 'Major Roads';
const roadsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: roadsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${roadsLayerName}`,
            popupEnabled: false,
            queryable: false,
            popupFields: {
                'Name': { field: 'fullname', type: 'string', transform: (value) => toTitleCase(value || '') },
            },
        },
    ],
};

// Railroads WMS Layer
const railroadsLayerName = 'ccus_railroads';
const railroadsWMSTitle = 'Railroads';
const railroadsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: railroadsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${railroadsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'railroad', type: 'string', transform: (value) => toTitleCase(value || '') },
            },
        },
    ],
};

// Transmission Lines WMS Layer
const transmissionLinesLayerName = 'ccus_transmissionlines';
const transmissionLinesWMSTitle = 'Transmission Lines';
const transmissionLinesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: transmissionLinesWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${transmissionLinesLayerName}`,
            popupEnabled: false,
            queryable: false,
            popupFields: {
                'Voltage': { field: 'layer', type: 'string' },
            },
        },
    ],
}
 
// Seamless Geological Units WMS Layer
const seamlessGeolunitsLayerName = 'mapping_geolunits_500k'
const seamlessGeolunitsWMSTitle = 'Geologic Units (500k) New';
const seamlessGeolunitsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/mapping/wms`,
    title: seamlessGeolunitsWMSTitle,
    opacity: 0.5,
    visible: false,
    sublayers: [
        {
            name: `${MAPPING_WORKSPACE}:${seamlessGeolunitsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Unit': {
                    field: 'custom',
                    type: 'custom',
                    transform: (props) => {
                        const unitName = props?.['unit_name'];
                        const unitSymbol = props?.['unit_symbol'];
                        const value = `${unitName} (${unitSymbol})`;
                        return value;
                    }
                },
                'Unit Description': { field: 'unit_description', type: 'string' },
                'Source': { field: 'series_id', type: 'string' },
            },
            linkFields: {
                'series_id': {
                    baseUrl: '',
                    transform: (value: string) => {
                        // the value is a url that needs to be transformed into href and label for the link
                        const transformedValues = {
                            href: `https://doi.org/10.34191/${value}`,
                            label: `${value}`
                        };
                        return [transformedValues];
                    }
                }
            }
        },
    ],
};


// SITLA Land Ownership Layer
const SITLAConfig: LayerProps = {
    type: 'map-image',
    url: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer',
    opacity: 0.5,
    title: 'Land Ownership',
    options: {
        title: 'Land Ownership',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: false,
        sublayers: [{
            id: 0,
            visible: true,
        }],
    },
};

const faultsLayerName = 'faults_m-179dm';
const faultsWMSTitle = 'Utah Faults';
const faultsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: faultsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${MAPPING_WORKSPACE}:${faultsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Description': {
                    field: 'custom',
                    type: 'custom',
                    transform: (props) => {
                        const subtype = props?.['subtype'];
                        const type = props?.['type'];
                        const modifier = props?.['modifier'];
                        const value = `${subtype} ${type}, ${modifier}`
                        return toSentenceCase(value);
                    }
                },
                'Scale': {
                    field: 'scale',
                    type: 'string',
                    transform: (value) => {
                        if (value === 'small') return '1:500,000'
                        return ''
                    }
                },
                'Source': { field: 'series_id', type: 'string' },
            },
            linkFields: {
                'series_id': {
                    baseUrl: '',
                    transform: (value: string) => {
                        // the value is a url that needs to be transformed into href and label for the link
                        const transformedValues = {
                            href: `https://doi.org/10.34191/${value}`,
                            label: `${value}`
                        };
                        return [transformedValues];
                    }
                }
            }
        },
    ],
};

const qFaultsLayerName = 'quaternaryfaults_current';
const qFaultsWMSTitle = 'Hazardous (Quaternary age) Faults';
const qFaultsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: qFaultsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${qFaultsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Fault Zone Name': { field: 'faultzone', type: 'string' },
                'Summary': { field: 'summary', type: 'string' },
                'Fault Name': { field: 'faultname', type: 'string' },
                'Section Name': { field: 'sectionname', type: 'string' },
                'Strand Name': { field: 'strandname', type: 'string' },
                'Structure Number': { field: 'faultnum', type: 'string' },
                'Mapped Scale': { field: 'mappedscale', type: 'string' },
                'Dip Direction': { field: 'dipdirection', type: 'string' },
                'Slip Sense': { field: 'slipsense', type: 'string' },
                'Slip Rate': { field: 'sliprate', type: 'string' },
                'Structure Class': { field: 'faultclass', type: 'string' },
                'Structure Age': { field: 'faultage', type: 'string' },
                '': {
                    field: 'usgs_link',
                    type: 'custom',
                    transform: (value) => {
                        if (!value) {
                            return 'No USGS link available';
                        }
                        return value['usgs_link'] || 'No USGS link available';
                    }
                },
            },
            linkFields: {
                'usgs_link': {
                    transform: (usgsLink) => {
                        if (!usgsLink || usgsLink === 'No USGS link available') {
                            return [{
                                label: 'No USGS link available',
                                href: ''
                            }];
                        }
                        return [{
                            label: 'Detailed Report',
                            href: `${usgsLink}`
                        }];
                    }
                }
            },
        },
    ],
};

const wildernessStudyAreasLayerName = 'ccus_wsa';
const wildernessStudyAreasWMSTitle = 'Wilderness Study Areas';
const wildernessStudyAreasWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wildernessStudyAreasWMSTitle,
    visible: false,
    opacity: 0.5,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${wildernessStudyAreasLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'nlcs_name', type: 'string' },
                'Type': { field: 'wsa_values', type: 'string' },
                'NLCS ID': { field: 'nlcs_id', type: 'string' },
                'WSA Number ': { field: 'wsa_number', type: 'string' }
            },
        }
    ],
};

const sitlaReportsLayerName = 'ccus_sitla_reports';
const sitlaReportsWMSTitle = 'SITLA Reports';
const sitlaReportsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: sitlaReportsWMSTitle,
    visible: false,
    opacity: 0.5,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${sitlaReportsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'new_block_', type: 'string' },
                'Ranking': {
                    field: 'ranking', type: 'string',
                    transform: (value) => {
                        if (value === 'None' || value === null) {
                            return 'Not evaluated';
                        } else {
                            return value;
                        }
                    }
                },
                'Description': { field: 'description', type: 'string' },
                '': { field: 'linktoreport', type: 'string', transform: (value) => value },
            },
            linkFields: {
                'linktoreport': {
                    transform: (value: string) => {
                        if (value === 'None') {
                            const transformedValues = {
                                href: '',
                                label: 'Not currently available'
                            };
                            return [transformedValues];
                        } else {
                            const transformedValues = {
                                href: value,
                                label: `Report`
                            };
                            return [transformedValues];
                        }
                    }
                },
            }
        }
    ],
};


const geothermalPowerplantsLayerName = 'ccus_geothermalpowerplants';
const geothermalPowerplantsWMSTitle = 'Geothermal Power Plants';
const geothermalPowerplantsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: geothermalPowerplantsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${geothermalPowerplantsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'plant', type: 'string', transform: (value) => toTitleCase(value || '') },
                'Capacity (MW)': { field: 'capacity_mw', type: 'number' },
                'Operator': { field: 'operator', type: 'string' },
                'City': { field: 'city', type: 'string' },
                'County': { field: 'county', type: 'string' },
            },
        }
    ],
};

const infrastructureAndLandUseConfig: LayerProps = {
    type: 'group',
    title: 'Infrastructure and Land Use',
    visible: false,
    layers: [
        geothermalPowerplantsWMSConfig,
        pipelinesWMSConfig,
        riversWMSConfig,
        roadsWMSConfig,
        railroadsWMSConfig,
        transmissionLinesWMSConfig,
        wildernessStudyAreasWMSConfig,
        SITLAConfig,
    ]
}

const geologicalInformationConfig: LayerProps = {
    type: 'group',
    title: 'Geological Information New',
    visible: false,
    layers: [
        qFaultsWMSConfig,
        faultsWMSConfig,
        seamlessGeolunitsWMSConfig
    ]
}

const layersConfig: LayerProps[] = [
    geologicalInformationConfig,
    infrastructureAndLandUseConfig,
];

export default layersConfig;