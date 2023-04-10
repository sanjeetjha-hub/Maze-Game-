const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;

const cells = 6;
const width = 600;
const height = 600;

const unitLength = width / cells;

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

//Wall
const walls = [Bodies.rectangle(width / 2, 0, width, 1, { isStatic: true }),
Bodies.rectangle(width / 2, height, width, 1, { isStatic: true }),
Bodies.rectangle(0, height / 2, 1, height, { isStatic: true }),
Bodies.rectangle(width, height / 2, 1, height, { isStatic: true })]
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

const grid = Array(cells).fill(null).map(() => Array(cells).fill(false));
const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false));
const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);


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
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
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

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            1,
            {
                label: 'wall',
                isStatic: true
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
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            1,
            unitLength,
            {
                label: 'wall',
                isStatic: true
            }
        );

        World.add(world, wall);
    });
});

const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * 0.7,
    unitLength * 0.7,
    {
        label: 'goal',
        isStatic: true
    }
);
World.add(world, goal);

const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4, { label: 'ball' });
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 2 });
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 2, y: y })
    } if (event.keyCode === 83) {
        Body.setVelocity(ball, { x: x, y: y + 2 })
    } if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 2, y: y })
    }
});


//Win Condition
const label = ['ball', 'goal']
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        if (label.includes(collision.bodyA.label) && label.includes(collision.bodyB.label)) {
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false)
                }
            });
        }
    })
});