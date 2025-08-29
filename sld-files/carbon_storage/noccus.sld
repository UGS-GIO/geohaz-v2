<?xml version="1.0" encoding="UTF-8"?>

<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd">

  <NamedLayer>

    <se:Name>ccus_noccuszone</se:Name>

    <UserStyle>

      <se:Name>ccus_noccuszone</se:Name>

      <se:FeatureTypeStyle>

        <se:Rule>

          <se:Name>No-CCUS-Zone</se:Name>

          <se:Description>

            <se:Title>Exclusion Zones - Land Management</se:Title>

          </se:Description>

          <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">

            <ogc:PropertyIsEqualTo>

              <ogc:PropertyName>grade</ogc:PropertyName>

              <ogc:Literal>No-CCUS-Zone</ogc:Literal>

            </ogc:PropertyIsEqualTo>

          </ogc:Filter>

          <se:PolygonSymbolizer>

            <se:Fill>

              <se:GraphicFill>

                <se:Graphic>

                  <se:Mark>

                    <se:WellKnownName>shape://slash</se:WellKnownName>

                    <se:Stroke>

                      <se:SvgParameter name="stroke">#ff0000</se:SvgParameter>

                      <se:SvgParameter name="stroke-width">2</se:SvgParameter>

                    </se:Stroke>

                  </se:Mark>

                  <se:Size>8</se:Size>

                </se:Graphic>

              </se:GraphicFill>

            </se:Fill>

            <se:Stroke>

              <se:SvgParameter name="stroke">#000000</se:SvgParameter>

              <se:SvgParameter name="stroke-width">2</se:SvgParameter>

              <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>

              <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>

            </se:Stroke>

          </se:PolygonSymbolizer>

        </se:Rule>

        <se:Rule>

          <se:Name>No-CCUS-Zone-Geo</se:Name>

          <se:Description>

            <se:Title>Exclusion Zones - Geology</se:Title>

          </se:Description>

          <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">

            <ogc:PropertyIsEqualTo>

              <ogc:PropertyName>grade</ogc:PropertyName>

              <ogc:Literal>No-CCUS-Zone-Geo</ogc:Literal>

            </ogc:PropertyIsEqualTo>

          </ogc:Filter>

          <se:PolygonSymbolizer>

            <se:Fill>

              <se:GraphicFill>

                <se:Graphic>

                  <se:Mark>

                    <se:WellKnownName>shape://slash</se:WellKnownName>

                    <se:Stroke>

                      <se:SvgParameter name="stroke">#000000</se:SvgParameter>

                      <se:SvgParameter name="stroke-width">2</se:SvgParameter>

                    </se:Stroke>

                  </se:Mark>

                  <se:Size>8</se:Size>

                </se:Graphic>

              </se:GraphicFill>

            </se:Fill>

            <se:Stroke>

              <se:SvgParameter name="stroke">#000000</se:SvgParameter>

              <se:SvgParameter name="stroke-width">2</se:SvgParameter>

              <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>

              <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>

            </se:Stroke>

          </se:PolygonSymbolizer>

        </se:Rule>

      </se:FeatureTypeStyle>

    </UserStyle>

  </NamedLayer>

</StyledLayerDescriptor>
