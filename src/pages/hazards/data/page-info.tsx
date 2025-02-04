import { Link } from "@/components/custom/link";

const appTitle = 'Geologic Hazards Portal';

const references = (
    <div>
        <ul className="list-disc ml-5 space-y-4">
            <li>
                Beukelman, G.S., Erickson, B.E., and Giraud, R.E., 2015, Landslide inventory map of the Sixmile Canyon and North Hollow area, Sanpete County, Utah: Utah Geological Survey Map 273DM, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/M-273DM">
                    M-273DM
                </Link>.
            </li>
            <li>
                Castleton, J.J., Elliott, A.H., and McDonald, G.N., 2011, Geologic hazards of the Magna quadrangle, Salt Lake County, Utah: Utah Geological Survey Special Study 137, 73 p., 10 plates, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-137">
                    SS-137
                </Link>.
            </li>
            <li>
                Castleton, J.J., Elliott, A.H., and McDonald, G.N., 2014, Geologic hazards of the Copperton quadrangle, Salt Lake County, Utah: Utah Geological Survey Special Study 152, 24 p., 10 plates, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-152">
                    SS-152
                </Link>.
            </li>
            <li>
                Castleton, J.J., Erickson, B.A., and Kleber, E.J., 2018, Radon hazard potential of Davis County, Utah: Utah Geological Survey Open-file Report 655, 1 plate, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/OFR-655">
                    OFR-655
                </Link>.
            </li>
            <li>
                Castleton, J.J., Erickson, B.A., and Kleber, E.J., 2018, Geologic hazards of the Moab quadrangle, Grand County, Utah: Utah Geological Survey Special Study 162, 33 p., 13 plates, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-162">
                    SS-162
                </Link>.
            </li>
            <li>
                Castleton, J.J., Erickson, B.A., McDonald, G.N., and Beukelman, G.S., 2018, Geologic Hazards of the Tickville Spring quadrangle, Salt Lake and Utah Counties, Utah: Utah Geological Survey Special Study 163, 25 p., 10 pl., scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-163">
                    SS-163
                </Link>.
            </li>
            <li>
                Giraud, R.E., and McDonald, G.N., 2017, Landslide inventory map of the Ferron Creek area, Sanpete and Emery Counties, Utah: Utah Geological Survey Special Study 161, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-161">
                    SS-161
                </Link>.
            </li>
            <li>
                Knudsen, T.R., and Lund, W.R., 2014, Geologic hazards of the State Route 9 Corridor, La Verkin City to Town of Springdale, Washington County, Utah: Utah Geological Survey Special Study 148, 13 p., 9 plates, GIS data,&nbsp;
                <Link to="https://doi.org/10.34191/SS-148">
                    SS-148
                </Link>.
            </li>
            <li>
                Lund, W.R., Knudsen, T.R., Shaw, L.M., 2008, Geologic hazards and adverse construction conditions, St. George metropolitan area, Washington County, Utah, Utah Geological Survey Special Study 127, 105 p,&nbsp;
                <Link to="https://doi.org/10.34191/SS-127">
                    SS-127
                </Link>.
            </li>
            <li>
                Lund, W.R., Knudsen, T.R., and Sharrow, D.L., 2010, Geologic hazards of the Zion National Park geologic-hazard study area, Washington and Kane Counties, Utah: Utah Geological Survey Special Study 133, 95 p., 9 plates, GIS data,&nbsp;
                <Link to="https://doi.org/10.34191/SS-133">
                    SS-133
                </Link>.
            </li>
            <li>
                McDonald, G.N., and Giraud, R.E., 2011, Landslide inventory map of Twelvemile Canyon, Sanpete County, Utah: Utah Geological Survey Map 247DM, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/M-247DM">
                    M-247DM
                </Link>.
            </li>
            <li>
                McDonald, G.N., and Giraud, R.E., 2014, Landslide inventory map of the 2012 Seeley fire area, Carbon and Emery Counties, Utah: Utah Geological Survey Special Study 153, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-153">
                    SS-153
                </Link>.
            </li>
            <li>
                McDonald, G.N., and Giraud, R.E., 2015, Landslide inventory map for the Upper Muddy Creek area, Sanpete and Sevier Counties, Utah: Utah Geological Survey Special Study 155, scale 1:24,000,&nbsp;
                <Link to="https://doi.org/10.34191/SS-155">
                    SS-155
                </Link>.
            </li>
            <li>
                McDonald, G.N., Kleber, E.J., Hiscock, A.I., Bennett, S.E.K., Bowman, S.D., 2020, Fault trace mapping and surface-fault-rupture special study zone, Utah and Idaho: Utah Geological Survey Report of Investigation 280, 23 p.,&nbsp;
                <Link to="https://doi.org/10.34191/RI-280">
                    RI-280
                </Link>.
            </li>
            <li>
                Hiscock, A.I., Kleber, E.J., Jänecke, S.U., McDonald, G.N., Oaks, R.Q., Jr., and Rittenour, T., 2024, Fault trace mapping and surface-fault-rupture special study zone delineation of the East and West Cache fault zones and other regional faults, Utah: Utah Geological Report of Investigation 286, 27 p., 1 appendix,&nbsp;
                <Link to="https://doi.org/10.34191/RI-286">
                    RI-286
                </Link>
            </li>
        </ul>
    </div>
)

