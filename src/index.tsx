import React, { CSSProperties } from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

interface SquareProps {
  value: 'O' | 'X' | null;
  onClick: () => void;
  highlight: boolean;
}

function Square(props: SquareProps) {
  if (props.highlight) {
    return (
      <button className="square" onClick={props.onClick}>
        <mark>{props.value}</mark>
      </button>
    );
  }
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

interface BoardProps {
  squares: ('O' | 'X' | null)[];
  onClick: (i: number) => void;
}

class Board extends React.Component<BoardProps, {}> {
  renderSquare(i: number, highlight: boolean) {
    return (
      <Square
        key={i}
        highlight={highlight}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const winnerLine = getWinnerLine(this.props.squares);
    let board = [];
    let board_row = [];
    for (let i = 0; i < 3; i++) {
      // 初期化
      board_row = [];
      for (let j = 0; j < 3; j++) {
        let num = j + i * 3;
        board_row.push(this.renderSquare(num, winnerLine.indexOf(num) >= 0));
      }
      board.push(
        <div className="board-row" key={i}>
          {board_row}
        </div>
      );
    }
    return <div>{board}</div>;
  }
}

interface ToggleProps {
  isOn: boolean;
  onName: string;
  offName: string;
  onClick: () => void;
}

class Toggle extends React.Component<ToggleProps, {}> {
  render() {
    return (
      <button onClick={this.props.onClick}>
        {this.props.isOn ? this.props.onName : this.props.offName}
      </button>
    );
  }
}

interface HistoryData {
  squares: ('O' | 'X' | null)[];
  col: number;
  row: number;
}

interface GameState {
  // 操作履歴を以下のように格納
  // Before first move
  // {
  //   squares: [
  //     null, null, null,
  //     null, null, null,
  //     null, null, null,
  //   ]
  // },
  // // After first move
  // {
  //   squares: [
  //     null, null, null,
  //     null, 'X', null,
  //     null, null, null,
  //   ]
  // },
  history: HistoryData[];
  // 'X'を表示する場合にture
  xIsNext: boolean;
  // 何手目の状態を見ているか
  stepNumber: number;
  // ソート
  isAsc: boolean;
}

class Game extends React.Component<{}, GameState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      history: [
        {
          // [
          // null, null, null,
          // null, null, null,
          // null, null, null,
          // ]
          squares: Array(9).fill(null),
          col: 0,
          row: 0
        }
      ],
      // 'X'の操作
      xIsNext: true,
      // 0手目
      stepNumber: 0,
      // 昇順
      isAsc: true
    };
  }

  /**
   * マスのクリックイベント
   * @param i マスのインデックス
   */
  handleClick(i: number) {
    // 操作履歴を格納
    const history: HistoryData[] = this.state.history.slice(
      0,
      this.state.stepNumber + 1
    );
    // 現在の状態
    const current: HistoryData = history[history.length - 1];
    // 現在の'X''〇'の状態
    const squares: ('O' | 'X' | null)[] = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      // 勝者判定で勝者が決まっている または すでに選択しているマスを選択
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    let col: number = (i % 3) + 1;
    let row: number = Math.floor(i / 3) + 1;

    this.setState({
      // 履歴を上書き（追加）
      history: history.concat([
        {
          squares: squares,
          col: col,
          row: row
        }
      ]),
      stepNumber: history.length,
      // 先取交代
      xIsNext: !this.state.xIsNext
    });
  }

  handleToggleClick() {
    this.setState({
      isAsc: !this.state.isAsc
    });
  }

  /**
   * 指定して履歴を表示
   * @param step 履歴のインデックス
   */
  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      // 偶数回が'X'の番
      xIsNext: step % 2 === 0
    });
  }

  render() {
    const history: HistoryData[] = this.state.history;
    const current: HistoryData = history[this.state.stepNumber];
    const winner: string | null = calculateWinner(current.squares);
    const moves = history.map((step: HistoryData, move: number) => {
      let dispColRow: string =
        '(col:' + String(step.col) + ', row:' + String(step.row) + ')';
      // ボタン名を生成
      const desc: string = move
        ? 'Go to move #' + move + dispColRow
        : 'Go to game start';

      let style: CSSProperties = { fontWeight: 'normal' };
      if (move === this.state.stepNumber) {
        style = {
          fontWeight: 'bold'
        };
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} style={style}>
            {desc}
          </button>
        </li>
      );
    });

    let status: string;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      if (this.state.history.length > 3 * 3) {
        status = 'Drow';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={i => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <Toggle
            isOn={this.state.isAsc}
            onName={'asc⇒desc'}
            offName={'desc⇒asc'}
            onClick={() => this.handleToggleClick()}
          />
          <ol>{this.state.isAsc ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));

// ========================================
// helper
// ========================================
/**
 * 勝者を計算
 * @param squares マスの状態
 * @returns 勝者が決まっている場合は'X'or'〇' 未決の場合はnullを返却
 */
function calculateWinner(squares: ('O' | 'X' | null)[]): string | null {
  const lines = [
    [0, 1, 2], // 縦
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // 横
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // 斜め
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (isAllTheSame(squares[a], squares[b], squares[c])) {
      // a-cまですべて同じなのでどれを返却でもよい
      return squares[a];
    }
  }
  return null;
}

/**
 * 勝利につながったマス目を取得
 * @param squares マスの状態
 * @returns 勝利につながったマス目
 */
function getWinnerLine(squares: ('O' | 'X' | null)[]): number[] {
  const lines = [
    [0, 1, 2], // 縦
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // 横
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // 斜め
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (isAllTheSame(squares[a], squares[b], squares[c])) {
      return lines[i];
    }
  }
  return [];
}

/**
 * val1 val2 val3がすべて一致するかを判定
 * @param val1 値1
 * @param val2 値2
 * @param val3 値3
 */
function isAllTheSame(
  val1: string | null,
  val2: string | null,
  val3: string | null
) {
  return val1 && val1 === val2 && val1 === val3;
}
