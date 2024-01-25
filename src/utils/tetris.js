class TShape {
  constructor() {
    this.shape = [
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ]
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
  }
}

class IShape {
  constructor() {
    this.shape = [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ]
  }
}

class LShape {
  constructor() {
    this.shape = [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ]
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
  }
}
class Tetris {
  constructor(element) {
    this.canvas = document.getElementById(element)
    this.canvas.width = 300
    this.canvas.height = 500
    this.bgColor = "#9ead86"
    this.emptyShapeColor = "#879372"
    this.previewShapeColor = "#00000060"
    this.shapeColor = "#000"
    this.ctx = this.canvas.getContext("2d")
    this.blockSize = 20
    this.left = 120
    this.shapes = [
      new TShape(),
      new SShape(),
      new ZShape(),
      new IShape(),
      new LShape(),
      new JShape(),
      new OShape(),
    ]
    this.maxMoveY = 0
    this.init()
    document.addEventListener("keydown", this.keydown.bind(this))
  }

  init() {
    this.blocks = Array(this.canvas.height / this.blockSize)
      .fill(0)
      .map(() => Array(this.canvas.width / this.blockSize).fill(0))
    this.clearDynamicBlocks()
    this.ctx.fillStyle = this.bgColor
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

  clearDynamicBlocks() {
    this.dynamicBlocks = Array(this.canvas.height / this.blockSize)
      .fill(0)
      .map(() => Array(this.canvas.width / this.blockSize).fill(0))
  }

  mergeBlocks() {
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((value, j) => {
        if (value) {
          this.blocks[i][j] = 1
        }
      })
    })
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

  /**
   * 逆时针旋转90度
   */

