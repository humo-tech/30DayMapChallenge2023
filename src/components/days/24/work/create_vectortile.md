1. create repository from https://github.com/geolonia/vector-tiles-api
2. set github actions as following https://github.com/geolonia/vector-tiles-api#github-pages-%E3%81%AE%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95
3. download data from amazon athena (black and white)
4. join black and white files named example.csv
5. push branch to github
6. then vectortiles's json autoput to https://{github-pages-url}/tiles/tiles.json
7. import this file to my script as source url.

```JavaScript
map.addSource('point', {
  type: 'vector',
  url: 'https://humo-tech.github.io/vectortiles_30daymapchallenge2023_day23/tiles/tiles.json',
})
```
