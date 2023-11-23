# 1) download las file
https://www.geospatial.jp/ckan/dataset/tokyopc-shima-2023

# 2) attach projectio (epsg:6667) to las
pdal translate -i ~/Downloads/09LC3752.las -o ~/Downloads/09LC3752_translate.las --writers.las.a_srs="EPSG:6677"

# 3) upload translated las file to Cesium.ion