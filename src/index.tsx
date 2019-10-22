import React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

interface SquareProps {
  value: 'O' | 'X' | null;
  onClick: () => void;
}

function Square(props: SquareProps) {
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
  renderSquare(i: number) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

interface HistoryData {
  squares: ('O' | 'X' | null)[];
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
          squares: Array(9).fill(null)
        }
      ],
      // 'X'の操作
      xIsNext: true,
      // 0手目
      stepNumber: 0
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
    this.setState({
      // 履歴を上書き（追加）
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      // 先取交代
      xIsNext: !this.state.xIsNext
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
      // ボタン名を生成
      const desc: string = move ? 'Go to move #' + move : 'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status: string;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={i => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
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
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // a-cまですべて同じなのでどれを返却でもよい
      return squares[a];
    }
  }
  return null;
}
