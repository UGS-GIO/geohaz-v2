import config from '../config';
import querystring from 'query-string';
// import polly from 'polly-js';
import { SpatialReference, JsonResponse } from '../types/types';
import { getHazardCodeFromUnitCode } from '../util/util';

// const retryPolicy = (url, outputFormatter = response => response) => {
//     return polly().waitAndRetry(3).executeForPromise(async () => {
//         const response = await fetch(url);

//         if (!response.ok) {
//             return Promise.reject({
//                 ...response,
//                 requestURL: url
//             });
//         }

//         const responseJson = await response.json();

//         if (responseJson.error) {
//             return Promise.reject({
//                 ...responseJson,
//                 requestURL: url
//             });
//         }

//         return outputFormatter(responseJson);
//     });
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface AreaOfInterest {
    rings: number[][][];
    spatialReference: SpatialReference;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async <T>(url: string, outputFormatter: (response: JsonResponse) => T): Promise<T> => {
    // fetch 3 times with 1 second delay
    for (let i = 0; i < 3; i++) {
        try {
            // console.log('fetchWithRetry', url);

            const response = await fetch(url);

            // if (!response.ok) {

            console.log('fetchWithRetry response', response.status);
            // }

            if (!response.ok) {
                throw {
                    ...response,
                    requestURL: url
                };
            }

            const responseJson: JsonResponse = await response.json();

            if (responseJson.error) {
                throw {
                    ...responseJson,
                    requestURL: url
                };
            }

            return outputFormatter(responseJson);
        } catch (error) {
            if (i === 2) {
                throw error;
            }

            await delay(1000);
        }
    }

    throw new Error('fetchWithRetry failed');
}

// const retryPolicy = <T>(url: string, outputFormatter: (response: JsonResponse) => T = response => response as unknown as T): Promise<T> => {
//     return new Promise<T>((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {
//         fetchWithRetry(url, outputFormatter)
//             .then(resolve)
//             .catch(reject);
//     });
// }

const retryPolicy = <T>(url: string, outputFormatter: (response: JsonResponse) => T = response => response as unknown as T): Promise<T> => {
    return fetchWithRetry(url, outputFormatter);
}

export const queryUnitsAsync = async (meta: string[], aoi: AreaOfInterest) => {

    let [url, hazard] = meta

    if (!url.startsWith('https')) {
        url = `${config.urls.baseUrl}/${url}`;
    }

    const hazardField = `${hazard}HazardUnit`;

    const parameters = {
        geometryType: 'esriGeometryPolygon',
        geometry: JSON.stringify(aoi),
        returnGeometry: false,
        outFields: hazardField,
        f: 'json'
    };

    return await retryPolicy(`${url}/query?${querystring.stringify(parameters)}`, (responseJson) => {
        return {
            units: responseJson.features.map(feature => feature.attributes[hazardField]),
            hazard,
            url
        };
    });
};

type Units = string[]
type Groups = string[]

const getDistinctHazardCodesFromUnits = (units: Units) => {
    return units.map(unit => getHazardCodeFromUnitCode(unit));
}

const queryTable = async (url: string, where: string, outFields: string, orderByFields?: string) => {
    const parameters = {
        where,
        outFields,
        f: 'json',
        orderByFields
    };

    return await retryPolicy(`${url}/query?${querystring.stringify(parameters)}`, (responseJson) => responseJson.features.map(feature => feature.attributes));
};

export const queryHazardUnitTableAsync = (units: Units) => {
    // console.log('QueryService.queryHazardUnitTableAsync');

    const where = `HazardUnit IN ('${units.join('\',\'')}')`;
    const outFields = 'HazardName,HazardUnit,HowToUse,Description,UnitName';

    return queryTable(config.urls.hazardUnitTextTable, where, outFields);
};

export const queryReferenceTableAsync = (units: Units) => {
    // console.log('QueryService.queryReferenceTableAsync');

    units = getDistinctHazardCodesFromUnits(units);
    const where = `Hazard IN ('${units.join('\',\'')}')`;
    const outFields = 'Hazard,Text';

    return queryTable(config.urls.hazardReferenceTextTable, where, outFields);
};

export const queryIntroTextAsync = (units: Units) => {
    // console.log('QueryService.queryIntroTextAsync');

    units = getDistinctHazardCodesFromUnits(units);
    const where = `Hazard IN ('${units.join('\',\'')}')`;
    const outFields = 'Hazard,Text';

    return queryTable(config.urls.hazardIntroTextTable, where, outFields);
};

export const queryGroupingAsync = (units: Units) => {
    // console.log('QueryService.queryGroupingAsync');

    units = getDistinctHazardCodesFromUnits(units);
    const where = `HazardCode IN ('${units.join('\',\'')}')`;
    const outFields = 'HazardCode,HazardGroup';

    return queryTable(config.urls.hazardGroupingsTable, where, outFields);
};

export const queryGroupTextAsync = (groups: Groups) => {
    // console.log('QueryService.queryGroupTextAsync');

    const where = `HazardGroup IN ('${groups.join('\',\'')}')`;
    const outFields = 'HazardGroup,Text';

    // Sort this data according to how you want it to show up in the report.
    // This does not affect the "OtherResources" group which is always at the bottom.
    return queryTable(config.urls.hazardGroupTextTable, where, outFields, 'Order_ ASC');
};

export const queryReportTextTableAsync = () => {
    // console.log('QueryService.queryReportTextTableAsync');

    const where = '1=1';
    const outFields = 'Section,Text';

    return queryTable(config.urls.reportTextTable, where, outFields);
};

export const queryOtherDataTableAsync = async () => {
    // console.log('QueryService.queryOtherDataTable');

    const where = '1=1';
    const outFields = 'Data,Introduction,HowToUse,References_';

    // console.log('asdf', await queryTable(config.urls.otherDataTable, where, outFields));


    return queryTable(config.urls.otherDataTable, where, outFields);
};

// export const queryLidarAsync = async aoi => {
//     const parameters = {
//         geometryType: 'esriGeometryPolygon',
//         geometry: JSON.stringify(aoi),
//         returnGeometry: false,
//         outFields: ['ProjectName', 'AreaName', 'DataAccessURL'],
//         f: 'json'
//     };

//     return await retryPolicy(`${config.urls.lidarExtents}/query?${stringify(parameters)}`,
//         (responseJson) => responseJson.features.map(feature => feature.attributes));
// };

// export const queryAerialAsync = async aoi => {
//     const parameters = {
//         geometryType: 'esriGeometryPolygon',
//         geometry: JSON.stringify(aoi),
//         returnGeometry: false,
//         outFields: ['Agency', 'ProjectYear', 'ProjectCode', 'ProjectName', 'Roll', 'Frame'],
//         f: 'json',
//         orderByFields: 'Agency ASC, ProjectYear DESC, ProjectCode ASC'
//     };

//     const features = await retryPolicy(`${config.urls.aerialImageryCenterPoints}/query?${stringify(parameters)}`,
//         (responseJson) => responseJson.features.map(feature => feature.attributes));
//     const agencies = Array.from(new Set(features.map(feature => feature.Agency)));

//     // mix in agency descriptions from related table
//     const agenciesWhere = `Agency IN ('${agencies.join(',')}')`;
//     const tableResults = await queryTable(config.urls.imageAgenciesTable, agenciesWhere, ['Agency', 'Description']);
//     const descriptionsLookup = {};
//     tableResults.forEach(result => {
//         descriptionsLookup[result.attributes.Agency] = result.attributes.Description;
//     });

//     return features.map(feature => {
//         return {
//             ...feature,
//             Description: descriptionsLookup[feature.Agency]
//         }
//     });
// };
