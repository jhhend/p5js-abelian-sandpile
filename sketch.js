
// Classes

class SandpileGrid {
  constructor(size) {
    this.size = size;
    this.grid = new Array(size).fill(0).map(v => new Array(size).fill(0) );
  }

  update() {

    let changes = { };

    const updateChange = (i, j, value) => {
      let key = `${i},${j}`;
      if (changes[key] === undefined) {
        changes[key] = value;
      } else {
        changes[key] += value;
      }
    }

    const applyChanges = () => {
      Object.keys(changes).forEach(key => {
        let [ i, j ] = key.split(',').map(v => parseInt(v));
        this.grid[i][j] += changes[key]
      });
    }

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {

        if (this.grid[i][j] < 4) {
          continue;
        }

        if (i - 1 >= 0) { updateChange(i - 1, j, 1); }
        if (i + 1 < this.size) { updateChange(i + 1, j, 1); }
        if (j - 1 >= 0) { updateChange(i, j - 1, 1); }
        if (j + 1 < this.size) { updateChange(i, j + 1, 1); }
        updateChange(i, j, -4);
      }
    } 

    // Signify that the system has reached a stable state
    if (Object.keys(changes).length === 0) {
      return false;
    }

    applyChanges()
    return true;
  }

  set(i, j, value) {
    this.grid[i][j] = value;
  }

  draw() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let val = this.grid[i][j];

        // Only draw cells which are occupied by values
        if (val === 0) {
          continue;
        }

        colorMode(HSB);
        let ratio = (val >= 4 ? 4 : val)/4;
        fill(color((colslider.value() + 360*ratio) % 360, 100, 100))
        colorMode(RGB);
        rect(i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }  
  }

}





// Global Constants

const CANVAS_SIZE = 729;
const CELL_SIZE = 9//8 //720/(27*3);
const CELL_COUNT = CANVAS_SIZE/CELL_SIZE;
const grid = new SandpileGrid(CELL_COUNT);
const State = {
  Active : 0,
  Done : 1
};
const SPEEDS = {
  "Very Fast" : 1,
  "Fast" : 2,
  "Normal" : 4,
  "Slow" : 8,
  "Very Slow" : 16
};





// Global variables

let startingColor;
let speed = 'Normal';
//let speedSelect;
let state = State.Active;





// p5.js Functions 

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  noStroke();

  let mid = Math.floor(CELL_COUNT / 2);
  grid.set(mid, mid, 100000);
  startingColor = Math.floor(random(0, 360)) % 360;
  console.log(startingColor % 360)

  // Speed select setup
  createP('Speed')
  let speedSelect = createSelect();
  speedSelect.option('Very Slow');
  speedSelect.option('Slow');
  speedSelect.option('Normal');
  speedSelect.option('Fast');
  speedSelect.option('Very Fast');
  speedSelect.selected('Normal')
  speedSelect.changed(() => {
    speed = speedSelect.value();
  });

  createP('Color')
  colslider = createSlider(0, 360/4, 0)

}

function draw() {
  background(0);

  if (state === State.Active) {
    if (frameCount % SPEEDS[speed] === 0) {
      // Switch to the done state if no changes were made in a given
      // iteration

      if (!grid.update()) {
        state = State.Done;
        console.log("!")
      } 
    }
  }

  grid.draw()
}
