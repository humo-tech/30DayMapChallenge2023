# search satellite data from here
# https://registry.opendata.aws/sentinel-2/
https://apps.sentinel-hub.com/eo-browser/
# when found, click link button to get amazon s3 path
# download jp2 file from amazon s3
aws s3 cp --request-payer requester s3://sentinel-s2-l1c/tiles/54/S/TE/2023/1/7/0/ ./54STE20230107

# merge image band4 as red, band3 as green, band2 as blue
# https://mf-atelier.sakura.ne.jp/mf-atelier2/gdal-ogr_tips/
gdalbuildvrt -separate true.vrt B04.jp2 B03.jp2 B02.jp2
gdal_translate -of "GTiff" true.vrt true.tif

# convert 16bit color to 8bit color, disclamer, there is no basis about '4800'
# https://gist.github.com/kapadia/ab5e3e0d36c0c19556e0
# https://gis.stackexchange.com/questions/217743/scale-16-bit-to-8-bit-within-range-using-gdal
gdal_translate -of GTiff -ot Byte -scale 0 4800 0 255 true.tif true8.tif

# make png tile to 'tiles/' directory
# https://qiita.com/Kanahiro/items/4b5f8db5743c69741220
gdal2tiles.py true8.tif tiles -z0-14 --xyz --processes=4