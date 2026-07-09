import Music, { type AudioType } from './music'
import { type Shape, TShape, SShape, ZShape, OShape, IShape, LShape, JShape } from './shapes'

/** 俄罗斯方块游戏主类，负责渲染、方块控制与游戏逻辑 */
class Tetris {
  /** 游戏画布元素 */
  private canvas: HTMLCanvasElement
  /** 画布 2D 绘图上下文 */
  private ctx: CanvasRenderingContext2D
  /** 画布宽度(像素) */
  private width = 200
  /** 画布高度(像素) */
  private height = 400
  /** 背景色 */
  private bgColor = '#9ead86'
  /** 空格子(网格)颜色 */
  private emptyShapeColor = '#879372'
  /** 落点预览方块颜色(半透明) */
  private previewShapeColor = '#00000060'
  /** 已落定/当前方块颜色 */
  private shapeColor = '#000'
  /** 单个格子边长(像素) */
  private blockSize = 20
  /** 新方块出生时的水平起始偏移(像素) */
  private left = 80
  /** 所有可用方块形状 */
  private shapes: Shape[]
  /** 当前方块还能向下移动的最大格数(用于快速下落与预览) */
  private maxMoveY = 0
  /** 当前方块相对出生点的水平偏移(像素) */
  private moveX = 0
  /** 当前方块相对出生点的垂直偏移(像素) */
  private moveY = 0
  /** 自动下落间隔(毫秒) */
  private speed = 1500
  /** 上一帧时间戳，用于计算帧间隔 */
  private lastTime = 0
  /** 累计经过的时间，超过 speed 则下落一格 */
  private interval = 0
  /** 静态方块矩阵，记录已落定的格子(1 有块,0 空) */
  private blocks: number[][] = []
  /** 动态方块矩阵,记录当前下落中方块占据的格子 */
  private dynamicBlocks: number[][] = []
  /** 当前正在下落的方块 */
  private currentShape!: Shape
  /** 音效管理器 */
  private music?: Music
  /** 音效类型映射 */
  private musicType!: Record<AudioType, AudioType>

  /**
   * @param element 画布元素的 id
   */
  constructor(element: string) {
    // 获取画布并设置尺寸
    this.canvas = document.getElementById(element) as HTMLCanvasElement
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')!
    // 初始化所有可用的方块形状
    this.shapes = [new TShape(), new SShape(), new ZShape(), new IShape(), new LShape(), new JShape(), new OShape()]
    this.init()
    // 监听键盘事件控制方块
    document.addEventListener('keydown', this.keydown.bind(this))
    // 首次点击页面时初始化音效(浏览器要求用户交互后才能播放音频)
    document.addEventListener('click', () => {
      if (this.music) {
        return
      }
      this.music = new Music()
      this.musicType = this.music.getType()
    })
  }

  /** 初始化/重置游戏状态并开始动画循环 */
  init() {
    // 创建空的静态方块矩阵
    this.blocks = Array(this.height / this.blockSize)
      .fill(0)
      .map(() => Array(this.width / this.blockSize).fill(0))
    this.clearDynamicBlocks()
    // 绘制背景与网格
    this.ctx.fillStyle = this.bgColor
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.strokeRect(0, 0, this.width, this.height)
    this.drawGrid()
    // 重置偏移并生成第一个方块
    this.moveX = 0
    this.moveY = 0
    this.currentShape = this.getRandomShape()
    this.drawShape()
    // 重置速度与计时器
    this.speed = 1500
    this.lastTime = 0
    this.interval = 0
    this.animate()
  }

  /** 清空动态方块矩阵(重置为全 0) */
  clearDynamicBlocks() {
    this.dynamicBlocks = Array(this.height / this.blockSize)
      .fill(0)
      .map(() => Array(this.width / this.blockSize).fill(0))
  }

