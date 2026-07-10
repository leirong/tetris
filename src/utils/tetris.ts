import Music from './music'
import { SHAPES, type Cell } from './shapes'

const ROWS = 20
const COLS = 10
const BLOCK = 20
const PREVIEW_SIZE = 4
/** 新方块出生列(居中) */
const SPAWN_COL = 3

/** 计分板数据，通过回调推送给 React */
export interface GameInfo {
  score: number
  level: number
  lines: number
  paused: boolean
}

type Grid = boolean[][]

interface Piece {
  cells: Cell[]
  row: number
  col: number
}

const createGrid = (): Grid => Array.from({ length: ROWS }, () => Array(COLS).fill(false))

const cloneCells = (cells: readonly Cell[]): Cell[] => cells.map(([x, y]) => [x, y])

/** 俄罗斯方块游戏主类，负责渲染、方块控制与游戏逻辑 */
class Tetris {
  /** 画布 2D 绘图上下文 */
  private ctx: CanvasRenderingContext2D
  /** 下一个方块预览画布 2D 绘图上下文 */
  private nextCtx?: CanvasRenderingContext2D
  /** 棋盘占用矩阵，记录已落定的格子(true 有块, false 空) */
  private grid: Grid = []
  /** 当前下落方块(局部坐标 + 棋盘偏移) */
  private current: Piece = { cells: [], row: 0, col: SPAWN_COL }
  /** 下一个即将出现的方块 */
  private nextCells: Cell[] = []
  /** 分数 */
  private score = 0
  /** 等级 */
  private level = 1
  /** 已消行数 */
  private lines = 0
  /** 是否暂停 */
  private paused = false
  /** 自动下落间隔(毫秒) */
  private speed = 1500
  /** rAF 句柄(用于取消动画循环) */
  private rafId = 0
  /** 上一帧时间戳，用于计算帧间隔 */
  private lastTime = 0
  /** 累计经过的时间，超过 speed 则下落一格 */
  private interval = 0
  /** 音效管理器 */
  private music?: Music
  /** 计分回调 */
  private onUpdate?: (info: GameInfo) => void

  /**
   * @param canvas 画布元素
   * @param nextCanvas 下一个方块预览画布元素
   * @param onUpdate 计分/等级变化回调
   */
  constructor(
    canvas: HTMLCanvasElement,
    nextCanvas?: HTMLCanvasElement | null,
    onUpdate?: (info: GameInfo) => void,
  ) {
    canvas.width = COLS * BLOCK
    canvas.height = ROWS * BLOCK
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context is unavailable')
    this.ctx = ctx
    if (nextCanvas) {
      nextCanvas.width = PREVIEW_SIZE * BLOCK
      nextCanvas.height = PREVIEW_SIZE * BLOCK
      const nextCtx = nextCanvas.getContext('2d')
      if (!nextCtx) throw new Error('Preview canvas 2D context is unavailable')
      this.nextCtx = nextCtx
    }
    this.onUpdate = onUpdate
    this.init()
    document.addEventListener('keydown', this.keydown)
    document.addEventListener('click', this.onFirstClick, { once: true })
  }

  /** 初始化/重置游戏状态并开始动画循环 */
  init() {
    cancelAnimationFrame(this.rafId)
    this.grid = createGrid()
    this.score = 0
    this.level = 1
    this.lines = 0
    this.speed = 1500
    this.paused = false
    this.lastTime = 0
    this.interval = 0
    this.nextCells = this.randomCells()
    this.spawn()
    this.emit()
    this.render()
    this.renderNext()
    this.rafId = requestAnimationFrame(this.animate)
  }

  /** 首次点击时初始化音效(浏览器要求用户交互后才能播放音频) */
  private onFirstClick = () => {
    if (this.music) return
    this.music = new Music()
  }

