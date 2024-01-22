import { useEffect } from "react"
import "./App.css"
import Tetris from "@/utils/tetris.js"

function App() {
  useEffect(() => {
    new (Tetris as any)("tetris")
  }, [])
  return (
    <>
      <canvas id="tetris"></canvas>
    </>
  )
}

export default App
