let myInstance;
let canvasContainer;
var centerHorz, centerVert;

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

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
  
}

// p4_base.js start

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;


function preload() {
  

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
  
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  rate.innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());

    // Draw the original image on the right side of the canvas
    image(currentInspiration.image, width, 0, width, height);
}
/* exported getInspirations, initDesign, renderDesign, mutateDesign */

function getInspirations() {
  return [
    {
      name: "Kitten",
      assetUrl:
        "https://cdn.glitch.global/9e633e87-02c2-4d72-b1ae-25c26b4a386a/kitten.jpg?v=1715126655296",
      source: "FJOLA DOGG THORVALDS/GETTY IMAGES",
      shape: "elliptical",
      Ratio: 5,
    },
    {
      name: "Corvette",
      assetUrl:
        "https://cdn.glitch.global/9e633e87-02c2-4d72-b1ae-25c26b4a386a/image_2024-05-07_212946454.png?v=1715142588421",
      shape: "rectangle",
      Ratio: 2.5,
    },
    {
      name: "Steve",
      assetUrl:
        "https://cdn.glitch.global/9e633e87-02c2-4d72-b1ae-25c26b4a386a/Steve.jpg?v=1715142592854",
      shape: "rectangle",
      Ratio: 2.5,
    },
    {
      name: "Landscape",
      assetUrl:
        "https://cdn.glitch.global/9e633e87-02c2-4d72-b1ae-25c26b4a386a/Landscape.jpg?v=1715142778139",
      shape: "elliptical",
      Ratio: 7,
    },
  ];
}

function initDesign(insp) {
  insp.image.loadPixels();
  resizeCanvas(insp.image.width / insp.Ratio, insp.image.height / insp.Ratio);
  //init data
  let data = {
    shapes: [],
    minRadius: 1,
    Alpha: 100,
    Alpha2: 70,
    maxRadius:
      Math.max(insp.image.width / 2, insp.image.height / 2) / insp.Ratio / 4,
    ShapesCount: 3000,
  };
  let tempX, tempY, tempRadius, tempAlpha;
  for (let i = 0; i <= data.ShapesCount; i++) {
    tempX = floor(random(insp.image.width));
    tempY = floor(random(insp.image.height));
    tempAlpha = random();
    tempRadius = lerp(
      data.minRadius,
      data.maxRadius,
      map(i, 0, data.ShapesCount, 1, 0)
    ); // Interpolated radius based on iteration
    data.shapes.push({
      x: tempX / insp.Ratio,
      y: tempY / insp.Ratio,
      r: tempRadius,
      col: FindIndexColor(tempX, tempY, insp.image), // Color of the shape
      a: data.Alpha - tempAlpha * data.Alpha2, // Alpha value of the shape
    });
  }

  return data;
}

function renderDesign(data, insp) {
  noStroke();
  for (let s of data.shapes) {
    switch (insp.shape) {
      case "elliptical": //Draw elliptical shapes
        fill(s.col[0], s.col[1], s.col[2], s.a);
        ellipse(s.x, s.y, s.r);
        noFill();
        break;
      case "rectangle": // Draw rectangular shapes
        fill(s.col[0], s.col[1], s.col[2], s.a);
        rect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
        noFill();
        break;
    }
  }
}

function mutateDesign(data, insp, rate) {
  let tempX, tempY, tempRadius;
  for (let s of data.shapes) {
    tempX = floor(
      constrain(
        randomGaussian(
          s.x * insp.Ratio,
          (rate * (insp.image.width - 1 - 0)) / 30
        ),
        0,
        insp.image.width - 1
      )
    ); // Mutated x-coordinate
    tempY = floor(
      constrain(
        randomGaussian(
          s.y * insp.Ratio,
          (rate * (insp.image.height - 1 - 0)) / 30
        ),
        0,
        insp.image.height - 1
      )
    ); // Mutated y-coordinate
    tempRadius = constrain(
      randomGaussian(s.r, (rate * (data.maxRadius - data.minRadius)) / 40),
      data.minRadius,
      data.maxRadius
    ); // Mutated radius
    s.x = tempX / insp.Ratio;
    s.y = tempY / insp.Ratio;
    s.r = tempRadius;
    s.col = FindIndexColor(floor(tempX), floor(tempY), insp.image);
  }
}

// Function to get the color of a pixel at specified coordinates in the image
function FindIndexColor(xpos, ypos, img) {
  let index = (ypos * img.width + xpos) * 4; // Calculate pixel index
  let rval = [img.pixels[index], img.pixels[index + 1], img.pixels[index + 2]]; // Retrieve RGB values
  return rval;
}