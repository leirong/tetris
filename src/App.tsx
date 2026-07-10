import { useEffect, useRef, useState } from 'react'
import './App.scss'
import classnames from 'classnames'
import Tetris, { type GameInfo } from '@/utils/tetris'

function App() {
  const [scale, setScale] = useState(1)
  const [info, setInfo] = useState<GameInfo>({ score: 0, level: 1, lines: 0 })
  const tetris = useRef<Tetris | null>(null)

  useEffect(() => {
    tetris.current = new Tetris('tetris', setInfo)
    const onResize = () => {
      const width = document.body.clientWidth
      setScale(width <= 200 ? width / 200 : 1)
    }
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
      <canvas id='tetris' style={{ transform: `scale(${scale})` }}></canvas>
      <section>
        <div className={classnames('fast-move')} onClick={fastMoveDown}>
          Drop
        </div>
        <div className='description'>
          <div className='up-w'>
            <span className={classnames('up')} onClick={rotate}>
              Rotation
            </span>
          </div>
          <div className='left-w'>
            <span className={classnames('move-left')} onClick={moveLeft}>
              Left
            </span>
          </div>
          <div className='right-w'>
            <span className={classnames('move-right')} onClick={moveRight}>
              Right
            </span>
          </div>
          <div className='down-w'>
            <span className={classnames('move-down')} onClick={moveDown}>
              Down
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
