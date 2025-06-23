import { Link } from "@/components/custom/link";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const appTitle = 'Utah Wetland Plant Application';

const references = (
    <ul className="list-disc ml-5 space-y-4">
    </ul>
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
        <p>
            This product represents a compilation of information from both the Utah Geological Survey and external sources. The Utah Department of Natural Resources, Utah Geological Survey, makes no warranty, expressed or implied, regarding its suitability for a particular use. The Utah Department of Natural Resources, Utah Geological Survey, shall not be liable under any circumstances for any direct, indirect, special, incidental, or consequential damages with respect to claims by users of this product.
        </p>
        <p>
            Wetlands spatial data were produced from a combination of aerial imagery examination and on-the-ground assessment and are not meant to be used as the basis for a jurisdictional wetland delineation. Wetlands across much of the state were mapped in the 1980s at a coarse resolution; some wetlands may have been inadvertently omitted and other wetlands may no longer exist or may not be considered jurisdictional. Please contact your local U.S. Army Corps of Engineers office if you are unsure of the status of a wetland on your property.
        </p>
        <p>
            County-level data on species’ ranges were compiled from the Utah Conservation Data Center (2017) and the National Amphibian Atlas (U.S. Geological Survey, 2014); however, species may be found outside of the listed counties, elevation ranges, and habitat types.
        </p>
    </div>
);

const mapDetails = (
    <div className='mx-2 space-y-2'>
      <p>The Wetland Plant Application is a tool that allows users to query, view, and download plant community composition data from Utah's wetlands. Some potential uses of the data include evaluating threats posed by noxious weed species, developing watershed-based species lists to ensure that regionally appropriate species are used in restoration activities, and identifying reference sites to use when setting mitigation standards. Data can also be used to support research on Utah's wetlands to better understand these systems.</p>

      <p>Each site is linked to a list of plant species observed at the site and their associated percent cover, using scientific and common names from <Link to="https://plants.sc.egov.usda.gov/" >USDA Plants</Link>. Plant data were collected by multiple organizations using a variety of methods. Wetlands for the sake of this application include any system considered to be wetland by the contributing organizations and include features such as aquatic beds and unvegetated mudflats and playas that may not meet regulatory definitions of wetlands. Some private landowners requested that the exact site location for sites on their property remain confidential. Therefore, the location of these sites is randomly assigned within the vicinity of the actual site. Data from these sites still show up in the query results. Though only data from reputable sources were included in this application, we make no guarantees about the accuracy of plant identification.</p>

      <p>Data can be queried in four main ways. First, you can click on individual sites to see site attributes and associated plant species. Second, you can query by species to see a list of sites where a particular species was found. Third, you can query by site attributes to either obtain a list of sites having those attributes or a summary list of all species found at sites having those attributes. Data can be queried by major ecoregion, <a href="#wetland-classification">wetland class</a>, watershed, and <a href="#vegetation-condition">condition class</a>. For example, you could obtain a list of all playa wetlands in the Jordan watershed that were considered reference condition or you could obtain a list of all species known from wet meadows in montane valleys. Last, you can use the Select features by polygon tool (upper left under the compass) to generate a list of sites that fall within a polygon you draw on the map.</p>

      <p>Click on the three horizontal bars on the upper left to start exploring Utah's wetlands.</p>

      <p id="vegetation-condition">Please contact <Link to="mailto:beckad@utah.gov">Becka Downard</Link> (801-537-3319) with questions or if you are interested in contributing data.</p>
    </div>
)

const mapDetailsShortened = (
    <p className='text-left text-sm mx-2 font-normal'>
        The Utah Geological Survey (UGS) conducts wetland mapping and wetland field assessment projects across Utah. All UGS mapping projects follow the National Wetland Inventory (NWI) standards developed by the U.S. Fish and Wildlife Service, and recent projects also include riparian mapping.
    </p>

)