  /** 将动态方块合并到静态方块矩阵(方块落定时调用) */
  mergeBlocks() {
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((value, j) => {
        if (value) {
          this.blocks[i][j] = 1
        }
      })
    })
  }

  /**
   * 动画循环，按 speed 间隔自动让方块下落一格
   * @param time requestAnimationFrame 传入的当前时间戳
   */
  animate(time = 0) {
    this.interval += time - this.lastTime
    this.lastTime = time
    if (this.interval > this.speed) {
      this.interval = 0
      this.moveDown()
    }
    requestAnimationFrame(this.animate.bind(this))
  }

  /** 逆时针旋转 90 度(旋转后越界则不生效) */
  rotate() {
    this.clearShape()
    // 以 [x, y] -> [y, max - x] 的映射实现旋转
    const newShape = this.currentShape.shape.map(([x, y]) => [y, this.getMax() - x])
    // 旋转过后需要判断是否超出了画布
    let flag = true
    for (let i = 0; i < newShape.length; i++) {
      const x = newShape[i][0] * this.blockSize + this.left + this.moveX
      const y = newShape[i][1] * this.blockSize + this.moveY
      if (
        this.blocks?.[y / this.blockSize] === undefined ||
        this.blocks?.[y / this.blockSize]?.[x / this.blockSize] === undefined
      ) {
        flag = false
        break
      }
    }
    // 只有旋转后未越界才应用新形状
    if (flag) {
      this.currentShape.shape = newShape
    }
    this.drawShape()
    this.music?.play(this.musicType.rotate)
  }

  /**
   * 获取当前方块坐标中的最大值(用于旋转计算)
   * @returns 坐标最大值
   */
  getMax() {
    let max = 0
    for (let index = 0; index < this.currentShape.shape.length; index++) {
      const [x, y] = this.currentShape.shape[index]
      max = Math.max(max, x, y)
    }
    return max
  }

  /**
   * 获取当前方块 y 坐标的最大值(即方块的最底部相对行)
   * @returns y 坐标最大值
   */
  getMaY() {
    let maxY = 0
    for (let index = 0; index < this.currentShape.shape.length; index++) {
      const [, y] = this.currentShape.shape[index]
      maxY = Math.max(maxY, y)
    }
    return maxY
  }

  /**
   * 键盘事件处理:方向键移动/旋转,空格快速下落
   * @param e 键盘事件对象
   */
  keydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      this.moveLeft()
    } else if (e.key === 'ArrowRight') {
      this.moveRight()
    } else if (e.key === 'ArrowDown') {
      this.moveDown()
    } else if (e.key === 'ArrowUp') {
      this.rotate()
    } else if (e.key === ' ') {
      this.fastMoveDown()
    }
  }

  /**
   * 获取当前方块向下能移动的最大步数
   * @returns 可下落的最大格数
   */
  getMaxMoveY() {
    // 收集当前动态方块所有格子的坐标
    const all: [number, number][] = []
    for (let i = 0; i < this.dynamicBlocks.length; i++) {
      for (let j = 0; j < this.dynamicBlocks[i].length; j++) {
        if (this.dynamicBlocks[i][j]) {
          all.push([i, j])
        }
      }
    }
    // 逐步向下平移，直到碰到已落定方块或触底
    let max = 0
    for (let index = 0; index < this.dynamicBlocks.length; index++) {
      if (all.some(([i, j]) => this.blocks?.[i + index]?.[j] === 1 || this.blocks?.[i + index]?.[j] === undefined)) {
        break
      } else {
        max++
      }
    }
    return max - 1 < 0 ? 0 : max - 1
  }

  /** 向左移动一格(触及左边界或有阻挡时不移动) */
  moveLeft() {
    // 已到最左侧则不移动
    if (this.checkLeft()) {
      console.log('已经到最左边了')
      return
    }
    this.clearShape()
    this.moveX -= this.blockSize
    this.drawShape()
    this.music?.play(this.musicType.move)
  }

  /** 向右移动一格(触及右边界或有阻挡时不移动) */
  moveRight() {
    // 已到最右侧则不移动
    if (this.checkRight()) {
      console.log('已经到最右边了')
      return
    }
    this.clearShape()
    this.moveX += this.blockSize
    this.drawShape()
    this.music?.play(this.musicType.move)
  }

  /**
   * 向下移动一格,到底时落定当前方块并生成新方块
   * @param playMusic 是否播放移动音效
   */
  moveDown(playMusic = false) {
    // 已到底部或碰到其他方块:落定当前方块并生成新方块
    if (this.checkDown()) {
      console.log('已经到最下边了')
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
    playMusic && this.music?.play(this.musicType.move)
  }

  /** 快速下落:将当前方块直接落到底部并生成新方块 */
  fastMoveDown() {
    // 将动态方块直接下移到可落地的最底部位置
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((value, j) => {
        if (value) {
          this.dynamicBlocks[i][j] = 0
          this.blocks[i + this.maxMoveY][j] = 1
        }
      })
    })
    // 到底后落定方块并生成新方块
    if (this.checkDown()) {
      console.log('已经到最下边了')
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
    this.music?.play(this.musicType.fastMove)
  }

  /** 检测并消除已填满的整行,并将上方方块下移 */
  deleteRow() {
    // 找出所有已被填满的行的索引
    const needDeleteIndexArr = this.blocks
      .map((item, index): [boolean, number] => {
        if (item.every((j) => j === 1)) {
          return [true, index]
        }
        return [false, index]
      })
      .filter(([b]) => b)
      .map(([, i]) => i)
    // 将需要消除的行清空并重绘为空格子
    for (let x = this.blocks.length - 1; x >= 0; x--) {
      for (let y = 0; y < this.blocks[x].length; y++) {
        if (needDeleteIndexArr.includes(x)) {
          this.ctx.fillStyle = this.bgColor
          this.ctx.fillRect(y * this.blockSize + 1, x * this.blockSize + 1, this.blockSize - 2, this.blockSize - 2)
          this.drawRect(y * this.blockSize, x * this.blockSize, this.emptyShapeColor, this.emptyShapeColor)
          this.blocks[x][y] = 0
        }
      }
    }

    // 消除行后，需要上面的块往下移动一个位置
    needDeleteIndexArr.forEach((needDeleteIndex) => {
      for (let i = needDeleteIndex - 1; i >= 0; i--) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          // 先擦除下一行的旧内容
          this.ctx.fillStyle = this.bgColor
          this.ctx.fillRect(
            j * this.blockSize + 1,
            (i + 1) * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2,
          )
          // 根据上一行是否有方块,重绘下一行
          if (this.blocks[i][j]) {
            this.drawRect(j * this.blockSize, (i + 1) * this.blockSize, this.shapeColor, this.shapeColor)
          } else {
            this.drawRect(j * this.blockSize, (i + 1) * this.blockSize, this.emptyShapeColor, this.emptyShapeColor)
          }
          // 数据同步下移一行
          this.blocks[i + 1][j] = this.blocks[i][j]
        }
      }
    })
  }

  /**
   * 绘制单个格子(带边框和内部填充)
   * @param x 格子左上角 x 坐标(像素)
   * @param y 格子左上角 y 坐标(像素)
   * @param borderColor 边框颜色
   * @param contentColor 内部填充颜色
   */
  drawRect(x: number, y: number, borderColor: string, contentColor: string) {
    this.ctx.strokeStyle = borderColor
    this.ctx.strokeRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4)

    this.ctx.fillStyle = contentColor
    this.ctx.fillRect(x + 5, y + 5, this.blockSize - 10, this.blockSize - 10)
  }

  /** 绘制整个背景网格(所有空格子) */
  drawGrid() {
    for (let x = 0; x < this.width; x += this.blockSize) {
      for (let y = 0; y < this.height; y += this.blockSize) {
        this.drawRect(x, y, this.emptyShapeColor, this.emptyShapeColor)
      }
    }
  }

  /**
   * 随机返回一个方块形状
   * @returns 随机选中的方块
   */
  getRandomShape() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length)
    const randomShape = this.shapes[randomIndex]
    return randomShape
  }

  /** 绘制当前方块的落点预览(显示方块最终会落在哪里) */
  drawPreview() {
    // 收集不需要被清除的格子:已有方块、当前方块及其预览落点
    const notClearIndexArr: [number, number][] = []
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

    // 清除上一帧残留的预览格子(不在保留列表中的动态区域)
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((_item2, j) => {
        if (!notClearIndexArr.find(([ii, jj]) => i === ii && j === jj)) {
          this.ctx.fillStyle = this.bgColor
          this.ctx.fillRect(j * this.blockSize + 1, i * this.blockSize + 1, this.blockSize - 2, this.blockSize - 2)
          this.drawRect(j * this.blockSize, i * this.blockSize, this.emptyShapeColor, this.emptyShapeColor)
        }
      })
    })

    // 在落点位置绘制半透明预览方块(仅当预览不与当前方块重叠时)
    this.dynamicBlocks.forEach((item, i) => {
      item.forEach((item2, j) => {
        if (item2 === 1) {
          if (this.maxMoveY > this.getMaY()) {
            this.ctx.fillStyle = this.bgColor
            this.ctx.fillRect(
              j * this.blockSize + 1,
              (i + this.maxMoveY) * this.blockSize + 1,
              this.blockSize - 2,
              this.blockSize - 2,
            )

            this.drawRect(
              j * this.blockSize,
              (i + this.maxMoveY) * this.blockSize,
              this.previewShapeColor,
              this.previewShapeColor,
            )
          }
        }
      })
    })
  }

  /** 绘制当前方块,并更新动态矩阵、预览与游戏结束判定 */
  drawShape() {
    const { shape } = this.currentShape
    for (let i = 0; i < shape.length; i++) {
      const x = shape[i][0] * this.blockSize + this.left + this.moveX
      const y = shape[i][1] * this.blockSize + this.moveY
      this.drawRect(x, y, this.shapeColor, this.shapeColor)
      this.dynamicBlocks[y / this.blockSize][x / this.blockSize] = 1
    }
    this.maxMoveY = this.getMaxMoveY()
    this.drawPreview()
    // 判断游戏是否结束,若结束则提示并重新开始
    if (this.isGameOver()) {
      this.music?.play(this.musicType.gameOver)
      alert('Game Over')
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.init()
    }
  }

  /** 擦除当前方块(移动前调用,把方块所在格子还原为空) */
  clearShape() {
    const { shape } = this.currentShape
    for (let i = 0; i < shape.length; i++) {
      const x = shape[i][0] * this.blockSize + this.left + this.moveX
      const y = shape[i][1] * this.blockSize + this.moveY
      this.ctx.fillStyle = this.bgColor
      this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2)

      this.drawRect(x, y, this.emptyShapeColor, this.emptyShapeColor)
      this.dynamicBlocks[y / this.blockSize][x / this.blockSize] = 0
    }
  }

  /**
   * 检测当前方块是否无法再向左移动(触及左边界或有阻挡)
   * @returns 无法左移返回 true
   */
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

  /**
   * 检测当前方块是否无法再向右移动(触及右边界或有阻挡)
   * @returns 无法右移返回 true
   */
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

  /**
   * 检测当前方块是否无法再向下移动(触底或下方有阻挡)
   * @returns 无法下移返回 true
   */
  checkDown() {
    let flag = false
    // 检查是否超出了画布
    const yIsOutside = this.dynamicBlocks.some((item, index) => {
      return index === this.dynamicBlocks.length - 1 && item.find((i) => i === 1)
    })
    if (yIsOutside) {
      flag = true
    }
    // 检查是否和别的方块重叠了
    outerLoop: for (let i = 0; i < this.dynamicBlocks.length; i++) {
      for (let j = 0; j < this.dynamicBlocks[i].length; j++) {
        if ((this.dynamicBlocks[i][j] === 1 && this.blocks[i + 1][j] === 1) || yIsOutside) {
          flag = true
          break outerLoop
        }
      }
    }
    return flag
  }

  /**
   * 判断游戏是否结束(每一行都存在已落定方块时视为堆满)
   * @returns 游戏结束返回 true
   */
  isGameOver() {
    return !!this.blocks.every((item) => item.find((i) => i === 1))
  }
}

export default Tetris
