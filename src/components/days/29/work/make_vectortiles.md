# download shape files

https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521&toukeiYear=2020&serveyId=D002005112020&coordsys=1&format=shape&datum=2000

# create geojson

```bash
for i in _/_.shp;
do
filename=`echo $i | sed s/.shp//`.geojson;
ogr2ogr $filename $i
done
```

# create vectortile

```bash
tippecanoe -zg --force -e 2020_did_ddsw  -l 2020_did_ddsw */*.geojson
```

# upload to s3

```bash
aws s3 sync --content-encoding gzip 2020_did_ddsw/ s3://<BUCKET_NAME>/<PATH>/2020_did_ddsw
```

KEY POINT: **_--content-encoding gzip_**
