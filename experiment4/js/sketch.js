
let worldSeed;
let Gkey = "xyzzy";


const s1 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    //canvas1 = createCanvas(600, 600/3);
    //canvas1.parent("container");

    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    
    //let label = sketch.createP();
    //label.html("World key: ");
    //label.parent("canvas-container1");

    //let input = sketch.createInput("xyzzy");
    //input.parent(label);
    //input.input(() => {
    //  rebuildWorld(input.value());
    //});

    //sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("canvas-container1");

    //rebuildWorld(input.value());
    
    rebuildWorld(Gkey);
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil((sketch.height + 150) / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW) || sketch.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW) || sketch.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW) || sketch.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW) || sketch.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

  "use strict";

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */
  let lastUpdate = 0;
  let redIncrement = 1;
  let timesChanged = 0;
  let adding = true;
  
  const blues = [
    [1,48,75],
    [1,85,134],
    [41,123,176],
    [41,164,194],
    [111,208,224],
    [111,208,224],
  ]

  const colorScale = 0.09;

  function p3_preload() {}
  
  function p3_setup() {
    canvas = sketch.createCanvas(600, 600/2);
    canvas.parent("canvas-container2");}
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
  }
  
  function p3_tileWidth() {
    return 32;
  }
  function p3_tileHeight() {
    return 16;
  }
  
  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  
  let clicks = {};
  
  function p3_tileClicked(i, j) {
    let key = [i, j];
    sketch.clicks[key] = 1 + (sketch.clicks[key] | 0);
  }
  
  function p3_drawBefore() {}
  
  function getNoiseColor(x, y, colorArray) {
    // Generate a noise value based on x and y
    let noiseValue = sketch.noise(x * colorScale, y * colorScale); 
  
    // Map the noise value to an index in the color array
    let index = sketch.floor(sketch.map(noiseValue, 0, 1, 0, colorArray.length));
  
    // Retrieve and return the selected color from the array
    return colorArray[index];
  }
  
  function p3_drawTile(i, j) {
    let N = sketch.noise(i/10, j/10)*0.7 + sketch.noise(i/5, j/5)*0.3;
    sketch.noStroke();
    if (N > 0.45 && N < 0.55) {
      sketch.fill(253 + redIncrement, 255 - redIncrement, 208 - redIncrement);
    }
    else if(N >= 0.55 && N < 0.62){
      sketch.fill(51 + redIncrement, 117, 15 );
    }
    else if(N >= 0.62 && N < 0.85){
      sketch.fill(36 + redIncrement, 84 , 10 );
    }
    else if(N >= 0.85){
      sketch.fill(36 + redIncrement, 84 , 10 );
    }
    else {
      const blueColor = getNoiseColor(i, j, blues);
      if (sketch.millis() - lastUpdate >= 100) {
        lastUpdate = sketch.millis();
        if (adding) {
          redIncrement += 1;
          timesChanged++;
          if (timesChanged >= 100) {
            adding = false;
            timesChanged = 0;
          }
        } else {
          redIncrement -= 1;
          timesChanged++;
          if (timesChanged >= 100) {
            adding = true;
            timesChanged = 0;
          }
        }
      }
      sketch.fill(blueColor[0] + redIncrement, blueColor[1], blueColor[2]);
    }
    sketch.push();
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape();
  
    let n = clicks[[i, j]] | 0;
    if (n % 2 == 1) {
      sketch.fill(0, 0, 0, 32);
      sketch.ellipse(0, 0, 10, 5);
      sketch.translate(0, -10);
      sketch.fill(255, 255, 100, 128);
      sketch.ellipse(0, 0, 10, 10);
    }
  
    sketch.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape();
  
    sketch.noStroke();
    sketch.fill(0);
    sketch.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {}
}


const s2 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    //canvas1 = createCanvas(600, 600/3);
    //canvas1.parent("container");

    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    
    //let label = sketch.createP();
    //label.html("World key: ");
    //label.parent("canvas-container1");

    //let input = sketch.createInput("xyzzy");
    //input.parent(label);
    //input.input(() => {
    //  rebuildWorld(input.value());
    //});

    //sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("canvas-container1");

    //rebuildWorld(input.value());
    
    rebuildWorld(Gkey);
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil((sketch.height + 150) / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW) || sketch.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW) || sketch.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW) || sketch.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW) || sketch.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

  "use strict";

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */
  let lastUpdate = 0;
  let redIncrement = 1;
  let timesChanged = 0;
  let adding = true;
  
  const blues = [
    [201,57,0],
    [255,73,0],
    [252,89,24],
    [217,61,0],
    [255,128,41],
    [255,128,41],
  ]

  const colorScale = 0.09;

  function p3_preload() {}
  
  function p3_setup() {
    canvas = sketch.createCanvas(600, 600/2);
    canvas.parent("canvas-container2");}
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
  }
  
  function p3_tileWidth() {
    return 32;
  }
  function p3_tileHeight() {
    return 16;
  }
  
  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  
  let clicks = {};
  
  function p3_tileClicked(i, j) {
    let key = [i, j];
    sketch.clicks[key] = 1 + (sketch.clicks[key] | 0);
  }
  
  function p3_drawBefore() {}
  
  function getNoiseColor(x, y, colorArray) {
    // Generate a noise value based on x and y
    let noiseValue = sketch.noise(x * colorScale, y * colorScale); 
  
    // Map the noise value to an index in the color array
    let index = sketch.floor(sketch.map(noiseValue, 0, 1, 0, colorArray.length));
  
    // Retrieve and return the selected color from the array
    return colorArray[index];
  }
  
  function p3_drawTile(i, j) {
    let N = sketch.noise(i/10, j/10)*0.7 + sketch.noise(i/5, j/5)*0.3;
    sketch.noStroke();
    if (N > 0.45 && N < 0.55) {
      sketch.fill(120, 120 , 120 );
    }
    else if(N >= 0.55 && N < 0.62){
      sketch.fill(173, 63, 63 );
    }
    else if(N >= 0.62 && N < 0.85){
      sketch.fill(125, 25 , 25 );
    }
    else if(N >= 0.85){
      sketch.fill(125, 25 , 25 );
    }
    else {
      const blueColor = getNoiseColor(i, j, blues);
      if (sketch.millis() - lastUpdate >= 100) {
        lastUpdate = sketch.millis();
        if (adding) {
          redIncrement += 1;
          timesChanged++;
          if (timesChanged >= 100) {
            adding = false;
            timesChanged = 0;
          }
        } else {
          redIncrement -= 1;
          timesChanged++;
          if (timesChanged >= 100) {
            adding = true;
            timesChanged = 0;
          }
        }
      }
      sketch.fill(blueColor[0] , blueColor[1] + redIncrement, blueColor[2]);
    }
    sketch.push();
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape();
  
    let n = clicks[[i, j]] | 0;
    if (n % 2 == 1) {
      sketch.fill(0, 0, 0, 32);
      sketch.ellipse(0, 0, 10, 5);
      sketch.translate(0, -10);
      sketch.fill(255, 255, 100, 128);
      sketch.ellipse(0, 0, 10, 10);
    }
  
    sketch.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape();
  
    sketch.noStroke();
    sketch.fill(0);
    sketch.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {}
}