  rotate() {
    const newShape = this.currentShape.shape.map(([x, y]) => [
      y,
      this.getMax() - x,
    ])
    // 旋转过后需要判断是否超出了画布
    let flag = true
    for (let i = 0; i < newShape.length; i++) {
      let x = newShape[i][0] * this.blockSize + this.left + this.moveX
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

  getMax() {
    let max = 0
    for (let index = 0; index < this.currentShape.shape.length; index++) {
      const [x, y] = this.currentShape.shape[index]
      max = Math.max(max, x, y)
    }
    return max
  }

  getMaY() {
    let maxY = 0
    for (let index = 0; index < this.currentShape.shape.length; index++) {
      const [, y] = this.currentShape.shape[index]
      maxY = Math.max(maxY, y)
    }
    return maxY
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
      this.fastMoveDown()
    }
  }

  // 获取向下能移动的最大步数
  getMaxMoveY() {
    const all = []
    for (let i = 0; i < this.dynamicBlocks.length; i++) {
      for (let j = 0; j < this.dynamicBlocks[i].length; j++) {
        if (this.dynamicBlocks[i][j]) {
          all.push([i, j])
        }
      }
    }
    let max = 0
    for (let index = 0; index < this.dynamicBlocks.length; index++) {
      if (
        all.some(
          ([i, j]) =>
            this.blocks?.[i + index]?.[j] === 1 ||
            this.blocks?.[i + index]?.[j] === undefined
        )
      ) {
        break
      } else {
        max++
      }
    }
    return max - 1 < 0 ? 0 : max - 1
  }

  /**
   * 向下移动
   */

  moveDown() {
    if (this.checkDown()) {
      console.log("已经到最下边了")
      this.mergeBlocks()
      this.clearDynamicBlocks()
      this.deleteRow()
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

  /**
   * 快速向下移动
   */
  
  fastMoveDown() {
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((value, j) => {
        if (value) {
          this.dynamicBlocks[i][j] = 0
          this.blocks[i + this.maxMoveY][j] = 1
        }
      })
    })
    if (this.checkDown()) {
      console.log("已经到最下边了")
      this.mergeBlocks()
      this.clearDynamicBlocks()
      this.deleteRow()
      this.moveX = 0
      this.moveY = 0
      this.currentShape = this.getRandomShape()
      this.drawShape()
      return
    }
    this.clearShape()
    this.moveY += this.blockSize * this.maxMoveY
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
          this.ctx.fillStyle = this.bgColor
          this.ctx.fillRect(
            y * this.blockSize + 1,
            x * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
          )
          this.drawRect(
            y * this.blockSize,
            x * this.blockSize,
            this.emptyShapeColor,
            this.emptyShapeColor
          )
          this.blocks[x][y] = 0
        }
      }
    }

    // 消除行后，需要上面的块往下移动一个位置
    needDeleteIndexArr.forEach((needDeleteIndex) => {
      for (let i = needDeleteIndex - 1; i >= 0; i--) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          this.ctx.fillStyle = this.bgColor
          this.ctx.fillRect(
            j * this.blockSize + 1,
            (i + 1) * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
          )
          if (this.blocks[i][j]) {
            this.drawRect(
              j * this.blockSize,
              (i + 1) * this.blockSize,
              this.shapeColor,
              this.shapeColor
            )
          } else {
            this.drawRect(
              j * this.blockSize,
              (i + 1) * this.blockSize,
              this.emptyShapeColor,
              this.emptyShapeColor
            )
          }
          this.blocks[i + 1][j] = this.blocks[i][j]
        }
      }
    })
  }

  drawRect(x, y, borderColor, contentColor) {
    this.ctx.strokeStyle = borderColor
    this.ctx.strokeRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4)

    this.ctx.fillStyle = contentColor
    this.ctx.fillRect(x + 5, y + 5, this.blockSize - 10, this.blockSize - 10)
  }

  drawGrid() {
    for (let x = 0; x < this.canvas.width; x += this.blockSize) {
      for (let y = 0; y < this.canvas.height; y += this.blockSize) {
        this.drawRect(x, y, this.emptyShapeColor, this.emptyShapeColor)
      }
    }
  }

  getRandomShape() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length)
    const randomShape = this.shapes[randomIndex]
    return randomShape
  }

  drawPreview() {
    const notClearIndexArr = []
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((item2, j) => {
        if (this.blocks[i][j] === 1 || this.dynamicBlocks[i][j] === 1) {
          notClearIndexArr.push([i, j])
        }
        if (item2 === 1) {
          notClearIndexArr.push([i + this.maxMoveY, j])
        }
      })
    })

    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((item2, j) => {
        if (!notClearIndexArr.find(([ii, jj]) => i === ii && j === jj)) {
          this.ctx.fillStyle = this.bgColor
          this.ctx.fillRect(
            j * this.blockSize + 1,
            i * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
          )
          this.drawRect(
            j * this.blockSize,
            i * this.blockSize,
            this.emptyShapeColor,
            this.emptyShapeColor
          )
        }
      })
    })

    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((item2, j) => {
        if (item2 === 1) {
          if (this.maxMoveY > this.getMaY()) {
            this.ctx.fillStyle = this.bgColor
            this.ctx.fillRect(
              j * this.blockSize + 1,
              (i + this.maxMoveY) * this.blockSize + 1,
              this.blockSize - 2,
              this.blockSize - 2
            )
            
            this.drawRect(
              j * this.blockSize,
              (i + this.maxMoveY) * this.blockSize,
              this.previewShapeColor,
              this.previewShapeColor
            )
          }
        }
      })
    })
  }

  drawShape() {
    const { shape } = this.currentShape
    for (let i = 0; i < shape.length; i++) {
      let x = shape[i][0] * this.blockSize + this.left + this.moveX
      let y = shape[i][1] * this.blockSize + this.moveY
      this.drawRect(x, y, this.shapeColor, this.shapeColor)
      this.dynamicBlocks[y / this.blockSize][x / this.blockSize] = 1
    }
    this.maxMoveY = this.getMaxMoveY()
    this.drawPreview()
    if (this.isGameOver()) {
      alert("Game Over")
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.init()
    }
  }
  clearShape() {
    const { shape } = this.currentShape
    for (let i = 0; i < shape.length; i++) {
      let x = shape[i][0] * this.blockSize + this.left + this.moveX
      let y = shape[i][1] * this.blockSize + this.moveY
      this.ctx.fillStyle = this.bgColor
      this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2)

      this.drawRect(x, y, this.emptyShapeColor, this.emptyShapeColor)
      this.dynamicBlocks[y / this.blockSize][x / this.blockSize] = 0
    }
  }
  checkLeft() {
    let flag = false
    // 检查是否超出了画布
    const xIsOutside = this.dynamicBlocks.some((item) => {
      return item[0] === 1
    })
    if (xIsOutside) {
      flag = true
    }

    // 检查是否和别的方块重叠了
    outerLoop: for (let i = 0; i < this.dynamicBlocks.length; i++) {
      for (let j = 0; j < this.dynamicBlocks[i].length; j++) {
        if (this.dynamicBlocks[i][j] === 1 && this.blocks[i][j - 1] === 1) {
          flag = true
          break outerLoop
        }
      }
    }
    return flag
  }
  checkRight() {
    let flag = false
    // 检查是否超出了画布
    const xIsOutside = this.dynamicBlocks.some((item) => {
      return item[item.length - 1] === 1
    })
    if (xIsOutside) {
      flag = true
    }
    // 检查是否和别的方块重叠了
    outerLoop: for (let i = 0; i < this.dynamicBlocks.length; i++) {
      for (let j = 0; j < this.dynamicBlocks[i].length; j++) {
        if (this.dynamicBlocks[i][j] === 1 && this.blocks[i][j + 1] === 1) {
          flag = true
          break outerLoop
        }
      }
    }
    return flag
  }

  checkDown() {
    let flag = false
    // 检查是否超出了画布
    const yIsOutside = this.dynamicBlocks.some((item, index) => {
      return (
        index === this.dynamicBlocks.length - 1 && item.find((i) => i === 1)
      )
    })
    if (yIsOutside) {
      flag = true
    }
    // 检查是否和别的方块重叠了
    outerLoop: for (let i = 0; i < this.dynamicBlocks.length; i++) {
      for (let j = 0; j < this.dynamicBlocks[i].length; j++) {
        if (
          (this.dynamicBlocks[i][j] === 1 && this.blocks[i + 1][j] === 1) ||
          yIsOutside
        ) {
          flag = true
          break outerLoop
        }
      }
    }
    return flag
  }
  isGameOver() {
    return !!this.blocks.every((item) => item.find((i) => i === 1))
  }
}

export default Tetris
