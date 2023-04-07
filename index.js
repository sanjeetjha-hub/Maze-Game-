const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse   } = Matter;

const engine = Engine.create();
const { world } = engine;

const cells = 5;
const width = 1000;
const height = 1000;

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

const grid = Array(cells).fill(null).map(()=> Array(cells).fill(false));

const verticals = Array(cells).fill(null).map(()=> Array(cells-1).fill(false));

const horizontals = Array(cells-1).fill(null).map(()=> Array(cells).fill(false));

console.log(grid,verticals,horizontals);