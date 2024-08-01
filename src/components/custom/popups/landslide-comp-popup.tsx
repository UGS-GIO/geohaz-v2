import React from 'react';

const LandslideCompPopup: React.FC<{ graphic: __esri.Graphic }> = ({ graphic }) => {
    const { attributes } = graphic;

    return (
        <div className="space-y-2">
            {attributes.StateLSID && (
                <div className="font-semibold">
                    <span className="font-bold">State Landslide ID: </span>{attributes.StateLSID}
                </div>
            )}
            {attributes.LSUnit && (
                <div className="font-semibold">
                    <span className="font-bold">Landslide Unit: </span>{attributes.LSUnit}
                </div>
            )}
            {attributes.MoveType && attributes.MoveType.trim() !== "" && (
                <div className="font-semibold">
                    <span className="font-bold">Movement Type: </span>{attributes.MoveType}
                </div>
            )}
            {attributes.Historical && attributes.Historical.trim() !== "" && (
                <div className="font-semibold">
                    <span className="font-bold">Historical: </span>{attributes.Historical}
                </div>
            )}
            {attributes.GeolUnit && (
                <div className="font-semibold">
                    <span className="font-bold">Geologic Unit: </span>{attributes.GeolUnit}
                </div>
            )}
            {attributes.MapScale && (
                <div className="font-semibold">
                    <span className="font-bold">Map Scale: </span>{attributes.MapScale}
                </div>
            )}
            {attributes.MapName && (
                <div className="font-semibold">
                    <span className="font-bold">Map Name: </span>{attributes.MapName}
                </div>
            )}
            {attributes.PubDate && (
                <div className="font-semibold">
                    <span className="font-bold">Pub Date: </span>{attributes.PubDate}
                </div>
            )}
            {attributes.Author_s && (
                <div className="font-semibold">
                    <span className="font-bold">Author(s): </span>{attributes.Author_s}
                </div>
            )}
            {attributes.AffUnit && attributes.AffUnit.trim() !== "" && (
                <div className="font-semibold">
                    <span className="font-bold">Affiliated Unit: </span>{attributes.AffUnit}
                </div>
            )}
            {attributes.MoveUnit && attributes.MoveUnit.trim() !== "" && (
                <div className="font-semibold">
                    <span className="font-bold">Movement Unit: </span>{attributes.MoveUnit}
                </div>
            )}
            {attributes.MoveCause && attributes.MoveCause.trim() !== "" && (
                <div className="font-semibold">
                    <span className="font-bold">Movement Cause: </span>{attributes.MoveCause}
                </div>
            )}
            {attributes.Notes && attributes.Notes.trim() !== "" && (
                <div className="font-semibold">
                    <span className="font-bold">Notes: </span>{attributes.Notes}
                </div>
            )}
        </div>
    );
};

export default LandslideCompPopup;
