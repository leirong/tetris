import { useEffect, useRef, useState } from "react";
import "./App.scss";
import classnames from "classnames";
import Tetris from "@/utils/tetris.js";

function App() {
  const [scale, setScale] = useState(1);
  const tetris = useRef<Tetris>();
  useEffect(() => {
    tetris.current = new Tetris("tetris");
    window.addEventListener("resize", () => {
      const width = document.body.clientWidth;
      if (width <= 200) {
        setScale(width / 200);
      }
    });
  }, []);

  const fastMoveDown = () => tetris.current?.fastMoveDown()

  const rotate = () => tetris.current?.rotate()

  const moveLeft = () => tetris.current?.moveLeft();

  const moveRight = () => tetris.current?.moveRight();

  const moveDown = () => tetris.current?.moveDown();

  return (
    <div className="container">
      <canvas id="tetris" style={{ transform: `scale(${scale})` }}></canvas>
      <section>
        <div
          className={classnames("fast-move")}
          onClick={fastMoveDown}
        >
          Drop
        </div>
        <div className="description">
          <div className="up-w">
            <span
              className={classnames("up")}
              onClick={rotate}
            >
              Rotation
            </span>
          </div>
          <div className="left-w">
            <span
              className={classnames("move-left")}
              onClick={moveLeft}
            >
              Left
            </span>
          </div>
          <div className="right-w">
            <span
              className={classnames("move-right")}
              onClick={moveRight}
            >
              Right
            </span>
          </div>
          <div className="down-w">
            <span
              className={classnames("move-down")}
              onClick={moveDown}
            >
              Down
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
