import { useEffect, useRef, useState } from 'react'
import './App.scss'
import Tetris, { type GameInfo } from '@/utils/tetris'

function App() {
  const [scale, setScale] = useState(1)
  const [info, setInfo] = useState<GameInfo>({ score: 0, level: 1, lines: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tetris = useRef<Tetris | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    tetris.current = new Tetris(canvasRef.current, setInfo)
    const onResize = () => {
      const width = document.body.clientWidth
      setScale(width <= 200 ? width / 200 : 1)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      tetris.current?.destroy()
    }
  }, [])

  const fastMoveDown = () => tetris.current?.fastMoveDown()
  const rotate = () => tetris.current?.rotate()
  const moveLeft = () => tetris.current?.moveLeft()
  const moveRight = () => tetris.current?.moveRight()
  const moveDown = () => tetris.current?.moveDown()

  return (
    <div className='container'>
      <div className='scoreboard'>
        <span>Score: {info.score}</span>
        <span>Level: {info.level}</span>
        <span>Lines: {info.lines}</span>
      </div>
      <canvas ref={canvasRef} style={{ transform: `scale(${scale})` }}></canvas>
      <section>
        <button className='fast-move' type='button' onClick={fastMoveDown}>
          Drop
        </button>
        <div className='description'>
          <div className='up-w'>
            <button className='up' type='button' onClick={rotate}>
              Rotation
            </button>
          </div>
          <div className='left-w'>
            <button className='move-left' type='button' onClick={moveLeft}>
              Left
            </button>
          </div>
          <div className='right-w'>
            <button className='move-right' type='button' onClick={moveRight}>
              Right
            </button>
          </div>
          <div className='down-w'>
            <button className='move-down' type='button' onClick={moveDown}>
              Down
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
