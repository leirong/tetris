export type Cell = readonly [x: number, y: number]
export type Shape = readonly Cell[]

/**
 * 7 种俄罗斯方块形状
 * 每个形状由 4 个 [x, y] 局部坐标组成，原点为左上角
 */
export const SHAPES = [
  [[0, 1], [1, 1], [2, 1], [1, 2]], // T
  [[1, 0], [2, 0], [0, 1], [1, 1]], // S
  [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
  [[0, 0], [1, 0], [0, 1], [1, 1]], // O
  [[0, 1], [1, 1], [2, 1], [3, 1]], // I
  [[1, 0], [1, 1], [1, 2], [2, 2]], // L
  [[1, 0], [1, 1], [1, 2], [0, 2]], // J
] as const satisfies readonly Shape[]
