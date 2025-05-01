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
                'Image Year': { field: 'image_year', type: 'string' },
                'Image Date': { field: 'image_date', type: 'string' },
                'Image Decade': { field: 'image_decade', type: 'string' },
                'Image Scale': { field: 'image_scale', type: 'string' },
                'Supplemental Map Info': { field: 'suppmapinfo', type: 'string' }
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
                'Cowardin Attribute': { field: 'cowattribute', type: 'string' },
                'Wetland Type': { field: 'wetland_type', type: 'string' },
                'Acres': { field: 'acres', type: 'string' },
                'Image Year': { field: 'image_yr', type: 'string' },
                'Additional Attributes Available': { field: 'llww', type: 'string' }
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
                'Cowardin Attribute': { field: 'cowattribute', type: 'string' },
                'Wetland Type': { field: 'wetland_type', type: 'string' },
                'Acres': { field: 'acres', type: 'string' },
                'Image Year': { field: 'image_yr', type: 'string' },
                'Additional Attributes Available': { field: 'llww', type: 'string' }
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
                'Image Year': { field: 'image_year', type: 'string' },
                'Image Date': { field: 'image_date', type: 'string' },
                'Image Decade': { field: 'image_decade', type: 'string' },
                'Image Scale': { field: 'image_scale', type: 'string' },
                'Supplemental Map Info': { field: 'suppmapinfo', type: 'string' }
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
                    'Attribute': { field: 'attribute', type: 'string' },
                    'Riparian Type': { field: 'wetland_type', type: 'string' },
                    'Acres': { field: 'acres', type: 'string' },
                    'Image Year': { field: 'image_yr', type: 'string' }
                }
            }
        ]
    };

// Wetlands Group Layer
const riparianGroupConfig: LayerProps = {
    type: 'group',
    title: 'Riparian Data',
    visible: false,
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
                'Cowardin Attribute': { field: 'cowattribute', type: 'string' },
                'LLWW Feature Type': { field: 'featuretype', type: 'string' },
                'HGM': { field: 'hgm_class', type: 'string' },
                'Landscape': { field: 'landscape', type: 'string' },
                'Landform or Waterbody': { field: 'landform_waterbody', type: 'string' },
                'Flowpath': { field: 'flowpath', type: 'string' },
                'LLWW Base Code': { field: 'llww_base', type: 'string' },
                'LLWW Modifiers': { field: 'llww_modifiers', type: 'string' }
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
                'Project Name': { field: 'projectname', type: 'string' },
                'Organization': { field: 'organization', type: 'string' },
                'Base Imagery': { field: 'baseimagery', type: 'string' },
                'Supplemental Report': { field: 'report', type: 'string' }
            }
        }
    ]
};

// Additional Attributes Group Layer
const additonalGroupConfig: LayerProps = {
    type: 'group',
    title: 'Additional Attributes (LLWW)',
    visible: false,
    layers: [llwwMappingConfig, cacheProjectsConfig]
};

// Hydric Soils Classes (Soil_Hydric_Classes/0)
// Still need to impliment image server layers
/*
const hydricSoilsTitle = 'Hydric Soils Classes';
const hydricSoilsConfig: LayerProps = {
    type: 'feature',
    url: "https://utility.arcgis.com/usrsvcs/servers/771b11ef2a574ce9a3a2351b758498fa/rest/services/USA_Soils_Hydric_Class/ImageServer",
    title: hydricSoilsTitle,
    visible: false,
};
*/

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
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Project Name': { field: 'project', type: 'string' },
                'Years': { field: 'years', type: 'string' },
                'Report': { field: 'projectreport', type: 'string' },
                'Target population': { field: 'target_population', type: 'string' },
                'Target population comparison': { field: 'target_population_comparison', type: 'string' },
                'Sample frame': { field: 'sample_frame', type: 'string' },
                'Site selection': { field: 'site_selection', type: 'string' }
            }
        },
    ]
};

