import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { Switch } from '@/components/ui/switch';
import { useReload3d } from '@/hooks/use-reload-3d';

function MapConfigurations() {
  const { setIsDecimalDegrees, locationCoordinateFormat } = useMapCoordinates();
  const { is3d, setIs3d } = useReload3d();

  const handleCoordFormatChange = (value: string) => {
    if (value && setIsDecimalDegrees) {
      setIsDecimalDegrees(value === "Decimal Degrees");
    }
  };

  const handleOnCheckedChange = () => (checked: boolean) => {
    setIs3d(checked);
  };

  return (
    <>
      <BackToMenuButton />
      <div>
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
              Reload in {!is3d ? "3D" : "2D"}
            </CardTitle>
            {/* <CardDescription>Choose a coordinate format to toggle between decimal degrees and degrees, minutes, seconds.</CardDescription> */}
          </CardHeader>
          <CardContent>
            {/* reload 3d switch */}
            <div className="flex">
              <Switch
                checked={is3d}
                onCheckedChange={handleOnCheckedChange()}
                aria-label="Toggle 3d reload"
                className="data-[state=unchecked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default MapConfigurations;
