const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;

const cellsHorizontal = 3;
const cellsVertical = 3;
const width = window.innerWidth - 10;
const height = window.innerHeight - 10;

// const width = 1000;
// const height = 1000;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;


const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Wall
const borderWallSize = 2;
const walls = [Bodies.rectangle(width / 2, 0, width, borderWallSize, { isStatic: true }),
Bodies.rectangle(width / 2, height, width, borderWallSize, { isStatic: true }),
Bodies.rectangle(0, height / 2, borderWallSize, height, { isStatic: true }),
Bodies.rectangle(width, height / 2, borderWallSize, height, { isStatic: true })]
World.add(world, walls);

//Maze Generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter)

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);


const stepThroughCell = (row, column) => {
    //If i have visited the cell at [row,column] then return 
    if (grid[row][column]) {
        return;
    }

    //Mark this cell as being visted
    grid[row][column] = true;

    //Assemble randomly orderded list of neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left'],
    ]);

    //for each neighbour
    for (let neighbour of neighbours) {
        const [nextRow, nextColumn, directions] = neighbour;

        //see if that neighbour is out of bound
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }
        //if we have visited the neighbour, continue to next neighbour
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        //remove a wall from either vertical or horizontal
        if (directions === 'left') {
            verticals[row][column - 1] = true;
        } else if (directions === 'right') {
            verticals[row][column] = true;
        } else if (directions === 'up') {
            horizontals[row - 1][column] = true;
        } else if (directions === 'down') {
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn);
    }
    //visit the next cell
};

stepThroughCell(1, 1);

const mazeWallSize = 1;

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            mazeWallSize,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );

        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            mazeWallSize,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );

        World.add(world, wall);
    });
});

const goalSize = 0.7;

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * goalSize,
    unitLengthY * goalSize,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

const ballRadius = Math.min((unitLengthX + unitLengthY) / 6);

const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, { label: 'ball' });
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 1 });
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 1, y: y })
    } if (event.keyCode === 83) {
        Body.setVelocity(ball, { x: x, y: y + 1 })
    } if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 1, y: y })
    }
});


//Win Condition
const label = ['ball', 'goal']
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        if (label.includes(collision.bodyA.label) && label.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false)
                }
            });
        }
    })
});

