import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

export const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
const WETLANDS_WORKSPACE = 'wetlands';


// Wetlands Mapping Layer Configurations
const wetMetaLayerName = 'wetlandsapp_metadata';
const wetMetaTitle = 'Wetland Project Information';
const wetMetaConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wetMetaTitle,
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${wetMetaLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

const wetNonRiverineLayerName = 'wetlandsapp_non_riverine';
const wetNonRiverineTitle = 'Wetlands (non-riverine)';
const wetNonRiverineConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wetNonRiverineTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${wetNonRiverineLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        },
    ]
};

const riverineLayerName = 'wetlandsapp_riverine';
const riverineTitle = 'Riverine';
const riverineConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: riverineTitle,
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${riverineLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        },
    ]
};

// Wetlands Group Layer
const wetlandGroupConfig: LayerProps = {
    type: 'group',
    title: 'Wetland Mapping',
    visible: true,
    layers: [
        wetMetaConfig,
        wetNonRiverineConfig,
        riverineConfig
    ]
};

const ripMetaLayerName = 'wetlandsapp_riparian_metadata';
const ripMetaTitle = 'Riparian Project Information';
const ripMetaConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    visible: false,
    title: ripMetaTitle,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${ripMetaLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

const ripDataLayerName = 'wetlandsapp_riparian';
const ripDataTitle = 'Riparian Mapping';
const
    ripDataConfig: WMSLayerProps = {
        type: 'wms',
        url: `${PROD_GEOSERVER_URL}/wms`,
        title: ripDataTitle,
        visible: true,
        sublayers: [
            {
                name: `${WETLANDS_WORKSPACE}:${ripDataLayerName}`,
                popupEnabled: false,
                queryable: true,
                popupFields: {
                }
            }
        ]
    };

// Wetlands Group Layer
const riparianGroupConfig: LayerProps = {
    type: 'group',
    title: 'Riparian Data',
    visible: true,
    layers: [
        ripMetaConfig,
        ripDataConfig
    ]
};

// LLWW descriptions or metadata (calcluated project area)
const llwwMappingLayerName = 'wetlandsapp_finalfunction_calculated_projectarea';
const llwwMappingTitle = 'LLWW Descriptions';
const llwwMappingConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: llwwMappingTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${llwwMappingLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// cache project areas
const cacheProjectsLayerName = 'wetlandsapp_llww_mappingareas';
const cacheProjectsTitle = 'LLWW Mapping Areas';
const cacheProjectsConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: cacheProjectsTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${cacheProjectsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// Additional Attributes Group Layer
const additonalGroupConfig: LayerProps = {
    type: 'group',
    title: 'Additional Attributes (LLWW)',
    visible: true,
    layers: [llwwMappingConfig, cacheProjectsConfig]
};

const hydricSoilsTitle = 'Hydric Soils Classes';
const hydricSoilsConfig: LayerProps = {
    type: 'feature',
    url: "https://utility.arcgis.com/usrsvcs/servers/771b11ef2a574ce9a3a2351b758498fa/rest/services/USA_Soils_Hydric_Class/ImageServer",
    title: hydricSoilsTitle,
    visible: false,
};

// Wetland Assessment Study Results  (Wetland_Condition/2)
const wetlandsWMSLayerName = 'wetlandsapp_wetlandassessmentstudyresults';
const wetlandsWMSTitle = 'Wetland Assessment Study Results';
const wetlandsWMSConfig: LayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wetlandsWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${wetlandsWMSLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// Wetland Assessment Projects  (Wetland_Condition/0)
const assessmentLayerName = 'wetlandsapp_wetlandassessmentprojects';
const assessmentTitle = 'Wetland Assessment Projects';
const assessmentConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    visible: true,
    opacity: 0.6,
    title: assessmentTitle,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${assessmentLayerName}`,
        },
    ]
};

const studyResultsLayerName = 'wetlandsapp_wetlandassessmentstudyresults';
const studyResultsTitle = 'Wetland Assessment Study Results';
const studyResultsConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: studyResultsTitle,
    opacity: 0.6,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${studyResultsLayerName}`,
        }
    ]
};

const stressorsLayerName = 'wetlandsapp_wetlandstressors';
const stressorsTitle = 'Wetland Stressors';
const stressorsConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    visible: false,
    title: stressorsTitle,
    opacity: 0.6,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${stressorsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            },
        }
    ]
};

// Wetlands Group Layer
const wetConditionGroupConfig: LayerProps = {
    type: 'group',
    title: 'Wetland Condition',
    visible: true,
    layers: [wetlandsWMSConfig, assessmentConfig, studyResultsConfig, stressorsConfig]
};

// Land Ownership Layer Configuration
// const ownershipLayerName = 'Land Ownership';
const ownershipitle = 'Land Ownership';
const ownershipConfig: LayerProps = {
    type: 'map-image',
    url: "https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer",
    visible: false,
    title: ownershipitle,
    //listMode: "hide-children",
};

// landscape ecoregions
const huc12ecoLayerName = 'wetlandsapp_huc12_ecoregion';
const huc12ecoTitle = 'Watershed (HUC12) by Ecoregion';
const huc12ecoConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: huc12ecoTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc12ecoLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};


// HUC 12
const huc12LayerName = 'wetlandsapp_huc12';
const huc12Title = 'Watershed (HUC12)';
const huc12Config: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: huc12Title,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc12LayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// HUC 8
const huc8ecoLayerName = 'wetlandsapp_huc8_ecoregion';
const huc8ecoTitle = 'Watershed (HUC8) by Ecoregion';
const huc8ecoConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: huc8ecoTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc8ecoLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// HUC 8
const huc8LayerName = 'wetlandsapp_huc8';
const huc8Title = 'Watershed (HUC8)';
const huc8Config: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: huc8Title,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc8LayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// Ecoregion
const ecoregionLayerName = 'wetlandsapp_ecoregion';
const ecoregionTitle = 'Egoregion';
const ecoregionConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: ecoregionTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${ecoregionLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// Wetlands Group Layer
const ecoregionsGroupConfig: LayerProps = {
    type: 'group',
    title: 'Landscape Ecoregion Data',
    visible: true,
    layers: [huc12ecoConfig, huc12Config, huc8ecoConfig, huc8Config, ecoregionConfig]
};


const layersConfig: LayerProps[] = [
    wetlandGroupConfig,
    riparianGroupConfig,
    additonalGroupConfig,
    hydricSoilsConfig,
    wetConditionGroupConfig,
    ownershipConfig,
    ecoregionsGroupConfig
];

export default layersConfig;