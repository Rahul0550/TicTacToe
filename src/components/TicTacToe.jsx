// TicTacToe.js
import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const initialBoard = Array(9).fill(null);

const checkWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }

  return { winner: null, line: [] };
};

const Square = ({ value, onClick, isWinnerSquare }) => (
  <button
    className={`box ${isWinnerSquare ? 'winner' : ''}`}
    onClick={onClick}
    disabled={value !== null}
  >
    {value}
  </button>
);

const Board = ({ squares, onClick, winnerInfo }) => (
  <div className="board">
    {squares.map((square, i) => (
      <Square
        key={i}
        value={square}
        onClick={() => onClick(i)}
        isWinnerSquare={winnerInfo.line.includes(i)}
      />
    ))}
  </div>
);

const GameStatus = ({ winnerInfo }) => (
  <div className="winner-container">
    {winnerInfo.winner && winnerInfo.winner !== 'T' && (
      <div className="winner-message">{`Player ${winnerInfo.winner} wins!`}</div>
    )}
    {winnerInfo.winner === 'T' && (
      <div className="draw-message">It's a Draw!</div>
    )}
  </div>
);

const TicTacToe = () => {
  const [squares, setSquares] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, line: [] });
  const [playerSign, setPlayerSign] = useState('X');

  useEffect(() => {
    const makeBotMove = async () => {
      try {
        const response = await fetch('https://hiring-react-assignment.vercel.app/api/bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(squares),
        });

        if (response.ok) {
          const json = await response.json();

          if (json !== undefined) {
            const botMove = json;
            if (!squares[botMove] && !winnerInfo.winner) {
              const newSquares = [...squares];
              newSquares[botMove] = playerSign === 'X' ? 'O' : 'X';
              setSquares(newSquares);
              setWinnerInfo(checkWinner(newSquares));
              setIsXNext(true);
            }
          }
        } else {
          console.error('Bot move request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error making bot move:', error);
      }
    };

    if (!isXNext) {
      makeBotMove();
    }
  }, [squares, isXNext, winnerInfo, playerSign]);

  const handleClick = (i) => {
    if (squares[i] || winnerInfo.winner) {
      return;
    }

    const newSquares = [...squares];
    newSquares[i] = playerSign;
    setSquares(newSquares);

    const newWinnerInfo = checkWinner(newSquares);
    setWinnerInfo(newWinnerInfo);

    if (newWinnerInfo.winner) {
      setWinnerInfo(newWinnerInfo);
      setIsXNext(false);
    } else if (newSquares.every((square) => square !== null)) {
      // Check for a draw
      setWinnerInfo({ winner: 'T', line: [] });
      setIsXNext(false);
    } else {
      setIsXNext(false);
    }
  };

  const handleRestart = () => {
    setSquares(initialBoard);
    setWinnerInfo({ winner: null, line: [] });
    setIsXNext(true);
  };

  const handleSignChange = (newSign) => {
    setPlayerSign(newSign);
    setSquares(initialBoard);
    setWinnerInfo({ winner: null, line: [] });
    setIsXNext(true);
  };

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      <div className="sign-selection">
        <label>
          Select your sign:
          <select value={playerSign} onChange={(e) => handleSignChange(e.target.value)}>
            <option value="X">X</option>
            <option value="O">O</option>
          </select>
        </label>
      </div>
      <Board squares={squares} onClick={handleClick} winnerInfo={winnerInfo} />
      <GameStatus winnerInfo={winnerInfo} />
      <button className="restart-button" onClick={handleRestart}>
        Restart Game
      </button>
    </div>
  );
};

export default TicTacToe;
