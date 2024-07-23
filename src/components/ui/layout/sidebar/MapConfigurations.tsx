import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function MapConfigurations() {
  const [coordFormat, setCoordFormat] = useState("Degrees, Minutes, Seconds");

  const handleCoordFormatChange = (value: string) => {
    if (value) {
      setCoordFormat(value);
    }
  };

  return (
    <div className="p-4 bg-background">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Map Configurations</h3>
      </div>

      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Location Coordinate Format</h4>
        <div className="border border-gray-300 rounded-md p-2">
          <RadioGroup
            value={coordFormat}
            onValueChange={handleCoordFormatChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <div className="flex">
              <RadioGroupItem value="Decimal Degrees" id="decimal-degrees" className="peer sr-only" />
              <Label
                htmlFor="decimal-degrees"
                className="flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-white"
              >
                Decimal Degrees
              </Label>
            </div>
            <div className="flex">
              <RadioGroupItem value="Degrees, Minutes, Seconds" id="dms" className="peer sr-only" />
              <Label
                htmlFor="dms"
                className="flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-white"
              >
                Degrees, Minutes, Seconds
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

export default MapConfigurations;
