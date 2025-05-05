import { Link } from "@/components/custom/link";
import { ENERGY_MINERALS_WORKSPACE, GEN_GIS_WORKSPACE, HAZARDS_WORKSPACE, MAPPING_WORKSPACE, PROD_GEOSERVER_URL, PROD_POSTGREST_URL } from "@/lib/constants";
import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

// GeoRegions WMS Layer
const basinNamesLayerName = 'basin_names';
const basinNamesWMSTitle = 'GeoRegions';
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
    visible: false,
    opacity: 0.5,
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
    visible: false,
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
                'Storage Resource Estimate (Mt CO₂)': {
                    field: 'capacity_mtco2',
                    type: 'number',
                    decimalPlaces: 2,
                },
                'Storage Cost ($/tCO₂)': {
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
                'Porosity (φ)': {
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
    visible: false,
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
    opacity: 0.5,
    visible: false,
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
const wellWithTopsWMSTitle = 'Wells Database';
const wellWithTopsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wellWithTopsWMSTitle,
    visible: false,
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
                    fieldLabel: 'Formation Tops',
                    matchingField: 'api',
                    targetField: 'api',
                    url: PROD_POSTGREST_URL + '/view_wellswithtops_hascore',
                    headers: {
                        "Accept-Profile": 'emp',
                        "Accept": "application/json",
                        "Cache-Control": "no-cache",
                    },
                    displayFields: [
                        { field: 'formation_alias', label: 'Formation Name' },
                        { field: 'formation_depth', label: 'Formation Depth (ft)' },
                    ],
                    sortBy: 'formation_depth',
                    sortDirection: 'asc'
                },
                {
                    fieldLabel: 'LAS File Information',
                    matchingField: 'display_api',
                    targetField: 'api',
                    url: PROD_POSTGREST_URL + '/ccus_las_display_view',
                    headers: {
                        "Accept-Profile": 'emp',
                        "Accept": "application/json",
                        "Cache-Control": "no-cache",
                    },
                    displayFields: [
                        { field: 'display_description', label: 'Description', transform: (value) => value !== '' ? value : 'No Data' },
                        { field: 'display_field_name', label: 'Field Name', transform: (value) => value !== '' ? value : 'No Data' },
                        { field: 'display_well_status', label: 'Well Status', transform: (value) => value !== '' ? value : 'No Data' },
                        { field: 'display_well_type', label: 'Well Type', transform: (value) => value !== '' ? value : 'No Data' },
                        {
                            field: 'source', label: 'Source', transform: (value) => {
                                if (value === 'DOGM') {
                                    return <Link to="https://dataexplorer.ogm.utah.gov/">Utah Division of Oil, Gas and Mining</Link>
                                } else if (value === 'UGS') {
                                    return <>Utah Geological Survey - contact <Link to="mailto:gstpierre@utah.gov">gstpierre@utah.gov</Link></>
                                }
                                return value !== '' ? value : 'No Data';
                            }
                        },
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
    opacity: 0.5,
    options: {
        title: 'SITLA Land Ownership',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: false,
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
                    type: 'string',
                    transform: (popupFields: any) => {
                        return `${popupFields['subtype']} ${popupFields['type']}, ${popupFields['modifier']}`;
                    }
                },
                'Scale': {
                    field: 'scale',
                    type: 'string',
                    transform: (value: string) => {
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
                'Detailed Report': { field: 'usgs_link', type: 'string' },
            }
        },
    ],
};

const coresAndCuttingsLayerName = 'cores';
const coresAndCuttingsWMSTitle = 'Cores and Cuttings';
const coresAndCuttingsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: coresAndCuttingsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${coresAndCuttingsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Well Name': { field: 'well_name', type: 'string' },
                'Type': { field: 'type', type: 'string' },
                'County': { field: 'county_long', type: 'string' },
            },
        }
    ],
};

// Energy and Minerals Group Layer
const ccusResourcesConfig: LayerProps = {
    type: 'group',
    title: 'CCUS Resources',
    visible: true,
    layers: [
        sco2WMSConfig,
        basinNamesWMSConfig,
        wellWithTopsWMSConfig,
        oilGasFieldsWMSConfig,
    ]
}

const infrastructureAndLandUseConfig: LayerProps = {
    type: 'group',
    title: 'Infrastructure and Land Use',
    visible: false,
    layers: [
        pipelinesWMSConfig,
        riversWMSConfig,
        SITLAConfig
    ]
}

const geologicalInformationConfig: LayerProps = {
    type: 'group',
    title: 'Geological Information',
    visible: false,
    layers: [
        qFaultsWMSConfig,
        faultsWMSConfig,
        seamlessGeolunitsWMSConfig,
        coresAndCuttingsWMSConfig
    ]
}



const layersConfig: LayerProps[] = [
    ccusResourcesConfig,
    infrastructureAndLandUseConfig,
    geologicalInformationConfig
];

export default layersConfig;