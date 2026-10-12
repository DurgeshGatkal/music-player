/**
 * ============================================================================
 * SONORA • HI-FI AUDIO ENGINE
 * Doubly Linked List In-Memory Architecture
 * ============================================================================
 * Internal Playlist Graph:
 * - Every song is a Doubly Linked List Node: node.prev <--> node <--> node.next
 * - O(1) instantaneous track navigation without index lookups
 * - Automatic loop wrap-around support (Circular DLL)
 * ============================================================================
 */

// ============================================================================
// 1. DOUBLY LINKED LIST NODE CLASS
// ============================================================================
class SongNode {
    /**
     * @param {string} title
     * @param {string} artist
     * @param {string} album
     * @param {string} dateAdded
     * @param {string} file
     * @param {string} coverGradient
     * @param {string} duration
     */
    constructor(title, artist, album, dateAdded, file, coverGradient, duration = "3:30") {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.dateAdded = dateAdded;
        this.file = file;
        this.coverGradient = coverGradient;
        this.duration = duration;

        // Pointer References
        this.prev = null;
        this.next = null;
    }
}

// ============================================================================
// 2. DOUBLY LINKED LIST PLAYLIST
// ============================================================================
class DoublyLinkedListPlaylist {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.isCircular = true;
        this._count = 0;
    }

    /**
     * Append song node to tail - O(1)
     */
    addSong(title, artist, album, dateAdded, file, coverGradient, duration) {
        const newNode = new SongNode(title, artist, album, dateAdded, file, coverGradient, duration);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }

        this._count++;
        return newNode;
    }

    /**
     * Move to next song - O(1)
     */
    nextSong() {
        if (!this.current) return null;

        if (this.current.next) {
            this.current = this.current.next;
        } else if (this.isCircular && this.head) {
            this.current = this.head;
        }
        return this.current;
    }

    /**
     * Move to previous song - O(1)
     */
    previousSong() {
        if (!this.current) return null;

        if (this.current.prev) {
            this.current = this.current.prev;
        } else if (this.isCircular && this.tail) {
            this.current = this.tail;
        }
        return this.current;
    }

    /**
     * Shuffle nodes and rewire pointers
     */
    shuffle() {
        const nodes = this.toArray();
        if (nodes.length <= 1) return;

        for (let i = nodes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
        }

        this.head = nodes[0];
        this.head.prev = null;

        for (let i = 0; i < nodes.length - 1; i++) {
            nodes[i].next = nodes[i + 1];
            nodes[i + 1].prev = nodes[i];
        }

        this.tail = nodes[nodes.length - 1];
        this.tail.next = null;
    }

    /**
     * Convert linked list to linear array
     */
    toArray() {
        const list = [];
        let temp = this.head;
        while (temp !== null) {
            list.push(temp);
            temp = temp.next;
        }
        return list;
    }

    size() {
        return this._count;
    }
}

// ============================================================================
// 3. SEED TRACK DATA
// ============================================================================
const playlist = new DoublyLinkedListPlaylist();

playlist.addSong(
    "Believer",
    "Imagine Dragons",
    "Evolve",
    "2017 Hit",
    "music/song1.mp3",
    "linear-gradient(135deg, #FF416C, #8B5CF6)",
    "3:24"
);
playlist.addSong(
    "Perfect",
    "Ed Sheeran",
    "÷ (Divide)",
    "2017 Hit",
    "music/song2.mp3",
    "linear-gradient(135deg, #06B6D4, #3B82F6)",
    "4:23"
);
playlist.addSong(
    "Shape of You",
    "Ed Sheeran",
    "÷ (Divide)",
    "2017 Hit",
    "music/song3.mp3",
    "linear-gradient(135deg, #EC4899, #8B5CF6)",
    "3:53"
);
playlist.addSong(
    "Heat Waves",
    "Glass Animals",
    "Dreamland",
    "2020 Hit",
    "music/song4.mp3",
    "linear-gradient(135deg, #06B6D4, #10B981)",
    "3:58"
);

// ============================================================================
// 4. DOM ELEMENTS
// ============================================================================
const audioPlayer = document.getElementById("audioPlayer");

// Playback Buttons
const playBtn = document.getElementById("playBtn");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const shuffleSmallBtn = document.getElementById("shuffleSmallBtn");
const loopBtn = document.getElementById("loopBtn");
const likeBtn = document.getElementById("likeBtn");
const heroHeartBtn = document.getElementById("heroHeartBtn");

// Track Info Display
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const bottomThumb = document.getElementById("bottomThumb");
const heroAlbumArt = document.getElementById("heroAlbumArt");
const heroSongCount = document.getElementById("heroSongCount");

// Progress Slider & Timers
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

// Volume Controls
const volumeBar = document.getElementById("volumeBar");
const volumeFill = document.getElementById("volumeFill");
const volumeBtn = document.getElementById("volumeBtn");
const volumeIcon = document.getElementById("volumeIcon");

// Tracks List Container & Search
const tracksList = document.getElementById("tracksList");
const searchInput = document.getElementById("searchInput");

// ============================================================================
// 5. AUDIO PLAYBACK CONTROLLER
// ============================================================================
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.8;

function loadSong(songNode) {
    if (!songNode) return;

    songTitle.textContent = songNode.title;
    artistName.textContent = songNode.artist;
    bottomThumb.style.background = songNode.coverGradient;
    heroAlbumArt.style.background = songNode.coverGradient;

    audioPlayer.src = songNode.file;

    progressBar.value = 0;
    progressFill.style.width = "0%";
    currentTime.textContent = "0:00";
    duration.textContent = songNode.duration || "0:00";

    renderTrackTable();
}

