const { Engine, Render, Runner, Bodies, Composite, Body } = Matter

const cells = 5
const width = 600
const height = 600

const unitlength = width / cells

const engine = Engine.create()
engine.world.gravity.y = 0
const { world } = engine
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width,
    height
  }
})

Render.run(render)
Runner.run(Runner.create(), engine)

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
]
Composite.add(world, walls)

// Maze  generation
const grid = Array(cells).fill(null).map(() => Array(cells).fill(false))
const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false))
const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false))

const startRow = Math.floor(Math.random() * cells)
const startColumn = Math.floor(Math.random() * cells)

const stepThroughCell = (row, column) => {
  // If I have visited the cell at [row, column], then return
  if (grid[row][column]) {
    return
  }

  // Mark this cell as being visited
  grid[row][column] = true

  // Assemble randomly-ordered list of neightbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ])

  // For each neighbor ...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor

    // See if that neighbor is out of bounds
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
      continue
    }

    // If we have visited that neightbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue
    }

    // Remove a wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true
    } else if (direction === 'right') {
      verticals[row][column] = true
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true
    } else if (direction === 'down') {
      horizontals[row][column] = true
    }

    stepThroughCell(nextRow, nextColumn)
  }
  // Visit that next cell
}

stepThroughCell(startRow, startColumn)

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) { 
      return  
    } 

    const wall = Bodies.rectangle(
      columnIndex * unitlength + unitlength / 2,
      rowIndex * unitlength + unitlength,
      unitlength,
      5,
      {
        isStatic: true
      }
    )
    Composite.add(world, wall)
  })
})

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return
    }

    const wall = Bodies.rectangle(
      columnIndex * unitlength + unitlength,
      rowIndex * unitlength + unitlength / 2,
      5,
      unitlength,
      {
        isStatic: true
      }
    )
    Composite.add(world, wall)
  })
})

// Goal
const goal = Bodies.rectangle(
  width - unitlength / 2,
  height - unitlength / 2,
  unitlength * 0.7,
  unitlength * 0.7,
  {
    isStatic: true
  }
)
Composite.add(world, goal)

// Ball
const ball = Bodies.circle(
  unitlength / 2,
  unitlength / 2,
  unitlength / 4,
)
Composite.add(world, ball)

// Ball control
document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity

  if (event.key === 'w') {
    Body.setVelocity(ball, { x, y: y-5})
  }
  if (event.key === 'd') {
    Body.setVelocity(ball, { x: x + 5, y })
  }
  if (event.key === 's') {
    Body.setVelocity(ball, { x, y: y + 5 })
  }
  if (event.key === 'a') {
    Body.setVelocity(ball, { x: x - 5, y })
  }
})