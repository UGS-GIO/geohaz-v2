import { useContext, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapContext } from '@/context/map-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';

function MapConfigurations() {
  const [coordFormat, setCoordFormat] = useState("Degrees, Minutes, Seconds");
  const { setIsDecimalDegrees } = useContext(MapContext);

  const handleCoordFormatChange = (value: string) => {
    if (value && setIsDecimalDegrees) {
      setCoordFormat(value);
      setIsDecimalDegrees(value === "Decimal Degrees");
    }
  };

  return (
    <>
      <BackToMenuButton />
      <div className="p-4">
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
              value={coordFormat}
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
      </div>
    </>
  );
}

export default MapConfigurations;
