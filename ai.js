/**
 * ai.js
 * Chess AI with Minimax search, Alpha-Beta pruning, Piece-Square tables,
 * move ordering heuristics, and multiple difficulty levels.
 */

class ChessAI {
    constructor() {
        this.pieceValues = {
            p: 100,
            n: 320,
            b: 330,
            r: 500,
            q: 900,
            k: 20000
        };

        // Piece-Square Tables (White perspective: rank 8 down to rank 1)
        // Values encourage piece activity, center control, and king safety
        this.pst = {
            p: [
                [ 0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [ 5,  5, 10, 25, 25, 10,  5,  5],
                [ 0,  0,  0, 20, 20,  0,  0,  0],
                [ 5, -5,-10,  0,  0,-10, -5,  5],
                [ 5, 10, 10,-20,-20, 10, 10,  5],
                [ 0,  0,  0,  0,  0,  0,  0,  0]
            ],
            n: [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            b: [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            r: [
                [ 0,  0,  0,  5,  5,  0,  0,  0],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [ 5, 10, 10, 10, 10, 10, 10,  5],
                [ 0,  0,  0,  0,  0,  0,  0,  0]
            ],
            q: [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [  0,  0,  5,  5,  5,  5,  0, -5],
                [ -5,  0,  5,  5,  5,  5,  0, -5],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            k: [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [ 20, 20,  0,  0,  0,  0, 20, 20],
                [ 20, 30, 10,  0,  0, 10, 30, 20]
            ]
        };
    }

    evaluateBoard(engine) {
        let score = 0;
        const board = engine.board;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece) continue;

                const val = this.pieceValues[piece.type];
                const pstVal = piece.color === 'w'
                    ? this.pst[piece.type][r][c]
                    : this.pst[piece.type][7 - r][c];

                const totalVal = val + pstVal;
                if (piece.color === 'w') {
                    score += totalVal;
                } else {
                    score -= totalVal;
                }
            }
        }
        return score;
    }

    orderMoves(moves) {
        return moves.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            if (a.captured) {
                // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
                scoreA = 10 * this.pieceValues[a.captured.type] - this.pieceValues[a.piece.type];
            }
            if (a.promotion) {
                scoreA += this.pieceValues[a.promotion];
            }

            if (b.captured) {
                scoreB = 10 * this.pieceValues[b.captured.type] - this.pieceValues[b.piece.type];
            }
            if (b.promotion) {
                scoreB += this.pieceValues[b.promotion];
            }

            return scoreB - scoreA;
        });
    }

    minimax(engine, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(engine);
        }

        const legalMoves = engine.getLegalMoves(engine.turn);

        if (legalMoves.length === 0) {
            if (engine.isCheck(engine.turn)) {
                // Checkmate score adjusted by depth
                return isMaximizing ? -50000 - depth : 50000 + depth;
            }
            return 0; // Stalemate / Draw
        }

        const orderedMoves = this.orderMoves(legalMoves);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of orderedMoves) {
                engine.makeMove(move);
                const evalScore = this.minimax(engine, depth - 1, alpha, beta, false);
                engine.undoMove();

                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break; // Beta cutoff
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of orderedMoves) {
                engine.makeMove(move);
                const evalScore = this.minimax(engine, depth - 1, alpha, beta, true);
                engine.undoMove();

                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break; // Alpha cutoff
            }
            return minEval;
        }
    }

    getBestMove(engine, difficulty = 'medium') {
        const aiColor = engine.turn;
        const legalMoves = engine.getLegalMoves(aiColor);
        if (legalMoves.length === 0) return null;

        const isMaximizing = aiColor === 'w';

        // EASY DIFFICULTY
        if (difficulty === 'easy') {
            // 35% chance to make a purely random legal move
            if (Math.random() < 0.35) {
                return legalMoves[Math.floor(Math.random() * legalMoves.length)];
            }
            // Depth 1 evaluation with slight noise
            let bestMoves = [];
            let bestScore = isMaximizing ? -Infinity : Infinity;

            for (const move of legalMoves) {
                engine.makeMove(move);
                const score = this.evaluateBoard(engine) + (Math.random() * 30 - 15);
                engine.undoMove();

                if (isMaximizing) {
                    if (score > bestScore) {
                        bestScore = score;
                        bestMoves = [move];
                    } else if (Math.abs(score - bestScore) < 5) {
                        bestMoves.push(move);
                    }
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        bestMoves = [move];
                    } else if (Math.abs(score - bestScore) < 5) {
                        bestMoves.push(move);
                    }
                }
            }
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }

        // MEDIUM (Depth 2) & HARD (Depth 3)
        const depth = difficulty === 'hard' ? 3 : 2;
        const orderedMoves = this.orderMoves(legalMoves);

        let bestMoves = [orderedMoves[0]];
        let bestEval = isMaximizing ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of orderedMoves) {
            engine.makeMove(move);
            const moveEval = this.minimax(engine, depth - 1, alpha, beta, !isMaximizing);
            engine.undoMove();

            if (isMaximizing) {
                if (moveEval > bestEval + 2) {
                    bestEval = moveEval;
                    bestMoves = [move];
                } else if (Math.abs(moveEval - bestEval) <= 2) {
                    bestMoves.push(move);
                }
                alpha = Math.max(alpha, moveEval);
            } else {
                if (moveEval < bestEval - 2) {
                    bestEval = moveEval;
                    bestMoves = [move];
                } else if (Math.abs(moveEval - bestEval) <= 2) {
                    bestMoves.push(move);
                }
                beta = Math.min(beta, moveEval);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    async getBestMoveAsync(engine, difficulty = 'medium') {
        return new Promise(resolve => {
            // Run asynchronously so UI animations & "thinking" indicators render smoothly
            setTimeout(() => {
                const move = this.getBestMove(engine, difficulty);
                resolve(move);
            }, 60);
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessAI;
}
