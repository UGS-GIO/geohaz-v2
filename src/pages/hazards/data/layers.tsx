import { LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
const HAZARDS_WORKSPACE = 'hazards';
const GEN_GIS_WORKSPACE = 'gen_gis';
const UNIT_DESCRIPTIONS_URL = 'https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app/unit_descriptions';

const landslideLegacyLayerName = 'landslidelegacy';
const landslideLegacyWMSTitle = 'Legacy Landslide Compilation';
const landslideLegacyWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: landslideLegacyWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${landslideLegacyLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'State Landslide ID': 'statelsid',
                'Landslide Unit': 'lsunit',
                'Movement Type': 'movetype',
                'Historical': 'historical',
                'Geologic Unit': 'geolunit',
                'Map Scale': 'mapscale',
                'Map Name': 'mapname',
                'Pub Date': 'pubdate',
                'Author(s)': 'author_s',
                'Affiliated Unit': 'affunit',
                'Movement Unit': 'moveunit',
                'Movement Cause': 'movecause',
                'Notes': 'notes',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'lsfhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const landslideInventoryLayerName = 'landslideinventory';
const landslideInventoryWMSTitle = 'Landslides';
const landslideInventoryWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: landslideInventoryWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${landslideInventoryLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': 's_name',
                'Activity': 'activity',
                'Confidence': 'confidence',
                'Comments': 'comments',
                'Deposit Movement 1': 'd_h_move1',
                'Deposit Movement 2': 'd_h_move2',
                'Deposit Movement 3': 'd_h_move3',
                'Primary Geologic Unit Involved': 'd_geologic_unit1',
                'Secondary Geologic Unit Involved': 'd_geologic_unit2',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'lsfhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const landslideSusceptibilityLayerName = 'landslidesusceptibility';
const landslideSusceptibilityWMSTitle = 'Landslide Susceptibility';
const landslideSusceptibilityWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: landslideSusceptibilityWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${landslideSusceptibilityLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Hazard': 'hazard_symbology_text',
                'Mapped Scale': 'lssmappedscale',
                'Critical Angle': 'lsscriticalangle',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'lsshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const liquefactionLayerName = 'liquefaction';
const liquefactionWMSTitle = 'Liquefaction Susceptibility';
const liquefactionWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: liquefactionWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${liquefactionLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Hazard': 'hazard_symbology_text',
                'Mapped Scale': 'lqsmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'lqshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
};

// TODO: explore refactor to display peak ground acceleration like the imagery layer
const groundshakingLayerName = 'groundshaking';
const groundshakingWMSTitle = 'Earthquake Ground Shaking';
const groundshakingWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: groundshakingWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${groundshakingLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Peak Ground Acceleration': 'acc',
            },
        },
    ],
}

const qFaultsLayerName = 'quaternaryfaults';
const qFaultsWMSTitle = 'Hazardous (Quaternary age) Faults';
const qFaultsWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: qFaultsWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${qFaultsLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Fault Zone Name': 'faultzone',
                'Summary': 'summary',
                'Fault Name': 'faultname',
                'Section Name': 'sectionname',
                'Strand Name': 'strandname',
                'Structure Number': 'faultnum',
                'Mapped Scale': 'mappedscale',
                'Dip Direction': 'dipdirection',
                'Slip Sense': 'slipsense',
                'Slip Rate': 'sliprate',
                'Structure Class': 'faultclass',
                'Structure Age': 'faultage',
                'Detailed Report': 'usgs_link',
            },

        },
    ],
};


