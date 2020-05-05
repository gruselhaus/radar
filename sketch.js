/*
 * Copyright (c) 2020 Nico Finkernagel <nico@gruselhaus.com>
 */

const url = "https://opensky-network.org/api/states/all?lamin=49.944079&lomin=8.403252&lamax=50.126740&lomax=8.817649";

let mappa;
let planeMap;
let canvas;

let visible = false;

let planeImage, carImage;
let planes = [];

const toBeChecked = [RegExp(/^RM\d*/),RegExp(/^SIPO\d*/),RegExp(/^V\d*/), RegExp(/^FRA\d*/), RegExp(/^EL\d*/), RegExp(/^APT\d*/), RegExp(/^LEOS\d*/), RegExp(/^FF\d*/)];

function preload() {
  planeImage = loadImage("assets/plane.png");
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
    const callsign = this.states[1]; // Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
    const pos = planeMap.latLngToPixel(this.states[6], this.states[5]); // plane position (lat, long)
    const on_ground = this.states[8]; // Boolean value which indicates if the position was retrieved from a surface position report.
    const dir = this.states[10]; // True track in decimal degrees clockwise from north (north=0°). Can be null.
    const spi = this.states[15]; // Whether flight status indicates special purpose indicator.
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
        if (!on_ground) tint(0, 255, 0);
        if (spi) tint(199, 21, 133);
        image(planeImage, 0, 0, 30, 30);
      }
    } else {
      tint(255, 0, 0);
      rotate(dir);
      imageMode(CENTER);
      image(planeImage, 0, 0, 30, 30);
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
