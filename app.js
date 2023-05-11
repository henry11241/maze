const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter

const cellsHorizontal = 16
const cellsVertical = 10
const width = window.innerWidth
const height = window.innerHeight

const unitLengthX = width / cellsHorizontal
const unitLengthY = height / cellsVertical

const engine = Engine.create()
engine.world.gravity.y = 0
const { world } = engine
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
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
const generateMaze = () => {
  const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false))
  const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false))
  const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false))

  const startRow = Math.floor(Math.random() * cellsVertical)
  const startColumn = Math.floor(Math.random() * cellsHorizontal)

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
      if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
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
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        5,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'grey'
          }
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
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY / 2,
        5,
        unitLengthY,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'grey'
          }
        }
      )
      Composite.add(world, wall)
    })
  })

  // Goal
  const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
      label: 'goal',
      isStatic: true,
      render: {
        fillStyle: 'green'
      }
    }
  )
  Composite.add(world, goal)

  // Ball
  const ballRadius = Math.min(unitLengthX, unitLengthY) / 4
  const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
      label: 'ball',
      render: {
        fillStyle: randomColor()
      }
    }
  )
  Composite.add(world, ball)

  // Ball control
  document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity

    if (event.key === 'w') {
      Body.setVelocity(ball, { x: 0, y: y - 5 })
    }
    if (event.key === 'd') {
      Body.setVelocity(ball, { x: x + 5, y: 0 })
    }
    if (event.key === 's') {
      Body.setVelocity(ball, { x: 0, y: y + 5 })
    }
    if (event.key === 'a') {
      Body.setVelocity(ball, { x: x - 5, y: 0 })
    }
  })
  const limitMaxSpeed = () => {
    let maxSpeed = 5;
    const { x, y } = ball.velocity

    if (ball.velocity.x > maxSpeed) {
      Body.setVelocity(ball, { x: maxSpeed, y: 0 });
    }

    if (ball.velocity.x < -maxSpeed) {
      Body.setVelocity(ball, { x: -maxSpeed, y: 0 });
    }

    if (ball.velocity.y > maxSpeed) {
      Body.setVelocity(ball, { x: 0, y: maxSpeed });
    }

    if (ball.velocity.y < -maxSpeed) {
      Body.setVelocity(ball, { x: 0, y: -maxSpeed });
    }
  }
  Events.on(engine, 'beforeUpdate', limitMaxSpeed);
}
generateMaze()

// Win Condition
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(collision => {
    const label = ['ball', 'goal']

    if (
      label.includes(collision.bodyA.label) &&
      label.includes(collision.bodyB.label)
    ) {
      document.querySelector('.winner').classList.remove('hidden')
      world.gravity.y = 1
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false)
        }
      })
    }
  })
})

// Reset Maze
const resetButton = document.querySelector('.reset')
resetButton.addEventListener('click', () => {
  Composite.allBodies(world).forEach((body) => {
    if (body.label !== 'Rectangle Body') {
      Composite.remove(world, body)
    }
  })

  generateMaze()
  document.querySelector('.winner').classList.add('hidden')
  engine.world.gravity.y= 0
})