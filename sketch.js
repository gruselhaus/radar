/*
 * Copyright (c) 2020 Nico Finkernagel <nico@gruselhaus.com>
 */

const url = "https://opensky-network.org/api/states/all?lamin=49.944079&lomin=8.403252&lamax=50.126740&lomax=8.817649";

let mappa;
let planeMap;
let canvas;

let visible = false;

let planeImage, redPlaneImage, carImage;
let planes = [];

const toBeChecked = [RegExp(/^V\d*/), RegExp(/^FRA\d*/), RegExp(/^EL\d*/), RegExp(/^APT\d*/), RegExp(/^LEOS\d*/), RegExp(/^FF\d*/)];

function preload() {
  planeImage = loadImage("assets/plane.png");
  redPlaneImage = loadImage("assets/plane-red.png");
  carImage = loadImage("assets/car.png");
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  angleMode(DEGREES);

  mappa = new Mappa("Leaflet");
  planeMap = mappa.tileMap({
    lat: 50.03364,
    lng: 8.557677,
    zoom: 14,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
  });
  planeMap.overlay(canvas);

  getData();
  setInterval(getData, 5000);
}

const getData = async () => {
  visible = true;
  let formatted = JSON.parse(await httpGet(url));
  planes = [];
  for (const state of formatted.states) {
    planes.push(new Plane(state));
  }
};

function draw() {
  clear();
  if (visible) {
    // Draw planes
    for (const plane of planes) {
      plane.show();
    }

    // Draw boundaries
    const pos1 = planeMap.latLngToPixel(49.944079, 8.817649);
    const pos2 = planeMap.latLngToPixel(50.12674, 8.817649);
    const pos3 = planeMap.latLngToPixel(50.12674, 8.403252);
    const pos4 = planeMap.latLngToPixel(49.944079, 8.403252);

    push();
    strokeWeight(2);
    stroke(255, 0, 0);
    line(pos1.x, pos1.y, pos2.x, pos2.y);
    line(pos2.x, pos2.y, pos3.x, pos3.y);
    line(pos3.x, pos3.y, pos4.x, pos4.y);
    line(pos4.x, pos4.y, pos1.x, pos1.y);
    pop();
  }
}

class Plane {
  constructor(states) {
    this.states = states;
  }

  show() {
    const callsign = this.states[1]; //Callsign
    const pos = planeMap.latLngToPixel(this.states[6], this.states[5]); // plane position (lat, long)
    const dir = this.states[10]; // real track in degrees

    push();
    translate(pos.x, pos.y);
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
      if (checkCallsign(callsign)) {
        image(carImage, 0, 0, 13, 23);
      } else {
        image(planeImage, 0, 0, 30, 30);
      }
    } else {
      if (checkCallsign(callsign)) {
        image(carImage, 0, 0, 13, 23);
      } else {
        image(redPlaneImage, 0, 0, 30, 30);
      }
    }
    pop();
  }
}

function checkCallsign(callsign) {
  for (const elt of toBeChecked) {
    if (elt.test(callsign)) return true;
  }
  return false;
}
