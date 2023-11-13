# download shapefiles from following
https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v2_2.html

# create pref-merged geojson file
# 'N03_001' is PREFNAME field
# 'N03_007' is replaced to prefcode (first 2 digit of citycode and '000')
# 'N03_006' is replaced to prefname
ogr2ogr -f GeoJSON N03-18_180101_pref.geojson N03-18_180101.shp  -dialect sqlite -sql "SELECT ST_Union(geometry) AS geometry, N03_001, substr(N03_007, 1, 2) || '000' AS N03_007, N03_001 as N03_004 FROM 'N03-18_180101' GROUP BY N03_001"

# create city pmtiles (max zoom level 9)
tippecanoe -o N03-18_180101_z9.pmtiles N03-18_180101.geojson -z9

# create pref pmtiles (max zoom level 9)
tippecanoe -o N03-18_180101_pref_z9.pmtiles N03-18_180101_pref.geojson -z9

# tile join
tile-join -o N03-18_180101_z9_pref_city.pmtiles N03-18_180101_z9.pmtiles N03-18_180101_pref_z9.pmtiles
