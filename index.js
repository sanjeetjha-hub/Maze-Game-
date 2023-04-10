const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse   } = Matter;

const engine = Engine.create();
const { world } = engine;

const cells = 3;
const width = 600;
const height = 600;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

World.add(world,MouseConstraint.create(engine,{
    mouse : Mouse.create(render.canvas)
}));

//Wall
const walls = [Bodies.rectangle(width/2, 0, width, 40, {isStatic : true}),
    Bodies.rectangle(width/2, height, width, 40, {isStatic : true}),
    Bodies.rectangle(0, height/2, 40, height, {isStatic : true}),
    Bodies.rectangle(width, height/2, 40, height, {isStatic : true})]
World.add(world, walls);

//Maze Generation

const shuffle = (arr) => {
    let counter = arr.length;
   
    while(counter>0){
        const index = Math.floor(Math.random() * counter)

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] =  temp;
    }
    return arr;
};

const grid = Array(cells).fill(null).map(()=> Array(cells).fill(false));
const verticals = Array(cells).fill(null).map(()=> Array(cells-1).fill(false));
const horizontals = Array(cells-1).fill(null).map(()=> Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);


const stepThroughCell = (row,column) => {
    //If i have visited the cell at [row,column] then return 
    if(grid[row][column]){
        return; 
    }

    //Mark this cell as being visted
    grid[row][column] = true;

    //Assemble randomly orderded list of neighbours
    const neighbours = shuffle([
        [row -1, column,'up'],
        [row, column + 1,'right'],
        [row+1, column,'down'],
        [row, column-1,'left'],
    ]);

    
    //for each neighbour
    for(let neighbour of neighbours){
        const [nextRow,nextColumn,directions] = neighbour;

    //see if that neighbour is out of bound
        if(nextRow< 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells)
        {
            continue;
        }
    //if we have visited the neighbour, continue to next neighbour
    if(grid[nextRow][nextColumn])
    {
        continue;
    }
    //remove a wall from either vertical or horizontal
    if(directions === 'left'){
        verticals[row][column-1] = true;
    }
    else if(directions === 'right'){
        verticals[row][column] = true;
    }else if (directions === 'up'){
        horizontals[row-1][column]= true;
    }else if(directions==='down'){
        horizontals[row][column]=true;
    }
    
    stepThroughCell(nextRow,nextColumn);
    }
    //visit the next cell
    
};
console.log(horizontals,verticals);
stepThroughCell(1,1);