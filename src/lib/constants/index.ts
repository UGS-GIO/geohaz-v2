export const PROD_GEOSERVER_URL = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/';
export const PROD_POSTGREST_URL = 'https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app';
export const HAZARDS_WORKSPACE = 'hazards';
export const ENERGY_MINERALS_WORKSPACE = 'energy_mineral';
export const GEN_GIS_WORKSPACE = 'gen_gis';
export const MAPPING_WORKSPACE = 'mapping';
export const GEOCODE_PROXY_FUNCTION_URL = 'http://127.0.0.1:5001/ut-dnr-ugs-maps-dev/us-central1/geocodeProxy';
export const MASQUERADE_GEOCODER_URL = 'https://masquerade.ugrc.utah.gov/arcgis/rest/services/UtahLocator/GeocodeServer';

export interface LayerFetchConfig {
    tableName: string;
    acceptProfile: string;
}

export const layerFetchConfigs: Record<string, LayerFetchConfig> = {
    'hazards': {
        tableName: 'hazlayerinfo',
        acceptProfile: 'hazards'
    },
    'ccus': {
        tableName: 'ccuslayerinfo',
        acceptProfile: 'emp'
    },
    // 'default': {
    //     tableName: 'default_layer_info',
    //     acceptProfile: 'default_profile'
    // }
};

export const getLayerFetchConfig = (page: string | null): LayerFetchConfig | null => {
    if (!page) return null;
    return layerFetchConfigs[page] || layerFetchConfigs['default'] || null;
};