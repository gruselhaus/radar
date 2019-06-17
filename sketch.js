let mappa;
let planeMap;
let canvas;
let url = 'https://opensky-network.org/api/states/all?lamin=49.707526&lomin=7.997795&lamax=50.696854&lomax=9.673431';
let time;
const pos = {
  lat: 0,
  lon: 0,
  track: 0
}

let visible = false;
let params = null;
const options = {
  lat: 50.03364,
  lng: 8.557677,
  zoom: 14,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}
let planes = [];

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  mappa = new Mappa('Leaflet');
  planeMap = mappa.tileMap(options);
  planeMap.overlay(canvas);
  getData();
  time = setInterval(getData, 500);
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
    const callsign = this.states[1];
    stroke(0);
    strokeWeight(.5);
    fill(200, 100, 123, 150);
    ellipse(pix.x, pix.y, 12, 12);
    if (callsign === "") {
      return;
    }
    beginShape();
    stroke(0);
    strokeWeight(1);
    noFill();
    vertex(pix.x + cos(45) * 12, pix.y - sin(135) * 12);
    vertex(pix.x + 20, pix.y - 15);
    vertex(pix.x + 80, pix.y - 15);
    endShape();
    strokeWeight(.2);
    fill(0);
    text(callsign, pix.x + 24, pix.y - 17);
  }
}