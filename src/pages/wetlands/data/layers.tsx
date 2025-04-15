import { LayerProps } from "@/lib/types/mapping-types";

export const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
const WETLANDS_WORKSPACE = 'wetlands_project';


// Wetlands Mapping Layer Configurations
const wetMetaLayerName = 'Wetland Project Information';
const wetMetaTitle = 'Wetland Project Information';
const wetMetaConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/WetlandMappingTest27June23/MapServer/1",
  title: wetMetaTitle,
  renderer: "wetMetaRenderer",
  visible: false,
  sublayers: [
    {
      name: `${WETLANDS_WORKSPACE}:${wetMetaLayerName}`,
      popupEnabled: false,
      queryable: true,
      popupFields: {
        'Image Year': { field: 'Image Year', type: 'string' },
        'Image Date': { field: 'Image Date', type: 'string' },
        'Image Decade': { field: 'Image Decade', type: 'string' },
        'Image Scale': { field: 'Image Scale', type: 'string' },
        'Supplemental Map Info': { field: 'Supplemental Map Info', type: 'string' }
      }
    }
  ]
};

const wetNonRiverineLayerName = 'Wetlands (non-riverine)';
const wetNonRiverineTitle = 'Wetlands (non-riverine)';
const wetNonRiverineConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/WetlandMappingTest27June23/MapServer/2",
  title: wetNonRiverineTitle,
  renderer: "nonRiverineRenderer",
  labelsVisible: false,
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

const riverineLayerName = 'Riverine';
const riverineTitle = 'Riverine';
const riverineConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/WetlandMappingTest27June23/MapServer/3",
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

const ripMetaLayerName = 'Riparian Project Information';
const ripMetaTitle = 'Riparian Project Information';
const ripMetaConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/RiparianMappingtest27June23/MapServer/0",
  visible: false,
  title: ripMetaTitle,
  renderer: "ripMetaRenderer",
  sublayers: [
    {
      name: `${WETLANDS_WORKSPACE}:${ripMetaLayerName}`,
      popupEnabled: false,
      queryable: true,
      popupFields: {
        'Image Year': { field: 'Image Year', type: 'string' },
        'Image Date': { field: 'Image Date', type: 'string' },
        'Image Decade': { field: 'Image Decade', type: 'string' },
        'Image Scale': { field: 'Image Scale', type: 'string' },
        'Supplemental Map Info': { field: 'Supplemental Map Info', type: 'string' }
      }
    }
  ]
};

const ripDataLayerName = 'Riparian Mapping';
const ripDataTitle = 'Riparian Mapping';
const ripDataConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/RiparianMappingtest27June23/MapServer/1",
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


const llwwMappingLayerName = 'LLWW Descriptions';
const llwwMappingTitle = 'LLWW Descriptions';
const llwwMappingConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/LLWW_Additional_Attributes/MapServer/0",
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
const cacheProjectsLayerName = 'LLWW Mapping Areas';
const cacheProjectsTitle = 'LLWW Mapping Areas';
const cacheProjectsConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/LLWW_Additional_Attributes/MapServer/1",
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
const hydricSoilsConfig : LayerProps = {
  type: 'feature',
  url: "https://utility.arcgis.com/usrsvcs/servers/771b11ef2a574ce9a3a2351b758498fa/rest/services/USA_Soils_Hydric_Class/ImageServer",
  title: hydricSoilsTitle,
  visible: false,
  //type: "imagery", // Added type for clarity if you're handling different layer types
};

// cache project areas
const landscapeLayerName = 'Watershed (HUC12) by Ecoregion';
const landscapeTitle = 'Watershed (HUC12) by Ecoregion';
const landscapeConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/Wetland_Landscape_Data/MapServer/0",
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
const wetlandsWMSConfig: WMSLayerProps = {
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
        'Site Name': { field: 'site_name', type: 'string' },
        'Commodity': { field: 'commodity', type: 'string' },
        'Label': { field: 'label', type: 'string' }
      }
    }
  ]
};

// Species Layer Configurations
const assessmentLayerName = 'Wetland Assessment Projects';
const assessmentTitle = 'Wetland Assessment Projects';
const assessmentConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/Wetland_Condition/MapServer/0",
  visible: true,
  renderer: "assRenderer",  
  title: assessmentTitle,
  blendMode: "multiply",
  // opacity: 0.6,
  sublayers: [
    {
      name: assessmentLayerName,
      content: "contentStudyArea",
      actions: ["resultsAction"],
      outFields: ["*"],
    },
  ]
};

const studyResultsLayerName = 'Wetland Assessment Study Results';
const studyResultsTitle = 'Wetland Assessment Study Results';
const studyResultsConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/Wetland_Condition/MapServer/2",
  title: studyResultsTitle,
  opacity: 0.6,
  sublayers: [
    {
      name: studyResultsLayerName,
      content: "contentStudyResults",
      actions: ["projectsAction"],
      outFields: ["*"],
    }
  ]
};

//const stressorsLayerName = '';
const stressorsTitle = 'Wetland Stressors';
const stressorsConfig = {
  type: 'feature',
  url: "https://webmaps.geology.utah.gov/arcgis/rest/services/Wetlands/Wetland_Condition/MapServer/1",
  renderer: "stressorsRenderer",
  visible: false,
  title: stressorsTitle,
  opacity: 0.6,
};

// Wetlands Group Layer
const wetConditionGroupConfig: LayerProps = {
  type: 'group',
  title: 'Wetland Condition',
  visible: true,
  layers: [wetlandsWMSConfig,assessmentConfig, studyResultsConfig, stressorsConfig]
};

// Land Ownership Layer Configuration
const ownershipLayerName = 'Land Ownership';
const ownershipitle = 'Land Ownership';
const ownershipConfig: LayerProps = {
  type: 'mapimagelayer',
  url: "https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer",
  visible: false,
  title: ownershipitle,
  listMode: "hide-children",
  sublayers: [
    {
      name: ownershipLayerName,
    },
  ]
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
