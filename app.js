const { Engine, Render, Runner, Bodies, Composite } = Matter

const engine = Engine.create()
const { world } = engine
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600
  }
})

const shape = Bodies.rectangle(200, 200, 50, 50, {
  isStatic: true
})
Composite.add(world, shape)

Render.run(render)
Runner.run(Runner.create(), engine)