<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor 
    xmlns="http://www.opengis.net/sld" 
    xmlns:sld="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.0.0">
  
  <!-- Primary FeatureTypeStyle: Dynamic map rendering -->
  <sld:NamedLayer>
    <sld:Name>PointLayer</sld:Name>
    <sld:UserStyle>
      <sld:Title>Storage Cost and Capacity Style with Border</sld:Title>
      
      <!-- Dynamic styling for map display -->
      <sld:FeatureTypeStyle>
      
        <!-- Rule 1: Green: storage_cost_doll_per_tco2 between 6.387 and 11.795 -->
        <sld:Rule>
          <sld:Name>Green (6.387 - 11.795)</sld:Name>
          <sld:Title>Storage Cost (6.3 - 11.8 $/tCO₂)</sld:Title>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>6.386</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>11.795</ogc:Literal>
              </ogc:PropertyIsLessThan>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#00FF00</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>capacity_mtco2</ogc:PropertyName>
                  <ogc:Literal>4.719877</ogc:Literal>
                  <ogc:Literal>10</ogc:Literal>
                  <ogc:Literal>5764.043791</ogc:Literal>
                  <ogc:Literal>60</ogc:Literal>
                </ogc:Function>
              </sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        
        <!-- Rule 2: Yellow: storage_cost_doll_per_tco2 between 11.795 and 21.640 -->
        <sld:Rule>
          <sld:Name>Yellow (11.795 - 21.640)</sld:Name>
          <sld:Title>Storage Cost (11.80 - 21.64 $/tCO₂)</sld:Title>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>11.795</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>21.640</ogc:Literal>
              </ogc:PropertyIsLessThan>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#FFFF00</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>capacity_mtco2</ogc:PropertyName>
                  <ogc:Literal>4.719877</ogc:Literal>
                  <ogc:Literal>10</ogc:Literal>
                  <ogc:Literal>5764.043791</ogc:Literal>
                  <ogc:Literal>60</ogc:Literal>
                </ogc:Function>
              </sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        
        <!-- Rule 3: Orange: storage_cost_doll_per_tco2 between 21.640 and 35.451 -->
        <sld:Rule>
          <sld:Name>Orange (21.640 - 35.451)</sld:Name>
          <sld:Title>Storage Cost (21.64 - 35.45 $/tCO₂)</sld:Title>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>21.640</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>35.451</ogc:Literal>
              </ogc:PropertyIsLessThan>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#FFA500</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>capacity_mtco2</ogc:PropertyName>
                  <ogc:Literal>4.719877</ogc:Literal>
                  <ogc:Literal>10</ogc:Literal>
                  <ogc:Literal>5764.043791</ogc:Literal>
                  <ogc:Literal>60</ogc:Literal>
                </ogc:Function>
              </sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        
        <!-- Rule 4: Red: storage_cost_doll_per_tco2 between 35.451 and 52.522 -->
        <sld:Rule>
          <sld:Name>Red (35.451 - 52.522)</sld:Name>
          <sld:Title>Storage Cost (35.45 - 52.52 $/tCO₂)</sld:Title>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>35.451</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>52.522</ogc:Literal>
              </ogc:PropertyIsLessThan>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#FF0000</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>capacity_mtco2</ogc:PropertyName>
                  <ogc:Literal>4.719877</ogc:Literal>
                  <ogc:Literal>10</ogc:Literal>
                  <ogc:Literal>5764.043791</ogc:Literal>
                  <ogc:Literal>60</ogc:Literal>
                </ogc:Function>
              </sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        
        <!-- Rule 5: Dark Red: storage_cost_doll_per_tco2 between 52.522 and 101.236 -->
        <sld:Rule>
          <sld:Name>Dark Red (52.522 - 101.236)</sld:Name>
          <sld:Title>Storage Cost (52.52 - 101.24 $/tCO₂)</sld:Title>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>52.522</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>101.236</ogc:Literal>
              </ogc:PropertyIsLessThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#8B0000</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>capacity_mtco2</ogc:PropertyName>
                  <ogc:Literal>4.719877</ogc:Literal>
                  <ogc:Literal>10</ogc:Literal>
                  <ogc:Literal>5764.043791</ogc:Literal>
                  <ogc:Literal>60</ogc:Literal>
                </ogc:Function>
              </sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        
      </sld:FeatureTypeStyle>
      
      <!-- Legend-only FeatureTypeStyle: Fixed symbol sizes to illustrate capacity variation -->
      <!-- These rules are set with a scale range (here using MaxScaleDenominator=1) so they won't appear on the map -->
      <sld:FeatureTypeStyle>
        
        <sld:Rule>
          <sld:Name>Green - Capacity Small (10 pt)</sld:Name>
          <sld:Title>Minimum Storage Resource Estimate (~4.72 Mt CO₂)</sld:Title>
          <sld:MaxScaleDenominator>1</sld:MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>6.387</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>11.795</ogc:Literal>
              </ogc:PropertyIsLessThan>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#000000</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>5</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        <sld:Rule>
          <sld:Name>Green - Capacity Large (60 pt)</sld:Name>
          <sld:Title>Maximum Storage Resource Estimate (~5,764 Mt CO₂)</sld:Title>
          <sld:MaxScaleDenominator>1</sld:MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>6.387</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan>
                <ogc:PropertyName>storage_cost_doll_per_tco2</ogc:PropertyName>
                <ogc:Literal>11.795</ogc:Literal>
              </ogc:PropertyIsLessThan>
            </ogc:And>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:Mark>
                <sld:WellKnownName>circle</sld:WellKnownName>
                <sld:Fill>
                  <sld:CssParameter name="fill">#000000</sld:CssParameter>
                </sld:Fill>
                <sld:Stroke>
                  <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                  <sld:CssParameter name="stroke-width">1</sld:CssParameter>
                </sld:Stroke>
              </sld:Mark>
              <sld:Size>15</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        
      </sld:FeatureTypeStyle>
      
    </sld:UserStyle>
  </sld:NamedLayer>
  
</sld:StyledLayerDescriptor>
