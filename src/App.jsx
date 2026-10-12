
import { useEffect, useState } from "react";
import "./App.css";

const START = [
  "rnbqkbnr",
  "pppppppp",
  "........",
  "........",
  "........",
  "........",
  "PPPPPPPP",
  "RNBQKBNR",
];

const SYMBOLS = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const FILES = "abcdefgh";
const initialRights = () => ({
  K: true, Q: true, k: true, q: true,
});

function newGame() {
  return {
    board: START.map((row) => row.split("")),
    turn: "w",
    rights: initialRights(),
    ep: null,
    history: [],
    moves: [],
    result: "",
  };
}

function colorOf(piece) {
  if (!piece || piece === ".") return null;
  return piece === piece.toUpperCase() ? "w" : "b";
}

function inside(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function square(r, c) {
  return FILES[c] + (8 - r);
}

function locate(board, king) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === king) return [r, c];
    }
  }
  return null;
}

function attacked(board, r, c, by) {
  const pawnRow = r + (by === "w" ? 1 : -1);

  for (const dc of [-1, 1]) {
    const pc = c + dc;
    if (inside(pawnRow, pc)) {
      const p = board[pawnRow][pc];
      if (p === (by === "w" ? "P" : "p")) return true;
    }
  }

  for (const [dr, dc] of [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ]) {
    const nr = r + dr;
    const nc = c + dc;
    if (inside(nr, nc) &&
        board[nr][nc].toLowerCase() === "n" &&
        colorOf(board[nr][nc]) === by) return true;
  }

  for (const [dr, dc] of [
    [-1, -1], [-1, 0], [-1, 1], [0, -1],
    [0, 1], [1, -1], [1, 0], [1, 1],
  ]) {
    let nr = r + dr;
    let nc = c + dc;
    let distance = 1;

    while (inside(nr, nc)) {
      const p = board[nr][nc];

      if (p !== ".") {
        if (colorOf(p) === by) {
          const kind = p.toLowerCase();
          if (
            (distance === 1 && kind === "k") ||
            (["q"].includes(kind)) ||
            (["b"].includes(kind) && dr !== 0 && dc !== 0) ||
            (["r"].includes(kind) && (dr === 0 || dc === 0))
          ) return true;
        }
        break;
      }

      nr += dr;
      nc += dc;
      distance++;
    }
  }

  return false;
}

function inCheck(board, color) {
  const king = locate(board, color === "w" ? "K" : "k");
  return king ? attacked(board, king[0], king[1], color === "w" ? "b" : "w") : true;
}