const acknowledgements = (
    <div className="space-y-2">
        <p>
            In 2008, the Utah Geological Survey Geologic Hazards Mapping Initiative was created with funding from the Utah Legislature to map geologic hazards in areas of existing and future development. This mapping is focused on identifying hazards for an entire 7.5′ quadrangle at 1:24,000 scale, instead of single hazard maps of large regional areas. The geologic-hazard maps address hazards associated with earthquakes, landslides, flooding, debris flows, indoor radon, shallow groundwater, rockfall, and problem soils and rocks. The initiative will provide planners, local officials, property owners, developers, engineers, geologists, design professionals, and the interested public with information on the type and location of critical geologic hazards that may impact existing and future development.
        </p>
        <p>
            Hazard mapping is a multidisciplinary cooperative collaboration. We thank Scott Davis, Nathan Kota, Steve Gourley, and Jake Adams with the Utah Automated Geographic Reference Center (AGRC) for assistance and programming in the creation of the online web mapping application. Steve Bowman and Jessica Castleton (UGS) helped develop the schema and reporting format used in the current database. Marshall Robinson, Jay Hill, Martha Jensen (UGS) and Corey Unger (former UGS) did web design and programming for the interactive map. UGS GIS analyst Gordon Douglass contributed substantially at various stages of development of the database. We thank the hazard mappers in the UGS Geologic Hazards Program for providing high quality hazard maps.
        </p>
    </div>
)

const dataDisclaimer = (
    <div className="space-y-2">
        <p>
            Although this product represents the work of professional scientists, the Utah Department of Natural Resources, Utah Geological Survey, makes no warranty, expressed or implied, regarding its suitability for a particular use.      The Utah Department of Natural Resources, Utah Geological Survey, shall not be liable under any circumstances for any direct, indirect, special, incidental, or consequential damages with respect to claims by users of this product. The Utah Geological Survey does not guarantee accuracy or completeness of the data.
        </p>
        <p>
            The Utah Geologic Hazards Database contains geologic hazard information and data from the Utah Geological Survey (UGS) and other sources for the area of interest shown on the interactive map and can be used to identify mapped geologic hazards in an area, understand what the hazards are, and some potential ways to mitigate them.
        </p>
        <p>
            The database is periodically updated to incorporate the results of new mapping and/or updated mapping due to updated data and/or methodology; however, more-detailed fault traces and paleoseismic information may be available in recently published geologic maps and reports, so the database should not be considered exhaustive.
        </p>
        <p>
            Locations of mapped geologic hazards should always be considered approximate.
        </p>
        <p>
            The locational accuracy of hazards on the maps varies, and spatial error can be substantial when viewing structures at high zoom levels that were originally mapped at small scales. Therefore, the locations of hazards on the map should be considered approximate. Depending on the ultimate needs of the user, a site-specific investigation by a qualified Utah-licensed Professional Geologist may be required to accurately characterize the hazards at a particular site.
        </p>
    </div>
);

