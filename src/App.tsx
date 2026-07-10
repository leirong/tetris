import { useEffect, useRef, useState } from 'react'
import './App.scss'
import Tetris, { type GameInfo } from '@/utils/tetris'

function App() {
  const [scale, setScale] = useState(1)
  const [info, setInfo] = useState<GameInfo>({ score: 0, level: 1, lines: 0, paused: false })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nextCanvasRef = useRef<HTMLCanvasElement>(null)
  const tetris = useRef<Tetris | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !nextCanvasRef.current) return

    tetris.current = new Tetris(canvasRef.current, nextCanvasRef.current, setInfo)
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
  const togglePause = () => tetris.current?.togglePause()

  return (
    <div className='container'>
      <div className='scoreboard'>
        <span>Score: {info.score}</span>
        <span>Level: {info.level}</span>
        <span>Lines: {info.lines}</span>
      </div>
      <div className='game-area'>
        <div className='preview-panel'>
          <span>Next</span>
          <canvas ref={nextCanvasRef} className='next-canvas'></canvas>
          <button className='pause' type='button' onClick={togglePause}>
            {info.paused ? 'Resume' : 'Pause'}
          </button>
        </div>
        <canvas ref={canvasRef} className='board-canvas' style={{ transform: `scale(${scale})` }}></canvas>
      </div>
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