  /** 键盘事件处理:方向键移动/旋转,空格快速下落 */
  private keydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        this.moveLeft()
        break
      case 'ArrowRight':
        this.moveRight()
        break
      case 'ArrowDown':
        this.moveDown()
        break
      case 'ArrowUp':
        this.rotate()
        break
      case ' ':
        this.fastMoveDown()
        break
      case 'p':
      case 'P':
        this.togglePause()
        break
      default:
        return
    }
    e.preventDefault()
  }

  /** 动画循环，按 speed 间隔自动让方块下落一格 */
  private animate = (time = 0) => {
    if (this.paused) {
      this.lastTime = time
      this.rafId = requestAnimationFrame(this.animate)
      return
    }

    // 首帧只记录时间，不触发下落
    if (this.lastTime === 0) {
      this.lastTime = time
    } else {
      this.interval += time - this.lastTime
      this.lastTime = time
      if (this.interval >= this.speed) {
        this.interval -= this.speed
        this.step()
      }
    }
    this.rafId = requestAnimationFrame(this.animate)
  }

  /** 自动下落一格(静音)，到底则落定并生成新方块 */
  private step() {
    if (this.isColliding(this.current.cells, this.current.row + 1, this.current.col)) {
      this.lock()
      return
    }
    this.current.row++
    this.render()
  }

  /**
   * 通用碰撞检测：给定形状与位置，检查是否越界或与已落定方块重叠
   * @returns 碰撞返回 true
   */
  private isColliding(cells: readonly Cell[], row: number, col: number): boolean {
    for (const [x, y] of cells) {
      const r = row + y
      const c = col + x
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || this.grid[r][c]) return true
    }
    return false
  }

  /** 当前方块向下还能移动的最大格数 */
  private dropDistance(): number {
    let d = 0
    while (!this.isColliding(this.current.cells, this.current.row + d + 1, this.current.col)) {
      d++
    }
    return d
  }

  /** 向左移动一格(触及左边界或有阻挡时不移动) */
  moveLeft() {
    if (this.paused) return
    this.tryMove(0, -1)
  }

  /** 向右移动一格(触及右边界或有阻挡时不移动) */
  moveRight() {
    if (this.paused) return
    this.tryMove(0, 1)
  }

  /** 向下移动一格(手动，播放音效)，到底则落定 */
  moveDown() {
    if (this.paused) return
    if (!this.tryMove(1, 0)) this.lock()
  }

  /** 尝试移动当前方块，成功时重绘并播放移动音效 */
  private tryMove(rowDelta: number, colDelta: number): boolean {
    const { cells, row, col } = this.current
    if (this.isColliding(cells, row + rowDelta, col + colDelta)) return false
    this.current.row += rowDelta
    this.current.col += colDelta
    this.render()
    this.music?.play('move')
    return true
  }

  /** 逆时针旋转 90 度(碰撞则不生效) */
  rotate() {
    if (this.paused) return
    const max = Math.max(...this.current.cells.flatMap(([x, y]) => [x, y]))
    const rotated: Cell[] = this.current.cells.map(([x, y]) => [y, max - x])
    if (this.isColliding(rotated, this.current.row, this.current.col)) return
    this.current.cells = rotated
    this.render()
    this.music?.play('rotate')
  }

  /** 快速下落：直接落到底部并生成新方块 */
  fastMoveDown() {
    if (this.paused) return
    this.current.row += this.dropDistance()
    this.lock()
    this.music?.play('fastMove')
  }

  /** 切换暂停/继续状态 */
  togglePause() {
    this.paused = !this.paused
    this.interval = 0
    this.lastTime = 0
    this.emit()
    this.render()
  }

  /** 落定当前方块：写入 grid → 消行 → 生成新方块 */
  private lock() {
    for (const [x, y] of this.current.cells) {
      this.grid[this.current.row + y][this.current.col + x] = true
    }
    this.clearLines()
    this.spawn()
    this.render()
  }

  /** 检测并消除已填满的整行，上方方块下移，并计分/升级/加速 */
  private clearLines() {
    const remaining = this.grid.filter((row) => !row.every(Boolean))
    const count = ROWS - remaining.length
    if (count === 0) return
    // 顶部补空行
    while (remaining.length < ROWS) remaining.unshift(Array(COLS).fill(false))
    this.grid = remaining
    this.lines += count
    this.score += [0, 40, 100, 300, 1200][count] * this.level
    this.level = Math.floor(this.lines / 10) + 1
    this.speed = Math.max(100, 1500 - (this.level - 1) * 100)
    this.music?.play('clear')
    this.emit()
  }

  /** 随机生成新方块，若出生即碰撞则游戏结束 */
  private spawn() {
    this.current = { cells: cloneCells(this.nextCells), row: 0, col: SPAWN_COL }
    this.nextCells = this.randomCells()
    this.renderNext()
    if (this.isColliding(this.current.cells, this.current.row, this.current.col)) {
      this.gameOver()
    }
  }

  /** 游戏结束 */
  private gameOver() {
    cancelAnimationFrame(this.rafId)
    this.music?.play('gameOver')
    alert('Game Over')
    this.init()
  }

  /** 推送计分数据给 React */
  private emit() {
    this.onUpdate?.({ score: this.score, level: this.level, lines: this.lines, paused: this.paused })
  }

  /** 随机复制一个方块形状 */
  private randomCells(): Cell[] {
    return cloneCells(SHAPES[Math.floor(Math.random() * SHAPES.length)])
  }

  /** 全量重绘：背景 → 已落定方块 → 落点预览 → 当前方块 */
  private render() {
    const { cells, row, col } = this.current
    this.ctx.fillStyle = '#9ead86'
    this.ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK)
    // 网格 + 已落定方块
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.drawCell(c, r, this.grid[r][c] ? '#000' : '#879372')
      }
    }
    // 落点预览(仅当还能下落时)
    const drop = this.dropDistance()
    if (drop > 0) {
      for (const [x, y] of cells) {
        this.drawCell(col + x, row + y + drop, '#00000060')
      }
    }
    // 当前方块
    for (const [x, y] of cells) {
      this.drawCell(col + x, row + y, '#000')
    }

    if (this.paused) {
      this.ctx.fillStyle = '#00000055'
      this.ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK)
      this.ctx.fillStyle = '#9ead86'
      this.ctx.font = 'bold 24px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText('PAUSED', (COLS * BLOCK) / 2, (ROWS * BLOCK) / 2)
    }
  }

  /** 重绘下一个方块预览 */
  private renderNext() {
    if (!this.nextCtx) return

    this.nextCtx.fillStyle = '#9ead86'
    this.nextCtx.fillRect(0, 0, PREVIEW_SIZE * BLOCK, PREVIEW_SIZE * BLOCK)
    for (let r = 0; r < PREVIEW_SIZE; r++) {
      for (let c = 0; c < PREVIEW_SIZE; c++) {
        this.drawPreviewCell(c, r, '#879372')
      }
    }

    const maxX = Math.max(...this.nextCells.map(([x]) => x))
    const maxY = Math.max(...this.nextCells.map(([, y]) => y))
    const minX = Math.min(...this.nextCells.map(([x]) => x))
    const minY = Math.min(...this.nextCells.map(([, y]) => y))
    const offsetCol = (PREVIEW_SIZE - (maxX - minX + 1)) / 2 - minX
    const offsetRow = (PREVIEW_SIZE - (maxY - minY + 1)) / 2 - minY

    for (const [x, y] of this.nextCells) {
      this.drawPreviewCell(offsetCol + x, offsetRow + y, '#000')
    }
  }

  /**
   * 绘制单个格子(带边框和内部填充)
   * @param col 格子列(网格单位)
   * @param row 格子行(网格单位)
   * @param color 边框与填充颜色
   */
  private drawCell(col: number, row: number, color: string) {
    const x = col * BLOCK
    const y = row * BLOCK
    this.ctx.strokeStyle = color
    this.ctx.strokeRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4)
    this.ctx.fillStyle = color
    this.ctx.fillRect(x + 5, y + 5, BLOCK - 10, BLOCK - 10)
  }

  /** 绘制预览画布里的单个格子 */
  private drawPreviewCell(col: number, row: number, color: string) {
    if (!this.nextCtx) return

    const x = col * BLOCK
    const y = row * BLOCK
    this.nextCtx.strokeStyle = color
    this.nextCtx.strokeRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4)
    this.nextCtx.fillStyle = color
    this.nextCtx.fillRect(x + 5, y + 5, BLOCK - 10, BLOCK - 10)
  }

  /** 销毁：取消动画循环并移除事件监听(供 React cleanup 调用) */
  destroy() {
    cancelAnimationFrame(this.rafId)
    this.music?.destroy()
    document.removeEventListener('keydown', this.keydown)
    document.removeEventListener('click', this.onFirstClick)
  }
}

export default Tetris
