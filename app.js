/**
 * app.js
 * Main game controller and UI integration.
 * Handles drag-and-drop, board rendering, timers, AI moves, sounds, and UI controls.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Engine & Components
    const engine = new ChessEngine();
    const ai = new ChessAI();
    const audio = new ChessAudio();

    // Game Configuration State
    let gameMode = 'ai'; // 'ai' or 'pvp'
    let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
    let playerColor = 'w'; // Color human plays in vs-AI mode
    let isFlipped = false;
    let isAiThinking = false;

    // Selection & Drag State
    let selectedSquare = null; // { r, c }
    let legalMovesForSelected = [];
    let lastMove = null; // { from, to }
    let pendingPromotion = null; // { from, to }

    // Drag-and-drop support
    let isDragging = false;
    let draggedSquare = null;
    let dragGhost = document.getElementById('drag-ghost');

    // Clocks
    let timeControlSeconds = 300; // default 5 min
    let clocks = {
        w: 300,
        b: 300,
        intervalId: null
    };

    // DOM Elements
    const boardEl = document.getElementById('chessboard');
    const statusBanner = document.getElementById('status-banner');
    const moveHistoryTable = document.getElementById('move-history-tbody');
    const emptyHistoryEl = document.getElementById('empty-history');
    const topClockEl = document.getElementById('top-clock');
    const bottomClockEl = document.getElementById('bottom-clock');
    const topPillEl = document.getElementById('top-pill');
    const bottomPillEl = document.getElementById('bottom-pill');
    const topCapturedEl = document.getElementById('top-captured');
    const bottomCapturedEl = document.getElementById('bottom-captured');
    const topScoreEl = document.getElementById('top-score');
    const bottomScoreEl = document.getElementById('bottom-score');
    const topAvatarEl = document.getElementById('top-avatar');
    const bottomAvatarEl = document.getElementById('bottom-avatar');
    const topPlayerNameEl = document.getElementById('top-player-name');
    const bottomPlayerNameEl = document.getElementById('bottom-player-name');
    const topPlayerTagEl = document.getElementById('top-player-tag');
    const bottomPlayerTagEl = document.getElementById('bottom-player-tag');

    // Modals
    const promoModal = document.getElementById('promo-modal');
    const promoGrid = document.getElementById('promo-grid');
    const gameOverModal = document.getElementById('game-over-modal');
    const gameOverIcon = document.getElementById('game-over-icon');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverReason = document.getElementById('game-over-reason');

    // Controls
    const gameModeSelect = document.getElementById('game-mode-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const playerColorSelect = document.getElementById('player-color-select');
    const timeControlSelect = document.getElementById('time-control-select');
    const themeSelect = document.getElementById('theme-select');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnUndo = document.getElementById('btn-undo');
    const btnFlip = document.getElementById('btn-flip');
    const btnMute = document.getElementById('btn-mute');
    const btnRematch = document.getElementById('btn-rematch');

    // Initialize Game
    init();

    function init() {
        bindEvents();
        startNewGame();
    }

    function bindEvents() {
        // Controls
        gameModeSelect.addEventListener('change', (e) => {
            gameMode = e.target.value;
            difficultySelect.disabled = (gameMode !== 'ai');
            playerColorSelect.disabled = (gameMode !== 'ai');
            startNewGame();
        });

        difficultySelect.addEventListener('change', (e) => {
            aiDifficulty = e.target.value;
        });

        playerColorSelect.addEventListener('change', (e) => {
            playerColor = e.target.value;
            isFlipped = (playerColor === 'b');
            startNewGame();
        });

        timeControlSelect.addEventListener('change', (e) => {
            timeControlSeconds = parseInt(e.target.value, 10);
            startNewGame();
        });

        themeSelect.addEventListener('change', (e) => {
            document.body.dataset.theme = e.target.value;
        });

        btnNewGame.addEventListener('click', () => startNewGame());
        btnRematch.addEventListener('click', () => {
            closeModals();
            startNewGame();
        });

        btnUndo.addEventListener('click', handleUndo);
        btnFlip.addEventListener('click', toggleBoardFlip);

        btnMute.addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            btnMute.textContent = isMuted ? '🔇' : '🔊';
        });

        // Floating Hero Pills
        const pillBaarish = document.getElementById('pill-baarish');
        if (pillBaarish) {
            pillBaarish.addEventListener('click', () => {
                const isRaining = audio.toggleRain();
                pillBaarish.style.borderColor = isRaining ? 'var(--accent-amber)' : '';
                pillBaarish.innerHTML = isRaining ? '<span>🌧️ Baarish On ⚡</span>' : '<span>🌧️ Baarish?</span>';
            });
        }

        const pillMode = document.getElementById('pill-mode-toggle');
        if (pillMode) {
            pillMode.addEventListener('click', () => {
                gameMode = gameMode === 'ai' ? 'pvp' : 'ai';
                gameModeSelect.value = gameMode;
                difficultySelect.disabled = (gameMode !== 'ai');
                playerColorSelect.disabled = (gameMode !== 'ai');
                pillMode.innerHTML = gameMode === 'ai' ? '<span>🤖 Play vs AI</span>' : '<span>👥 Pass & Play</span>';
                startNewGame();
            });
        }

        const pillShare = document.getElementById('pill-share');
        if (pillShare) {
            pillShare.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    pillShare.innerHTML = '<span>✅ Copied Link!</span>';
                    setTimeout(() => { pillShare.innerHTML = '<span>💬 Share</span>'; }, 2000);
                } else {
                    alert('ChessMasters Wakwasti: ' + window.location.href);
                }
            });
        }

        // Top Navigation Theme Button
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const themeList = ['coastal', 'emerald', 'wood', 'slate', 'terracotta'];
        let currentThemeIdx = 0;
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                currentThemeIdx = (currentThemeIdx + 1) % themeList.length;
                const chosen = themeList[currentThemeIdx];
                document.body.dataset.theme = chosen;
                themeSelect.value = chosen;
            });
        }

        // About / FAQ Modals
        const infoModal = document.getElementById('info-modal');
        const btnHowToPlay = document.getElementById('btn-how-to-play');
        const btnFaq = document.getElementById('btn-faq');
        const btnCloseInfo = document.getElementById('btn-close-info');

        if (btnHowToPlay) btnHowToPlay.addEventListener('click', () => infoModal.classList.add('open'));
        if (btnFaq) btnFaq.addEventListener('click', () => infoModal.classList.add('open'));
        if (btnCloseInfo) btnCloseInfo.addEventListener('click', () => infoModal.classList.remove('open'));

        // ==========================================
        // Music Player & Music Lounge Modal Controls
        // ==========================================
        // ==============================================================
        // Dedicated 90s Hindi Nostalgia Playlist & Retro Player Controls
        // ==============================================================
        const btnPlayTrack = document.getElementById('btn-play-track');
        const btnPrevTrack = document.getElementById('btn-prev-track');
        const btnNextTrack = document.getElementById('btn-next-track');
        const btnShuffleTrack = document.getElementById('btn-shuffle-track');
        const btnModalShuffle = document.getElementById('btn-modal-shuffle');
        const albumArtIcon = document.getElementById('album-art-icon');
        const playerProgressBg = document.getElementById('player-progress-bg');
        const btnOpenLounge = document.getElementById('btn-open-lounge');
        const pillMusicLounge = document.getElementById('pill-music-lounge');
        const musicModal = document.getElementById('music-lounge-modal');
        const btnCloseMusic = document.getElementById('btn-close-music');
        const playlistSearchInput = document.getElementById('playlist-search-input');
        const playlistTracksList = document.getElementById('playlist-tracks-list');
        const playlistCountText = document.getElementById('playlist-count-text');
        const ytVolSlider = document.getElementById('yt-volume-slider');
        const ytVolVal = document.getElementById('yt-vol-val');

        function updatePlayPauseButton(isPlaying) {
            if (btnPlayTrack) btnPlayTrack.textContent = isPlaying ? '⏸' : '▶';
            if (albumArtIcon) albumArtIcon.classList.toggle('playing', isPlaying);
            updateTrackListPlayingState();
        }

        function updateShuffleUI() {
            const isShuffle = window.chessMusic ? window.chessMusic.isShuffle : false;
            if (btnShuffleTrack) btnShuffleTrack.classList.toggle('active', isShuffle);
            if (btnModalShuffle) btnModalShuffle.classList.toggle('active', isShuffle);
        }

        function updateTrackListPlayingState() {
            if (!playlistTracksList || !window.chessMusic) return;
            const currentIdx = window.chessMusic.currentTrackIndex;
            const isPlaying = window.chessMusic.isPlaying;

            const items = playlistTracksList.querySelectorAll('.playlist-track-item');
            items.forEach(item => {
                const itemIdx = parseInt(item.dataset.index, 10);
                const isThisCurrent = (itemIdx === currentIdx);
                item.classList.toggle('playing', isThisCurrent && isPlaying);
                const badge = item.querySelector('.track-play-badge');
                if (badge) {
                    badge.textContent = (isThisCurrent && isPlaying) ? '⏸ Playing' : (isThisCurrent ? '▶ Paused' : '▶ Play');
                }
            });
        }

        function renderPlaylistTracks() {
            if (!playlistTracksList || !window.chessMusic) return;
            const tracks = window.chessMusic.filteredTracks || window.chessMusic.tracks;
            const currentIdx = window.chessMusic.currentTrackIndex;
            const isPlaying = window.chessMusic.isPlaying;

            playlistTracksList.innerHTML = '';

            if (playlistCountText) {
                playlistCountText.textContent = `${tracks.length} Songs ${window.chessMusic.searchQuery ? 'Found' : 'in Playlist'}`;
            }

            if (tracks.length === 0) {
                playlistTracksList.innerHTML = `
                    <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
                        No songs found matching "${window.chessMusic.searchQuery}". Try searching another title, singer or film.
                    </div>
                `;
                return;
            }

            tracks.forEach((track) => {
                const item = document.createElement('div');
                const isCurrent = (track.index === currentIdx);
                item.className = `playlist-track-item ${isCurrent && isPlaying ? 'playing' : ''}`;
                item.dataset.index = track.index;

                const displayNum = (track.index + 1).toString().padStart(2, '0');

                item.innerHTML = `
                    <div class="track-item-left">
                        <span class="track-item-num">#${displayNum}</span>
                        <div class="track-item-texts">
                            <span class="track-item-title">${track.title}</span>
                            <span class="track-item-artist">${track.artist}</span>
                        </div>
                    </div>
                    <div class="track-item-action">
                        <span class="track-play-badge">${isCurrent && isPlaying ? '⏸ Playing' : (isCurrent ? '▶ Paused' : '▶ Play')}</span>
                    </div>
                `;

                item.addEventListener('click', () => {
                    if (window.chessMusic.currentTrackIndex === track.index && window.chessMusic.isPlaying) {
                        window.chessMusic.togglePlay();
                    } else {
                        window.chessMusic.playTrackIndex(track.index);
                    }
                    updatePlayPauseButton(window.chessMusic.isPlaying);
                });

                playlistTracksList.appendChild(item);
            });
        }

        // Attach callbacks to ChessMusicManager
        if (window.chessMusic) {
            window.chessMusic.onStateChangeCallback = (isPlaying) => {
                updatePlayPauseButton(isPlaying);
            };
            window.chessMusic.onTrackChangeCallback = () => {
                updateTrackListPlayingState();
            };
            window.chessMusic.onReadyCallback = () => {
                renderPlaylistTracks();
            };
        }

        if (btnPlayTrack) {
            btnPlayTrack.addEventListener('click', () => {
                if (window.chessMusic) {
                    window.chessMusic.togglePlay();
                    updatePlayPauseButton(window.chessMusic.isPlaying);
                }
            });
        }

        if (btnPrevTrack) {
            btnPrevTrack.addEventListener('click', () => {
                if (window.chessMusic) {
                    window.chessMusic.prevTrack();
                    updatePlayPauseButton(true);
                }
            });
        }

        if (btnNextTrack) {
            btnNextTrack.addEventListener('click', () => {
                if (window.chessMusic) {
                    window.chessMusic.nextTrack();
                    updatePlayPauseButton(true);
                }
            });
        }

        function handleShuffleToggle() {
            if (window.chessMusic) {
                window.chessMusic.toggleShuffle();
                updateShuffleUI();
            }
        }

        if (btnShuffleTrack) btnShuffleTrack.addEventListener('click', handleShuffleToggle);
        if (btnModalShuffle) btnModalShuffle.addEventListener('click', handleShuffleToggle);

        if (playerProgressBg) {
            playerProgressBg.addEventListener('click', (e) => {
                const rect = playerProgressBg.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                if (window.chessMusic) {
                    window.chessMusic.seekToPercent(pct);
                }
            });
        }

        function openMusicLounge() {
            if (musicModal) {
                musicModal.classList.add('open');
                renderPlaylistTracks();
                updateShuffleUI();
                if (playlistSearchInput) playlistSearchInput.focus();
            }
        }

        function closeMusicLounge() {
            if (musicModal) {
                musicModal.classList.remove('open');
            }
        }

        if (btnOpenLounge) btnOpenLounge.addEventListener('click', openMusicLounge);
        if (pillMusicLounge) pillMusicLounge.addEventListener('click', openMusicLounge);
        if (btnCloseMusic) btnCloseMusic.addEventListener('click', closeMusicLounge);
        if (musicModal) {
            musicModal.addEventListener('click', (e) => {
                if (e.target === musicModal) closeMusicLounge();
            });
        }

        // Live Search Input Filtering
        if (playlistSearchInput) {
            playlistSearchInput.addEventListener('input', (e) => {
                if (window.chessMusic) {
                    window.chessMusic.filterTracks(e.target.value);
                    renderPlaylistTracks();
                }
            });
        }

        // Volume slider
        if (ytVolSlider) {
            ytVolSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                if (ytVolVal) ytVolVal.textContent = `${val}%`;
                if (window.chessMusic) window.chessMusic.setVolume(val);
            });
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'u' || e.key === 'U') handleUndo();
            if (e.key === 'f' || e.key === 'F') toggleBoardFlip();
            if (e.key === 'n' || e.key === 'N') startNewGame();
        });

        // Global Drag Event Listeners
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
    }

    function startNewGame() {
        engine.reset();
        selectedSquare = null;
        legalMovesForSelected = [];
        lastMove = null;
        pendingPromotion = null;
        isAiThinking = false;
        closeModals();

        // Reset clocks
        resetClocks();

        updatePlayerLabels();
        renderBoard();
        updateUI();

        // If playing as Black against AI, AI moves first
        if (gameMode === 'ai' && playerColor === 'b' && engine.turn === 'w') {
            triggerAiMove();
        }
    }

    function getBoardColors() {
        const topColor = isFlipped ? 'w' : 'b';
        const bottomColor = isFlipped ? 'b' : 'w';
        return { topColor, bottomColor };
    }

    function updatePlayerLabels() {
        const { topColor, bottomColor } = getBoardColors();

        topAvatarEl.className = `avatar-badge ${topColor === 'w' ? 'white' : 'black'}`;
        topAvatarEl.textContent = topColor === 'w' ? '♙' : '♟';

        bottomAvatarEl.className = `avatar-badge ${bottomColor === 'w' ? 'white' : 'black'}`;
        bottomAvatarEl.textContent = bottomColor === 'w' ? '♙' : '♟';

        if (gameMode === 'ai') {
            const topIsHuman = (topColor === playerColor);
            topPlayerNameEl.textContent = topIsHuman ? `You (${topColor === 'w' ? 'White' : 'Black'})` : `StockBot (${capitalize(aiDifficulty)})`;
            topPlayerTagEl.textContent = topIsHuman ? 'Player' : 'Computer AI';

            const bottomIsHuman = (bottomColor === playerColor);
            bottomPlayerNameEl.textContent = bottomIsHuman ? `You (${bottomColor === 'w' ? 'White' : 'Black'})` : `StockBot (${capitalize(aiDifficulty)})`;
            bottomPlayerTagEl.textContent = bottomIsHuman ? 'Player' : 'Computer AI';
        } else {
            // PvP
            topPlayerNameEl.textContent = topColor === 'w' ? 'Player 1 (White)' : 'Player 2 (Black)';
            topPlayerTagEl.textContent = 'Pass & Play';
            bottomPlayerNameEl.textContent = bottomColor === 'w' ? 'Player 1 (White)' : 'Player 2 (Black)';
            bottomPlayerTagEl.textContent = 'Pass & Play';
        }
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function toggleBoardFlip() {
        isFlipped = !isFlipped;
        updatePlayerLabels();
        renderBoard();
    }

    /* ==========================================================================
       Rendering & Board Building
       ========================================================================== */
    function renderBoard() {
        boardEl.innerHTML = '';
        const kingInCheckPos = engine.isCheck(engine.turn) ? engine.getKingPosition(engine.turn) : null;

        for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
            for (let colIdx = 0; colIdx < 8; colIdx++) {
                // Determine board square based on flip
                const r = isFlipped ? 7 - rowIdx : rowIdx;
                const c = isFlipped ? 7 - colIdx : colIdx;

                const square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.r = r;
                square.dataset.c = c;

                // Highlight Last Move
                if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) {
                    square.classList.add('last-move');
                }

                // Highlight Selected Square
                if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                    square.classList.add('selected');
                }

                // Highlight Check on King
                if (kingInCheckPos && kingInCheckPos.r === r && kingInCheckPos.c === c) {
                    square.classList.add('in-check');
                }

                // Coordinate labels on edges
                if (colIdx === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coord-rank';
                    rankLabel.textContent = 8 - r;
                    square.appendChild(rankLabel);
                }
                if (rowIdx === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coord-file';
                    fileLabel.textContent = String.fromCharCode(97 + c);
                    square.appendChild(fileLabel);
                }

                // Render Piece
                const piece = engine.getPiece(r, c);
                if (piece) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = 'piece';
                    pieceEl.innerHTML = ChessPieces.getSvg(piece.type, piece.color);
                    pieceEl.dataset.r = r;
                    pieceEl.dataset.c = c;

                    // Pointer down for click & drag
                    pieceEl.addEventListener('pointerdown', (e) => onPiecePointerDown(e, r, c, piece));

                    square.appendChild(pieceEl);
                }

                // Render Move Hint Dots / Rings
                if (selectedSquare) {
                    const hintMove = legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
                    if (hintMove) {
                        const hint = document.createElement('div');
                        if (hintMove.captured || hintMove.isEnPassant) {
                            hint.className = 'move-hint-capture';
                        } else {
                            hint.className = 'move-hint-dot';
                        }
                        square.appendChild(hint);
                    }
                }

                // Square click handler (for tap to move)
                square.addEventListener('click', (e) => onSquareClick(r, c));

                boardEl.appendChild(square);
            }
        }
    }

    /* ==========================================================================
       Piece Interaction: Click & Drag
       ========================================================================== */
    function onSquareClick(r, c) {
        if (isAiThinking) return;

        const piece = engine.getPiece(r, c);
        const isCurrentPlayerTurn = (gameMode === 'pvp') || (engine.turn === playerColor);

        if (!isCurrentPlayerTurn) return;

        // If clicking on one of player's own pieces -> select it
        if (piece && piece.color === engine.turn) {
            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                // Clicked same piece -> unselect
                clearSelection();
            } else {
                selectSquare(r, c);
            }
            return;
        }

        // If a piece is currently selected, try to move to clicked square
        if (selectedSquare) {
            const chosenMove = legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
            if (chosenMove) {
                executePlayerMove(chosenMove);
            } else {
                clearSelection();
            }
        }
    }

    function selectSquare(r, c) {
        selectedSquare = { r, c };
        legalMovesForSelected = engine.getLegalMovesForSquare(r, c);
        renderBoard();
    }

    function clearSelection() {
        selectedSquare = null;
        legalMovesForSelected = [];
        renderBoard();
    }

    /* Drag and Drop Implementation */
    function onPiecePointerDown(e, r, c, piece) {
        if (isAiThinking) return;
        const isCurrentPlayerTurn = (gameMode === 'pvp') || (engine.turn === playerColor);
        if (!isCurrentPlayerTurn) return;
        if (piece.color !== engine.turn) return;

        // Select piece
        selectSquare(r, c);

        // Initiate dragging
        isDragging = true;
        draggedSquare = { r, c, piece };

        // Setup drag ghost
        dragGhost.innerHTML = ChessPieces.getSvg(piece.type, piece.color);
        dragGhost.style.display = 'block';
        dragGhost.style.left = `${e.clientX}px`;
        dragGhost.style.top = `${e.clientY}px`;

        const pieceEl = e.currentTarget;
        pieceEl.classList.add('dragging');
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        dragGhost.style.left = `${e.clientX}px`;
        dragGhost.style.top = `${e.clientY}px`;
    }

    function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        dragGhost.style.display = 'none';

        // Find square under pointer
        const targetEl = document.elementFromPoint(e.clientX, e.clientY);
        const squareEl = targetEl ? targetEl.closest('.square') : null;

        if (squareEl && draggedSquare) {
            const tr = parseInt(squareEl.dataset.r, 10);
            const tc = parseInt(squareEl.dataset.c, 10);

            if (tr !== draggedSquare.r || tc !== draggedSquare.c) {
                const chosenMove = legalMovesForSelected.find(m => m.to.r === tr && m.to.c === tc);
                if (chosenMove) {
                    executePlayerMove(chosenMove);
                    draggedSquare = null;
                    return;
                }
            }
        }

        draggedSquare = null;
        renderBoard();
    }

    /* ==========================================================================
       Move Execution & Rule Handling
       ========================================================================== */
    function executePlayerMove(move) {
        // Check for pawn promotion
        if (move.piece.type === 'p' && (move.to.r === 0 || move.to.r === 7)) {
            pendingPromotion = move;
            showPromotionModal(move.piece.color);
            return;
        }

        commitMove(move);
    }

    function showPromotionModal(color) {
        promoGrid.innerHTML = '';
        const choices = ['q', 'r', 'b', 'n'];

        choices.forEach(type => {
            const opt = document.createElement('div');
            opt.className = 'promo-option';
            opt.innerHTML = ChessPieces.getSvg(type, color);
            opt.addEventListener('click', () => {
                if (pendingPromotion) {
                    const moveWithPromo = { ...pendingPromotion, promotion: type };
                    pendingPromotion = null;
                    closeModals();
                    commitMove(moveWithPromo);
                }
            });
            promoGrid.appendChild(opt);
        });

        promoModal.classList.add('open');
    }

    function commitMove(move) {
        const executed = engine.makeMove(move);
        if (!executed) return;

        lastMove = { from: move.from, to: move.to };
        clearSelection();

        // Play appropriate sound
        playSoundForMove(executed);

        // Update Clocks
        startClockIfNeeded();
        switchClocks();

        // Update UI
        updateUI();

        // Check for Game Over
        const status = engine.getGameStatus();
        if (status.status !== 'active') {
            handleGameOver(status);
            return;
        }

        // Trigger AI move if applicable
        if (gameMode === 'ai' && engine.turn !== playerColor) {
            triggerAiMove();
        }
    }

    function playSoundForMove(move) {
        if (engine.isCheck(engine.turn)) {
            audio.playCheck();
        } else if (move.isCastle) {
            audio.playCastle();
        } else if (move.captured) {
            audio.playCapture();
        } else {
            audio.playMove();
        }
    }

    async function triggerAiMove() {
        isAiThinking = true;
        updateStatusBanner();

        // Delay slightly for natural feel (300ms)
        await new Promise(r => setTimeout(r, 280));

        const aiMove = await ai.getBestMoveAsync(engine, aiDifficulty);
        isAiThinking = false;

        if (aiMove) {
            const executed = engine.makeMove(aiMove);
            if (executed) {
                lastMove = { from: aiMove.from, to: aiMove.to };
                playSoundForMove(executed);
                switchClocks();
                updateUI();

                const status = engine.getGameStatus();
                if (status.status !== 'active') {
                    handleGameOver(status);
                }
            }
        }
    }

    function handleUndo() {
        if (isAiThinking) return;

        if (gameMode === 'ai') {
            // Undo 2 half-moves so it returns to player's turn
            if (engine.history.length >= 2) {
                engine.undoMove();
                engine.undoMove();
            } else if (engine.history.length === 1 && engine.turn !== playerColor) {
                engine.undoMove();
            }
        } else {
            // PvP mode: undo 1 half-move
            engine.undoMove();
        }

        lastMove = engine.history.length > 0 ? engine.history[engine.history.length - 1].move : null;
        if (engine.history.length === 0 && clocks.intervalId) {
            clearInterval(clocks.intervalId);
            clocks.intervalId = null;
        }
        clearSelection();
        closeModals();
        updateUI();
    }

    /* ==========================================================================
       UI Updates, Status Banner, & History
       ========================================================================== */
    function updateUI() {
        renderBoard();
        updateStatusBanner();
        renderCapturedPieces();
        renderMoveHistory();
        updateTurnPills();
    }

    function updateStatusBanner() {
        statusBanner.className = '';
        const status = engine.getGameStatus();

        if (isAiThinking) {
            statusBanner.textContent = `StockBot is thinking...`;
            return;
        }

        if (status.status === 'checkmate') {
            statusBanner.textContent = status.reason;
            statusBanner.classList.add('game-over');
        } else if (status.status === 'stalemate' || status.status === 'draw') {
            statusBanner.textContent = status.reason;
            statusBanner.classList.add('game-over');
        } else if (status.inCheck) {
            const checkedColor = engine.turn === 'w' ? 'White' : 'Black';
            statusBanner.textContent = `Check! ${checkedColor} King is under attack!`;
            statusBanner.classList.add('check');
        } else {
            const turnName = engine.turn === 'w' ? 'White' : 'Black';
            statusBanner.textContent = `${turnName}'s turn to move`;
        }

        const badgeLiveCount = document.getElementById('badge-live-count');
        if (badgeLiveCount) {
            badgeLiveCount.textContent = status.inCheck ? 'Check!' : (engine.turn === 'w' ? 'White' : 'Black');
        }
    }

    function updateTurnPills() {
        const { topColor, bottomColor } = getBoardColors();

        topPillEl.classList.toggle('active', engine.turn === topColor);
        bottomPillEl.classList.toggle('active', engine.turn === bottomColor);

        topClockEl.classList.toggle('active', engine.turn === topColor);
        bottomClockEl.classList.toggle('active', engine.turn === bottomColor);
    }

    function renderCapturedPieces() {
        const { topColor, bottomColor } = getBoardColors();
        const captured = engine.capturedPieces;
        const mat = engine.getMaterialScore();

        // Pieces captured BY top player
        topCapturedEl.innerHTML = '';
        captured[topColor].forEach(p => {
            const el = document.createElement('div');
            el.className = 'captured-mini';
            el.innerHTML = ChessPieces.getSvg(p.type, p.color);
            topCapturedEl.appendChild(el);
        });

        // Pieces captured BY bottom player
        bottomCapturedEl.innerHTML = '';
        captured[bottomColor].forEach(p => {
            const el = document.createElement('div');
            el.className = 'captured-mini';
            el.innerHTML = ChessPieces.getSvg(p.type, p.color);
            bottomCapturedEl.appendChild(el);
        });

        // Material Advantage scores (+X)
        const topScoreDiff = topColor === 'w' ? mat.diff : -mat.diff;
        const bottomScoreDiff = bottomColor === 'w' ? mat.diff : -mat.diff;

        topScoreEl.textContent = topScoreDiff > 0 ? `+${topScoreDiff}` : '';
        bottomScoreEl.textContent = bottomScoreDiff > 0 ? `+${bottomScoreDiff}` : '';
    }

    function renderMoveHistory() {
        const history = engine.history;
        if (history.length === 0) {
            emptyHistoryEl.style.display = 'block';
            moveHistoryTable.innerHTML = '';
            return;
        }

        emptyHistoryEl.style.display = 'none';
        moveHistoryTable.innerHTML = '';

        for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = history[i] ? history[i].move.san : '';
            const blackMove = history[i + 1] ? history[i + 1].move.san : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="move-num">${moveNum}.</td>
                <td>${whiteMove}</td>
                <td>${blackMove}</td>
            `;
            moveHistoryTable.appendChild(row);
        }

        // Auto scroll to bottom
        const container = document.getElementById('history-scroll-box');
        container.scrollTop = container.scrollHeight;
    }

    /* ==========================================================================
       Clocks / Timers
       ========================================================================== */
    function resetClocks() {
        if (clocks.intervalId) clearInterval(clocks.intervalId);

        clocks.w = timeControlSeconds;
        clocks.b = timeControlSeconds;
        clocks.intervalId = null;

        updateClockDisplays();
    }

    function startClockIfNeeded() {
        if (!clocks.intervalId && timeControlSeconds > 0) {
            clocks.intervalId = setInterval(tickClock, 1000);
        }
    }

    function tickClock() {
        const status = engine.getGameStatus();
        if (status.status !== 'active') {
            clearInterval(clocks.intervalId);
            return;
        }

        if (engine.turn === 'w') {
            clocks.w--;
            if (clocks.w <= 0) {
                clocks.w = 0;
                handleTimeout('w');
            }
        } else {
            clocks.b--;
            if (clocks.b <= 0) {
                clocks.b = 0;
                handleTimeout('b');
            }
        }
        updateClockDisplays();
    }

    function switchClocks() {
        updateClockDisplays();
    }

    function updateClockDisplays() {
        if (timeControlSeconds <= 0) {
            topClockEl.textContent = '∞';
            bottomClockEl.textContent = '∞';
            return;
        }

        const { topColor, bottomColor } = getBoardColors();
        topClockEl.textContent = formatTime(clocks[topColor]);
        bottomClockEl.textContent = formatTime(clocks[bottomColor]);

        topClockEl.classList.toggle('low-time', clocks[topColor] <= 30);
        bottomClockEl.classList.toggle('low-time', clocks[bottomColor] <= 30);
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function handleTimeout(color) {
        clearInterval(clocks.intervalId);
        const winner = color === 'w' ? 'Black' : 'White';
        const loser = color === 'w' ? 'White' : 'Black';

        audio.playGameOver(gameMode === 'ai' ? (winner === 'White' && playerColor === 'w') : true);

        gameOverIcon.textContent = '⏱️';
        gameOverTitle.textContent = `${winner} Wins!`;
        gameOverReason.textContent = `${loser} ran out of time.`;
        gameOverModal.classList.add('open');
    }

    /* ==========================================================================
       Game Over Modal
       ========================================================================== */
    function handleGameOver(status) {
        if (clocks.intervalId) clearInterval(clocks.intervalId);

        let isWin = false;
        let icon = '🤝';
        let title = 'Game Drawn';

        if (status.status === 'checkmate') {
            const winnerName = status.winner === 'w' ? 'White' : 'Black';
            title = `${winnerName} Wins!`;
            icon = '🏆';
            isWin = (gameMode === 'ai' && status.winner === playerColor);
        }

        audio.playGameOver(isWin);

        gameOverIcon.textContent = icon;
        gameOverTitle.textContent = title;
        gameOverReason.textContent = status.reason;
        gameOverModal.classList.add('open');
    }

    function closeModals() {
        promoModal.classList.remove('open');
        gameOverModal.classList.remove('open');
        const infoModal = document.getElementById('info-modal');
        if (infoModal) infoModal.classList.remove('open');
        const musicModal = document.getElementById('music-lounge-modal');
        if (musicModal) musicModal.classList.remove('open');
    }
});