const surfaceFaultRuptureLayerName = 'surfacefaultrupture';
const surfaceFaultRuptureWMSTitle = 'Surface Fault Rupture Special Study Zones';
const surfaceFaultRuptureWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: surfaceFaultRuptureWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${surfaceFaultRuptureLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'sfrmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'sfrhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const windBlownSandLayerName = 'windblownsand';
const windBlownSandWMSTitle = 'Wind-Blown Sand Susceptibility';
const windBlownSandWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: windBlownSandWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${windBlownSandLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'wssmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'wsshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const saltTectonicsDeformationLayerName = 'salttectonicsdeformation';
const saltTectonicsDeformationWMSTitle = 'Salt Tectonics-Related Ground Deformation';
const saltTectonicsDeformationWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: saltTectonicsDeformationWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${saltTectonicsDeformationLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'sdhmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'sdhhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const shallowBedrockLayerName = 'shallowbedrock';
const shallowBedrockWMSTitle = 'Shallow Bedrock Potential';
const shallowBedrockWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: shallowBedrockWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${shallowBedrockLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'sbpmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'sbphazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const rockfallHazardLayerName = 'rockfall';
const rockfallHazardWMSTitle = 'Rockfall Hazard';
const rockfallHazardWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: rockfallHazardWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${rockfallHazardLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'rfhmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'rfhhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const pipingAndErosionLayerName = 'pipinganderosion';
const pipingAndErosionWMSTitle = 'Piping and Erosion Susceptibility';
const pipingAndErosionWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: pipingAndErosionWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${pipingAndErosionLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'pesmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'peshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const expansiveSoilRockLayerName = 'expansivesoilrock';
const expansiveSoilRockWMSTitle = 'Expansive Soil and Rock Susceptibility';
const expansiveSoilRockWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: expansiveSoilRockWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${expansiveSoilRockLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'exsmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'exshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const shallowGroundwaterLayerName = 'shallowgroundwater';
const shallowGroundwaterWMSTitle = 'Shallow Groundwater Susceptibility';
const shallowGroundwaterWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: shallowGroundwaterWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${shallowGroundwaterLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'sgsmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'sgshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const radonSusceptibilityLayerName = 'radonsusceptibility';
const radonSusceptibilityWMSTitle = 'Geologic Radon Susceptibility';
const radonSusceptibilityWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: radonSusceptibilityWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${radonSusceptibilityLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'grsmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'grshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const corrosiveSoilRockLayerName = 'corrosivesoilrock';
const corrosiveSoilRockWMSTitle = 'Corrosive Soil and Rock Susceptibility';
const corrosiveSoilRockWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: corrosiveSoilRockWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${corrosiveSoilRockLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'crsmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'crshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const collapsibleSoilLayerName = 'collapsiblesoil';
const collapsibleSoilWMSTitle = 'Collapsible Soil Susceptibility';
const collapsibleSoilWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: collapsibleSoilWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${collapsibleSoilLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'cssmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'csshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const solubleSoilAndRockLayerName = 'solublesoilandrock';
const solubleSoilAndRockWMSTitle = 'Soluble Soil and Rock Susceptibility';
const solubleSoilAndRockWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: solubleSoilAndRockWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${solubleSoilAndRockLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'slsmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'slshazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const calicheLayerName = 'caliche';
const calicheWMSTitle = 'Caliche Susceptibility';
const calicheWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: calicheWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${calicheLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'casmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'cashazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const floodAndDebrisLayerName = 'floodanddebrisflow';
const floodAndDebrisWMSTitle = 'Flood and Debris-Flow Hazard';
const floodAndDebrisWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: floodAndDebrisWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${floodAndDebrisLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'flhmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'flhhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const earthFissureLayerName = 'earthfissure';
const earthFissureWMSTitle = 'Earth Fissure Hazard';
const earthFissureWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: earthFissureWMSTitle,
    visible: true,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${earthFissureLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Mapped Scale': 'efhmappedscale',
            },
            relatedTables: [
                {
                    fieldLabel: 'hazard_symbology_text',
                    matchingField: 'Relate_ID',
                    targetField: 'efhhazardunit',
                    url: UNIT_DESCRIPTIONS_URL,
                    acceptProfile: 'hazards'
                }
            ]
        },
    ],
}

const erosionHazardZoneLayerName = 'erosionhazardzone';
const erosionHazardZoneWMSTitle = 'J.E. Fuller Flood Erosion Hazard Zones';
const erosionHazardZoneWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: erosionHazardZoneWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${erosionHazardZoneLayerName}`,
            popupEnabled: false,
            queryable: true,
        },
    ],
}

const karstFeaturesLayerName = 'karstfeatures';
const karstFeaturesWMSTitle = 'Karst Features';
const karstFeaturesWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: karstFeaturesWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${karstFeaturesLayerName}`,
            popupEnabled: false,
            queryable: true,
        },
    ],
}

const quads24kLayerName = '24kquads';
const quads24kWMSTitle = 'USGS 1:24,000-Scale Quadrangle Boundaries';
const quads24kWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: quads24kWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${GEN_GIS_WORKSPACE}:${quads24kLayerName}`,
            popupEnabled: false,
            queryable: false,
        },
    ],
}

const studyAreasLayerName = 'studyareas';
const studyAreasWMSTitle = 'Mapped Areas';
const studyAreasWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: studyAreasWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${studyAreasLayerName}`,
            popupEnabled: false,
            queryable: true,
            popupFields: {
                'Name': 'name',
                'Report ID': 'repor_id',
                'Mapped Hazards': 'hazard_name',
            },
        },
    ],
}

const areasNotMappedLayerName = 'areasnotmapped';
const areasNotMappedWMSTitle = 'Areas Not Mapped within Project Areas';
const areasNotMappedWMSConfig: WMSLayerProps = {
    type: 'wms',
    url: `${PROD_GEOSERVER_URL}/wms`,
    title: areasNotMappedWMSTitle,
    visible: false,
    sublayers: [
        {
            name: `${HAZARDS_WORKSPACE}:${areasNotMappedLayerName}`,
            queryable: false,
        },
    ],
}

const floodHazardsConfig: LayerProps = {
    type: 'group',
    title: 'Flooding Hazards',
    visible: false,
    layers: [floodAndDebrisWMSConfig, shallowGroundwaterWMSConfig],
};

const earthquakesConfig: LayerProps = {
    type: 'group',
    title: 'Earthquake Hazards',
    visible: true,
    layers: [groundshakingWMSConfig, liquefactionWMSConfig, surfaceFaultRuptureWMSConfig, qFaultsWMSConfig],
};

const landslidesConfig: LayerProps = {
    type: 'group',
    title: 'Landslide Hazards',
    visible: true,
    layers: [landslideLegacyWMSConfig, landslideSusceptibilityWMSConfig, landslideInventoryWMSConfig, rockfallHazardWMSConfig],
};

const soilHazardsConfig: LayerProps = {
    type: 'group',
    title: 'Problem Soil and Rock Hazards',
    visible: true,
    layers: [windBlownSandWMSConfig, solubleSoilAndRockWMSConfig, shallowBedrockWMSConfig, saltTectonicsDeformationWMSConfig, radonSusceptibilityWMSConfig, pipingAndErosionWMSConfig, karstFeaturesWMSConfig, erosionHazardZoneWMSConfig, expansiveSoilRockWMSConfig, earthFissureWMSConfig, corrosiveSoilRockWMSConfig, collapsibleSoilWMSConfig, calicheWMSConfig],
};

const layersConfig: LayerProps[] = [
    quads24kWMSConfig,
    areasNotMappedWMSConfig,
    studyAreasWMSConfig,
    soilHazardsConfig,
    landslidesConfig,
    floodHazardsConfig,
    earthquakesConfig,
];

export default layersConfig;