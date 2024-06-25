const baseUrl = 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services';
const supplementalData = `${baseUrl}/Utah_Geological_Hazards_Supplemental_Data_t1_view/FeatureServer`;
const groundshakingHazardCode = 'EGS';
const quaternaryFaultsHazardCode = 'QFF';
export default {
    mapKeys: {
        overview: 'overview-map',
        lidar: 'lidar-map',
        aerials: 'aerials-map'
    },
    scaleMultiple: 2500,
    notProd: import.meta.env.MODE !== 'production',
    urls: {
        baseUrl,
        hazardGroupingsTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/0`,
        hazardGroupTextTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/1`,
        hazardIntroTextTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/2`,
        hazardReferenceTextTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/3`,
        hazardUnitTextTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/4`,
        imageAgenciesTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/5`,
        otherDataTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/7`,
        reportTextTable: `${baseUrl}/Report_Tables_t1_view/FeatureServer/8`,
        lidarExtents: `${supplementalData}/2`,
        aerialImageryCenterPoints: `${supplementalData}/3`
    },
    groundshakingHazardCode,
    quaternaryFaultsHazardCode,
    queries: [
        //['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/0', 'FLH'], // Flood Hazard
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/1', 'SGS'], // Shallow Groundwater Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/2', 'LSS'], // Landslide Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/3', 'LSF'], // Landslides
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/4', 'LSC'], // Legacy Landslide Compilation
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/5', 'CAS'], // Caliche Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/6', 'CSS'], // Collapsible Soil Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/7', 'CRS'], // Corrosive Soil and Rock Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/8', 'EFH'], // Earth Fissure Hazard
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/9', 'ERZ'], // Erosion Hazard Zones
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/10', 'EXS'], // Expansive Soil and Rock Susceptibility
        //['Utah_Geologic_Hazards_Working_Database_t1_view/11', 'GSP'], // Ground Subsidence Potential
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/12', 'MKF'], // Karst Features
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/13', 'PES'], // Piping and Erosion Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/14', 'GRS'], // Radon Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/15', 'RFH'], // Rockfall Hazardßß
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/16', 'SDH'], // Salt Tectonics Related Ground Deformation
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/17', 'SBP'], // Shallow Bedrock Potential
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/18', 'SLS'], // Soluble Soil and Rock Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/19', 'WSS'], // Wind-Blown Sand Susceptibility
        ['Utah_Geologic_Hazards_Working_Database_t1_view/FeatureServer/24', 'AAF'], // Alluvial Fan Inventory
        ['https://webmaps.geology.utah.gov/arcgis/rest/services/Hazards/quaternary_faults/MapServer/0', quaternaryFaultsHazardCode], // Quaternary Faults
        // ['https://pgfeatureserv-souochdo6a-wm.a.run.app/functions/postgisf/tw.search_fault_data/items.json', quaternaryFaultsHazardCode], // Quaternary Faults
        ['Utah_Earthquake_Hazards/FeatureServer/2', 'LQS'], // Liquefaction Susceptibility
        ['Utah_Earthquake_Hazards/FeatureServer/3', 'SFR'], // Surface Fault Rupture Hazard Special Study Zone
        ['Utah_Earthquake_Hazards/FeatureServer/5', groundshakingHazardCode] // Groundshaking Polygons
    ],
    webMaps: {
        hazard: (import.meta.env.MODE === 'development') ?
            // development
            //'eec57827136a472dbdb75535889d74b2' :
            //'a2d16377b4b5495ab2aaca8dd14463ba' :
            '85711d64428b439f822794c75208d1d6' :
            // production & staging
            //'a2d16377b4b5495ab2aaca8dd14463ba'
            '85711d64428b439f822794c75208d1d6'
    }
};
