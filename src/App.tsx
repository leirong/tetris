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
    tetris.current?.moveDown(true);
  };

  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints;

  let fastMoveProps = {};
  if (isTouchDevice) {
    fastMoveProps = {
      onTouchStart: onDropMouseDown,
      onTouchEnd: onDropMouseUp,
    };
  } else {
    fastMoveProps = {
      onMouseDown: onDropMouseDown,
      onMouseUp: onDropMouseUp,
    };
  }

  let upProps = {};
  if (isTouchDevice) {
    upProps = {
      onTouchStart: onUpMouseDown,
      onTouchEnd: onUpMouseUp,
    };
  } else {
    upProps = {
      onMouseDown: onUpMouseDown,
      onMouseUp: onUpMouseUp,
    };
  }

  let leftProps = {};
  if (isTouchDevice) {
    leftProps = {
      onTouchStart: onLeftMouseDown,
      onTouchEnd: onLeftMouseUp,
    };
  } else {
    leftProps = {
      onMouseDown: onLeftMouseDown,
      onMouseUp: onLeftMouseUp,
    };
  }

  let rightProps = {};
  if (isTouchDevice) {
    rightProps = {
      onTouchStart: onRightMouseDown,
      onTouchEnd: onRightMouseUp,
    };
  } else {
    rightProps = {
      onMouseDown: onRightMouseDown,
      onMouseUp: onRightMouseUp,
    };
  }

  let downProps = {};
  if (isTouchDevice) {
    downProps = {
      onTouchStart: onDownMouseDown,
      onTouchEnd: onDownMouseUp,
    };
  } else {
    downProps = {
      onMouseDown: onDownMouseDown,
      onMouseUp: onDownMouseUp,
    };
  }

  return (
    <div className="container">
      <canvas id="tetris" style={{ transform: `scale(${scale})` }}></canvas>
      <section>
        <div
          className={classnames("fast-move", { down: dropIsMouseDown })}
          {...fastMoveProps}
        >
          Drop
        </div>
        <div className="description">
          <div className="up-w">
            <span
              className={classnames("up", { down: upIsMouseDown })}
              {...upProps}
            >
              Rotation
            </span>
          </div>
          <div className="left-w">
            <span
              className={classnames("move-left", { down: leftIsMouseDown })}
              {...leftProps}
            >
              Left
            </span>
          </div>
          <div className="right-w">
            <span
              className={classnames("move-right", { down: rightIsMouseDown })}
              {...rightProps}
            >
              Right
            </span>
          </div>
          <div className="down-w">
            <span
              className={classnames("move-down", { down: downIsMouseDown })}
              {...downProps}
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
