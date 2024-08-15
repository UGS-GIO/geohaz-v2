
// const layersConfig: LayerProps[] = [
//     quadBoundariesConfig,
//     notMappedConfig,
//     hazardStudyConfig,
//     soilHazardsConfig,
//     landslidesConfig,
//     earthquakesConfig,
//     floodHazardsConfig,
// ];



// const basinNamesWMSConfig: LayerProps = {
//     type: 'wms',
//     url: `https://geoserver225-ffmu3lsepa-uc.a.run.app/geoserver/EnergyMinerals/basin_names/ows?service=WMS&version=1.3.0&request=GetCapabilities`,
//     options: {
//         name: 'basin_names',
//         title: 'Basin Names',
//         visible: true,
//     },
// };

// // same for 	EnergyMinerals:oilgasfields
// const oilGasFieldsWMSConfig: LayerProps = {
//     type: 'wms',
//     url: `https://geoserver225-ffmu3lsepa-uc.a.run.app/geoserver/EnergyMinerals/oilgasfields/ows?service=WMS&version=1.3.0&request=GetCapabilities`,
//     options: {
//         name: 'oil_gas_fields',
//         title: 'Oil and Gas Fields',
//         visible: true,
//     },
// };

// // pipelines
// const pipelinesWMSConfig: LayerProps = {
//     type: 'wms',
//     url: `https://geoserver225-ffmu3lsepa-uc.a.run.app/geoserver/EnergyMinerals/pipelines/ows?service=WMS&version=1.3.0&request=GetCapabilities`,
//     options: {
//         name: 'pipelines',
//         title: 'Pipelines',
//         visible: true,
//     },
// };

// const sco2WMSConfig: LayerProps = {
//     type: 'wms',
//     url: `https://geoserver225-ffmu3lsepa-uc.a.run.app/geoserver/EnergyMinerals/sco2/ows?service=WMS&version=1.3.0&request=GetCapabilities`,
//     options: {
//         name: 'sco2',
//         title: 'SCO2',
//         visible: true,
//     },
// };

// const EMPConfig: LayerProps = {
//     type: 'group',
//     title: 'Energy and Minerals',
//     visible: true,
//     layers: [
//         basinNamesWMSConfig,
//         oilGasFieldsWMSConfig,
//         pipelinesWMSConfig,
//         sco2WMSConfig
//     ]
// };