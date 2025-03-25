import { Link } from "@/components/custom/link";

const appTitle = 'Utah Mineral Resources: Metals and Industrial Minerals';

const references = (
    <div>
        <li>AmphibiaWeb, 2018, AmphibiaWeb: Berkeley, California, University of California, online,<a href="https://amphibiaweb.org/">https://amphibiaweb.org/</a>, accessed January 2018.</li>
        <li>Green, D.M., Weir, L.A., Casper, G.S., and Lannoo, M., 2014, North American amphibians− distribution and diversity: Berkeley, University of California Press, 600 p.</li>
        <li>IUCN, 2017, The IUCN Red List of Threatened Species−version 2017-3: online,<a href="http://www.iucnredlist.org"> http://www.iucnredlist.org</a>, accessed March 2018.</li>
        <li>Menuz, 2015, Landscape integrity model for Utah’s wetlands: Salt Lake City, Utah Geological Survey, 50 p., available <a href="https://geodata.geology.utah.gov/pages/search.php?search=!list15236&amp;order_by=date&amp;sort=DESC&amp;offset=0&amp;archive=0&amp;sort=DESC&amp;k=">online</a>. </li>
        <li>Utah Conservation Data Center, 2017, Utah’s state listed species by county: Online,<a href="https://dwrcdc.nr.utah.gov/ucdc/ViewReports/sslist.htm">https://dwrcdc.nr.utah.gov/ucdc/ViewReports/sslist.htm</a>, accessed March 2018.</li>
        <li>U.S. Fish and Wildlife Service (2009), A system for mapping riparian areas in the western United States: Arlington, 43 p.</li>
        <li>U.S. Geological Survey, 2014, National amphibian atlas−version number 3.0: Laurel, Maryland, Patuxent Wildlife Research Center: Online,<a href="http://www.pwrc.usgs.gov/naa">www.pwrc.usgs.gov/naa</a>, accessed March 2018.</li>
        {/* <ul className="list-disc ml-5 space-y-4">
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
        </ul> */}
        lorem ipsum fill this in
    </div>
)

const acknowledgments = (
    <div className="space-y-2">
        <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius ipsa ipsam adipisci? Amet reprehenderit veritatis sint voluptate repellendus temporibus dolorem debitis placeat earum necessitatibus, quisquam illum facilis assumenda enim quia?
        </p>
        <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius ipsa ipsam adipisci? Amet reprehenderit veritatis sint voluptate repellendus temporibus dolorem debitis placeat earum necessitatibus, quisquam illum facilis assumenda enim quia?
        </p>
    </div>
)

const dataDisclaimer = (
    <div className="space-y-2">
        <p>This product represents a compilation of information from both the Utah Geological Survey and external sources. The Utah Department of Natural Resources, Utah Geological Survey, makes no warranty, expressed or implied, regarding its suitability for a particular use. The Utah Department of Natural Resources, Utah Geological Survey, shall not be liable under any circumstances for any direct, indirect, special, incidental, or consequential damages with respect to claims by users of this product.</p>
        <p>Wetlands spatial data were produced from a combination of aerial imagery examination and on-the-ground assessment and are not meant to be used as the basis for a jurisdictional wetland delineation. Wetlands across much of the state were mapped in the 1980s at a coarse resolution; some wetlands may have been inadvertently omitted and other wetlands may no longer exist or may not be considered jurisdictional. Please contact your local U.S. Army Corps of Engineers office if you are unsure of the status of a wetland on your property.</p>
        <p>County-level data on species’ ranges were compiled from the Utah Conservation Data Center (2017) and the National Amphibian Atlas (U.S. Geological Survey, 2014); however, species may be found outside of the listed counties, elevation ranges, and habitat types.</p>
    </div>
);

