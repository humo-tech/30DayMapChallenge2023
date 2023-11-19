# download 
access to strava site and goto specific record
download gpx

# create geojson from gpx
ogr2ogr ~/Downloads/marathon_track_points.geojson ~/Downloads/10243136847.gpx track_points

# create geojson to czml
python3 make_czml.py