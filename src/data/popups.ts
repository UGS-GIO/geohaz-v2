const studyAreasPopup = function (feature: __esri.Feature) {
    let contentS = "";
    contentS += "<span class='bold' title='Name'><b>Name: </b></span>{Name}<br/>";

    function reportIdArraySort(item: string) {
        console.log(item);

        const regexSring = /^\d+$/gm;
        if (regexSring.exec(item)) {
            contentS += "<a href='https://geodata.geology.utah.gov/pages/view.php?ref=" + item + "' target='_blank'>" + item + "</a><br/>";
        } else
            contentS += "<a href='https://doi.org/10.34191/" + item + "' target='_blank'>" + item + "</a><br/>";
    }

    const reportIdString: string = feature.graphic.attributes.Repor_ID;
    if (reportIdString) {
        const idArray = reportIdString.split(',');
        console.log(idArray);

        const idArrayTrimmed = idArray.map((el: string) => el.trim());
        contentS += "<span class='bold' title='Report ID'><b>Report ID: </b></span>";
        idArrayTrimmed.forEach(reportIdArraySort);

    }

    // contentS += "<span class='bold' title='Report ID'><b>Report ID: </b></span>" + "<a href='https://doi.org/10.34191/{Repor_ID}' target='_blank'>{Repor_ID}</a>" + "<br/>";


    const hazardsString = feature.graphic.attributes.Hazard_Name;
    const hazArray = hazardsString.split(',');
    contentS += "<span class='bold' title='Mapped Hazards'><b>Mapped Hazards: </b></span><br/>";
    hazArray.forEach(studyPopupContent);

    function studyPopupContent(item: string) {
        contentS += "&nbsp;&nbsp;• " + item + "<br/>";
    }
    return contentS;
}



// const epicentersPopup = function () {
//     let content = "";


//     content += "<span class='bold' title='Magnitude'><b>Magnitude: </b></span>{Mag}<br/>";


//     content += "<span class='bold' title='Longitude'><b>Longitude: </b></span>{Long}<br/>";

//     content += "<span class='bold' title='Latitude'><b>Latitude: </b></span>{Lat}<br/>";


//     content += "<span class='bold' title='Depth'><b>Depth: </b></span>{Depth} Km <br/>";

//     content += "<span class='bold' title='Date'><b>Date: </b></span>{Date}<br/>";

//     return content;
// }

// const miningepicentersPopup = function (feature: __esri.Feature) {
//     let content = "";

//     content += "<span class='bold' title='Magnitude'><b>Magnitude: </b></span>{Mag}<br/>";

//     content += "<span class='bold' title='Longitude'><b>Longitude: </b></span>{Long}<br/>";

//     content += "<span class='bold' title='Latitude'><b>Latitude: </b></span>{Lat}<br/>";

//     content += "<span class='bold' title='Depth'><b>Depth: </b></span>{Depth} Km <br/>";

//     content += "<span class='bold' title='Date'><b>Date: </b></span>{Date}<br/>";

//     return content;
// }

// qfaultspopup template
const qfaultsPopup = function (feature: __esri.Feature) {
    const div = document.createElement("div");

    if (feature.graphic.attributes.faultzone) {
        div.innerHTML += `
            <span><b>Fault Zone: </b></span>
            <calcite-link id="faultzone-tooltip">${feature.graphic.attributes.faultzone}</calcite-link>
            <calcite-tooltip label="Data disclaimer" reference-element="faultzone-tooltip">
                <span>${feature.graphic.attributes.summary}</span>
            </calcite-tooltip>
            <br>
        `;
    }
    if (feature.graphic.attributes.faultname) {
        div.innerHTML += `<b>Fault Name: </b>${feature.graphic.attributes.faultname}<br>`;
    }
    if (feature.graphic.attributes.sectionname) {
        div.innerHTML += `<b>Section Name: </b>${feature.graphic.attributes.sectionname}<br>`;
    }
    if (feature.graphic.attributes.strandname) {
        div.innerHTML += `<b>Strand Name: </b>${feature.graphic.attributes.strandname}<br>`;
    }
    if (feature.graphic.attributes.faultnum) {
        div.innerHTML += `<b>Structure Number: </b>${feature.graphic.attributes.faultnum}<br>`;
    }
    if (feature.graphic.attributes.mappedscale) {
        div.innerHTML += `<b>Mapped Scale: </b>${feature.graphic.attributes.mappedscale}<br>`;
    }
    if (feature.graphic.attributes.dipdirection) {
        div.innerHTML += `<b>Dip Direction: </b>${feature.graphic.attributes.dipdirection}<br>`;
    }
    if (feature.graphic.attributes.slipsense) {
        div.innerHTML += `<b>Slip Sense: </b>${feature.graphic.attributes.slipsense}<br>`;
    }
    if (feature.graphic.attributes.sliprate) {
        div.innerHTML += `<b>Slip Rate: </b>${feature.graphic.attributes.sliprate}<br>`;
    }
    if (feature.graphic.attributes.faultclass) {
        div.innerHTML += `<b>Structure Class: </b>${feature.graphic.attributes.faultclass}<br>`;
    }
    if (feature.graphic.attributes.faultage) {
        div.innerHTML += `<b>Structure Age: </b>${feature.graphic.attributes.faultage}<br>`;
    }
    if (feature.graphic.attributes.usgs_link) {
        div.innerHTML += `
            <span><b>Detailed Report: </b></span>
            <calcite-link href=${feature.graphic.attributes.usgs_link} icon-end="launch" target="_blank">
                Opens in new tab
            </calcite-link>
        `;
    }

    return div;
}

