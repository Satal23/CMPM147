/* exported generateGrid, drawGrid */
/* global placeTile */

const lookup = [
  [0, 2],   
  [0, 1],   
  [0, -1],   
  [-1, -1],   
  [-1, 0], 
  [0, 1],    
  [0, -1],    
  [-1, -1],  
  [1, 0],  
  [0, 1],   
  [-1, -1],   
  [-1, -1],     
  [-1, 0],   
  [0, 1],   
  [0, -1],    
  [-1, -1]    
];


function generateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("_");
    }
    grid.push(row);
  }
  let numRectangles = 5;
  let rectangles = [];
  
  for (let r = 0; r < numRectangles; r++) {
    let cx1 = floor(random(0, numCols - 10));
    let cy1 = floor(random(0, numRows - 10)); 
    let cx2 = cx1 + floor(random(5, 10));       
    let cy2 = cy1 + floor(random(5, 10));
    rectangles.push({ x1: cx1, y1: cy1, x2: cx2, y2: cy2 });
  }
  
  function isInRectangles(x, y) {
    for (let rect of rectangles) {
      if (x >= rect.x1 && x < rect.x2 && y >= rect.y1 && y < rect.y2) {
        return true;
      }
    }
    return false;
  }

  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      if (isInRectangles(x, y)) {
        grid[y][x] = ".";
      }
    }
  }
  
  
  return grid;
}


function gridCheck(grid, i, j, target) {
  if (i >= 0 && i < grid.length && j >= 0 && j < grid[0].length) {
    return grid[i][j] === target;
  } else {
    return false;
  }
}


function gridCode(grid, i, j, target) {
  const NORTH = 1 << 0;
  const SOUTH = 1 << 1;
  const EAST = 1 << 2;
  const WEST = 1 << 3;

  let northBit = 0;
  let southBit = 0;
  let eastBit = 0;
  let westBit = 0;

  northBit = gridCheck(grid, i - 1, j, target) ? 1 : 0;
  southBit = gridCheck(grid, i + 1, j, target) ? 1 : 0;
  eastBit = gridCheck(grid, i, j + 1, target) ? 1 : 0;
  westBit = gridCheck(grid, i, j - 1, target) ? 1 : 0;

  let code = (northBit << 0) + (southBit << 1) + (eastBit << 2) + (westBit << 3);

  return code;
}


function drawContext(grid, i, j, target, ti, tj) {
  let code = gridCode(grid, i, j, target);

  if (lookup[code] !== null) {
    const [tiOffset, tjOffset] = lookup[code];

    placeTile(i , j, ti + tiOffset, tj + tjOffset);
  }
  else {
    console.log("Code not found in lookup table.");
  }
}




function drawGrid(grid) {
  background(128);

  let seconds = 0;
  seconds = round(millis()/1000);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid, i, j, ".")) {
        placeTile(i, j, 11,21);
      } 
      else {
        placeTile(i, j, 2,23);
        drawContext(grid, i, j, ".", 23, 23);
      }
    }
  }
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if(gridCheck(grid, i, j, ".")){
        let chance = random(0,100);
        if(chance < 1){
          if(seconds % 2 === 0){
            placeTile(i,j,3,29)
          }
          else {
            placeTile(i,j,0,29)
          }
        }
      }
      else if(gridCheck(grid, i, j, "_")){
        let chance = random(0,100);
        if(chance < 1){
          placeTile(i,j,26,0)
        }
      }
    }
  }
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid, i, j, ".")) {
        continue
      } 
      else {
        drawContext(grid, i, j, ".", 23, 23);
      }
    }
  }
  
}
