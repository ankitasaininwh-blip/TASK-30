# TASK-30
# Chess Club – React.js Mini Project

## Project Overview

Chess Club is an offline, two-player chess game developed using React.js. Two players can play against each other on the same device by taking turns moving their chess pieces.

The application implements chess movement rules, check and checkmate detection, player timers, and move history.

## Features

- Interactive 8×8 chessboard.
- Standard initial positions for all chess pieces.
- Local two-player gameplay.
- Turn-based moves for White and Black.
- Legal move validation for chess pieces.
- Prevention of illegal moves.
- Check and checkmate detection.
- Stalemate detection.
- Countdown timers for both players.
- Automatic timer switching between players.
- Move history in chess notation, such as `e4` and `e5`.
- Highlighting of selected pieces and legal moves.
- Undo the last move.
- Restart the game.
- Automatic pawn promotion to Queen.
- Offline gameplay without requiring a server or account.

## Technologies Used

- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- Vite

## Project Structure

```text
ankita_task-30/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- A code editor such as Visual Studio Code

### Steps

1. Open the project folder in Visual Studio Code.
2. Open the terminal.
3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in the terminal.

## How to Play

1. Start a new game. All pieces are placed in their standard starting positions.
2. White makes the first move.
3. Click a chess piece to display its legal moves.
4. Click a highlighted square to move the selected piece.
5. Players alternate turns after each valid move.
6. The active player's timer counts down during their turn.
7. Check and checkmate notifications appear when applicable.
8. Use **Undo Move** to revert the last move.
9. Use **New Game** or **Restart** to begin a fresh game.

## Chess Rules

The application implements movement rules for Pawns, Rooks, Knights, Bishops, Queens, and Kings. It validates moves to prevent a player from leaving their own King in check.

Special moves include castling, en passant, and automatic Queen promotion. The game also detects checkmate and stalemate conditions.

## Testing

The application should be tested for:

- Correct initial board setup.
- Legal and illegal piece movements.
- Turn switching between players.
- Check and checkmate conditions.
- Castling and en passant.
- Countdown timers.
- Move history updates.
- Undo and restart functionality.
- Responsive layout in the browser.

## Limitations

- The game supports local two-player gameplay only.
- Pawn promotion automatically selects a Queen.
- No online multiplayer or AI opponent is included.
- The game does not connect to an external chess server.

## Conclusion

This project demonstrates React component development, state management, event handling, chess rule validation, timer functionality, and interactive user interface design without using a chess library.
