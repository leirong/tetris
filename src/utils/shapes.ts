/**
 * 方块形状接口
 * shape 是一组坐标点 [x, y]，描述方块由哪些格子组成，
 * 坐标以形状自身的局部网格为原点（左上角为 0,0)
 */
export interface Shape {
  shape: number[][]
}

/** T 形方块 */
export class TShape implements Shape {
  shape = [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ]
}

/** S 形方块 */
export class SShape implements Shape {
  shape = [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ]
}

/** Z 形方块 */
export class ZShape implements Shape {
  shape = [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ]
}

/** O 形方块(正方形) */
export class OShape implements Shape {
  shape = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]
}

/** I 形方块(长条) */
export class IShape implements Shape {
  shape = [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ]
}

/** L 形方块 */
export class LShape implements Shape {
  shape = [
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 2],
  ]
}

/** J 形方块 */
export class JShape implements Shape {
  shape = [
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 2],
  ]
}
