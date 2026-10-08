/**
 * music-manager.js
 * Dedicated Background Music Manager for:
 * "HINDI SONGS PLAYLIST FOR BARBERSHOP, TRUCK DRIVERS, & MISTRIS."
 * Playlist URL: https://youtube.com/playlist?list=PLq-bT4s33RYADNkcClDkLPovaKJx0HTDM
 * Plays the 100 curated nostalgic 90s/2000s Bollywood songs seamlessly in the background.
 */

class ChessMusicManager {
    constructor() {
        this.player = null;
        this.isReady = false;
        this.isPlaying = false;
        this.currentVolume = 75;
        this.progressTimer = null;
        this.isShuffle = false;
        this.playlistId = window.WAKWASTI_PLAYLIST_ID || "PLq-bT4s33RYADNkcClDkLPovaKJx0HTDM";

        // Load 100 tracks from playlist-tracks.js, with fallback
        this.tracks = (window.WAKWASTI_TRACKS && window.WAKWASTI_TRACKS.length > 0)
            ? window.WAKWASTI_TRACKS
            : [
                {
                    index: 0,
                    id: "mZwJs1YQ-Wk",
                    title: "Kisi Din Banoongi Main",
                    fullTitle: "Kisi Din Banoongi Main | Raja Songs | Madhuri Dixit",
                    artist: "Raja • Madhuri Dixit • Udit Narayan",
                    channel: "Shemaroo Filmi Gaane"
                }
            ];

        this.currentTrackIndex = 0;
        this.filteredTracks = [...this.tracks];
        this.searchQuery = "";

        // Callbacks
        this.onStateChangeCallback = null;
        this.onReadyCallback = null;
        this.onTrackChangeCallback = null;

        this.init();
    }

    init() {
        this.loadYouTubeAPI();
    }

    loadYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.createYouTubePlayer();
        };

        if (window.YT && window.YT.Player) {
            this.createYouTubePlayer();
        }
    }

    createYouTubePlayer() {
        const container = document.getElementById('yt-player-container');
        if (!container) return;

        const initialTrack = this.tracks[this.currentTrackIndex];

        try {
            this.player = new YT.Player('yt-player-container', {
                height: '100%',
                width: '100%',
                videoId: initialTrack ? initialTrack.id : 'mZwJs1YQ-Wk',
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'playsinline': 1,
                    'origin': window.location.origin || '*'
                },
                events: {
                    'onReady': () => {
                        this.isReady = true;
                        this.player.setVolume(this.currentVolume);
                        this.updateTrackInfo(this.currentTrackIndex);
                        if (this.onReadyCallback) this.onReadyCallback();
                    },
                    'onStateChange': (e) => {
                        this.handlePlayerStateChange(e.data);
                    },
                    'onError': (e) => {
                        console.warn('YouTube playback notice for video:', e.data);
                        // On error (e.g. restricted video), smoothly advance to next track
                        setTimeout(() => this.nextTrack(), 1200);
                    }
                }
            });
        } catch (err) {
            console.warn('Could not initialize YouTube Player:', err);
        }
    }

    handlePlayerStateChange(state) {
        // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
        if (state === 1) { // Playing
            this.isPlaying = true;
            this.startProgressTicker();
        } else if (state === 2) { // Paused
            this.isPlaying = false;
            this.stopProgressTicker();
        } else if (state === 0) { // Song finished: auto-play next track in playlist!
            this.isPlaying = false;
            this.stopProgressTicker();
            this.nextTrack();
        }

        if (this.onStateChangeCallback) {
            this.onStateChangeCallback(this.isPlaying);
        }
    }

    togglePlay() {
        if (!this.isReady || !this.player) {
            this.isPlaying = !this.isPlaying;
            if (this.onStateChangeCallback) this.onStateChangeCallback(this.isPlaying);
            return;
        }

        try {
            if (this.isPlaying) {
                this.player.pauseVideo();
            } else {
                this.player.playVideo();
            }
        } catch (e) {
            console.warn('Playback error:', e);
        }
    }

    playTrackIndex(index) {
        if (index < 0 || index >= this.tracks.length) return;
        this.currentTrackIndex = index;
        const track = this.tracks[index];

        if (!this.isReady || !this.player) {
            this.updateTrackInfo(index);
            return;
        }

        try {
            this.player.loadVideoById(track.id);
            this.isPlaying = true;
            this.updateTrackInfo(index);
            if (this.onTrackChangeCallback) this.onTrackChangeCallback(index);
            if (this.onStateChangeCallback) this.onStateChangeCallback(true);
        } catch (e) {
            console.warn('Error loading video ID:', track.id, e);
        }
    }

    nextTrack() {
        let nextIdx;
        if (this.isShuffle) {
            do {
                nextIdx = Math.floor(Math.random() * this.tracks.length);
            } while (this.tracks.length > 1 && nextIdx === this.currentTrackIndex);
        } else {
            nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        this.playTrackIndex(nextIdx);
    }

    prevTrack() {
        let prevIdx;
        if (this.isShuffle) {
            do {
                prevIdx = Math.floor(Math.random() * this.tracks.length);
            } while (this.tracks.length > 1 && prevIdx === this.currentTrackIndex);
        } else {
            prevIdx = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        }
        this.playTrackIndex(prevIdx);
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        return this.isShuffle;
    }

    setVolume(vol) {
        this.currentVolume = Math.max(0, Math.min(100, vol));
        if (this.player && this.player.setVolume) {
            try { this.player.setVolume(this.currentVolume); } catch (e) {}
        }
    }

    seekToPercent(percent) {
        if (!this.player || !this.player.getDuration) return;
        try {
            const dur = this.player.getDuration();
            if (dur && dur > 0) {
                const targetSec = (percent / 100) * dur;
                this.player.seekTo(targetSec, true);
            }
        } catch (e) {}
    }

    startProgressTicker() {
        if (this.progressTimer) clearInterval(this.progressTimer);
        this.progressTimer = setInterval(() => {
            this.updateProgress();
        }, 1000);
    }

    stopProgressTicker() {
        if (this.progressTimer) clearInterval(this.progressTimer);
    }

    updateProgress() {
        if (!this.player || !this.player.getCurrentTime) return;

        try {
            const cur = this.player.getCurrentTime() || 0;
            const dur = this.player.getDuration() || 0;

            const curEl = document.getElementById('player-time-cur');
            const totalEl = document.getElementById('player-time-total');
            const fillEl = document.getElementById('player-progress-fill');

            if (curEl) curEl.textContent = this.formatTime(Math.floor(cur));
            if (totalEl && dur > 0) totalEl.textContent = this.formatTime(Math.floor(dur));

            if (fillEl && dur > 0) {
                const pct = (cur / dur) * 100;
                fillEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
            }
        } catch (e) {}
    }

    updateTrackInfo(index) {
        const track = this.tracks[index];
        if (!track) return;

        const titleEl = document.getElementById('player-track-title');
        const artistEl = document.getElementById('player-track-artist');

        if (titleEl) titleEl.textContent = track.title;
        if (artistEl) artistEl.textContent = `90s Hindi Radio • ${track.artist}`;
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    filterTracks(query) {
        this.searchQuery = (query || "").trim().toLowerCase();
        if (!this.searchQuery) {
            this.filteredTracks = [...this.tracks];
        } else {
            this.filteredTracks = this.tracks.filter(t => 
                t.title.toLowerCase().includes(this.searchQuery) ||
                t.fullTitle.toLowerCase().includes(this.searchQuery) ||
                t.artist.toLowerCase().includes(this.searchQuery) ||
                t.channel.toLowerCase().includes(this.searchQuery)
            );
        }
        return this.filteredTracks;
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }
}

// Global instance
window.chessMusic = new ChessMusicManager();
