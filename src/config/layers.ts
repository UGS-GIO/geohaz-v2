import {
    landslideCompPopup,
    landslideSourcePopup,
    epicentersPopup,
    miningepicentersPopup,
    poopTemplate,
    studyAreasPopup
} from "./popups";

import {
    rendererRecent,
    rendererMining,
    rendererLiquefaction,
    rendererBedrockPot,
    surfaceFaultRuptureRenderer,
    quadRenderer,
    colorize
} from "./renderers";
import { LayerProps } from "./types/mappingTypes";


const landslideCompConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/4',
    options: {
        title: 'Legacy Landslide Compilation',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>Legacy Landslide Compilation</b>',
            outFields: ['*'],
            content: landslideCompPopup,
        },
        minScale: 300000,
    },
};

const landslideDepositConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/3',
    options: {
        title: 'Landslides',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>Landslides</b>',
            outFields: ['*'],
            content: landslideSourcePopup,
        },
    },
};

const landslideSusceptibilityConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/2',
    options: {
        title: 'Landslide Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>Landslide Susceptibility</b>',
            outFields: ['*'],
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'relationships/2/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'Hazard_Symbology_Text',
                            visible: true,
                            label: 'Hazard',
                        },
                        {
                            fieldName: 'LSSCriticalAngle',
                            visible: true,
                            label: 'Critical Angle',
                        },
                    ],
                },
                {
                    type: 'text',
                    text:
                        '<b>{Hazard_Symbology_Text}: </b>{relationships/2/Description}<br><b>Mapped Scale: </b>{LSSMappedScale}<br><b>Critical Angle: </b>{LSSCriticalAngle}',
                },
            ],
        },
    },
};

const epicentersRecentConfig: LayerProps & { featureReduction: object } = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Earthquake_Hazards/FeatureServer/0',
    options: {
        title: 'Epicenters (1850 to 2016)',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>Earthquake Epicenter Information</b>',
            outFields: ['*'],
            content: epicentersPopup,
        },
        renderer: rendererRecent,
    },
    featureReduction: {
        type: 'selection',
    },
};

// Setting feature reduction for the layer
// epicentersRecentConfig.featureReduction = {
//     type: 'selection',
// };


const epicentersMiningConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Earthquake_Hazards/FeatureServer/1',
    options: {
        title: 'Mining-Induced Epicenters',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: 'Mining-Induced Epicenters',
            outFields: ['*'],
            content: miningepicentersPopup,
            // content: "{Mag:miningepicentersPopup}{Depth:miningepicentersPopup}{Long:miningepicentersPopup}{Lat:miningepicentersPopup}{Date:miningepicentersPopup}"
        },
        renderer: rendererMining,
    },
};

const liquefactionConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Earthquake_Hazards/FeatureServer/2',
    options: {
        title: 'Liquefaction Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        renderer: rendererLiquefaction,
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>Liquefaction Susceptibility</b>',
            outFields: ['*'],
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'Hazard_Symbology_Text',
                            visible: true,
                            label: 'Hazard',
                        },
                        {
                            fieldName: 'relationships/0/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'MappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                    ],
                },
                {
                    type: 'text',
                    text:
                        '<b>{Hazard_Symbology_Text}: </b>{relationships/0/Description}<br><b>Mapped Scale: </b>{LQSMappedScale}',
                },
            ],
        },
        // content: "{LQSHazardUnit:liquefactionPopup}{LQSMappedScale:liquefactionPopup}"
    },
};

const shakingVectorConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/ArcGIS/rest/services/Utah_Earthquake_Hazards/FeatureServer/5',
    options: {
        title: 'Earthquake Ground Shaking',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
    },
};

const shakingRasterConfig: LayerProps = {
    type: 'imagery',
    url: 'https://webmaps.geology.utah.gov/arcgis/rest/services/Hazards/GroundshakingRaster/ImageServer',
    options: {
        visible: true,
        legendEnabled: false,
        listMode: 'hide',
        title: 'Shaking Raster',
        pixelFilter: colorize,
        opacity: 0,
        popupTemplate: {
            title: '<b>Earthquake Ground Shaking</b>',
            content: '<b>Peak Ground Acceleration: </b>{Raster.ServicePixelValue.Raw}  G\'s',
        },
    },
};

const qFaultsConfig: LayerProps = {
    type: 'map-image',
    url: 'https://webmaps.geology.utah.gov/arcgis/rest/services/Hazards/quaternary_faults_with_labels/MapServer',
    options: {
        sublayers: [
            {
                id: 0,
                visible: true,
                popupTemplate: {
                    outFields: ['*'],
                    title: '<b>Hazardous (Quaternary age) Faults</b>',
                    content: poopTemplate,
                },
            },
            {
                id: 1,
                visible: true,
            },
        ],
        title: 'Hazardous (Quaternary age) Faults',
        listMode: 'hide-children',
        visible: true,
    },
};

const faultRuptureConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Earthquake_Hazards/FeatureServer/3',
    options: {
        title: 'Surface Fault Rupture Special Study Zones',
        renderer: surfaceFaultRuptureRenderer,
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/1/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'SFRMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/1/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/1/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '{relationships/1/Description}<br><b>Mapped Scale: </b>{SFRMappedScale}',
                },
            ],
        },
    },
};

const eolianSusConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/19',
    options: {
        title: 'Wind-Blown Sand Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>Wind-Blown Sand Susceptibility</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'Hazard_Symbology_Text',
                            visible: true,
                            label: 'Hazard',
                        },
                        {
                            fieldName: 'relationships/17/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/17/Description}<br><b>Mapped Scale: </b>{WSSMappedScale}',
                },
            ],
        },
    },
};

const tectonicDefConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/16',
    options: {
        title: 'Salt Tectonics-Related Ground Deformation',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/14/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'Hazard_Symbology_Text',
                            visible: true,
                            label: 'Hazard',
                        },
                        {
                            fieldName: 'SDHMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/14/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/14/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/14/Description}<br><b>Mapped Scale: </b>{SDHMappedScale}',
                },
            ],
        },
    },
};

const bedrockPotConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/17',
    options: {
        title: 'Shallow Bedrock Potential',
        elevationInfo: [{ mode: 'on-the-ground' }],
        renderer: rendererBedrockPot,
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/15/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'Hazard_Symbology_Text',
                            visible: true,
                            label: 'Hazard',
                        },
                        {
                            fieldName: 'SBPMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/15/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/15/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/15/Description}<br><b>Mapped Scale: </b>{SBPMappedScale}',
                },
            ],
        },
    },
};

const rockfallHazConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/15',
    options: {
        title: 'Rockfall Hazard',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/13/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'Hazard_Symbology_Text',
                            visible: true,
                            label: 'Hazard',
                        },
                        {
                            fieldName: 'RFHMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/13/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/13/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/13/Description}<br><b>Mapped Scale: </b>{RFHMappedScale}',
                },
            ],
        },
    },
};

const pipingSusConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/13',
    options: {
        title: 'Piping and Erosion Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/11/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'PESMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/11/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/11/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/11/Description}<br><b>Mapped Scale: </b>{PESMappedScale}',
                },
            ],
        },
    },
};

const expansiveSoilConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/10',
    options: {
        title: 'Expansive Soil and Rock Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/9/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'EXSMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/9/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/9/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/9/Description}<br><b>Mapped Scale: </b>{EXSMappedScale}',
                },
            ],
        },
    },
};

const groundwaterSusConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/1',
    options: {
        title: 'Shallow Groundwater Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/1/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'FLHMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/1/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/1/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/1/Description}<br><b>Mapped Scale: </b>{SGSMappedScale}',
                },
            ],
        },
    },
};

const radonSusConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/14',
    options: {
        title: 'Geologic Radon Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/12/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'GRSMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/12/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/12/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/12/Description}<br><b>Mapped Scale: </b>{GRSMappedScale}',
                },
            ],
        },
    },
};

const corrosiveSoilConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/7',
    options: {
        title: 'Corrosive Soil and Rock Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/6/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'CRSMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/6/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/6/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/6/Description}<br><b>Mapped Scale: </b>{CRSMappedScale}',
                },
            ],
        },
    },
};

const collapsibleSoilConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/6',
    options: {
        title: 'Collapsible Soil Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/5/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'CSSMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/5/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/5/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/5/Description}<br><b>Mapped Scale: </b>{CSSMappedScale}',
                },
            ],
        },
    },
};

const solubleSoilConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/18',
    options: {
        title: 'Soluble Soil and Rock Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/16/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'SLSMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/16/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/16/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/16/Description}<br><b>Mapped Scale: </b>{SLSMappedScale}',
                },
            ],
        },
    },
};

const calicheConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/5',
    options: {
        title: 'Caliche Susceptibility',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/4/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'CASMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/4/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/4/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '{relationships/4/Description}<br><b>Mapped Scale: </b>{CASMappedScale}',
                },
            ],
        },
    },
};

const floodHazardConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/0',
    options: {
        title: 'Flood and Debris-Flow Hazard',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/0/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'FLHMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/0/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/0/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/0/Description}<br><b>Mapped Scale: </b>{FLHMappedScale}',
                },
            ],
        },
    },
};

const earthFissureConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/8',
    options: {
        title: 'Earth Fissure Hazard',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/7/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'EFHMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/7/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/7/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/7/Description}<br><b>Mapped Scale: </b>{EFHMappedScale}',
                },
            ],
        },
    },
};

const erosionZoneConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/9',
    options: {
        title: 'J.E. Fuller Flood Erosion Hazard Zones',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/8/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'ERZMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/8/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/8/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '{relationships/8/Description}<br><b>Mapped Scale: </b>{ERZMappedScale}',
                },
            ],
        },
    },
};

const groundSubsidenceConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/11',
    options: {
        title: 'Ground Subsidence Potential',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/5/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'CSSMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/5/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/5/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '{relationships/4/Description}<br><b>Mapped Scale: </b>{CSSMappedScale}',
                },
            ],
        },
    },
};

const karstFeaturesConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards/FeatureServer/12',
    options: {
        title: 'Karst Features',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        outFields: ['*'],
        popupTemplate: {
            title: '<b>{relationships/10/HazardName}</b>',
            content: [
                {
                    type: 'fields',
                    fieldInfos: [
                        {
                            fieldName: 'GSPMappedScale',
                            visible: true,
                            label: 'Mapped Scale',
                        },
                        {
                            fieldName: 'relationships/10/Description',
                            visible: true,
                            label: 'Hazard Description',
                        },
                        {
                            fieldName: 'relationships/10/HazardName',
                            visible: true,
                            label: 'Hazard',
                        },
                    ],
                },
                {
                    type: 'text',
                    text: '<b>{Hazard_Symbology_Text}: </b>{relationships/10/Description}<br><b>Mapped Scale: </b>{GSPMappedScale}',
                },
            ],
        },
    },
};

const soilHazardsConfig: LayerProps = {
    type: 'group',
    title: 'Problem Soil and Rock Hazards',
    visible: true,
    layers: [eolianSusConfig, solubleSoilConfig, bedrockPotConfig, tectonicDefConfig, radonSusConfig, pipingSusConfig, karstFeaturesConfig, erosionZoneConfig, expansiveSoilConfig, earthFissureConfig, corrosiveSoilConfig, collapsibleSoilConfig, calicheConfig],
};

const quadBoundariesConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards_Supplemental_Data_View/FeatureServer/0',
    options: {
        title: 'USGS 1:24,000-Scale Quadrangle Boundaries',
        elevationInfo: [{ mode: 'on-the-ground' }],
        labelingInfo: {
            labelExpressionInfo: {
                expression: '$feature.NAME',
            },
            symbol: {
                type: 'text',
                color: '#db0202',
                font: {
                    family: 'serif',
                    size: 10,
                    weight: 'bold',
                    style: 'italic',
                },
            },
        },
        renderer: quadRenderer,
        visible: true,
    },
};

const hazardStudyConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards_Supplemental_Data_View/FeatureServer/1',
    options: {
        title: 'Mapped Areas',
        elevationInfo: [{ mode: 'on-the-ground' }],
        outFields: ['*'],
        popupTemplate: {
            outFields: ['*'],
            title: '<b>Mapped Areas</b>',
            content: studyAreasPopup,
        },
    },
};

const lidarBoundsConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards_Supplemental_Data_View/FeatureServer/2',
    options: {
        title: 'Lidar Extents',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
    },
};

const airphotoPointsConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards_Supplemental_Data_View/FeatureServer/3',
    options: {
        title: 'Aerial Imagery Centerpoints',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
        minScale: 500000,
    },
};

const notMappedConfig: LayerProps = {
    type: 'feature',
    url: 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_Geologic_Hazards_Supplemental_Data_View/FeatureServer/4',
    options: {
        title: 'Areas Not Mapped within Project Areas',
        elevationInfo: [{ mode: 'on-the-ground' }],
        visible: true,
    },
};

const floodHazardsConfig: LayerProps = {
    type: 'group',
    title: 'Flooding Hazards',
    visible: true,
    layers: [floodHazardConfig, groundwaterSusConfig],
};

const earthquakesConfig: LayerProps = {
    type: 'group',
    title: 'Earthquake Hazards',
    visible: true,
    layers: [shakingVectorConfig, liquefactionConfig, faultRuptureConfig, qFaultsConfig],
};

const landslidesConfig: LayerProps = {
    type: 'group',
    title: 'Landslide Hazards',
    visible: true,
    layers: [landslideCompConfig, landslideSusceptibilityConfig, landslideDepositConfig, rockfallHazConfig],
};

const layersConfig: LayerProps[] = [
    quadBoundariesConfig,
    notMappedConfig,
    hazardStudyConfig,
    soilHazardsConfig,
    landslidesConfig,
    earthquakesConfig,
    floodHazardsConfig,
    // qFaultsConfig
];

export default layersConfig;