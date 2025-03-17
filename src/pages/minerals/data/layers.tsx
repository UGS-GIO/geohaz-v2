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
                'Deposit Type': { field: 'deposit_type', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Alunite.pdf'
                            }
                        ];

                    }
                }
            },
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
                'Age': { field: 'age', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' },
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Bentonite.pdf'
                            }
                        ]
                    }
                }
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
                'Age': { field: 'age', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Dolomite.pdf'
                            }
                        ];
                    }
                }
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
                'Age': { field: 'age', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Gypsum.pdf'
                            }
                        ];
                    }
                }
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
                'Age': { field: 'age', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Limestone.pdf'
                            }
                        ];
                    }
                }
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
                'Age': { field: 'age', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Phosphate.pdf'
                            }
                        ];
                    }
                }
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
                'Deposit Type': { field: 'deposit_type', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Potash.pdf'
                            }
                        ];
                    }
                }
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
                'Age': { field: 'age', type: 'string' },
                'Unit Name': { field: 'unit_name', type: 'string' }
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'Layer Information',
                                href: 'https://ugspub.nr.utah.gov/publications/blm_mineral_resources/Silica.pdf'
                            }
                        ];
                    }
                }
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
const criticalMineralOccurrencesWMSLayerName = 'metalmineralapp_criticalmineralpoints';
const criticalMineralOccurrencesWMSTitle = 'Critical Mineral Occurrences';
const criticalMineralOccurrencesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: criticalMineralOccurrencesWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${ENERGY_MINERALS_WORKSPACE}:${criticalMineralOccurrencesWMSLayerName}`,
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
        criticalMineralOccurrencesWMSConfig
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
                'Organized District': { field: 'organized', type: 'string' },
                'Productive': { field: 'productive', type: 'string' },
                'Short Tons': {
                    field: 'short_tons', type: 'string', transform: (value) => {
                        // if value is 0, return empty string so popup doesn't show the field
                        if (value === '0') return '';
                        return value;
                    },
                },
                'Total Dollar Value': {
                    field: 'total_dollar_value',
                    type: 'string',
                    transform: (value) => {
                        if (!value) return value;

                        // Convert to number, round to 2 decimal places
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) return value;

                        // Format with commas and 2 decimal places
                        return numValue.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        });
                    }
                },
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
                'Site Name': { field: 'site_name', type: 'string' },
                'Commodity': { field: 'commodity', type: 'string' },
                'Ore Mineral': { field: 'ore_minerals', type: 'string' },
                'Commodity Type': { field: 'type', type: 'string' },
                'Production': { field: 'production', type: 'string' },
                'Deposit Size': { field: 'dep_size', type: 'string' },
                'Mining District': { field: 'district', type: 'string' },
                'County': { field: 'county', type: 'string' },
            },
            linkFields: {
                'custom': { // use 'custom' to create a custom hardcoded link
                    baseUrl: '',
                    transform: () => {
                        return [
                            {
                                label: 'UMOS Explanation',
                                href: 'https://geology.utah.gov/apps/blm_mineral/appfiles/UMOS%20Explanation.pdf'
                            }
                        ];

                    }
                }
            },
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
                'WSA': { field: 'wsa', type: 'string' },
                '': { field: 'url', type: 'string' },
            },
            linkFields: {
                'url': {
                    baseUrl: '',
                    transform: (value) => {
                        return [
                            {
                                label: 'Download Mineral Land Assessment for Wilderness Study Area',
                                href: value
                            }
                        ];
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