const centralBasinsTable = [    
    { 
        title: "Shallow Water",
        description: "Wetland consistently flooded with shallow water &lt;1-m deep and very sparsely vegetated (=2% cover)."
    },
    {
        title: "Aquatic Bed",
        description: "Wetland dominated by submergent or floating aquatic vegetation, typically with =10% cover of emergents."
    },
    {
        title: "Marsh",
        description: "Wetland dominated by emergent forbs and graminoids and frequently inundated with water =15 cm in depth, and typically saturated when not inundated, though water depths may vary throughout the year depending on climate conditions and management."
    },
    {
        title: "Mudflat",
        description: "Wetland dominated by emergent forbs and graminoids and characterized by cycles of inundation and drying from adjacent lakes or artificial impoundments."
    },
    {
        title: "Saline Meadow",
        description: "Wetland dominated by highly saline-tolerant emergent forbs and graminoids, typically including Distichlis spicata (saltgrass). Sites frequently supported by high groundwater or shallow inundation of a few centimeters."
    },
    {
        title: "Fresh Meadow",
        description: "Wetland dominated by emergent forbs and graminoids that vary in their salinity tolerance. Sites frequently supported by high groundwater or shallow inundation of a few centimeters."
    },
    {
        title: "Forested-Shrubland",
        description: "Wetland dominated by woody species, typically with =20% woody species cover, and frequently found along streams and rivers."
    },
    {
        title: "Playa",
        description: "Wetland with saline soils frequently either sparsely vegetated, dominated by annual species, or dominated by saline-tolerant woody perennials such as Allenrolfea occidentalis (iodinebush)."
    }
]

const wasachUintaTable = [    
    {
        title: "Aquatic Bed",
        description: "Wetland dominated by submergent or floating aquatic vegetation, typically with =10% cover of emergents.",
        levelIV: "all ecoregions"  
    },
    {           
        title: "Marsh",
        description: "Wetland dominated by emergent forbs and graminoids and frequently inundated with water =15 cm in depth, and typically saturated when not inundated, though water depths may vary throughout the year depending on climate conditions and management." ,
        levelIV: "all ecoregions"
    },
    {        
        title: "Wet Meadow (Valley/Foothill)",
        description: "Wetland dominated by emergent forbs and graminoids, typically with =10% cover of woody species. Sites frequently supported by high groundwater or shallow inundation of a few centimeters.",
        levelIV: "Mountain Valleys, Semiarid Foothills, Foothill Shrublands and Low Mountains"
    },
    {        
        title: "Wet Meadow (Plateaus)",
        description: "same",
        levelIV: "High Plateaus"
    },
    {        
        title: "Wet Meadow (Montane)",     
        description: "same",
        levelIV: "Wasatch Montane Zone"
    },          
    {        
        title: "Wet Meadow (Subalpine)",
        description: "same",
        levelIV: "Mid-Elevation Uinta Mountains, Uinta Subalpine Forests, Alpine Zone"
    },
    {        
        title: "Shrubland (Valley/Foothills)", 
        description: "Wetland dominated by shrubs, typically with ≥25% cover of shrubs and higher shrub cover than tree cover.",
        levelIV: "Mountain Valleys, Semiarid Foothills, Foothill Shrublands and Low Mountains"
    },
    {        
        title: "Shrubland (Montane/Plateaus)",
        description: "same",
        levelIV: "Wasatch Montane Zone"
    },
    {        
        title: "Shrubland (Subalpine)",    
        description: "same",
        levelIV: "Mid-Elevation Uinta Mountains, Uinta Subalpine Forests, Alpine Zone"
    },  
    {       
         title: "Woodland",
        description: "Wetland dominated by tree species, typically with =30% cover of trees.",
        levelIV: "all ecoregions"
    }
]