const mapDetails = (
    <div className='mx-2 space-y-2'>
        <p>
            The Utah Geological Survey (UGS) conducts wetland mapping and wetland field assessment projects across Utah. All UGS mapping projects follow the National Wetland Inventory (NWI) standards developed by the U.S. Fish and Wildlife Service, and recent projects also include riparian mapping. Mapping is conducted primarily by reviewing aerial imagery and cannot be used as the basis for a jurisdictional wetland delineation. This map contains data from NWI that is up-to-date as of November 12, 2024. Wetland field assessment data and links to reports can be found under the Wetland Field Studies section of the application. Landscape Data show patterns of wetland abundance, ownership, and condition at multiple spatial scales. See <a href="#" id="openData"> Database Contents</a> for more information about the data in this map.
        </p>
        <p>
            <strong>Contact</strong>
        </p>
        <p>
            <ul>
                <li><a href="mailto:pgoodwin@utah.gov">Peter Goodwin </a>- 801.537.3130</li>
            </ul>
        </p>
        <p><strong>Links to Related Information</strong></p>
        <p><ul>
            <li><a href="https://geology.utah.gov/water/wetlands/">UGS Wetland Webpages</a> for information on wetlands and UGS wetland research</li>
            <li><a href="https://www.fws.gov/wetlands/Data/Data-Download.html">National Wetlands Inventory</a> for downloads of the original NWI data</li>
            <li><a href="http://www.spk.usace.army.mil/Missions/Regulatory/Contacts/Contact-Your-Local-Office/">U.S. Army Corps of Engineers District Offices</a> for information about wetland regulations and jurisdictional wetland delineations</li>
            <li><a href="https://www.spk.usace.army.mil/Missions/Regulatory/Contacts/Wetland-Consultants/">U.S. Army Corps Wetland Consultants List</a> for a list of consultants that can conduct wetland delineations</li>
        </ul>
        </p>
    </div>
)

const mapDetailsShortened = (
    <p className='text-left text-sm mx-2 font-normal'>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius ipsa ipsam adipisci? Amet reprehenderit veritatis sint voluptate repellendus temporibus dolorem debitis placeat earum necessitatibus, quisquam illum facilis assumenda enim quia?
    </p>

)

const dataSources = (
    <div className='mx-2 space-y-2'>
        <p>
            <strong>
                Utah Mineral Occurance System (UMOS) (<Link to="https://ugspub.nr.utah.gov/publications/open_file_reports/ofr-757/ofr-757.zip">data</Link>, <Link to="https://ugspub.nr.utah.gov/publications/open_file_reports/ofr-757/ofr-757.pdf">report</Link>)
            </strong>
        </p>
        <p className="pl-4">
            A database of mineral occurrences, prospects, mines, and mineral resources in the state of Utah.
        </p>
        <p>
            <strong>
                Critical Mineral Occurrences (<Link to="https://ugspub.nr.utah.gov/publications/circular/c-135.pdf">publication</Link>, <Link to="https://geology.utah.gov/apps/blm_mineral/appfiles/Utah_Critical_Minerals.gdb.zip">current GIS data</Link>, <Link to="https://geology.utah.gov/apps/blm_mineral/appfiles/Utah_CriticalMinerals.gdb.zip">old GIS data</Link>)
            </strong>
        </p>
        <p className="pl-4">
            Locations in Utah with critical mineral potential and of known critical mineral occurrences. Definition of critical mineral is based on the <Link to="https://www.federalregister.gov/documents/2022/02/24/2022-04027/2022-final-list-of-critical-minerals">2022 list published by the U.S. Geological Survey.</Link>.
        </p>
        <p>
            <strong>
                Mining Districts (<Link to="https://ugspub.nr.utah.gov/publications/open_file_reports/ofr-695.pdf">publication</Link>, <Link to="https://geology.utah.gov/apps/blm_mineral/appfiles/Mining_Districts_20190116gdb.zip">GIS data</Link>)
            </strong>
        </p>
        <p className="pl-4">
            Locations of Utah’s mining districts with summaries of relevant information for each district.
        </p>
        <p>
            <strong>
                Industrial Mineral Resource Potential (<Link to="https://ugspub.nr.utah.gov/publications/circular/c-135.pdf">publication</Link>, <Link to="https://geology.utah.gov/apps/blm_mineral/appfiles/Utah_IM_GIS.zip">download</Link>)
            </strong>
        </p>
        <p className="pl-4">
            Resource potential for various locatable industrial mineral commodities.
        </p>
        <p>
            <strong>
                U.S. Bureau of Mines Wilderness Study Area (WSA) Mineral Land Assessment
            </strong>
        </p>
        <p className="pl-4">
            Mineral resource assessment reports of BLM Wilderness Study Areas prepared by the U.S. Bureau of Mines.
        </p>
    </div>
)

const dataSourcesShortened = (
    <p className='text-left text-sm mx-2 font-normal'>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis laudantium veniam nisi harum et, repellendus necessitatibus ea sapiente assumenda placeat vero, sint quasi quibusdam odit, cum exercitationem rem totam quod!
    </p>
)

export { references, acknowledgments, dataDisclaimer, mapDetails, mapDetailsShortened, dataSources, dataSourcesShortened, appTitle };