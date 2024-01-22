class TShape {
  constructor() {
    this.shape = [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ]
    this.color = "blue"
  }
}

class SShape {
  constructor() {
    this.shape = [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ]
    this.color = "red"
  }
}

class ZShape {
  constructor() {
    this.shape = [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ]
    this.color = "purple"
  }
}

class OShape {
  constructor() {
    this.shape = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]
    this.color = "green"
  }
}

class IShape {
  constructor() {
    this.shape = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]
    this.color = "brown"
  }
}

class LShape {
  constructor() {
    this.shape = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ]
    this.color = "teal"
  }
}

class JShape {
  constructor() {
    this.shape = [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
    ]
    this.color = "orange"
  }
}
class Tetris {
  constructor(element) {
    this.canvas = document.getElementById(element)
    this.canvas.width = 300
    this.canvas.height = 500
    this.ctx = this.canvas.getContext("2d")
    this.blockSize = 20
    this.shapes = [
      new TShape(),
      new SShape(),
      new ZShape(),
      new IShape(),
      new LShape(),
      new JShape(),
      new OShape(),
    ]
    this.init()
    document.addEventListener("keydown", this.keydown.bind(this))
  }

  init() {
    this.blocks = Array(this.canvas.height / this.blockSize)
      .fill(0)
      .map(() => Array(this.canvas.width / this.blockSize).fill(0))
    this.ctx.fillStyle = "white"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawGrid()
    this.moveX = 0
    this.moveY = 0
    this.currentShape = this.getRandomShape()
    this.drawShape()
    this.speed = 1500
    this.lastTime = 0
    this.interval = 0
    this.animate()
  }

  animate(time = 0) {
    this.interval += time - this.lastTime
    this.lastTime = time
    if (this.interval > this.speed) {
      this.interval = 0
      this.moveDown()
    }
    requestAnimationFrame(this.animate.bind(this))
  }

  rotate() {
    console.log("this.currentShape :>> ", this.currentShape)
    const newShape = this.currentShape.shape.map(([x, y]) => [
      this.getMaxX() - y,
      x,
    ])
    // 旋转过后需要判断是否超出了画布
    let flag = true
    for (let i = 0; i < newShape.length; i++) {
      let x = newShape[i][0] * this.blockSize + 160 + this.moveX
      let y = newShape[i][1] * this.blockSize + this.moveY
      if (
        this.blocks?.[y / this.blockSize] === undefined ||
        this.blocks?.[y / this.blockSize]?.[x / this.blockSize] === undefined
      ) {
        flag = false
        break
      }
    }
    if (flag) {
      this.currentShape.shape = newShape
    }
  }

  getMaxX() {
    let maxX = 0
    for (let index = 0; index < this.currentShape.shape.length; index++) {
      const [x] = this.currentShape.shape[index]
      if (x > maxX) {
        maxX = x
      }
    }
    return maxX
  }

  keydown(e) {
    if (e.key === "ArrowLeft") {
      if (this.checkLeft()) {
        console.log("已经到最左边了")
        return
      }
      this.clearShape()
      this.moveX -= this.blockSize
      this.drawShape()
    } else if (e.key === "ArrowRight") {
      if (this.checkRight()) {
        console.log("已经到最右边了")
        return
      }
      this.clearShape()
      this.moveX += this.blockSize
      this.drawShape()
    } else if (e.key === "ArrowDown") {
      this.moveDown()
    } else if (e.key === "ArrowUp") {
      this.clearShape()
      this.rotate()
      this.drawShape()
    } else if (e.key === " ") {
      console.log("空格 :>> ")
    }
  }

  moveDown() {
    if (this.checkDown()) {
      console.log("已经到最下边了")
      this.moveX = 0
      this.moveY = 0
      this.currentShape = this.getRandomShape()
      this.drawShape()
      return
    }
    this.clearShape()
    this.moveY += this.blockSize
    this.drawShape()
  }

  deleteRow() {
    const needDeleteIndexArr = this.blocks
      .map((item, index) => {
        if (item.every((j) => j === 1)) {
          return [true, index]
        }
        return [false, index]
      })
      .filter(([b]) => b)
      .map(([, i]) => i)
    for (let x = this.blocks.length - 1; x >= 0; x--) {
      for (let y = 0; y < this.blocks[x].length; y++) {
        if (needDeleteIndexArr.includes(x)) {
          this.ctx.fillStyle = "white"
          this.ctx.globalAlpha = 1
          this.ctx.fillRect(
            y * this.blockSize + 1,
            x * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
          )
          this.blocks[x][y] = 0
        }
      }
    }
  }

  drawGrid() {
    for (let x = this.blockSize; x < this.canvas.width; x += this.blockSize) {
      this.ctx.beginPath()
      this.ctx.globalAlpha = 0.2
      this.ctx.fillStyle = "#000000"
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.lineWidth = 1
      this.ctx.stroke()
      this.ctx.closePath()
    }

    for (let y = this.blockSize; y < this.canvas.height; y += this.blockSize) {
      this.ctx.beginPath()
      this.ctx.globalAlpha = 0.2
      this.ctx.fillStyle = "#000000"
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.lineWidth = 1
      this.ctx.stroke()
      this.ctx.closePath()
    }
  }

