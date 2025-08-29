<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>CO2_Sources</Name>
    <UserStyle>
      <Title>CO2_Sources</Title>
      <Abstract>CO2_Sources by industry and emissions</Abstract>
      <FeatureTypeStyle>
        
        <!-- 
        =====================================================================
         RULES FOR RENDERING FEATURES ON THE MAP
         - One rule for each 'description' category.
         - Color is fixed for the category.
         - Size is determined by a step function on the 'ghg_quantity__metric_tones_co2e_' attribute.
        =====================================================================
        -->
        
        <!-- Rule for Agriculture -->
        <Rule>
          <Name>agriculture</Name>
          <Title>Agriculture</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Agriculture</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#A52A2A</CssParameter> <!-- Brown -->
                </Fill>
              	<Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for Cement/lime plant -->
        <Rule>
          <Name>cement_lime</Name>
          <Title>Cement/Lime Plant</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Cement/lime plant</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#008000</CssParameter> <!-- Green -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for Coal power plant -->
        <Rule>
          <Name>coal_power</Name>
          <Title>Coal Power Plant</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Coal power plant</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#800080</CssParameter> <!-- Purple -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for Landfill -->
        <Rule>
          <Name>landfill</Name>
          <Title>Landfill</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Landfill</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#FFFF00</CssParameter> <!-- Yellow -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for Manufacturing -->
        <Rule>
          <Name>manufacturing</Name>
          <Title>Manufacturing</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Manufacturing</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#000000</CssParameter> <!-- Black -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for Military -->
        <Rule>
          <Name>military</Name>
          <Title>Military</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Military</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#0000FF</CssParameter> <!-- Blue -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for Natural resource extraction -->
        <Rule>
          <Name>natural_resource</Name>
          <Title>Natural Resource Extraction</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Natural resource extraction</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#FFA500</CssParameter> <!-- Orange -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <!-- Rule for NG Pipeline compressor station -->
        <Rule>
          <Name>ng_pipeline</Name>
          <Title>NG Pipeline Compressor Station</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>NG pipeline compressor station</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#FF0000</CssParameter> <!-- Red -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        
        <!-- Rule for NG Power Plant -->
        <Rule>
          <Name>ng_power_plant</Name>
          <Title>NG Power Plant</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>NG power plant</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#e834eb</CssParameter> <!-- Pink -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        
        <!-- Rule for Refinery -->
        <Rule>
          <Name>refinery</Name>
          <Title>Refinery</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>Refinery</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#34c6eb</CssParameter> <!-- Teal -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        
        <!-- Rule for University -->
        <Rule>
          <Name>university</Name>
          <Title>University</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>description</ogc:PropertyName>
              <ogc:Literal>University</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#85cc1b</CssParameter> <!-- Teal -->
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>
                <ogc:Function name="Interpolate">
                  <ogc:PropertyName>ghg_quantity__metric_tons_co2e_</ogc:PropertyName>
                  <ogc:Literal>50000</ogc:Literal><ogc:Literal>12</ogc:Literal>
                  <ogc:Literal>4495601</ogc:Literal><ogc:Literal>50</ogc:Literal>
                </ogc:Function>
              </Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        
        <!-- 
        =====================================================================
         RULES FOR LEGEND GENERATION ONLY
         - These rules create the legend for the different emission sizes.
         - They use Min/MaxScaleDenominator to ensure they are never drawn on the map.
         - They use a neutral grey color and the fixed sizes from your breakpoints.
        =====================================================================
        -->
        <Rule>
          <Name>size_legend_1</Name>
          <Title>Minimum Greenhouse Gas Emissions</Title>
          <MinScaleDenominator>1000000000</MinScaleDenominator>
          <MaxScaleDenominator>1000000001</MaxScaleDenominator>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill><CssParameter name="fill">#808080</CssParameter></Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>5</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        <Rule>
          <Name>size_legend_2</Name>
          <Title>Maximum Greenhouse Gas Emissions</Title>
          <MinScaleDenominator>1000000000</MinScaleDenominator>
          <MaxScaleDenominator>1000000001</MaxScaleDenominator>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill><CssParameter name="fill">#808080</CssParameter></Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>15</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
                
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