//qfaults popup code
const poopTemplate =
    (event: __esri.Feature) => {

        const { graphic } = event;
        const containerFaultZone = document.createElement("div");

        if (graphic.attributes.FaultZone) {
            const faultZoneDiv = document.createElement("strong");
            faultZoneDiv.textContent = "Fault Zone Name: ";
            containerFaultZone.appendChild(faultZoneDiv);

            // const faultZoneSum = graphic.attributes.Summary;
            const faultZone = graphic.attributes.FaultZone;
            const faultTip = document.createElement("span");
            faultTip.textContent = faultZone;
            faultTip.style.textDecoration = 'underline';
            faultTip.style.cursor = 'pointer';
            containerFaultZone.appendChild(faultTip);
            // faultTip.onclick = () => {
            //     showHideCalcitePanels("#panelLegend", "#collapseLegend");
            //     query("#faultSum").html(faultZoneSum);
            // };
        }

        if (graphic.attributes.FaultName) {
            const br = document.createElement("br");
            const faultNameDiv = document.createElement('strong');
            faultNameDiv.textContent = "Fault Name: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(faultNameDiv);

            const faultNameValue = graphic.attributes.FaultName;
            const faultNameSpan = document.createElement("span");
            faultNameSpan.textContent = faultNameValue;
            containerFaultZone.appendChild(faultNameSpan);
        }

        if (graphic.attributes.SectionName) {
            const br = document.createElement("br");
            const sectionNameDiv = document.createElement('strong');
            sectionNameDiv.textContent = "Section Name: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(sectionNameDiv);

            const sectionNameValue = graphic.attributes.SectionName;
            const sectionNameSpan = document.createElement("span");
            sectionNameSpan.textContent = sectionNameValue;
            containerFaultZone.appendChild(sectionNameSpan);
        }

        if (graphic.attributes.StrandName) {
            const br = document.createElement("br");
            const strandNameDiv = document.createElement('strong');
            strandNameDiv.textContent = "Strand Name: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(strandNameDiv);

            const strandNameValue = graphic.attributes.StrandName;
            const strandNameSpan = document.createElement("span");
            strandNameSpan.textContent = strandNameValue;
            containerFaultZone.appendChild(strandNameSpan);
        }

        if (graphic.attributes.FaultNum) {
            const br = document.createElement("br");
            const faultNumDiv = document.createElement('strong');
            faultNumDiv.textContent = "Structure Number: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(faultNumDiv);

            const faultNumValue = graphic.attributes.FaultNum;
            const faultNumSpan = document.createElement("span");
            faultNumSpan.textContent = faultNumValue;
            containerFaultZone.appendChild(faultNumSpan);
        }

        if (graphic.attributes.MappedScale) {
            const br = document.createElement("br");
            const mapScaleDiv = document.createElement('strong');
            mapScaleDiv.textContent = "Mapped Scale: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(mapScaleDiv);

            const mapScaleValue = graphic.attributes.MappedScale;
            const mapScaleSpan = document.createElement("span");
            mapScaleSpan.textContent = mapScaleValue;
            containerFaultZone.appendChild(mapScaleSpan);
        }


        if (graphic.attributes.DipDirection) {
            const br = document.createElement("br");
            const dipDirDiv = document.createElement('strong');
            dipDirDiv.textContent = "Dip Direction: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(dipDirDiv);

            const dipDirValue = graphic.attributes.DipDirection;
            const dipDirSpan = document.createElement("span");
            dipDirSpan.textContent = dipDirValue;
            containerFaultZone.appendChild(dipDirSpan);
        }

        if (graphic.attributes.SlipSense) {
            const br = document.createElement("br");
            const slipSenseDiv = document.createElement('strong');
            slipSenseDiv.textContent = "Slip Sense: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(slipSenseDiv);

            const slipSenseValue = graphic.attributes.SlipSense;
            const slipSenseSpan = document.createElement("span");
            slipSenseSpan.textContent = slipSenseValue;
            containerFaultZone.appendChild(slipSenseSpan);
        }

        if (graphic.attributes.SlipRate) {
            const br = document.createElement("br");
            const slipRateDiv = document.createElement('strong');
            slipRateDiv.textContent = "Slip Rate: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(slipRateDiv);

            const slipRatevalue = graphic.attributes.SlipRate;
            const slipRateSpan = document.createElement("span");
            slipRateSpan.textContent = slipRatevalue;
            containerFaultZone.appendChild(slipRateSpan);
        }



        if (graphic.attributes.FaultClass) {
            const br = document.createElement("br");
            const faultClassDiv = document.createElement('strong');
            faultClassDiv.textContent = "Structure Class: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(faultClassDiv);

            const faultClassvalue = graphic.attributes.FaultClass;
            const faultClassSpan = document.createElement("span");
            faultClassSpan.textContent = faultClassvalue;
            containerFaultZone.appendChild(faultClassSpan);
        }

        if (graphic.attributes.FaultAge) {
            const br = document.createElement("br");
            const faultAgeDiv = document.createElement('strong');
            faultAgeDiv.textContent = "Structure Age: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(faultAgeDiv);

            const faultAgevalue = graphic.attributes.FaultAge;
            const faultAgeSpan = document.createElement("span");
            faultAgeSpan.textContent = faultAgevalue;
            containerFaultZone.appendChild(faultAgeSpan);
        }

        if (graphic.attributes.USGS_Link) {
            const br = document.createElement("br");
            const linkDiv = document.createElement('strong');
            linkDiv.textContent = "Detailed Report: ";
            containerFaultZone.appendChild(br);
            containerFaultZone.appendChild(linkDiv);
            const linkvalue = graphic.attributes.USGS_Link;

            const a = document.createElement('a');
            const linkText = document.createTextNode("Opens in new tab");
            a.appendChild(linkText);
            a.title = "Detailed Report";
            a.href = linkvalue;
            a.target = '_blank';
            document.body.appendChild(a);

            containerFaultZone.appendChild(a);
        }

        return containerFaultZone;
    };





