/**
 * chess-engine.js
 * Complete, self-contained standard chess logic engine.
 * Handles board state, move generation, move validation, check/mate/draw rules,
 * castling, en passant, promotion, and standard algebraic notation (SAN).
 */

class ChessEngine {
    constructor() {
        this.reset();
    }

    reset() {
        // 8x8 board: row 0 is rank 8 (Black back rank), row 7 is rank 1 (White back rank)
        // col 0 is file 'a', col 7 is file 'h'
        this.board = this.createInitialBoard();
        this.turn = 'w'; // 'w' or 'b'
        this.castling = {
            w: { k: true, q: true },
            b: { k: true, q: true }
        };
        this.enPassant = null; // { r, c } square behind pawn that moved 2 squares
        this.halfMoveClock = 0; // for 50-move rule
        this.fullMoveNumber = 1;
        this.history = []; // stack of { move, stateSnapshot }
        this.capturedPieces = { w: [], b: [] }; // pieces captured BY white / BY black
        this.positionHistory = [this.getBoardPositionKey()];
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

        for (let c = 0; c < 8; c++) {
            board[0][c] = { type: backRank[c], color: 'b' };
            board[1][c] = { type: 'p', color: 'b' };
            board[6][c] = { type: 'p', color: 'w' };
            board[7][c] = { type: backRank[c], color: 'w' };
        }
        return board;
    }

    cloneBoard(b = this.board) {
        return b.map(row => row.map(cell => (cell ? { ...cell } : null)));
    }

    getPiece(r, c) {
        if (r < 0 || r > 7 || c < 0 || c > 7) return null;
        return this.board[r][c];
    }

    isWithinBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    getKingPosition(color, board = this.board) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.type === 'k' && p.color === color) {
                    return { r, c };
                }
            }
        }
        return null;
    }

    isSquareAttacked(r, c, attackerColor, board = this.board) {
        // Check Knight attacks
        const knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightOffsets) {
            const nr = r + dr, nc = c + dc;
            if (this.isWithinBounds(nr, nc)) {
                const p = board[nr][nc];
                if (p && p.color === attackerColor && p.type === 'n') return true;
            }
        }

        // Check Pawn attacks
        const pawnDir = attackerColor === 'w' ? 1 : -1; // White pawns attack up towards rank 8 (decreasing r), so attacker is at r + 1
        const pawnAttackCols = [c - 1, c + 1];
        const pr = r + pawnDir;
        if (this.isWithinBounds(pr, 0)) {
            for (const pc of pawnAttackCols) {
                if (this.isWithinBounds(pr, pc)) {
                    const p = board[pr][pc];
                    if (p && p.color === attackerColor && p.type === 'p') return true;
                }
            }
        }

        // Check King adjacent attacks
        const kingOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        for (const [dr, dc] of kingOffsets) {
            const nr = r + dr, nc = c + dc;
            if (this.isWithinBounds(nr, nc)) {
                const p = board[nr][nc];
                if (p && p.color === attackerColor && p.type === 'k') return true;
            }
        }

        // Check Orthogonal ray attacks (Rook & Queen)
        const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of straightDirs) {
            let nr = r + dr, nc = c + dc;
            while (this.isWithinBounds(nr, nc)) {
                const p = board[nr][nc];
                if (p) {
                    if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }

        // Check Diagonal ray attacks (Bishop & Queen)
        const diagonalDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of diagonalDirs) {
            let nr = r + dr, nc = c + dc;
            while (this.isWithinBounds(nr, nc)) {
                const p = board[nr][nc];
                if (p) {
                    if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }

        return false;
    }

    isCheck(color = this.turn, board = this.board) {
        const kingPos = this.getKingPosition(color, board);
        if (!kingPos) return false;
        const enemyColor = color === 'w' ? 'b' : 'w';
        return this.isSquareAttacked(kingPos.r, kingPos.c, enemyColor, board);
    }

    getPseudoLegalMoves(color = this.turn) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    this.appendPieceMoves(r, c, piece, moves);
                }
            }
        }
        return moves;
    }

    appendPieceMoves(r, c, piece, moves) {
        const { type, color } = piece;
        const enemyColor = color === 'w' ? 'b' : 'w';

        if (type === 'p') {
            const dir = color === 'w' ? -1 : 1;
            const startRank = color === 'w' ? 6 : 1;
            const promoRank = color === 'w' ? 0 : 7;

            // 1 square forward
            const f1r = r + dir;
            if (this.isWithinBounds(f1r, c) && !this.board[f1r][c]) {
                if (f1r === promoRank) {
                    ['q', 'r', 'b', 'n'].forEach(promo => {
                        moves.push({ from: { r, c }, to: { r: f1r, c }, piece, promotion: promo });
                    });
                } else {
                    moves.push({ from: { r, c }, to: { r: f1r, c }, piece, promotion: null });

                    // 2 squares forward from starting rank
                    const f2r = r + dir * 2;
                    if (r === startRank && !this.board[f2r][c]) {
                        moves.push({ from: { r, c }, to: { r: f2r, c }, piece, promotion: null });
                    }
                }
            }

            // Diagonal captures
            for (const dc of [-1, 1]) {
                const cr = r + dir;
                const cc = c + dc;
                if (this.isWithinBounds(cr, cc)) {
                    const target = this.board[cr][cc];
                    if (target && target.color === enemyColor) {
                        if (cr === promoRank) {
                            ['q', 'r', 'b', 'n'].forEach(promo => {
                                moves.push({ from: { r, c }, to: { r: cr, c: cc }, piece, captured: target, promotion: promo });
                            });
                        } else {
                            moves.push({ from: { r, c }, to: { r: cr, c: cc }, piece, captured: target, promotion: null });
                        }
                    } else if (this.enPassant && this.enPassant.r === cr && this.enPassant.c === cc) {
                        // En Passant capture
                        const epPawn = this.board[r][cc];
                        moves.push({
                            from: { r, c },
                            to: { r: cr, c: cc },
                            piece,
                            captured: epPawn,
                            isEnPassant: true,
                            promotion: null
                        });
                    }
                }
            }
        } else if (type === 'n') {
            const offsets = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const [dr, dc] of offsets) {
                const nr = r + dr, nc = c + dc;
                if (this.isWithinBounds(nr, nc)) {
                    const target = this.board[nr][nc];
                    if (!target || target.color === enemyColor) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target || null, promotion: null });
                    }
                }
            }
        } else if (type === 'b' || type === 'r' || type === 'q') {
            const dirs = [];
            if (type === 'b' || type === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
            if (type === 'r' || type === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

            for (const [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                while (this.isWithinBounds(nr, nc)) {
                    const target = this.board[nr][nc];
                    if (!target) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: null, promotion: null });
                    } else {
                        if (target.color === enemyColor) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target, promotion: null });
                        }
                        break;
                    }
                    nr += dr;
                    nc += dc;
                }
            }
        } else if (type === 'k') {
            const offsets = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            for (const [dr, dc] of offsets) {
                const nr = r + dr, nc = c + dc;
                if (this.isWithinBounds(nr, nc)) {
                    const target = this.board[nr][nc];
                    if (!target || target.color === enemyColor) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target || null, promotion: null });
                    }
                }
            }

            // Castling
            if (this.castling[color]) {
                const rank = color === 'w' ? 7 : 0;
                if (r === rank && c === 4 && !this.isCheck(color)) {
                    // Kingside (O-O)
                    if (this.castling[color].k) {
                        if (!this.board[rank][5] && !this.board[rank][6]) {
                            const rook = this.board[rank][7];
                            if (rook && rook.type === 'r' && rook.color === color) {
                                if (!this.isSquareAttacked(rank, 5, enemyColor) && !this.isSquareAttacked(rank, 6, enemyColor)) {
                                    moves.push({
                                        from: { r, c },
                                        to: { r: rank, c: 6 },
                                        piece,
                                        isCastle: 'k',
                                        captured: null,
                                        promotion: null
                                    });
                                }
                            }
                        }
                    }
                    // Queenside (O-O-O)
                    if (this.castling[color].q) {
                        if (!this.board[rank][1] && !this.board[rank][2] && !this.board[rank][3]) {
                            const rook = this.board[rank][0];
                            if (rook && rook.type === 'r' && rook.color === color) {
                                if (!this.isSquareAttacked(rank, 3, enemyColor) && !this.isSquareAttacked(rank, 2, enemyColor)) {
                                    moves.push({
                                        from: { r, c },
                                        to: { r: rank, c: 2 },
                                        piece,
                                        isCastle: 'q',
                                        captured: null,
                                        promotion: null
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    getLegalMoves(color = this.turn) {
        const pseudoMoves = this.getPseudoLegalMoves(color);
        const legalMoves = [];

        for (const move of pseudoMoves) {
            if (this.isMoveLegal(move, color)) {
                legalMoves.push(move);
            }
        }
        return legalMoves;
    }

    getLegalMovesForSquare(r, c) {
        const piece = this.getPiece(r, c);
        if (!piece || piece.color !== this.turn) return [];
        return this.getLegalMoves(this.turn).filter(m => m.from.r === r && m.from.c === c);
    }

    isMoveLegal(move, color = this.turn) {
        // Test move on temporary cloned board
        const tempBoard = this.cloneBoard();
        const { from, to, piece, promotion, isCastle, isEnPassant } = move;

        tempBoard[from.r][from.c] = null;

        if (promotion) {
            tempBoard[to.r][to.c] = { type: promotion, color };
        } else {
            tempBoard[to.r][to.c] = { ...piece };
        }

        if (isEnPassant) {
            // Remove captured pawn
            tempBoard[from.r][to.c] = null;
        } else if (isCastle === 'k') {
            tempBoard[from.r][5] = tempBoard[from.r][7];
            tempBoard[from.r][7] = null;
        } else if (isCastle === 'q') {
            tempBoard[from.r][3] = tempBoard[from.r][0];
            tempBoard[from.r][0] = null;
        }

        return !this.isCheck(color, tempBoard);
    }

    makeMove(moveInput) {
        // moveInput can be { from: {r, c}, to: {r, c}, promotion?: 'q' }
        const legalMoves = this.getLegalMoves(this.turn);
        const move = legalMoves.find(m =>
            m.from.r === moveInput.from.r &&
            m.from.c === moveInput.from.c &&
            m.to.r === moveInput.to.r &&
            m.to.c === moveInput.to.c &&
            (!moveInput.promotion || m.promotion === moveInput.promotion || (m.piece.type === 'p' && !m.promotion))
        );

        if (!move) return null;

        // If pawn reaches back rank and no promotion chosen yet, default to queen
        if (move.piece.type === 'p' && (move.to.r === 0 || move.to.r === 7) && !move.promotion) {
            move.promotion = moveInput.promotion || 'q';
        }

        // Generate Standard Algebraic Notation before state change
        const san = this.generateSAN(move, legalMoves);

        // Snapshot current state for undo
        const snapshot = {
            board: this.cloneBoard(),
            turn: this.turn,
            castling: JSON.parse(JSON.stringify(this.castling)),
            enPassant: this.enPassant ? { ...this.enPassant } : null,
            halfMoveClock: this.halfMoveClock,
            fullMoveNumber: this.fullMoveNumber,
            capturedPieces: {
                w: [...this.capturedPieces.w],
                b: [...this.capturedPieces.b]
            },
            positionHistory: [...this.positionHistory]
        };

        const { from, to, piece, captured, promotion, isCastle, isEnPassant } = move;

        // Apply piece move
        this.board[from.r][from.c] = null;
        if (promotion) {
            this.board[to.r][to.c] = { type: promotion, color: piece.color };
        } else {
            this.board[to.r][to.c] = { ...piece };
        }

        // Handle Castling Rook move
        if (isCastle === 'k') {
            this.board[from.r][5] = this.board[from.r][7];
            this.board[from.r][7] = null;
        } else if (isCastle === 'q') {
            this.board[from.r][3] = this.board[from.r][0];
            this.board[from.r][0] = null;
        }

        // Handle En Passant capture
        if (isEnPassant) {
            const capturedPawn = this.board[from.r][to.c];
            this.board[from.r][to.c] = null;
            this.capturedPieces[piece.color].push(capturedPawn);
        } else if (captured) {
            this.capturedPieces[piece.color].push(captured);
        }

        // Update Castling rights
        if (piece.type === 'k') {
            this.castling[piece.color].k = false;
            this.castling[piece.color].q = false;
        } else if (piece.type === 'r') {
            if (from.r === 7 && from.c === 7) this.castling.w.k = false;
            if (from.r === 7 && from.c === 0) this.castling.w.q = false;
            if (from.r === 0 && from.c === 7) this.castling.b.k = false;
            if (from.r === 0 && from.c === 0) this.castling.b.q = false;
        }
        // If rook captured on its home square
        if (captured && captured.type === 'r') {
            if (to.r === 7 && to.c === 7) this.castling.w.k = false;
            if (to.r === 7 && to.c === 0) this.castling.w.q = false;
            if (to.r === 0 && to.c === 7) this.castling.b.k = false;
            if (to.r === 0 && to.c === 0) this.castling.b.q = false;
        }

        // Update En Passant square
        if (piece.type === 'p' && Math.abs(to.r - from.r) === 2) {
            this.enPassant = { r: (from.r + to.r) / 2, c: from.c };
        } else {
            this.enPassant = null;
        }

        // Update Halfmove clock
        if (piece.type === 'p' || captured) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        // Update Fullmove counter
        if (this.turn === 'b') {
            this.fullMoveNumber++;
        }

        // Change Turn
        this.turn = this.turn === 'w' ? 'b' : 'w';

        // Save move to history
        const recordedMove = { ...move, san };
        this.history.push({ move: recordedMove, snapshot });
        this.positionHistory.push(this.getBoardPositionKey());

        // Check if the move puts opponent in check or checkmate to append '+' or '#'
        const nextLegalMoves = this.getLegalMoves(this.turn);
        const inCheck = this.isCheck(this.turn);
        if (inCheck) {
            if (nextLegalMoves.length === 0) {
                recordedMove.san += '#';
            } else {
                recordedMove.san += '+';
            }
        }

        return recordedMove;
    }

    undoMove() {
        if (this.history.length === 0) return null;
        const last = this.history.pop();
        const { snapshot, move } = last;

        this.board = snapshot.board;
        this.turn = snapshot.turn;
        this.castling = snapshot.castling;
        this.enPassant = snapshot.enPassant;
        this.halfMoveClock = snapshot.halfMoveClock;
        this.fullMoveNumber = snapshot.fullMoveNumber;
        this.capturedPieces = snapshot.capturedPieces;
        this.positionHistory = snapshot.positionHistory;

        return move;
    }

    generateSAN(move, legalMoves) {
        const { from, to, piece, captured, promotion, isCastle } = move;
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        const toSquare = files[to.c] + ranks[to.r];

        if (isCastle === 'k') return 'O-O';
        if (isCastle === 'q') return 'O-O-O';

        let san = '';
        if (piece.type === 'p') {
            if (captured) {
                san += files[from.c] + 'x' + toSquare;
            } else {
                san += toSquare;
            }
            if (promotion) {
                san += '=' + promotion.toUpperCase();
            }
        } else {
            san += piece.type.toUpperCase();

            // Disambiguation
            const sameTypeMoves = legalMoves.filter(m =>
                m.piece.type === piece.type &&
                m.piece.color === piece.color &&
                m.to.r === to.r &&
                m.to.c === to.c &&
                (m.from.r !== from.r || m.from.c !== from.c)
            );

            if (sameTypeMoves.length > 0) {
                const sameFile = sameTypeMoves.some(m => m.from.c === from.c);
                const sameRank = sameTypeMoves.some(m => m.from.r === from.r);

                if (!sameFile) {
                    san += files[from.c];
                } else if (!sameRank) {
                    san += ranks[from.r];
                } else {
                    san += files[from.c] + ranks[from.r];
                }
            }

            if (captured) {
                san += 'x';
            }
            san += toSquare;
        }

        return san;
    }

    getBoardPositionKey() {
        // String representation for threefold repetition detection
        let s = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                s += p ? p.color + p.type : '.';
            }
        }
        s += `|${this.turn}|${this.castling.w.k ? 'K' : ''}${this.castling.w.q ? 'Q' : ''}${this.castling.b.k ? 'k' : ''}${this.castling.b.q ? 'q' : ''}`;
        s += `|${this.enPassant ? this.enPassant.r + ',' + this.enPassant.c : '-'}`;
        return s;
    }

    getGameStatus() {
        const legalMoves = this.getLegalMoves(this.turn);
        const inCheck = this.isCheck(this.turn);

        if (legalMoves.length === 0) {
            if (inCheck) {
                return {
                    status: 'checkmate',
                    winner: this.turn === 'w' ? 'b' : 'w',
                    reason: `${this.turn === 'w' ? 'Black' : 'White'} wins by checkmate!`
                };
            } else {
                return {
                    status: 'stalemate',
                    winner: null,
                    reason: 'Draw by stalemate (no legal moves).'
                };
            }
        }

        if (this.halfMoveClock >= 100) {
            return {
                status: 'draw',
                winner: null,
                reason: 'Draw by fifty-move rule.'
            };
        }

        if (this.isThreefoldRepetition()) {
            return {
                status: 'draw',
                winner: null,
                reason: 'Draw by threefold repetition.'
            };
        }

        if (this.isInsufficientMaterial()) {
            return {
                status: 'draw',
                winner: null,
                reason: 'Draw by insufficient material.'
            };
        }

        return {
            status: 'active',
            inCheck,
            turn: this.turn
        };
    }

    isThreefoldRepetition() {
        const currentKey = this.positionHistory[this.positionHistory.length - 1];
        let count = 0;
        for (const key of this.positionHistory) {
            if (key === currentKey) count++;
            if (count >= 3) return true;
        }
        return false;
    }

    isInsufficientMaterial() {
        const pieces = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p) pieces.push({ ...p, r, c });
            }
        }

        // K vs K
        if (pieces.length === 2) return true;

        // K+B vs K or K+N vs K
        if (pieces.length === 3) {
            return pieces.some(p => p.type === 'b' || p.type === 'n');
        }

        // K+B vs K+B with bishops on the same color
        if (pieces.length === 4) {
            const bishops = pieces.filter(p => p.type === 'b');
            if (bishops.length === 2 && bishops[0].color !== bishops[1].color) {
                const squareColor1 = (bishops[0].r + bishops[0].c) % 2;
                const squareColor2 = (bishops[1].r + bishops[1].c) % 2;
                if (squareColor1 === squareColor2) return true;
            }
        }

        return false;
    }

    getMaterialScore() {
        const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        let w = 0, b = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p) {
                    if (p.color === 'w') w += values[p.type];
                    else b += values[p.type];
                }
            }
        }
        return { w, b, diff: w - b };
    }
}

// Export for module or browser window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessEngine;
}
