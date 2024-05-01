// Constants
const WATER_COLOR = "#66CCFF"; // light blue
const TREE_TRUNK_COLOR = "#8B4513"; // brown
const TREE_CANOPY_COLOR = "#006400"; // dark green
const SAND_COLOR = "#FFFFFF"; // white
const CLOUD_COLOR = "#D3D3D3"; // light gray

// Globals
let perlinPoints = [];
let trees = [];
let clouds = [];


const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 600;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}


function setup() {
    // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  CANVAS_WIDTH = canvas.width;
  CANVAS_HEIGHT = canvas.height;
  canvas.parent("canvas-container");
    // resize canvas is the page is resized
  
    // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");
  
  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
  generatePerlinLine();
  generateTrees();
  generateClouds();
  drawScene();
}

function generatePerlinLine() {
  let startX = CANVAS_WIDTH; 
  let startY = CANVAS_HEIGHT * 3 / 6; 
  let frequency = 0.01;
  let amplitude = 200;

  for (let x = 0; x < CANVAS_WIDTH; x++) {
    let y = noise(startX + x * frequency) * amplitude + startY;
    perlinPoints.push({ x: x, y: y });
  }
}

function generateTrees() {
  for (let i = 0; i < 1100; i++) {
    let x = random(0, CANVAS_WIDTH);
    let y = random(perlinPoints[floor(x)].y, CANVAS_HEIGHT);
    trees.push({ x: x, y: y });
  }
}

function generateClouds() {
  for (let i = 0; i < 10; i++) {
    let x = random(0, CANVAS_WIDTH);
    let y = random(0, CANVAS_HEIGHT / 3); 
    let size = random(50, 100);
    let speed = random(0.5, 1.5);
    let growthRate = random(0.02, 0.05);
    clouds.push({ x: x, y: y, size: size, speed: speed, growthRate: growthRate });
  }
}

function drawScene() {
    // Define light blue and dark blue colors
  let lightBlue = color(135, 206, 250); // Light blue
  let darkBlue = color(0, 20, 150); // Dark blue

     // Draw gradient background from light blue to dark blue
  setGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, darkBlue, lightBlue, "Y");
  
  fill(SAND_COLOR);
  beginShape();
  vertex(0, CANVAS_HEIGHT);
  for (let i = 0; i < CANVAS_WIDTH; i++) {
    let x = perlinPoints[i].x;
    let y = perlinPoints[i].y;
    vertex(x, y);
  }
  vertex(CANVAS_WIDTH, CANVAS_HEIGHT);
  endShape(CLOSE);

  for (let i = 0; i < clouds.length; i++) {
    let cloud = clouds[i];
    drawCloud(cloud.x, cloud.y, cloud.size);
    cloud.x += cloud.speed;
    if (cloud.x > CANVAS_WIDTH + cloud.size) {
      cloud.x = -cloud.size; 
    }
    cloud.size += cloud.growthRate;
    if (cloud.size < 50 || cloud.size > 100) {
      cloud.growthRate *= -1; 
    }
  }

  noStroke();
  for (let i = 0; i < trees.length; i++) {
    let x = trees[i].x;
    let y = trees[i].y;
    drawTree(x, y);
  }
}

function drawCloud(x, y, size) {
  fill(CLOUD_COLOR);
  
  let basecolor = color(200)
  let closecolor = color(250)
  let cloudcolor = lerpColor(basecolor, closecolor, Math.random(Math.floor(Math.random() * (20))));
  
  fill(cloudcolor)
  ellipse(x, y, size * 5, size / 3);

}

function drawTree(x, y) {
  
  let baseColor = color(0, 100, 0); 
  
  let closeColor = color(0, 150, 0); 

  let canopyColor = lerpColor(baseColor, closeColor, Math.random(Math.floor(Math.random() * (20))));
  
  let basebrownColor = color(120, 70, 0); 

  let closebrownColor = color(190, 90, 90);
  
  let Trunkcolor = lerpColor(basebrownColor, closebrownColor, Math.random(Math.floor(Math.random() * (20))));
  
  
  let trunkWidth = 20;
  let trunkHeight = 40;
  let canopyWidth = 30;
  let canopyHeight = 40;

  // Trunk
  fill(Trunkcolor);
  rectMode(CENTER);
  rect(x, y, trunkWidth / 4, trunkHeight / 4);

  // Canopy
  fill(canopyColor);
  triangle(x - canopyWidth / 5, y - trunkHeight / 8, x + canopyWidth / 5, y - trunkHeight / 8, x, y - trunkHeight / 2 - canopyHeight / 3);
}

// Function to draw gradient
function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();
  if (axis === "Y") {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis === "X") {
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  }
}