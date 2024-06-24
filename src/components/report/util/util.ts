export const getHazardCodeFromUnitCode = (unitCode: string) => {
    return unitCode.slice(-3).toUpperCase();
}

export const getLidarFeatureName = (projectName: string, areaName?: string) => {
    if (areaName) {
        return `${projectName} - ${areaName}`;
    }

    return projectName;
}
