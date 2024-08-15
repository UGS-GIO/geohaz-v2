import React from 'react';

const StudyAreasPopup: React.FC<{ graphic: __esri.Graphic }> = ({ graphic }) => {
    const { attributes } = graphic;

    const reportIdArraySort = (item: string) => {
        const regexString = /^\d+$/gm;
        if (regexString.exec(item)) {
            return (
                <a
                    href={`https://geodata.geology.utah.gov/pages/view.php?ref=${item}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    {item}
                </a>
            );
        }
        return (
            <a
                href={`https://doi.org/10.34191/${item}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                {item}
            </a>
        );
    };

    const reportIdString: string = attributes.Repor_ID;
    const reportIds = reportIdString ? reportIdString.split(',').map(el => el.trim()) : [];

    const hazardsString: string = attributes.Hazard_Name;
    const hazards = hazardsString ? hazardsString.split(',').map(el => el.trim()) : [];

    return (
        <div className="space-y-1">
            <div className="font-semibold" title="Name">
                <span className="font-bold">Name: </span>{attributes.Name}
            </div>
            {reportIds.length > 0 && (
                <div className="font-semibold" title="Report ID">
                    <span className="font-bold">Report ID: </span>
                    {reportIds.map((reportId, index) => (
                        <div key={index}>
                            {reportIdArraySort(reportId)}
                        </div>
                    ))}
                </div>
            )}
            {hazards.length > 0 && (
                <div className="font-semibold" title="Mapped Hazards">
                    <span className="font-bold">Mapped Hazards: </span>
                    <ul className="list-disc ml-5">
                        {hazards.map((hazard, index) => (
                            <li key={index}>{hazard}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export { StudyAreasPopup };
