export const getHazardCodeFromUnitCode = (unitCode: string) => {
    return unitCode.slice(-3).toUpperCase();
}

export const getLidarFeatureName = (projectName: string, areaName?: string) => {
    if (areaName) {
        return `${projectName} - ${areaName}`;
    }

    return projectName;
}

export const kebabCase = (str: string) => str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