function pseudoMoves(state, r, c) {
  const { board, rights, ep } = state;
  const p = board[r][c];
  if (p === ".") return [];

  const color = colorOf(p);
  const kind = p.toLowerCase();
  const result = [];
  const enemy = color === "w" ? "b" : "w";

  function add(nr, nc, extra = {}) {
    if (!inside(nr, nc)) return false;
    const target = board[nr][nc];

    if (target !== "." && colorOf(target) === color) return false;
    if (target !== "." && target.toLowerCase() === "k") return false;

    result.push({ from: [r, c], to: [nr, nc], ...extra });
    return target === ".";
  }

  if (kind === "p") {
    const dir = color === "w" ? -1 : 1;
    const start = color === "w" ? 6 : 1;
    const last = color === "w" ? 0 : 7;

    if (inside(r + dir, c) && board[r + dir][c] === ".") {
      add(r + dir, c, { promotion: r + dir === last });
      if (r === start && board[r + 2 * dir][c] === ".") {
        add(r + 2 * dir, c, { double: true });
      }
    }

    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (!inside(nr, nc)) continue;

      if (board[nr][nc] !== "." && colorOf(board[nr][nc]) === enemy) {
        add(nr, nc, { promotion: nr === last });
      } else if (ep && ep[0] === nr && ep[1] === nc) {
        result.push({ from: [r, c], to: [nr, nc], enPassant: true });
      }
    }
  } else if (kind === "n") {
    for (const [dr, dc] of [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ]) add(r + dr, c + dc);
  } else if (["b", "r", "q"].includes(kind)) {
    const dirs = [];
    if (kind !== "r") dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    if (kind !== "b") dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

    for (const [dr, dc] of dirs) {
      let nr = r + dr;
      let nc = c + dc;

      while (inside(nr, nc)) {
        const empty = add(nr, nc);
        if (!empty) break;
        nr += dr;
        nc += dc;
      }
    }
  } else if (kind === "k") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr || dc) add(r + dr, c + dc);
      }
    }

    const row = color === "w" ? 7 : 0;
    const short = color === "w" ? "K" : "k";
    const long = color === "w" ? "Q" : "q";

    if (r === row && c === 4 && !inCheck(board, color)) {
      if (
        rights[short] && board[row][5] === "." && board[row][6] === "." &&
        board[row][7] === (color === "w" ? "R" : "r") &&
        !attacked(board, row, 5, enemy) && !attacked(board, row, 6, enemy)
      ) result.push({ from: [r, c], to: [row, 6], castle: "short" });

      if (
        rights[long] && board[row][1] === "." &&
        board[row][2] === "." && board[row][3] === "." &&
        board[row][0] === (color === "w" ? "R" : "r") &&
        !attacked(board, row, 3, enemy) && !attacked(board, row, 2, enemy)
      ) result.push({ from: [r, c], to: [row, 2], castle: "long" });
    }
  }

  return result;
}

function playMove(state, move) {
  const next = {
    ...state,
    board: state.board.map((row) => [...row]),
    rights: { ...state.rights },
    ep: null,
  };

  const [r, c] = move.from;
  const [nr, nc] = move.to;
  let piece = next.board[r][c];
  const color = colorOf(piece);
  const target = next.board[nr][nc];
  const captured = move.enPassant
    ? next.board[color === "w" ? nr + 1 : nr - 1][nc]
    : target;

  next.board[r][c] = ".";

  if (move.enPassant) {
    next.board[color === "w" ? nr + 1 : nr - 1][nc] = ".";
  }

  if (move.castle) {
    const row = r;
    if (move.castle === "short") {
      next.board[row][5] = next.board[row][7];
      next.board[row][7] = ".";
    } else {
      next.board[row][3] = next.board[row][0];
      next.board[row][0] = ".";
    }
  }

  if (move.promotion) {
    piece = color === "w" ? "Q" : "q";
  }

  next.board[nr][nc] = piece;

  if (piece.toLowerCase() === "k") {
    next.rights[color === "w" ? "K" : "k"] = false;
    next.rights[color === "w" ? "Q" : "q"] = false;
  }

  if (r === 7 && c === 0 || nr === 7 && nc === 0) next.rights.Q = false;
  if (r === 7 && c === 7 || nr === 7 && nc === 7) next.rights.K = false;
  if (r === 0 && c === 0 || nr === 0 && nc === 0) next.rights.q = false;
  if (r === 0 && c === 7 || nr === 0 && nc === 7) next.rights.k = false;

  if (move.double) next.ep = [(r + nr) / 2, c];

  next.turn = color === "w" ? "b" : "w";
  return { next, captured };
}

function legalMoves(state, r, c) {
  const p = state.board[r][c];
  if (p === "." || colorOf(p) !== state.turn) return [];

  return pseudoMoves(state, r, c).filter((move) => {
    const { next } = playMove(state, move);
    return !inCheck(next.board, state.turn);
  });
}

function allLegalMoves(state, color = state.turn) {
  const temp = { ...state, turn: color };
  const moves = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (colorOf(temp.board[r][c]) === color) {
        moves.push(...legalMoves(temp, r, c));
      }
    }
  }

  return moves;
}

