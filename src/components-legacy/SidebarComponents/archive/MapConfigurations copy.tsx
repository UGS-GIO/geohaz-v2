import { useState } from 'react';
import { Link } from '@/shared';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

function MapConfigurations() {
  const [coordFormat, setCoordFormat] = useState("Degrees, Minutes, Seconds");
  const [verticalExaggeration, setVerticalExaggeration] = useState(false);
  const [basemapLabels, setBasemapLabels] = useState(false);

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
        <ToggleGroup
          type="single"
          value={coordFormat}
          onValueChange={handleCoordFormatChange}
          className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2"
        >
          <ToggleGroupItem
            value="Decimal Degrees"
            className={`w-full sm:w-auto flex flex-col items-center justify-center px-4 py-2 border rounded-md ${coordFormat === "Decimal Degrees" ? 'bg-primary text-white' : 'bg-white border-gray-300'
              }`}
          >
            <span>Decimal Degrees</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="Degrees, Minutes, Seconds"
            className={`w-full sm:w-auto flex flex-col items-center justify-center px-4 py-2 border rounded-md ${coordFormat === "Degrees, Minutes, Seconds" ? 'bg-primary text-white' : 'bg-white border-gray-300'
              }`}
          >
            <span>Degrees, Minutes, Seconds</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="mb-4">
        <div className="flex items-center">
          <Checkbox
            checked={verticalExaggeration}
            onChange={() => setVerticalExaggeration(!verticalExaggeration)}
          />
          <label className="ml-2">Toggle Vertical Exaggeration</label>
        </div>
        <p className="text-gray-400 ml-6 text-sm">3D view only</p>
        <div className="flex items-center mt-2">
          <Checkbox
            checked={basemapLabels}
            onChange={() => setBasemapLabels(!basemapLabels)}
          />
          <label className="ml-2">Toggle Basemap Labels</label>
        </div>
      </div>

      <div className="mb-4">
        <Link text="Reload map in 2D mode" href="https://google.com/" />
        <p className="text-gray-400 ml-2 text-sm">3D view only</p>
      </div>
    </div>
  );
}

export default MapConfigurations;