const dataSources = (
    <div className='mx-2 space-y-2'>
      <h4 id="wetland-classification"><strong>WETLAND CLASSIFICATION</strong></h4>
      <p>Wetland types are presented by <Link to="https://www.epa.gov/eco-research/ecoregions" >ecoregion</Link>, areas where ecosystems are generally similar based on patterns in geology, landforms, soils, vegetation, climate, land use, wildlife, and hydrology. Ecoregions are hierarchically arranged at four levels with 2 level I ecoregions, 3 level II ecoregions, 7 level III ecoregions, and 36 level IV ecoregions in Utah. Three level III ecoregions make up more than 95% of Utah, including the Central Basin and Range, the Wasatch and Uinta Mountains, and the Colorado Plateau. The majority of wetland survey data contributed to this application to date have been from the Central Basin and Range and Wasatch and Uinta Mountains ecoregions, so wetland classes for now focus on those two ecoregions only. Within each ecoregion, wetland sites are further classified based on factors such as dominant overstory life form (herbaceous, shrub, tree), water regime, and landscape position. For the Wasatch and Uinta Mountains, we also use level IV ecoregions as a factor in the classification. Sites with substantial mixing of two wetland types are assigned both a primary and secondary wetland type.</p>

      <h4><strong>Central Basin and Range</strong></h4>
      <p>Data from 204 sites surveyed in the Central Basin and Range by the UGS between 2013 and 2018 were used to develop seven initial wetland classes that take into account dominant overstory life form, water regime, salinity tolerance, and landscape position. More information about the initial development of the Central Basin and Range classes can be found <Link to="https://geodata.geology.utah.gov/pages/view.php?ref=63232" >here</Link>. After the initial development, we separated meadows into saline meadow and fresh meadow classes and narrowed our definition of mudflats.</p>

        <Table>
            <TableCaption>A list of wetland classes and their descriptions.</TableCaption>
            <TableHeader>
                <TableRow>
                <TableHead>Wetland Class</TableHead>
                <TableHead>Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {centralBasinsTable.map((item, index) => (
                <TableRow key={index}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>      

      <h4><strong>Wasatch and Uinta Mountains (including Wyoming Basin)</strong></h4>
      <p>We classified wetland sites in the Wasatch and Uinta Mountains and Wyoming Basin ecoregions into ten classes based on the UGS's analysis of wetland vegetation in this region. The classification is based on dominant overstory life form, water regime, and location within level IV ecoregions.</p>

        <Table>
            <TableCaption>A list of wetland classes and their descriptions.</TableCaption>
            <TableHeader>
                <TableRow>
                <TableHead>Wetland Class</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Level IV Ecoregion(s)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {wasachUintaTable.map((item, index) => (
                <TableRow key={index}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.levelIV}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>

      <h4 id="vegetation-condition"><strong>VEGETATION CONDITION</strong></h4>
      <p>Sites were assigned vegetation condition classes based solely on plant community composition data. "High quality reference" sites are sites with the most intact plant communities for a particular wetland class, regardless of the degree of landscape disturbance adjacent to these sites or whether other stressors are present. Plant community intactness was evaluated using species-specific conservatism values (C-values). C-values between 1 and 10 are assigned to species based on their association with disturbance through a combination of best professional judgment, literature review, and/or field observations. Low values indicate that species are usually found at disturbed sites, high values indicate that species are associated with pristine sites, and values in the middle indicate that species may be found equally at either type of site. All non-native species are assigned a C-value of 0. We used C-values to calculate cover-weighted mean C for each site, which is the average C-value for all species at a site, weighted by the cover of each species.</p>

      <p>"High quality reference" sites are those sites with a cover-weighted mean C (CW Mean C) value within the top 25% of sites for the wetland class, using all data available in December 2024. Sites with &gt;25% cover by species lacking C-values were classified as "not enough data." We did not classify any sites as reference for aquatic bed wetlands or sites with wetland classes having &lt;10 sites; these sites were all classified as "not enough data." Sites with two wetland types were considered reference if they met or exceeded the cover-weighted mean C thresholds for both types.</p>
    
    </div>
)


const dataSourcesShortened = (
    <p className='text-left text-sm mx-2 font-normal'>
        Data sources for this application include wetland and riparian mapping, hydric soils, landscape data, wetland assessments, stressors, species ranges, and land ownership, compiled from state and federal agencies, field studies, and geospatial analyses.
    </p>
)

export { references, acknowledgments, dataDisclaimer, mapDetails, mapDetailsShortened, dataSources, dataSourcesShortened, appTitle };