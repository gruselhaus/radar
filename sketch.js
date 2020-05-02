let mappa;
let planeMap;
let canvas;
let url = "https://opensky-network.org/api/states/all?lamin=49.707526&lomin=7.997795&lamax=50.696854&lomax=9.673431";
let time;
const pos = {
  lat: 0,
  lon: 0,
  track: 0,
};

let visible = false;
let params = null;
const options = {
  lat: 50.03364,
  lng: 8.557677,
  zoom: 14,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
};

let planeImage, redPlaneImage, carImage;
let planes = [];

function preload() {
  planeImage = loadImage("plane.png");
  redPlaneImage = loadImage("plane-red.png");
  carImage = loadImage("car.png");
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  mappa = new Mappa("Leaflet");
  planeMap = mappa.tileMap(options);
  planeMap.overlay(canvas);
  getData();
  time = setInterval(getData, 500);
  angleMode(DEGREES);
}

const getData = async () => {
  visible = true;
  const data = await httpGet(url);
  let formatted = JSON.parse(data);
  planes = [];
  for (const state of formatted.states) {
    planes.push(new Plane(state));
  }
};

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
    push();
    const lat = this.states[6];
    const lon = this.states[5];
    const dir = this.states[10];
    const pix = planeMap.latLngToPixel(lat, lon);
    const callsign = this.states[1];
    translate(pix.x, pix.y);
    if (callsign !== "") {
      text(callsign, 24, 13);
      beginShape();
      stroke(0);
      strokeWeight(1);
      noFill();
      vertex(cos(45) * 12, sin(135) * 12);
      vertex(20, 15);
      vertex(80, 15);
      endShape();
      strokeWeight(0.2);
      fill(0);
      rotate(dir);
      imageMode(CENTER);
      if (callsign.includes("FRA") || callsign.includes("APT") || callsign.includes("LEOS") || callsign.includes("FF")) {
        image(carImage, 0, 0, 13, 23);
      } else {
        image(planeImage, 0, 0, 30, 30);
      }
    } else {
      if (callsign.includes("FRA") || callsign.includes("APT") || callsign.includes("LEOS") || callsign.includes("FF")) {
        image(carImage, 0, 0, 13, 23);
      } else {
        image(redPlaneImage, 0, 0, 30, 30);
      }
    }
    pop();
  }
}
