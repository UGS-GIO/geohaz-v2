import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { SearchCombobox } from '@/components/sidebar/filter/search-combobox';
import { ENERGY_MINERALS_WORKSPACE, PROD_GEOSERVER_URL, PROD_POSTGREST_URL, wellWithTopsLayerName } from '@/pages/ccus/data/layers';

function MapConfigurations() {
  const { setIsDecimalDegrees, locationCoordinateFormat } = useMapCoordinates();

  const handleCoordFormatChange = (value: string) => {
    if (value && setIsDecimalDegrees) {
      setIsDecimalDegrees(value === "Decimal Degrees");
    }
  };
  // Fault search configuration
  const searchConfig1 = {
    postgrest: {
      url: PROD_POSTGREST_URL,
      functionName: "search_fault_data",
      searchTermParam: "search_term",
      searchKeyParam: "search_key",
      displayField: "concatnames"
    },
    geoserver: {
      url: PROD_GEOSERVER_URL,
      workspace: ENERGY_MINERALS_WORKSPACE,
      layer: wellWithTopsLayerName,
      filterField: "hascore"
    },
    placeholder: "Search wells...",
    // buttonWidth: "w-[350px]"
  };

  const searchConfig = [
    {
      postgrest: {
        url: `${PROD_POSTGREST_URL}/${wellWithTopsLayerName}`,
        params: {
          targetField: 'wellname', // just return wellname column
          displayField: 'wellname',
        },
        headers: {
          'accept-profile': 'emp',
        }
      },
    },
  ];

  return (
    <>
      <BackToMenuButton />
      <div className='space-y-2'>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Map Configurations</h3>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              Location Coordinate Format
            </CardTitle>
            {/* <CardDescription>Choose a coordinate format to toggle between decimal degrees and degrees, minutes, seconds.</CardDescription> */}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={locationCoordinateFormat}
              onValueChange={handleCoordFormatChange}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              <div className="flex">
                <RadioGroupItem value="Decimal Degrees" id="decimal-degrees" className="peer sr-only" />
                <Label
                  htmlFor="decimal-degrees"
                  className="flex flex-1 items-center justify-center rounded-sm bg-popover p-3 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground"
                >
                  Decimal Degrees
                </Label>
              </div>
              <div className="flex">
                <RadioGroupItem value="Degrees, Minutes, Seconds" id="dms" className="peer sr-only" />
                <Label
                  htmlFor="dms"
                  className="flex flex-1 items-center justify-center rounded-sm bg-popover p-3 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground"
                >
                  Degrees, Minutes, Seconds
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Filter by
            </CardTitle>
          </CardHeader>
          <CardContent>

            <SearchCombobox
              config={searchConfig}
              onSearchSelect={(searchResult) => {
                // Handle the PostgREST search result
                console.log('Search result:', searchResult);
              }}
              onFeatureSelect={(feature) => {
                if (feature) {
                  console.log('Selected feature:', feature);
                }
              }}
            />
          </CardContent>
        </Card>



      </div>
    </>
  );
}

export default MapConfigurations;
