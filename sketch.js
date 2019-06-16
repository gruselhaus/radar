let mappa;
let planeMap;
let canvas;
let url = 'https://opensky-network.org/api/states/all?lamin=35.774266&lomin=-9.595501&lamax=60.939844&lomax=23.079977';
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
let planes = [];

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
  const data = await httpGet(url);
  let formatted = JSON.parse(data);
  planes = [];
  for (const state of formatted.states) {
    planes.push(new Plane(state));
  }
}

function draw() {
  clear();
  if (visible) {
    for (const plane of planes) {
      plane.show();
    }
  }
}

class Plane {
  constructor(states) {
    this.states = states;
  }

  show() {
    const lat = this.states[6];
    const lon = this.states[5];
    const pix = planeMap.latLngToPixel(lat, lon);
    stroke(0);
    strokeWeight(.5);
    fill(200, 100, 123, 150);
    ellipse(pix.x, pix.y, 12, 12);
  }
}