  getRandomShape() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length)
    const randomShape = this.shapes[randomIndex]
    return randomShape
  }

  drawShape() {
    const { shape, color } = this.currentShape
    for (let i = 0; i < shape.length; i++) {
      let x = shape[i][0] * this.blockSize + 160 + this.moveX
      let y = shape[i][1] * this.blockSize + this.moveY
      this.ctx.fillStyle = color
      this.ctx.globalAlpha = 1
      this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2)
      this.blocks[y / this.blockSize][x / this.blockSize] = 1
    }
    if (this.isGameOver()) {
      alert("Game Over")
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.init()
    }
    this.deleteRow()
  }
  clearShape() {
    const { shape } = this.currentShape
    for (let i = 0; i < shape.length; i++) {
      let x = shape[i][0] * this.blockSize + 160 + this.moveX
      let y = shape[i][1] * this.blockSize + this.moveY
      this.ctx.fillStyle = "white"
      this.ctx.globalAlpha = 1
      this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2)
      this.blocks[y / this.blockSize][x / this.blockSize] = 0
    }
  }
  checkLeft() {
    let flag = false
    const xIsOutside = this.currentShape.shape.find(
      ([x]) => x * this.blockSize + 160 + this.moveX - this.blockSize < 0
    )
    if (xIsOutside) {
      flag = true
    }
    const xy = this.currentShape.shape.map(([x, y]) => {
      const xIndex = (y * this.blockSize + this.moveY) / this.blockSize
      const yIndex = (x * this.blockSize + 160 + this.moveX) / this.blockSize
      return [xIndex, yIndex]
    })
    const yIsEnd = this.currentShape.shape.find(([x, y]) => {
      const xIndex = (y * this.blockSize + this.moveY) / this.blockSize
      const yIndex = (x * this.blockSize + 160 + this.moveX) / this.blockSize
      if (
        this.blocks[xIndex]?.[yIndex - 1] === undefined ||
        (this.blocks[xIndex][yIndex - 1] === 1 &&
          !xy.find(([xx, yy]) => xIndex === xx && yIndex - 1 === yy))
      ) {
        return true
      }
    })
    if (yIsEnd) {
      flag = true
    }
    return flag
  }
  checkRight() {
    let flag = false
    const xIsOutside = this.currentShape.shape.find(
      ([x]) =>
        x * this.blockSize + 160 + this.moveX + this.blockSize >=
        this.canvas.width
    )
    if (xIsOutside) {
      flag = true
    }
    const xy = this.currentShape.shape.map(([x, y]) => {
      const xIndex = (y * this.blockSize + this.moveY) / this.blockSize
      const yIndex = (x * this.blockSize + 160 + this.moveX) / this.blockSize
      return [xIndex, yIndex]
    })
    const yIsEnd = this.currentShape.shape.find(([x, y]) => {
      const xIndex = (y * this.blockSize + this.moveY) / this.blockSize
      const yIndex = (x * this.blockSize + 160 + this.moveX) / this.blockSize
      if (
        this.blocks[xIndex]?.[yIndex + 1] === undefined ||
        (this.blocks[xIndex][yIndex + 1] === 1 &&
          !xy.find(([xx, yy]) => xIndex === xx && yIndex + 1 === yy))
      ) {
        return true
      }
    })
    if (yIsEnd) {
      flag = true
    }
    return flag
  }

  checkDown() {
    let flag = false
    const yIsOutside = this.currentShape.shape.find(
      ([, y]) =>
        y * this.blockSize + this.moveY + this.blockSize >= this.canvas.height
    )
    if (yIsOutside) {
      flag = true
    }
    const xy = this.currentShape.shape.map(([x, y]) => {
      const xIndex = (y * this.blockSize + this.moveY) / this.blockSize
      const yIndex = (x * this.blockSize + 160 + this.moveX) / this.blockSize
      return [xIndex, yIndex]
    })

    const yIsEnd = this.currentShape.shape.find(([x, y]) => {
      const xIndex = (y * this.blockSize + this.moveY) / this.blockSize
      const yIndex = (x * this.blockSize + 160 + this.moveX) / this.blockSize
      if (
        this.blocks[xIndex + 1]?.[yIndex] === undefined ||
        (this.blocks[xIndex + 1][yIndex] === 1 &&
          !xy.find(([xx, yy]) => xIndex + 1 === xx && yIndex === yy))
      ) {
        return true
      }
    })
    if (yIsEnd) {
      flag = true
    }
    return flag
  }
  isGameOver() {
    return !!this.blocks.every((item) => item.find((i) => i === 1))
  }
}

export default Tetris
