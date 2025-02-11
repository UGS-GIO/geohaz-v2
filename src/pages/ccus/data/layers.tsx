import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

export const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
export const PROD_POSTGREST_URL = 'https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app';
export const ENERGY_MINERALS_WORKSPACE = 'energy_mineral';
export const GEN_GIS_WORKSPACE = 'gen_gis';
export const MAPPING_WORKSPACE = 'mapping';

// GeoRegions WMS Layer
const basinNamesLayerName = 'basin_names';
const basinNamesWMSTitle = 'GeoRegions';
const basinNamesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: basinNamesWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${basinNamesLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' },
                'Report Link': { field: 'reportlink', type: 'string' },
                'Rank': {
                    field: 'rank',
                    type: 'number'
                }
            },
            colorCodingMap: {
                'rank': (value: string | number) => {
                    const rank = typeof value === 'number' ? value : parseInt(value, 10);
                    if (rank === 1) return "#FF0000"; // Red
                    if (rank === 2) return "#FFFF00"; // Yellow
                    if (rank === 3) return "#00FF00"; // Green
                    return "#808080"; // Gray
                }
            }
        },
    ],
};

// Oil and Gas Fields WMS Layer
const oilGasFieldsLayerName = 'oilgasfields';
const oilGasFieldsWMSTitle = 'Oil and Gas Fields';
const oilGasFieldsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: oilGasFieldsWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${oilGasFieldsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Field Name': { field: 'field_name', type: 'string' },
                'Field Type': { field: 'field_type', type: 'string' },
                'Producing Formations': { field: 'prod_formations', type: 'string' },
                'Reservoir Age': { field: 'reservoir_rocks', type: 'string' },
                'Status': { field: 'status', type: 'string' }
            },
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
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${pipelinesLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Operator': { field: 'operator', type: 'string' },
                'Commodity': { field: 'commodity', type: 'string' },
                'Diameter': { field: 'diameter', type: 'number', },
                'Acronym': { field: 'acronym', type: 'string' },
                'Code Remarks': { field: 'coderemarks', type: 'string' }
            },
        },
    ],
};

// SCO2 WMS Layer
const sco2LayerName = 'sco2_draft_13aug24';
const sco2WMSTitle = 'Storage Resource Estimates';
const sco2WMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: sco2WMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${sco2LayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Storage Resource Estimate': {
                    field: 'capacity_mtco2',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Storage Cost ($/tCO2)': {
                    field: 'storage_cost_doll_per_tco2',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Formation': { field: 'name', type: 'string' },
                'Thickness (m)': {
                    field: 'thickness_m',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Depth (m)': {
                    field: 'depth_m',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Permeability (md)': {
                    field: 'permeability_md',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Porosity': {
                    field: 'porosity',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Pressure (MPa)': {
                    field: 'pressure_mpa',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Temperature (C)': {
                    field: 'temperature_c',
                    type: 'number',
                    decimalPlaces: 1,
                },
                'Temperature Gradient (C/km)': {
                    field: 'temperature_gradient_c_per_km',
                    type: 'number',
                    decimalPlaces: 2,
                },
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
    visible: true,
    sublayers: [
        {
            name: `${GEN_GIS_WORKSPACE}:${riversLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' },
                'Report Link': { field: 'reportlink', type: 'string' }
            },
        },
    ],
};

// Seamless Geological Units WMS Layer
const seamlessGeolunitsLayerName = 'seamlessgeolunits';
const seamlessGeolunitsWMSTitle = 'Seamless Geological Units (500k)';
const seamlessGeolunitsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: seamlessGeolunitsWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${MAPPING_WORKSPACE}:${seamlessGeolunitsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {},
        },
    ],
};

export const wellWithTopsLayerName = 'wellswithtops_hascore';
const wellWithTopsWMSTitle = 'Wells with Tops (Has Core)';
const wellWithTopsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wellWithTopsWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${wellWithTopsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'API': { field: 'api', type: 'string' },
                'Well Name': { field: 'wellname', type: 'string' }
            },
            relatedTables: [
                {
                    fieldLabel: 'Wells With Related Formation Tops',
                    matchingField: 'api',
                    targetField: 'api',
                    url: PROD_POSTGREST_URL + '/view_wellswithtops_hascore',
                    headers: {
                        "Accept-Profile": 'emp',
                        "Accept": "application/json",
                        "Cache-Control": "no-cache",
                    },
                    displayFields: [
                        { field: 'formation_name', label: 'Formation Name' },
                        { field: 'formation_depth', label: 'Formation Depth (meters??? verify)' },
                    ]
                }
            ]
        },
    ],
};

// SITLA Land Ownership Layer
const SITLAConfig: LayerProps = {
    type: 'feature',
    url: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer/0',
    options: {
        title: 'SITLA Land Ownership',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: false,
    },
};

const faultsLayerName = 'faults_m-179dm';
const faultsWMSTitle = '500k Faults';
const faultsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: faultsWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${MAPPING_WORKSPACE}:${faultsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Series ID': { field: 'series_id', type: 'string' },
                'Scale': {
                    field: 'scale',
                    type: 'number',
                    // example way of using transform
                    // transform: (value) => value.toFixed(2)
                }
            },
        },
    ],
};

// Energy and Minerals Group Layer
const EMPConfig: LayerProps = {
    type: 'group',
    title: 'Energy and Minerals',
    visible: true,
    layers: [
        // basinNamesWMSConfig,
        // oilGasFieldsWMSConfig,
        // pipelinesWMSConfig,
        // sco2WMSConfig,
        // riversWMSConfig,
        // seamlessGeolunitsWMSConfig,
        wellWithTopsWMSConfig,
        // SITLAConfig,
        // faultsWMSConfig,
    ]
};

const layersConfig: LayerProps[] = [
    EMPConfig
];

export default layersConfig;