function notation(state, move, captured, next) {
  if (move.castle === "short") return "O-O";
  if (move.castle === "long") return "O-O-O";

  const [r, c] = move.from;
  const [nr, nc] = move.to;
  const piece = state.board[r][c];
  const kind = piece.toUpperCase();
  const isCapture = captured !== "." && captured != null || move.enPassant;

  let text = kind === "P" ? "" : kind;
  if (isCapture && kind === "P") text += FILES[c];
  if (isCapture) text += "x";
  text += square(nr, nc);
  if (move.promotion) text += "=Q";

  if (inCheck(next.board, next.turn)) {
    text += allLegalMoves(next).length === 0 ? "#" : "+";
  }

  return text;
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export default function App() {
  const [game, setGame] = useState(newGame);
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [started, setStarted] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [notice, setNotice] = useState("White to move");

  useEffect(() => {
    if (!started || game.result) return;

    const timer = setInterval(() => {
      if (game.turn === "w") {
        setWhiteTime((t) => Math.max(0, t - 1));
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, game.turn, game.result]);

  useEffect(() => {
    if (whiteTime === 0 && !game.result) {
      setGame((g) => ({ ...g, result: "Black wins on time!" }));
    } else if (blackTime === 0 && !game.result) {
      setGame((g) => ({ ...g, result: "White wins on time!" }));
    }
  }, [whiteTime, blackTime, game.result]);

  function resetGame() {
    setGame(newGame());
    setSelected(null);
    setTargets([]);
    setWhiteTime(600);
    setBlackTime(600);
    setStarted(false);
    setUndoStack([]);
    setNotice("White to move");
  }

  function undoMove() {
    if (!undoStack.length || game.result) return;
    const last = undoStack[undoStack.length - 1];
    setGame(last.game);
    setWhiteTime(last.whiteTime);
    setBlackTime(last.blackTime);
    setUndoStack((stack) => stack.slice(0, -1));
    setSelected(null);
    setTargets([]);
    setNotice("Move undone");
  }

  function clickSquare(r, c) {
    if (game.result) return;

    const piece = game.board[r][c];

    if (selected && targets.some(
      (m) => m.to[0] === r && m.to[1] === c
    )) {
      const move = targets.find(
        (m) => m.to[0] === r && m.to[1] === c
      );

      const snapshot = {
        game,
        whiteTime,
        blackTime,
      };

      const movingPiece = game.board[selected[0]][selected[1]];
      const capture = move.enPassant
        ? game.board[game.turn === "w" ? r + 1 : r - 1][c]
        : game.board[r][c];

      const { next } = playMove(game, move);
      const san = notation(game, move, capture, next);

      next.history = [
        ...game.history,
        { from: square(...selected), to: square(r, c), san },
      ];
      next.moves = [...game.moves, san];

      const replies = allLegalMoves(next);
      const check = inCheck(next.board, next.turn);

      if (check && replies.length === 0) {
        next.result = `${game.turn === "w" ? "White" : "Black"} wins by checkmate!`;
      } else if (!check && replies.length === 0) {
        next.result = "Draw by stalemate!";
      }

      setUndoStack((stack) => [...stack, snapshot]);
      setGame(next);
      setSelected(null);
      setTargets([]);
      setStarted(true);

      setNotice(
        next.result ||
        (check
          ? `${next.turn === "w" ? "White" : "Black"} is in check!`
          : `${next.turn === "w" ? "White" : "Black"} to move`)
      );
      return;
    }

    if (piece !== "." && colorOf(piece) === game.turn) {
      setSelected([r, c]);
      setTargets(legalMoves(game, r, c));
      setNotice(`${game.turn === "w" ? "White" : "Black"} selected ${piece.toUpperCase()}`);
    } else {
      setSelected(null);
      setTargets([]);
      setNotice("Illegal move — select one of the highlighted squares.");
    }
  }

  const check = inCheck(game.board, game.turn);
  const legalCount = allLegalMoves(game).length;

  return (
    <main className="chess-app">
      <header className="chess-header">
        <div>
          <p className="chess-kicker">LOCAL MULTIPLAYER</p>
          <h1>♟ Chess Club</h1>
          <p className="chess-subtitle">Two players. One board. Play your best.</p>
        </div>
        <button className="new-game-btn" onClick={resetGame}>
          New Game
        </button>
      </header>

      <section className="chess-layout">
        <div className="board-panel">
          <div className="player-bar">
            <span>♚ Black</span>
            <strong className={game.turn === "b" && started ? "active-clock" : ""}>
              {formatTime(blackTime)}
            </strong>
          </div>

          <div className="chess-board">
            {game.board.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selected?.[0] === r && selected?.[1] === c;
                const isTarget = targets.some(
                  (m) => m.to[0] === r && m.to[1] === c
                );
                const last = game.history[game.history.length - 1];
                const isLast = last &&
                  (last.from === square(r, c) || last.to === square(r, c));

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => clickSquare(r, c)}
                    aria-label={`${square(r, c)} ${piece === "." ? "empty" : piece}`}
                    className={[
                      "chess-square",
                      isLight ? "light-square" : "dark-square",
                      isSelected ? "selected-square" : "",
                      isLast ? "last-square" : "",
                    ].join(" ")}
                  >
                    {c === 0 && <span className="rank-label">{8 - r}</span>}
                    {r === 7 && <span className="file-label">{FILES[c]}</span>}
                    {piece !== "." && (
                      <span className={`piece ${colorOf(piece) === "w" ? "white-piece" : "black-piece"}`}>
                        {SYMBOLS[piece]}
                      </span>
                    )}
                    {isTarget && (
                      <span className={
                        game.board[r][c] === "." ? "legal-dot" : "capture-ring"
                      } />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="player-bar">
            <span>♔ White</span>
            <strong className={game.turn === "w" && started ? "active-clock" : ""}>
              {formatTime(whiteTime)}
            </strong>
          </div>

          <p className={`game-notice ${check ? "check-notice" : ""}`}>
            {game.result || (check ? "⚠ Check! " : "")}{game.result ? "" : notice}
          </p>

          <div className="board-actions">
            <button onClick={undoMove} disabled={!undoStack.length || !!game.result}>
              ↶ Undo Move
            </button>
            <button onClick={resetGame}>↻ Restart</button>
          </div>
        </div>

        <aside className="side-panel">
          <section className="side-card">
            <h2>Game Status</h2>
            <p className="turn-status">
              {game.result
                ? game.result
                : `${game.turn === "w" ? "White" : "Black"} to move`}
            </p>
            <p className="small-note">
              {started ? "Game in progress" : "Make the first move to start the clock"}
            </p>
            {check && !game.result && <p className="check-label">King is in check!</p>}
            {game.result && <p className="result-label">Game over</p>}
          </section>

          <section className="side-card move-card">
            <h2>Move History</h2>
            {game.moves.length === 0 ? (
              <p className="empty-moves">Moves will appear here.</p>
            ) : (
              <div className="move-list">
                {Array.from({ length: Math.ceil(game.moves.length / 2) }, (_, i) => (
                  <div className="move-row" key={i}>
                    <span>{i + 1}.</span>
                    <span>{game.moves[i * 2]}</span>
                    <span>{game.moves[i * 2 + 1] || "…"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="side-card">
            <h2>How to Play</h2>
            <ul className="rules-list">
              <li>White moves first.</li>
              <li>Click a piece to show its legal moves.</li>
              <li>Click a highlighted square to move.</li>
              <li>Each player gets 10 minutes.</li>
              <li>Pawn promotion automatically becomes a queen.</li>
              <li>Checkmate or stalemate ends the game.</li>
            </ul>
          </section>

          <p className="offline-note">● Offline · Local 2-player game</p>
        </aside>
      </section>
    </main>
  );
}
