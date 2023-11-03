ogr2ogr -f GeoJSONSeq -select class /vsistdout/ kanto.csv | tippecanoe --force -l class  -o kanto.pmtiles --drop-densest-as-needed -z 12

# kanto.csv comes from athena query