function playSong() {
    if (!playlist.current) return;

    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayIcons(true);
        updateTrackPlayingState();
    }).catch(err => {
        console.warn("Autoplay paused or source error:", err);
    });
}

function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayIcons(false);
    updateTrackPlayingState();
}

function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function updatePlayIcons(playing) {
    const playSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const heroPlaySvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Listen Now</span>`;
    const heroPauseSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg><span>Pause</span>`;

    playBtn.innerHTML = playing ? pauseSvg : playSvg;
    heroPlayBtn.innerHTML = playing ? heroPauseSvg : heroPlaySvg;
}

function handleNext() {
    const nextNode = playlist.nextSong();
    if (nextNode) {
        loadSong(nextNode);
        if (isPlaying) playSong();
    }
}

function handlePrev() {
    const prevNode = playlist.previousSong();
    if (prevNode) {
        loadSong(prevNode);
        if (isPlaying) playSong();
    }
}

// ============================================================================
// 6. RENDER TRACK TABLE
// ============================================================================
function renderTrackTable() {
    tracksList.innerHTML = "";
    const nodes = playlist.toArray();
    const query = searchInput.value.toLowerCase().trim();

    heroSongCount.textContent = `${nodes.length} Tracks`;

    nodes.forEach((node, index) => {
        if (query && !node.title.toLowerCase().includes(query) && !node.artist.toLowerCase().includes(query)) {
            return;
        }

        const isCurrent = node === playlist.current;
        const row = document.createElement("div");
        row.className = `track-item ${isCurrent ? "active" : ""} ${isCurrent && isPlaying ? "is-playing" : ""}`;

        row.innerHTML = `
            <div class="col-num">
                <span class="num">${index + 1}</span>
                <span class="play-icon-hover">▶</span>
                <div class="sound-wave">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
            </div>
            <div class="col-main">
                <div class="track-cover-badge" style="background: ${node.coverGradient};">🎵</div>
                <div class="track-titles">
                    <span class="track-title-text">${node.title}</span>
                    <span class="track-artist-text">${node.artist}</span>
                </div>
            </div>
            <div class="col-album-text">${node.album}</div>
            <div class="col-date-text">${node.dateAdded}</div>
            <div class="col-time-text">${node.duration}</div>
        `;

        row.addEventListener("click", () => {
            if (playlist.current === node && isPlaying) {
                pauseSong();
            } else {
                playlist.current = node;
                loadSong(node);
                playSong();
            }
        });

        tracksList.appendChild(row);
    });
}

function updateTrackPlayingState() {
    const items = document.querySelectorAll(".track-item");
    items.forEach(item => {
        if (item.classList.contains("active")) {
            if (isPlaying) {
                item.classList.add("is-playing");
            } else {
                item.classList.remove("is-playing");
            }
        } else {
            item.classList.remove("is-playing");
        }
    });
}

// ============================================================================
// 7. TIMELINE & AUDIO EVENTS
// ============================================================================
audioPlayer.addEventListener("timeupdate", () => {
    if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
        const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = pct;
        progressFill.style.width = `${pct}%`;
        currentTime.textContent = formatSeconds(audioPlayer.currentTime);
        duration.textContent = formatSeconds(audioPlayer.duration);
    }
});

audioPlayer.addEventListener("loadedmetadata", () => {
    if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
        duration.textContent = formatSeconds(audioPlayer.duration);
    }
});

progressBar.addEventListener("input", () => {
    if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
        const target = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = target;
        progressFill.style.width = `${progressBar.value}%`;
    }
});

audioPlayer.addEventListener("ended", () => {
    handleNext();
});

// Volume
volumeBar.addEventListener("input", () => {
    const vol = parseFloat(volumeBar.value);
    audioPlayer.volume = vol;
    volumeFill.style.width = `${vol * 100}%`;
    isMuted = vol === 0;
    updateVolumeIcon();
});

volumeBtn.addEventListener("click", () => {
    if (isMuted) {
        audioPlayer.volume = previousVolume || 0.8;
        volumeBar.value = audioPlayer.volume;
        volumeFill.style.width = `${audioPlayer.volume * 100}%`;
        isMuted = false;
    } else {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeBar.value = 0;
        volumeFill.style.width = "0%";
        isMuted = true;
    }
    updateVolumeIcon();
});

function updateVolumeIcon() {
    if (isMuted || audioPlayer.volume === 0) {
        volumeIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    } else {
        volumeIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
    }
}

function formatSeconds(sec) {
    if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// ============================================================================
// 8. BUTTON EVENT LISTENERS
// ============================================================================
playBtn.addEventListener("click", togglePlayPause);
heroPlayBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", handleNext);
prevBtn.addEventListener("click", handlePrev);

function handleShuffle() {
    playlist.shuffle();
    loadSong(playlist.head);
    if (isPlaying) playSong();
}
shuffleBtn.addEventListener("click", handleShuffle);
shuffleSmallBtn.addEventListener("click", handleShuffle);

loopBtn.addEventListener("click", () => {
    playlist.isCircular = !playlist.isCircular;
    loopBtn.classList.toggle("active", playlist.isCircular);
});

likeBtn.addEventListener("click", () => {
    likeBtn.classList.toggle("liked");
});

heroHeartBtn.addEventListener("click", () => {
    heroHeartBtn.classList.toggle("active");
    likeBtn.classList.toggle("liked");
});

searchInput.addEventListener("input", () => {
    renderTrackTable();
});

// Keyboard controls
window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;

    if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
    } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
    }
});

// Bootstrap
loadSong(playlist.current);
renderTrackTable();
console.log("Sonora Audio Engine Initialized with Doubly Linked List Architecture.");
