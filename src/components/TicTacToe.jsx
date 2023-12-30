import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

// Initial state of the Tic Tac Toe board
const initialBoard = Array(9).fill(null);

// Function to check for a winner based on the current board state
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

// Individual square component
const Square = ({ value, onClick, isWinnerSquare }) => (
  <button
    className={`box ${isWinnerSquare ? 'winner' : ''} ${value === 'X' ? 'x-move' : value === 'O' ? 'o-move' : ''}`}
    onClick={onClick}
    disabled={value !== null}
  >
    {value}
  </button>
);

// Game board component
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

// Component to display game status (winner or draw)
const GameStatus = ({ winnerInfo, playerName, playerSign }) => (
  <div className="winner-container">
    {winnerInfo.winner && winnerInfo.winner !== 'T' && (
      <div className="winner-message">{`${winnerInfo.winner === playerSign ? playerName + ' Won' : 'Bot Won'}`}</div>
    )}
    {winnerInfo.winner === 'T' && (
      <div className="draw-message">It's a Draw!</div>
    )}
  </div>
);

const TicTacToe = () => {
  // State for the Tic Tac Toe board, player turn, winner info, player sign, player name, and name set status
  const [squares, setSquares] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, line: [] });
  const [playerSign, setPlayerSign] = useState('X');
  const [playerName, setPlayerName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  // Effect to make the bot move when it's its turn
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

  // Function to handle player's move and check for a winner or draw
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

  // Function to handle game restart
  const handleRestart = () => {
    setSquares(initialBoard);
    setWinnerInfo({ winner: null, line: [] });
    setIsXNext(true);
  };

  // Function to handle sign change (X or O)
  const handleSignChange = (e) => {
    setPlayerSign(e.target.value);
    setSquares(initialBoard);
    setWinnerInfo({ winner: null, line: [] });
    setIsXNext(true);
  };

  // Function to set player's name
  const handleNameSet = () => {
    if (playerName.trim() !== '') {
      setIsNameSet(true);
    }
  };

  // Function to handle player's name change
  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  // Function to change player's name
  const handleChangeName = () => {
    setIsNameSet(false);
    setPlayerName('');
  };

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      {isNameSet && (
        <div className="player-name-input">
          <label>
            Player Name: {playerName}
            <button onClick={handleChangeName}>Change Name</button>
          </label>
        </div>
      )}
      {!isNameSet && (
        <div className="player-name-input">
          <label>
            Player name:
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Player Name"
            />
          </label>
          <button onClick={handleNameSet}>Set Name</button>
        </div>
      )}
      {isNameSet && (
        <div className="sign-selection">
          <label>
            Select your sign:
            <select value={playerSign} onChange={handleSignChange}>
              <option value="X">X</option>
              <option value="O">O</option>
            </select>
          </label>
        </div>
      )}
      <Board squares={squares} onClick={handleClick} winnerInfo={winnerInfo} />
      <GameStatus winnerInfo={winnerInfo} playerName={playerName} playerSign={playerSign} />
      <button className="restart-button" onClick={handleRestart}>
        Restart Game
      </button>
    </div>
  );
};

export default TicTacToe;