const mapDetails = (
    <div className='mx-2 space-y-2'>
        <p>
            This Portal is a compilation of data from the Utah Geologic Hazards Database, and contains post-2008 UGS geologic hazard map data and data from other sources for parts of Utah. These data address earthquake, flood, landslide, and problem soil and rock hazards. This web mapping application is intended to provide planners, local government officials, property owners, developers, engineers, geologists, design professionals, and the public with information on the type, location, and relative susceptibility of geologic hazards that may impact existing and future infrastructure and development. The data also provide information that may be used for emergency response and recovery planning and community risk assessment for existing development and infrastructure.
        </p>
        <p>
            Areas with comprehensive geologic hazard map data are shown with red polygons. Statewide data for hazardous (Quaternary age) faults, and a legacy compilation of landslides are also available. Limited, comprehensive geologic hazard map data are available for the remaining hazards listed in the Legend. Hazard map layers can be enabled in the Legend by clicking on the eye symbol. Map layer units describing the hazard relative susceptibility are also shown in the Legend. The absence of data does not imply that no geologic hazard or hazards exist. Additional geologic hazard mapping is on-going and will be added to the database as it is finalized.
        </p>
        <p className="font-bold">
            Database Updated May 2020
        </p>
        <p className="font-bold">
            Related Information
        </p>
        <p>
            For more information, see <Link to="https://geology.utah.gov/hazards/">https://geology.utah.gov/hazards/</Link> or contact the UGS.
        </p>
    </div>
)

const mapDetailsShortened = (
    <p className='text-left text-sm mx-2 font-normal'>
        This Portal is a compilation of data from the Utah Geologic Hazards Database, and contains post-2008 UGS geologic hazard map data and data from other sources for parts of Utah...
    </p>
)

const dataSources = (
    <div className='mx-2 space-y-2'>
        <p>
            The database for the Utah Geologic Hazards Portal contains geologic hazard information and data from the Utah Geological Survey (UGS) and other sources. The database is periodically updated to incorporate the results of new mapping. Detailed geologic hazard mapping is available for limited areas and for specific hazards in Utah and additional mapping is ongoing.
        </p>
        <p>
            The data exists as an attributed geographic information system (GIS) feature class available for download: <Link to="https://geology.utah.gov/docs/zip/Geologic_Hazards_Geodatabase.gdb.zip">GIS Data</Link>
        </p>
        <p>Additionally, users can access full data reports for individual hazards by clicking on the report link in the pop-up window. These reports are not a substitute for a site-specific geologic hazards and geotechnical engineering investigation by a qualified, Utah-licensed consultant. These investigations provide valuable information on the site geologic conditions that may affect or be affected by development, as well as the type and relative susceptibility of geologic hazards at a site and recommend solutions to mitigate the effects and costs of the hazards, both at the time of construction and over the life of the development. See your local city or county building department for details on these investigations and <Link to="https://ugspub.nr.utah.gov/publications/circular/c-122.pdf">UGS Circular 122</Link> for more information.
        </p>
    </div>
)

const dataSourcesShortened = (
    <p className='text-left text-sm mx-2 font-normal'>
        The database for the Utah Geologic Hazards Portal contains geologic hazard information and data from the Utah Geological Survey (UGS) and other sources....
    </p>
)

export { references, acknowledgements, dataDisclaimer, mapDetails, mapDetailsShortened, dataSources, dataSourcesShortened, appTitle };