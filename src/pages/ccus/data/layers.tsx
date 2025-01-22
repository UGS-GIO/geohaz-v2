import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

export const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
const PROD_POSTGREST_URL = 'https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app';
const ENERGY_MINERALS_WORKSPACE = 'energy_mineral';
const GEN_GIS_WORKSPACE = 'gen_gis';
const MAPPING_WORKSPACE = 'mapping';

// Basin Names WMS Layer
const basinNamesLayerName = 'basin_names';
const basinNamesWMSTitle = 'Basin Names';
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
                'Name': 'name',
                'Description': 'description',
                'Report Link': 'reportlink'
            },
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
                'Field Name': 'field_name',
                'Field Number': 'field_number',
                'Field Type': 'field_type',
                'Label': 'label',
                'Producing Formations': 'prod_formations',
                'Reservoir Rocks': 'reservoir_rocks',
                'Status': 'status'
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
                'Operator': 'operator',
                'Commodity': 'commodity',
                'Diameter': 'diameter',
                'Acronym': 'acronym',
                'Code Remarks': 'coderemarks'
            },
        },
    ],
};

// SCO2 WMS Layer
const sco2LayerName = 'sco2_draft_13aug24';
const sco2WMSTitle = 'SCO2';
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
                'Unique ID': 'unique_id',
                'Basegrid ID': 'basegrid_id',
                'Name': 'name',
                'Geo Region': 'geo_region',
                'Longitude': 'x_lon',
                'Latitude': 'y_lat',
                'GIS Number': 'gis_number',
                'Depth (m)': 'depth_m',
                'Pressure (MPa)': 'pressure_mpa',
                'Thickness (m)': 'thickness_m',
                'Permeability (md)': 'permeability_md',
                'Porosity': 'porosity',
                'Temperature Gradient (C/km)': 'temperature_gradient_c_per_km',
                'Temperature (C)': 'temperature_c',
                'Area (km^2)': 'area_km2',
                'Surface Temperature (C)': 'surface_temperature_c',
                'ROM': 'rom',
                'Max Injection Rate (MT/yr)': 'max_injection_rate_mt_per_yr',
                'Cost Model': 'cost_model',
                'Injection Well Diameter (in)': 'injection_well_diameter_in',
                'Old O&G Wells': 'old_o_and_g_wells',
                'Backup Injection Well': 'backup_injection_well',
                'Above Zone MON': 'above_zone_mon',
                'In Zone MON': 'in_zone_mon',
                'Real Discount Rate': 'real_discount_rate',
                'PISC Length (yrs)': 'pisc_length_yrs',
                'Injection Period (yrs)': 'injection_period_yrs',
                'Finance Period (yrs)': 'finance_period_yrs',
                'Dollar Year': 'dollar_year',
                'Run CPG': 'run_cpg',
                'Run Water Sedbasin': 'run_water_sedbasin',
                'Capacity (MtCO2)': 'capacity_mtco2',
                'Storage Cost ($/tCO2)': 'storage_cost_doll_per_tco2',
                'CAPEX (M$)': 'capex_mdoll',
                'OPEX (M$/yr)': 'opex_mdoll_per_yr',
                'CRF': 'crf',
                'Error': 'error',
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
                'Name': 'name',
                'Description': 'description',
                'Report Link': 'reportlink'
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
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${seamlessGeolunitsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {},
        },
    ],
};

const wellWithTopsLayerName = 'wellswithtops_hascore';
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
                'API': 'api',
                'Well Name': 'wellname',
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
                'Series ID': 'series_id',
                'Scale': 'scale',
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
        basinNamesWMSConfig,
        oilGasFieldsWMSConfig,
        pipelinesWMSConfig,
        sco2WMSConfig,
        riversWMSConfig,
        seamlessGeolunitsWMSConfig,
        wellWithTopsWMSConfig,
        SITLAConfig,
        faultsWMSConfig,
    ]
};

const layersConfig: LayerProps[] = [
    EMPConfig
];

export default layersConfig;