// Wetland Assessment Study Results  (Wetland_Condition/2)
const wetlandsWMSLayerName = 'wetlandsapp_wetlandassessmentstudyresults';
const wetlandsWMSTitle = 'Wetland Assessment Study Results';
const wetlandsWMSConfig: LayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: wetlandsWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${wetlandsWMSLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Project Name': { field: 'project', type: 'string' },
                'Stratum Name': { field: 'years', type: 'string' },
                'Stratum Ecoregion': { field: 'projectreport', type: 'string' },
                'Sites Surveyed (#)': { field: 'target_population', type: 'string' },
                'Very High Condition Score (%)': { field: 'target_population_comparison', type: 'string' },
                'High Condition Score (%)': { field: 'sample_frame', type: 'string' },
                'Medium Condition Score (%)': { field: 'site_selection', type: 'string' }
            }
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
    visible: false,
    layers: [wetlandsWMSConfig, assessmentConfig, stressorsConfig]
};

// SITLA Land Ownership Layer
const ownershipLayerName = 'Land Ownership';
const ownershipTitle = ownershipLayerName;
const ownershipConfig: LayerProps = {
    type: 'feature',
    url: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/MapServer/0',
    opacity: 0.45,
    options: {
        popupEnabled: false,
        title: ownershipTitle,
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: false,
    },
};

// landscape ecoregions
const huc12ecoLayerName = 'wetlandsapp_huc12_ecoregion';
const huc12ecoTitle = 'Watershed (HUC12) by Ecoregion';
const huc12ecoConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: huc12ecoTitle,
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc12ecoLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Watershed Name:': { field: 'huc12_name', type: 'string' },
                'Watershed Identifier::': { field: 'huc12', type: 'string' },
                'Ecoregion::': { field: 'ecoregion', type: 'string' },
                'Surface Water Plot::': { field: 'surface_water_plot', type: 'string' }
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
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc12LayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Watershed Name:': { field: 'huc12_name', type: 'string' },
                'Watershed Identifier:': { field: 'huc12', type: 'string' },
                'Ecoregion:': { field: 'ecoregion', type: 'string' },
                'Surface Water Plot:': { field: 'surface_water_plot', type: 'string' }
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
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc8ecoLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Sub-basin Name:': { field: 'huc8_name', type: 'string' },
                'Sub-basin Identifier:': { field: 'huc8', type: 'string' },
                'Ecoregion:': { field: 'ecoregion', type: 'string' },
                'Surface Water Plot:': { field: 'surface_water_plot', type: 'string' }
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
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${huc8LayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Sub-basin Name:': { field: 'huc8_name', type: 'string' },
                'Sub-basin Identifier:': { field: 'huc8', type: 'string' },
                'Ecoregion:': { field: 'ecoregion', type: 'string' },
                'Surface Water Plot:': { field: 'surface_water_plot', type: 'string' }
            }
        }
    ]
};

// Ecoregion
const ecoregionLayerName = 'wetlandsapp_ecoregion';
const ecoregionTitle = 'Ecoregion';
const ecoregionConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: ecoregionTitle,
    visible: false,
    sublayers: [
        {
            name: `${WETLANDS_WORKSPACE}:${ecoregionLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Image Year:': { field: 'image_yr', type: 'string' },
                'Image Date:': { field: 'image_date', type: 'string' },
                'Image Decade:': { field: 'decade', type: 'string' },
                'Image Scale:': { field: 'all_scales', type: 'string' },
                'Data Source:': { field: 'data_source', type: 'string' },
                'Supplemental Map Info:': { field: 'supmapinfo', type: 'string' }
            }
        }
    ]
};

// Wetlands Group Layer
const ecoregionsGroupConfig: LayerProps = {
    type: 'group',
    title: 'Landscape Ecoregion Data',
    visible: false,
    layers: [huc12ecoConfig, huc12Config, huc8ecoConfig, huc8Config, ecoregionConfig]
};


const layersConfig: LayerProps[] = [
    wetlandGroupConfig,
    riparianGroupConfig,
    additonalGroupConfig,
    //hydricSoilsConfig,
    wetConditionGroupConfig,
    ownershipConfig,
    ecoregionsGroupConfig
];

export default layersConfig;