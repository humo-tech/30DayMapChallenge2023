import csv
from shapely import wkt
import json

with open('b74537ac-44e3-4442-bb27-fc3b5f02b6a2.csv') as f:
    features = []
    reader = csv.DictReader(f)
    for row in reader:
        # print(row['wkt'])
        point = wkt.loads(row['wkt']) 
        features.append({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [point.x, point.y]
            },
            'properties': {
                'name': row['name']
            }
        })


with open('./coffee_shop.geojson', 'w') as f:
    json.dump({'type': 'FeatureCollection', 'features': features}, f)
    
