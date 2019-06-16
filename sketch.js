let mappa;
let planeMap;
let canvas;
const url = 'https://opensky-network.org/api/states/all';
let time;
const pos = {
  lat: 0,
  lon: 0,
  track: 0
}

let visible = false;
let params = null;
const options = {
  lat: 0,
  lng: 0,
  zoom: 1.5,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  mappa = new Mappa('Leaflet');
  planeMap = mappa.tileMap(options);
  planeMap.overlay(canvas);
  getData();
  time = setInterval(getData, 5000);
}

const getData = async () => {
  visible = true;
  params = getURLParams();
  let icao = params.icao24;
  if (icao) icao = '?icao24=' + icao;
  const data = await httpGet(url + icao);
  let formatted = JSON.parse(data);
  pos.lat = formatted.states[0][6];
  pos.lon = formatted.states[0][5];
  pos.track = formatted.states[0][10];
  console.log(formatted)
}

function draw() {
  if (visible) {
    clear();
    const pix = planeMap.latLngToPixel(pos.lat, pos.lon);
    stroke(0);
    fill(100, 200, 123, 100);
    ellipse(pix.x, pix.y, 32, 32);
  }
}