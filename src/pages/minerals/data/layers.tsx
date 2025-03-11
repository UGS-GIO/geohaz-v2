import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

export const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
// const PROD_POSTGREST_URL = 'https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app';
const ENERGY_MINERALS_WORKSPACE = 'energy_mineral';
// Industrial Minerals WMS Layer Configurations
const aluniteLayerName = 'metalmineralapp_im_alunite';
const aluniteWMSTitle = 'Alunite';
const aluniteWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: aluniteWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${aluniteLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const bentoniteLayerName = 'metalmineralapp_im_bentonite';
const bentoniteWMSTitle = 'Bentonite';
const bentoniteWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: bentoniteWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${bentoniteLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const dolomiteLayerName = 'metalmineralapp_im_dolomite';
const dolomiteWMSTitle = 'Dolomite';
const dolomiteWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: dolomiteWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${dolomiteLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const gypsumLayerName = 'metalmineralapp_im_gypsum';
const gypsumWMSTitle = 'Gypsum';
const gypsumWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: gypsumWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${gypsumLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const limestoneLayerName = 'metalmineralapp_im_limestone';
const limestoneWMSTitle = 'Limestone';
const limestoneWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: limestoneWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${limestoneLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const phosphateLayerName = 'metalmineralapp_im_phosphate';
const phosphateWMSTitle = 'Phosphate';
const phosphateWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: phosphateWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${phosphateLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const potashLayerName = 'metalmineralapp_im_potash';
const potashWMSTitle = 'Potash';
const potashWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: potashWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${potashLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

const silicaLayerName = 'metalmineralapp_im_silica';
const silicaWMSTitle = 'Silica';
const silicaWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: silicaWMSTitle,
    opacity: .5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${silicaLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Description': { field: 'description', type: 'string' }
            }
        }
    ]
};

// Industrial Minerals Group Layer
const industrialMineralsGroupConfig: LayerProps = {
    type: 'group',
    title: 'Industrial Mineral Resource Potential',
    visible: true,
    layers: [
        aluniteWMSConfig,
        bentoniteWMSConfig,
        dolomiteWMSConfig,
        gypsumWMSConfig,
        limestoneWMSConfig,
        phosphateWMSConfig,
        potashWMSConfig,
        silicaWMSConfig
    ]
};

// Critical Minerals WMS Layer Configurations
const criticalMineralOccurencesWMSLayerName = 'metalmineralapp_criticalmineralpoints';
const criticalMineralOccurencesWMSTitle = 'Critical Mineral Occurrences';
const criticalMineralOccurencesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: criticalMineralOccurencesWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${criticalMineralOccurencesWMSLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Site Name': { field: 'site_name', type: 'string' },
                'Commodity': { field: 'commodity', type: 'string' },
                'Label': { field: 'label', type: 'string' }
            }
        }
    ]
};

// Critical Minerals Areas WMS Layer Configurations
const criticalMineralsAreasWMSLayerName = 'metalmineralapp_criticalmineralpolygons';
const criticalMineralsAreasWMSTitle = 'Critical Mineral Areas';
const criticalMineralsAreasWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: criticalMineralsAreasWMSTitle,
    opacity: 0.5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${criticalMineralsAreasWMSLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'District Name': { field: 'district', type: 'string' },
                'Commodity': { field: 'commodity', type: 'string' },
                'Label': { field: 'label', type: 'string' }
            }
        }
    ]
};

// Critical Minerals group layer
const criticalMineralsGroupConfig: LayerProps = {
    type: 'group',
    title: 'Critical Minerals',
    visible: true,
    layers: [
        criticalMineralsAreasWMSConfig,
        criticalMineralOccurencesWMSConfig
    ]
};

const miningDistrictsLayerName = 'metalmineralapp_mining_districts';
const miningDistrictsTitle = 'Metalliferous Mining Districts';
const miningDistrictsConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: miningDistrictsTitle,
    opacity: 0.5,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${miningDistrictsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Commodity': { field: 'commodity', type: 'string' },
                'Productive': { field: 'productive', type: 'string' },
                'Short Tons': { field: 'short_tons', type: 'string' },
                'Total Dollar Value': { field: 'total_dollar_value', type: 'string' },
            },
        },
    ],
}

const umosLayerName = 'metalmineralapp_umos';
const umosWMSTitle = 'Utah Mineral Occurrence System';
const umosWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: umosWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${umosLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Report ID': { field: 'repor_id', type: 'string' },
                'Mapped Hazards': { field: 'hazard_name', type: 'string' },
            },
            linkFields: {
                'repor_id': {
                    baseUrl: '',
                    transform: (value: string) => {
                        const values = value.split(','); // Split the input value by a comma
                        const transformedValues = values.map(val => {
                            const trimmedVal = val.trim();
                            const href = /^\d+$/.test(trimmedVal)
                                ? `https://geodata.geology.utah.gov/pages/view.php?ref=${trimmedVal}`
                                : `https://doi.org/10.34191/${trimmedVal}`;
                            const label = trimmedVal;
                            return { label, href };
                        });

                        return transformedValues;
                    }
                }
            }
        },
    ],
}

const landAssessmentLayerName = 'metalmineralapp_blm_wsa_mineral_land_asssessment';
const landAssessmentWMSTitle = 'WSA Mineral Land Assessment';
const landAssessmentWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: landAssessmentWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${landAssessmentLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': { field: 'name', type: 'string' },
                'Report ID': { field: 'repor_id', type: 'string' },
                'Mapped Hazards': { field: 'hazard_name', type: 'string' },
            },
            linkFields: {
                'repor_id': {
                    baseUrl: '',
                    transform: (value: string) => {
                        const values = value.split(','); // Split the input value by a comma
                        const transformedValues = values.map(val => {
                            const trimmedVal = val.trim();
                            const href = /^\d+$/.test(trimmedVal)
                                ? `https://geodata.geology.utah.gov/pages/view.php?ref=${trimmedVal}`
                                : `https://doi.org/10.34191/${trimmedVal}`;
                            const label = trimmedVal;
                            return { label, href };
                        });

                        return transformedValues;
                    }
                }
            }
        },
    ],
}

// SITLA Land Ownership Layer
const SITLAConfig: LayerProps = {
    type: 'feature',
    url: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer/0',
    opacity: 0.45,
    options: {
        popupEnabled: false,
        title: 'SITLA Land Ownership',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: false,
    },
};

const layersConfig: LayerProps[] = [
    umosWMSConfig,
    criticalMineralsGroupConfig,
    miningDistrictsConfig,
    industrialMineralsGroupConfig,
    landAssessmentWMSConfig,
    SITLAConfig
];

export default layersConfig;
