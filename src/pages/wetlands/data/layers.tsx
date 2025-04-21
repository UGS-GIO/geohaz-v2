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


const llwwMappingLayerName = '  wetlandsapp_llww_mappingareas';
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

// cache project areas
const landscapeLayerName = 'wetlandsapp_huc12_ecoregion';
const landscapeTitle = 'Watershed (HUC12) by Ecoregion';
const landscapeConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: landscapeTitle,
    visible: true,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${landscapeLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
            }
        }
    ]
};

// Landscape Group Layer
const landscapeGroupConfig: LayerProps = {
    type: 'group',
    title: 'Landscape Data',
    visible: true,
    layers: [landscapeConfig]
};

// Wetlands WMS Layer Configurations
const wetlandsWMSLayerName = 'wetlandsapp_assessmentLayer';
const wetlandsWMSTitle = 'Wetland Assessment Projects';
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

// Species Layer Configurations
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
const ownershipLayerName = 'Land Ownership';
const ownershipitle = 'Land Ownership';
const ownershipConfig: LayerProps = {
    type: 'map-image',
    url: "https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer",
    visible: false,
    title: ownershipitle,
    //listMode: "hide-children",
};


const layersConfig: LayerProps[] = [
    wetlandGroupConfig,
    riparianGroupConfig,
    additonalGroupConfig,
    hydricSoilsConfig,
    landscapeGroupConfig,
    wetConditionGroupConfig,
    ownershipConfig
];

export default layersConfig;