const fchPopup = function (feature: __esri.Feature) {
    let content = "";


    if (feature.graphic.attributes.FCHMappedScale) {
        content += "<span class='bold' title='Longitude'><b>Mapped Scale: </b></span>{FCHMappedScale}<br/>";

    }
    return content;
}

const lssPopup = function (feature: __esri.Feature) {
    console.log(feature);
    let content = "";

    content += "<span class='bold' title='Longitude'><b>Description: </b></span>{relationships/3/Description}<br/>";

    content += "<span class='bold' title='Longitude'><b>Mapped Scale: </b></span>{LSSMappedScale}<br/>";

    content += "<span class='bold' title='Longitude'><b>Critical Angle: </b></span>{LSSCriticalAngle}<br/>";

    return content;
}

const landslideSourcePopup = function (feature: __esri.Feature) {
    console.log(feature);
    let content = "";

    if (feature.graphic.attributes.s_name) {
        content += "<span class='bold' title='Longitude'><b>Name: </b></span>{s_name}<br/>";
    }


    if (feature.graphic.attributes.activity) {
        content += "<span class='bold' title='Longitude'><b>Activity: </b></span>{activity}<br/>";
    }


    if (feature.graphic.attributes.confidence) {
        content += "<span class='bold' title='Longitude'><b>Confidence: </b></span>{confidence}<br/>";
    }


    if (feature.graphic.attributes.comments) {
        content += "<span class='bold' title='Longitude'><b>Comments: </b></span>{comments}<br/>";
    }

    if (feature.graphic.attributes.d_h_move1) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement 1: </b></span>{data.d_h_move1}<br/>";
    }


    if (feature.graphic.attributes.d_h_move2) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement 2: </b></span>{data.d_h_move2}<br/>";
    }


    if (feature.graphic.attributes.d_h_move3) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement 3: </b></span>{data.d_h_move3}<br/>";
    }


    if (feature.graphic.attributes.d_geologic_unit1) {
        content += "<span class='bold' title='Longitude'><b>Primary Geologic Unit Involved: </b></span>{d_geologic_unit1}<br/>";
    }


    if (feature.graphic.attributes.d_geologic_unit2) {
        content += "<span class='bold' title='Longitude'><b>Secondary Geologic Unit Involved: </b></span>{d_geologic_unit2}<br/>";
    }

    return content;
}

