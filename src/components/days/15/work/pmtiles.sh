 ogr2ogr -f GeoJSONSeq -select restaurants,cafe /vsistdout/ ~/Downloads/q09.csv | tippecanoe --force -o restaurant_cafe_q9.pmtiles -Z0 -z1
 ogr2ogr -f GeoJSONSeq -select restaurants,cafe /vsistdout/ ~/Downloads/910.csv | tippecanoe --force -o restaurant_cafe_q9.pmtiles -Z2 -z3
 ogr2ogr -f GeoJSONSeq -select restaurants,cafe /vsistdout/ ~/Downloads/911.csv | tippecanoe --force -o restaurant_cafe_q11.pmtiles -Z4 -z5
 ogr2ogr -f GeoJSONSeq -select restaurants,cafe /vsistdout/ ~/Downloads/912.csv | tippecanoe --force -o restaurant_cafe_q12.pmtiles -Z6 -z7