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
  const [dropIsMouseDown, setDropIsMouseDown] = useState(false);
  const onDropMouseDown = () => {
    setDropIsMouseDown(true);
  };
  const onDropMouseUp = () => {
    setDropIsMouseDown(false);
    tetris.current?.fastMoveDown();
  };

  const [upIsMouseDown, setUpIsMouseDown] = useState(false);
  const onUpMouseDown = () => {
    setUpIsMouseDown(true);
  };
  const onUpMouseUp = () => {
    setUpIsMouseDown(false);
    tetris.current?.rotate();
  };

  const [leftIsMouseDown, setLeftIsMouseDown] = useState(false);
  const onLeftMouseDown = () => {
    setLeftIsMouseDown(true);
  };
  const onLeftMouseUp = () => {
    setLeftIsMouseDown(false);
    tetris.current?.moveLeft();
  };

  const [rightIsMouseDown, setRightIsMouseDown] = useState(false);
  const onRightMouseDown = () => {
    setRightIsMouseDown(true);
  };
  const onRightMouseUp = () => {
    setRightIsMouseDown(false);
    tetris.current?.moveRight();
  };

  const [downIsMouseDown, setDownIsMouseDown] = useState(false);
  const onDownMouseDown = () => {
    setDownIsMouseDown(true);
  };
  const onDownMouseUp = () => {
    setDownIsMouseDown(false);
    tetris.current?.moveDown();
  };

  return (
    <div className="container">
      <canvas id="tetris" style={{ transform: `scale(${scale})` }}></canvas>
      <section>
        <div
          className={classnames("fast-move", { down: dropIsMouseDown })}
          onMouseDown={onDropMouseDown}
          onMouseUp={onDropMouseUp}
        >
          Drop
        </div>
        <div className="description">
          <div className="up-w">
            <span
              className={classnames("up", { down: upIsMouseDown })}
              onMouseDown={onUpMouseDown}
              onMouseUp={onUpMouseUp}
            >
              Rotation
            </span>
          </div>
          <div className="left-w">
            <span
              className={classnames("move-left", { down: leftIsMouseDown })}
              onMouseDown={onLeftMouseDown}
              onMouseUp={onLeftMouseUp}
            >
              Left
            </span>
          </div>
          <div className="right-w">
            <span
              className={classnames("move-right", { down: rightIsMouseDown })}
              onMouseDown={onRightMouseDown}
              onMouseUp={onRightMouseUp}
            >
              Right
            </span>
          </div>
          <div className="down-w">
            <span
              className={classnames("move-down", { down: downIsMouseDown })}
              onMouseDown={onDownMouseDown}
              onMouseUp={onDownMouseUp}
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