const s3 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    //canvas1 = createCanvas(600, 600/3);
    //canvas1.parent("container");

    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    
    //let label = sketch.createP();
    //label.html("World key: ");
    //label.parent("canvas-container1");

    //let input = sketch.createInput("xyzzy");
    //input.parent(label);
    //input.input(() => {
    //  rebuildWorld(input.value());
    //});

    //sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("canvas-container1");

    //rebuildWorld(input.value());
    
    rebuildWorld(Gkey);
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil((sketch.height + 150) / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW) || sketch.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW) || sketch.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW) || sketch.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW) || sketch.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

  "use strict";

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */
  let lastUpdate = 0;
  let redIncrement = 1;
  let timesChanged = 0;
  let adding = true;
  
  const blues = [
    [201,57,0],
    [255,73,0],
    [252,89,24],
    [217,61,0],
    [255,128,41],
    [255,128,41],
  ]

  const colorScale = 0.09;

  function p3_preload() {}
  
  function p3_setup() {
    canvas = sketch.createCanvas(600, 600/2);
    canvas.parent("canvas-container2");}
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
  }
  
  function p3_tileWidth() {
    return 32;
  }
  function p3_tileHeight() {
    return 16;
  }
  
  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  
  let clicks = {};
  
  function p3_tileClicked(i, j) {
    let key = [i, j];
    sketch.clicks[key] = 1 + (sketch.clicks[key] | 0);
  }
  
  function p3_drawBefore() {}
  
  function getNoiseColor(x, y, colorArray) {
    // Generate a noise value based on x and y
    let noiseValue = sketch.noise(x * colorScale, y * colorScale); 
  
    // Map the noise value to an index in the color array
    let index = sketch.floor(sketch.map(noiseValue, 0, 1, 0, colorArray.length));
  
    // Retrieve and return the selected color from the array
    return colorArray[index];
  }
  
  function p3_drawTile(i, j) {
    let N = sketch.noise(i/10, j/10)*0.7 + sketch.noise(i/5, j/5)*0.3;
    sketch.noStroke();
    if (N > 0.25 && N < 0.3) {
      sketch.fill(120, 120 , 120 );
    }
    else if(N >= 0.3 && N < 0.42){
      sketch.fill(245 - redIncrement/2, 237 - redIncrement/2, 181 + redIncrement/2 );
    }
    else if(N >= 0.42 && N < 0.65){
      sketch.fill(227 - redIncrement/2, 217 - redIncrement/2, 149 + redIncrement/2);
    }
    else if(N >= 0.65){
      sketch.fill(196 - redIncrement/2, 183 - redIncrement/2, 99 + redIncrement/2);
    }
    else {
      const blueColor = getNoiseColor(i, j, blues);
      if (sketch.millis() - lastUpdate >= 100) {
        lastUpdate = sketch.millis();
        if (adding) {
          redIncrement += 5;
          timesChanged++;
          if (timesChanged >= 20) {
            adding = false;
            timesChanged = 0;
          }
        } else {
          redIncrement -= 5;
          timesChanged++;
          if (timesChanged >= 20) {
            adding = true;
            timesChanged = 0;
          }
        }
      }
      sketch.fill(blueColor[0], blueColor[1] + redIncrement, blueColor[2]);
    }
    sketch.push();
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape();
  
    let n = clicks[[i, j]] | 0;
    if (n % 2 == 1) {
      sketch.fill(0, 0, 0, 32);
      sketch.ellipse(0, 0, 10, 5);
      sketch.translate(0, -10);
      sketch.fill(255, 255, 100, 128);
      sketch.ellipse(0, 0, 10, 10);
    }
  
    sketch.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape();
  
    sketch.noStroke();
    sketch.fill(0);
    sketch.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {}
}

let p51 = new p5(s1, "canvas-container1");


let p52 = new p5(s2, "canvas-container2");


let p53 = new p5(s3, "canvas-container3");