const landslideDepositPopup = function (feature: __esri.Feature) {
    let content = "";

    if (feature.graphic.attributes.d_material) {
        content += "<span class='bold' title='Longitude'><b>Deposit Material: </b></span>{d_material}<br/>";
    }


    if (feature.graphic.attributes.d_move_type) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement Type: </b></span>{d_move_type}<br/>";
    }


    if (feature.graphic.attributes.d_name) {
        content += "<span class='bold' title='Longitude'><b>Deposit Name: </b></span>{d_name}<br/>";
    }


    if (feature.graphic.attributes.d_thickness) {
        content += "<span class='bold' title='Longitude'><b>Deposit Thickness: </b></span>{d_thickness}<br/>";
    }

    if (feature.graphic.attributes.d_move_dir) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement Direction: </b></span>{d_move_dir}<br/>";
    }


    if (feature.graphic.attributes.d_landform) {
        content += "<span class='bold' title='Longitude'><b>Deposit Landform: </b></span>{d_landform}<br/>";
    }


    if (feature.graphic.attributes.s_name) {
        content += "<span class='bold' title='Longitude'><b>Source Name: </b></span>{s_name}<br/>";
    }
    if (feature.graphic.attributes.activity) {
        content += "<span class='bold' title='Longitude'><b>Deposit Activity: </b></span>{activity}<br/>";
    }


    if (feature.graphic.attributes.confidence) {
        content += "<span class='bold' title='Longitude'><b>Deposit Mapping Confidence: </b></span>{confidence}<br/>";
    }


    if (feature.graphic.attributes.comments) {
        content += "<span class='bold' title='Longitude'><b>Comments: </b></span>{comments}<br/>";
    }

    if (feature.graphic.attributes.d_h_move1) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement 1: </b></span>{d_h_move1}<br/>";
    }


    if (feature.graphic.attributes.d_h_move2) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement 2: </b></span>{d_h_move2}<br/>";
    }


    if (feature.graphic.attributes.d_h_move3) {
        content += "<span class='bold' title='Longitude'><b>Deposit Movement 3: </b></span>{d_h_move3}<br/>";
    }


    if (feature.graphic.attributes.d_geologic_unit1) {
        content += "<span class='bold' title='Longitude'><b>Deposit Geologic Unit 1: </b></span>{d_geologic_unit1}<br/>";
    }


    if (feature.graphic.attributes.d_geologic_unit2) {
        content += "<span class='bold' title='Longitude'><b>Deposit Geologic 2: </b></span>{d_geologic_unit2}<br/>";
    }

    return content;
}

const landslideCompPopup = function (feature: __esri.Feature) {
    console.log(feature);
    let content = "";


    if (feature.graphic.attributes.StateLSID) {
        content += "<span class='bold' title='Longitude'><b>State Landslide ID: </b></span>{StateLSID}<br/>";
    }


    if (feature.graphic.attributes.LSUnit) {
        content += "<span class='bold' title='Longitude'><b>Landslide Unit: </b></span>{LSUnit}<br/>";
    }


    if (feature.graphic.attributes.MoveType != " ") {
        content += "<span class='bold' title='Longitude'><b>Movement Type: </b></span>{MoveType}<br/>";
    }


    if (feature.graphic.attributes.Historical != " ") {
        content += "<span class='bold' title='Longitude'><b>Historical: </b></span>{Historical}<br/>";
    }


    if (feature.graphic.attributes.GeolUnit) {
        content += "<span class='bold' title='Longitude'><b>Geologic Unit: </b></span>{GeolUnit}<br/>";
    }


    if (feature.graphic.attributes.MapScale) {
        content += "<span class='bold' title='Longitude'><b>Map Scale: </b></span>{MapScale}<br/>";
    }


    if (feature.graphic.attributes.MapName) {
        content += "<span class='bold' title='Longitude'><b>Map Name: </b></span>{MapName}<br/>";
    }


    if (feature.graphic.attributes.PubDate) {
        content += "<span class='bold' title='Longitude'><b>Pub Date: </b></span>{PubDate}<br/>";
    }


    if (feature.graphic.attributes.Author_s) {
        content += "<span class='bold' title='Longitude'><b>Author(s): </b></span>{Author_s}<br/>";
    }


    if (feature.graphic.attributes.AffUnit != " ") {
        content += "<span class='bold' title='Longitude'><b>Affiliated Unit: </b></span>{AffUnit}<br/>";
    }


    if (feature.graphic.attributes.MoveUnit != " ") {
        content += "<span class='bold' title='Longitude'><b>Movement Unit: </b></span>{MoveUnit}<br/>";
    }


    if (feature.graphic.attributes.MoveCause != " ") {
        content += "<span class='bold' title='Longitude'><b>Movement Cause: </b></span>{MoveCause}<br/>";
    }


    if (feature.graphic.attributes.Notes != " ") {
        content += "<span class='bold' title='Longitude'><b>Notes: </b></span>{Notes}<br/>";
    }

    return content;
}

export { studyAreasPopup, poopTemplate, fchPopup, lssPopup, landslideSourcePopup, landslideDepositPopup, landslideCompPopup, qfaultsPopup };
