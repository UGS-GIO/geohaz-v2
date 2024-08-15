import React from 'react';

const LandslideSourcePopup: React.FC<{ graphic: __esri.Graphic }> = ({ graphic }) => {
    const { attributes } = graphic;

    return (
        <div className="space-y-1">
            {attributes.s_name && (
                <div className="font-semibold">
                    <span className="font-bold">Name: </span>{attributes.s_name}
                </div>
            )}
            {attributes.activity && (
                <div className="font-semibold">
                    <span className="font-bold">Activity: </span>{attributes.activity}
                </div>
            )}
            {attributes.confidence && (
                <div className="font-semibold">
                    <span className="font-bold">Confidence: </span>{attributes.confidence}
                </div>
            )}
            {attributes.comments && (
                <div className="font-semibold">
                    <span className="font-bold">Comments: </span>{attributes.comments}
                </div>
            )}
            {attributes.d_h_move1 && (
                <div className="font-semibold">
                    <span className="font-bold">Deposit Movement 1: </span>{attributes.d_h_move1}
                </div>
            )}
            {attributes.d_h_move2 && (
                <div className="font-semibold">
                    <span className="font-bold">Deposit Movement 2: </span>{attributes.d_h_move2}
                </div>
            )}
            {attributes.d_h_move3 && (
                <div className="font-semibold">
                    <span className="font-bold">Deposit Movement 3: </span>{attributes.d_h_move3}
                </div>
            )}
            {attributes.d_geologic_unit1 && (
                <div className="font-semibold">
                    <span className="font-bold">Primary Geologic Unit Involved: </span>{attributes.d_geologic_unit1}
                </div>
            )}
            {attributes.d_geologic_unit2 && (
                <div className="font-semibold">
                    <span className="font-bold">Secondary Geologic Unit Involved: </span>{attributes.d_geologic_unit2}
                </div>
            )}
        </div>
    );
};

export { LandslideSourcePopup };
