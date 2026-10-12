# 🎵 Sonora • Doubly Linked List Music Player

[![Data Structure: Doubly Linked List](https://img.shields.io/badge/Data%20Structure-Doubly%20Linked%20List-6366F1?style=for-the-badge&logo=codeforces&logoColor=white)](https://en.wikipedia.org/wiki/Doubly_linked_list)
[![Frontend: HTML5 / CSS3 / Vanilla JS](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS%20(ES6+)-10B981?style=for-the-badge&logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Backend: C++17](https://img.shields.io/badge/Backend-C%2B%2B17-06B6D4?style=for-the-badge&logo=c%2B%2B&logoColor=white)](https://isocpp.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

An interactive, high-fidelity music player engineered specifically to demonstrate how **Doubly Linked Lists (DLL)** and **Circular Doubly Linked Lists (CDLL)** power real-world media playback systems like Spotify, Apple Music, and VLC.

Includes both a **Spotify-styled Web Application (Vanilla JS ES6+)** and a **modular C++ CLI Backend Engine**.

---

## 📚 Table of Contents
1. [Why Linked Lists for a Music Player?](#-why-linked-lists-for-a-music-player)
2. [Data Structure Architecture](#-data-structure-architecture)
   - [The Song Node](#1-the-song-node)
   - [Bidirectional Pointer Chains](#2-bidirectional-pointer-chains)
3. [How Navigation Works ($O(1)$ Pointer Traversal)](#-how-navigation-works-o1-pointer-traversal)
   - [Next Song Transition](#next-song-current--currentnext)
   - [Previous Song Transition](#previous-song-current--currentprev)
4. [How Looping & Repeat Mode Works](#-how-looping--repeat-mode-works)
   - [Linear DLL vs. Circular DLL](#linear-dll-vs-circular-doubly-linked-list)
   - [Forward Loop Wrap-Around](#forward-loop-wrap-around-tail--head)
   - [Reverse Loop Wrap-Around](#reverse-loop-wrap-around-head--tail)
   - [True Circular Linked List Representation](#true-circular-doubly-linked-list-cdll-ring)
5. [Dynamic Playlist Operations](#-dynamic-playlist-operations)
   - [Appending a Track in $O(1)$](#appending-a-track-in-o1)
   - [Deleting a Track in $O(1)$ (Pointer Bypassing)](#deleting-a-track-in-o1-pointer-bypassing)
   - [Shuffling via Pointer Reconstruction](#shuffling-via-pointer-reconstruction)
6. [Time & Space Complexity Analysis](#-time--space-complexity-analysis)
7. [Dual-Stack Code Implementation](#-dual-stack-code-implementation)
   - [JavaScript Web Engine (`script.js`)](#javascript-web-engine)
   - [C++ Backend Engine (`MusicPlayer.h` & `Song.h`)](#c-backend-engine)
8. [Project Structure](#-project-structure)
9. [How to Run](#-how-to-run)
   - [Running the Web Player](#1-running-the-web-player-frontend)
   - [Compiling & Running the C++ Demo](#2-compiling--running-the-c-backend)
10. [Controls & Keyboard Shortcuts](#-controls--keyboard-shortcuts)

---

## 🧠 Why Linked Lists for a Music Player?

When designing a music playlist, engineers require:
1. **Instant, bidirectional song switching**: Moving to the next or previous song must be instantaneous.
2. **Dynamic queuing**: Users frequently insert songs into "Up Next" or delete songs from their playlist.
3. **Continuous looping**: Seamless loop transitions from the end of the playlist back to the beginning.

### Why not a standard Array or Dynamic Vector?
| Challenge | Standard Array / Vector | Doubly Linked List (This Player) |
| :--- | :--- | :--- |
| **Track Deletion** | Removing track 3 from an array of 1,000 songs requires shifting all 997 subsequent elements left by 1 position: **$O(N)$ operation**. | Simply rewire the `prev` and `next` pointers around the deleted node: **$O(1)$ operation**. |
| **Track Insertion** | Inserting into the middle requires shifting trailing items right: **$O(N)$**. May also trigger memory reallocation and full array copying. | Allocate a new node and point its pointers to its neighbors: **$O(1)$ operation**. |
| **Bidirectional Navigation** | Requires managing and bounds-checking array index counters (`index++`, `index--`). | Every node inherently knows its predecessor (`prev`) and successor (`next`). |
| **Looping** | Requires modulo arithmetic or manual index reset conditionals. | Can form a closed ring where `tail.next = head` and `head.prev = tail`. |

---

## 🏗️ Data Structure Architecture

### 1. The Song Node
Every song in the playlist is encapsulated within an independent node in memory containing song metadata and two memory pointers:
- `prev`: Reference / Pointer to the preceding song node.
- `next`: Reference / Pointer to the subsequent song node.

```
                  ┌──────────────────────────────┐
                  │          SongNode            │
                  ├──────────────────────────────┤
                  │ title:    "Shape of You"     │
                  │ artist:   "Ed Sheeran"       │
                  │ file:     "music/song3.mp3"  │
                  │ duration: "3:53"             │
                  ├──────────────────────────────┤
   ◄── [prev] ────┤ *prev (pointer to left node) │
                  │ *next (pointer to right node)├──► [next] ───►
                  └──────────────────────────────┘
```

### 2. Bidirectional Pointer Chains
The playlist maintains three primary state pointers:
- **`head`**: Points to the first song in the playlist.
- **`tail`**: Points to the last song in the playlist.
- **`current`**: Points to the track currently playing.

```
       head                                                                   tail
        │                                                                       │
        ▼                                                                       ▼
 ┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
 │   Song 1     │ ◄───► │   Song 2     │ ◄───► │   Song 3     │ ◄───► │   Song 4     │
 │  "Believer"  │       │  "Perfect"   │       │"Shape of You"│       │ "Heat Waves" │
 └──────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
                               ▲
                               │
                            current
```

---

## ⚡ How Navigation Works ($O(1)$ Pointer Traversal)

Navigation does **not** rely on searching array indices. Instead, transitions are direct pointer dereferences taking **$O(1)$ constant time**.

### Next Song (`current = current.next`)
When the user clicks **Next** or a song finishes playing:
```
Step 1: Check if current.next exists.
Step 2: Set current = current.next.
Step 3: Load audio file and trigger playback.
```

```
           current                   current.next
              │                           │
              ▼                           ▼
       ┌──────────────┐            ┌──────────────┐
       │   Song 2     │  ──────►   │   Song 3     │
       │  "Perfect"   │   next     │"Shape of You"│
       └──────────────┘            └──────────────┘
                                          ▲
                                          │
                            [ New current after nextSong() ]
```

### Previous Song (`current = current.prev`)
When the user clicks **Previous**:
```
Step 1: Check if current.prev exists.
Step 2: Set current = current.prev.
Step 3: Load audio file and trigger playback.
```

```
        current.prev                    current
              │                            │
              ▼                            ▼
       ┌──────────────┐             ┌──────────────┐
       │   Song 2     │   ◄──────   │   Song 3     │
       │  "Perfect"   │    prev     │"Shape of You"│
       └──────────────┘             └──────────────┘
              ▲
              │
[ New current after previousSong() ]
```

---

## 🔁 How Looping & Repeat Mode Works

One of the most essential features of any music player is the **Loop / Repeat Playlist** function. The Doubly Linked List handles this elegantly.

### Linear DLL vs. Circular Doubly Linked List

```
1. LINEAR DLL (Loop Disabled):
   null ◄── [Song 1] ◄═══► [Song 2] ◄═══► [Song 3] ◄═══► [Song 4] ──► null
               ▲                                             ▲
             (HEAD)                                        (TAIL)
   * Reaching Song 4 and pressing Next: Stops playback (current.next is null).
   * At Song 1 and pressing Prev: Cannot go back (current.prev is null).

2. CIRCULAR DLL / LOOP MODE (Loop Enabled):
   ┌───────────────────────────────────────────────────────────────────────┐
   │                                                                       ▼
   └──► [Song 1] ◄═══════► [Song 2] ◄═══════► [Song 3] ◄═══════► [Song 4] ──┘
          ▲ (HEAD)                                                 ▲ (TAIL)
          │                                                        │
          └────────────────────────────────────────────────────────┘
```

### Forward Loop Wrap-Around (`tail -> head`)
When `current` is at the **last song (`tail`)**:
1. In non-circular mode, `current.next == null`, so playback ends or halts.
2. In **loop mode**, when `current.next == null`, the player wraps around to `head`:
   ```javascript
   if (this.current.next) {
       this.current = this.current.next;
   } else if (this.isCircular && this.head) {
       this.current = this.head; // Wrap back to the beginning!
   }
   ```
   **Result**: The user reaches the end of the playlist, and it seamlessly restarts from track 1 without reloading or re-indexing.

### Reverse Loop Wrap-Around (`head -> tail`)
When `current` is at the **first song (`head`)**:
1. In non-circular mode, `current.prev == null`, so going back is prohibited.
2. In **loop mode**, when `current.prev == null`, the player wraps around to `tail`:
   ```javascript
   if (this.current.prev) {
       this.current = this.current.prev;
   } else if (this.isCircular && this.tail) {
       this.current = this.tail; // Jump straight to the last song!
   }
   ```
   **Result**: Clicking Previous at the start immediately jumps to the final track in the playlist.

### True Circular Doubly Linked List (CDLL Ring)
In a permanent Circular Doubly Linked List structure, there are **no `null` pointers**:
- `tail.next = head`
- `head.prev = tail`

Traversing forward from `tail` directly lands on `head`, creating an infinite continuous loop:
$$\dots \leftrightarrow \text{Song 4} \leftrightarrow \text{Song 1} \leftrightarrow \text{Song 2} \leftrightarrow \text{Song 3} \leftrightarrow \text{Song 4} \leftrightarrow \text{Song 1} \dots$$

---

## 🛠️ Dynamic Playlist Operations

### Appending a Track in $O(1)$
Adding a song to the end of the queue connects the current `tail` with the new node in constant time:
```cpp
void addSong(string title, string artist, string filePath) {
    Song* newSong = new Song(title, artist, filePath);
    if (head == nullptr) {
        head = tail = current = newSong;
        return;
    }
    tail->next = newSong;  // Connect old tail forward to new node
    newSong->prev = tail;  // Connect new node backward to old tail
    tail = newSong;        // Update tail pointer
}
```

```
           Old tail                                New tail
              │                                       │
              ▼                                       ▼
       ┌──────────────┐        next            ┌──────────────┐
       │   Song 4     │  ────────────────►     │   Song 5     │
       │ "Heat Waves" │  ◄────────────────     │   "Levitating"
       └──────────────┘        prev            └──────────────┘
```

### Deleting a Track in $O(1)$ (Pointer Bypassing)
To delete a song, we simply rewire the neighboring nodes to bypass the target node. No elements are moved in memory:

```
Before Deletion:
[Song 1] ◄════════► [Song 2 (To Delete)] ◄════════► [Song 3]
       \                                           /
        \─────── prev.next = current.next ────────►
         ◄────── next.prev = current.prev ────────/

After Deletion:
[Song 1] ◄═══════════════════════════════════════► [Song 3]
```

```cpp
// Pointer Relinking in C++
temp->prev->next = temp->next; // Left node skips deleted node to point right
temp->next->prev = temp->prev; // Right node skips deleted node to point left
delete temp;                   // Free memory
```

### Shuffling via Pointer Reconstruction
Shuffling extracts nodes, applies the **Fisher-Yates shuffle algorithm** ($O(N)$), and then linearly reconnects `prev` and `next` pointers between the randomized nodes in a single pass.

---

## 📊 Time & Space Complexity Analysis

| Operation | Doubly Linked List | Dynamic Array / Vector | Real-World Impact |
| :--- | :---: | :---: | :--- |
| **Next Song (`current.next`)** | **$O(1)$** | $O(1)$ | Instant pointer jump without calculating index offsets. |
| **Previous Song (`current.prev`)** | **$O(1)$** | $O(1)$ | Instant reverse pointer jump. |
| **Append Song to Queue** | **$O(1)$** | $O(1)$ amortized | Avoids potential $O(N)$ memory reallocations when array capacity fills. |
| **Remove Current Song** | **$O(1)$** | **$O(N)$** | In arrays, all trailing elements must be copied left. In DLL, only 2 pointer links change. |
| **Loop Wrap-Around** | **$O(1)$** | $O(1)$ | Instantaneous pointer jump to `head` or `tail`. |
| **Memory Overhead per Track** | 2 pointers | 0 pointers | DLL stores `prev` and `next` pointers per node (tradeoff for $O(1)$ mutations). |

---

## 💻 Dual-Stack Code Implementation

### JavaScript Web Engine
Located in `frontend/script.js`:
```javascript
class SongNode {
    constructor(title, artist, album, dateAdded, file, coverGradient, duration) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.dateAdded = dateAdded;
        this.file = file;
        this.coverGradient = coverGradient;
        this.duration = duration;

        // Pointers
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedListPlaylist {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.isCircular = true; // Looping mode enabled by default
    }

    nextSong() {
        if (!this.current) return null;
        if (this.current.next) {
            this.current = this.current.next;
        } else if (this.isCircular && this.head) {
            this.current = this.head; // Loop back to start
        }
        return this.current;
    }

    previousSong() {
        if (!this.current) return null;
        if (this.current.prev) {
            this.current = this.current.prev;
        } else if (this.isCircular && this.tail) {
            this.current = this.tail; // Loop back to end
        }
        return this.current;
    }
}
```

### C++ Backend Engine
Located in `backend/Song.h` & `backend/MusicPlayer.h`:
```cpp
// Song.h - The Node
class Song {
public:
    string title;
    string artist;
    string filePath;
    Song* prev;
    Song* next;

    Song(string t, string a, string f) : title(t), artist(a), filePath(f), prev(nullptr), next(nullptr) {}
};

// MusicPlayer.h - The Doubly Linked List Controller
class MusicPlayer {
private:
    Song* head;
    Song* tail;
    Song* current;

public:
    void nextSong() {
        if (current && current->next != nullptr) {
            current = current->next;
            playCurrentSong();
        } else {
            cout << "Reached end of linear playlist.\n";
        }
    }

    void previousSong() {
        if (current && current->prev != nullptr) {
            current = current->prev;
            playCurrentSong();
        } else {
            cout << "Reached start of linear playlist.\n";
        }
    }
};
```

---

## 📁 Project Structure

```
MusicPlayer/
│
├── frontend/                     # Interactive Web Application
│   ├── index.html                # Spotify-inspired UI & layout structure
│   ├── style.css                 # Midnight dark theme styling & animations
│   ├── script.js                 # Doubly Linked List audio engine & controllers
│   └── music/                    # Authentic MP3 audio tracks
│       ├── song1.mp3             # Imagine Dragons - Believer
│       ├── song2.mp3             # Ed Sheeran - Perfect
│       ├── song3.mp3             # Ed Sheeran - Shape of You
│       └── song4.mp3             # Glass Animals - Heat Waves
│
├── backend/                      # C++ Modular Data Structure Implementation
│   ├── Song.h                    # Song Node class with bidirectional pointers
│   ├── MusicPlayer.h             # Doubly Linked List playlist operations
│   └── main.cpp                  # CLI interactive driver program
│
├── .gitignore                    # Git rules (excludes binaries and system caches)
└── README.md                     # Comprehensive architecture & logic documentation
```

---

## 🚀 How to Run

### 1. Running the Web Player (Frontend)
No build steps or dependencies required!
- **Option A (Direct)**: Double-click `frontend/index.html` to open it in Chrome, Edge, Firefox, or Safari.
- **Option B (Local Web Server)**:
  ```bash
  # Using Python built-in server:
  cd frontend
  python -m http.server 8000
  # Then open http://localhost:8000 in your browser
  ```

### 2. Compiling & Running the C++ Backend
The C++ console demo demonstrates the linked list operations in a native CLI environment:
```bash
# Navigate to backend directory
cd backend

# Compile using GCC / Clang
g++ -std=c++17 main.cpp -o music_player

# Run executable (Linux/macOS)
./music_player

# Run executable (Windows PowerShell / CMD)
.\music_player.exe
```

---

## ⌨️ Controls & Keyboard Shortcuts

| Control | Action | Behind the Scenes DLL Logic |
| :--- | :--- | :--- |
| <kbd>Space</kbd> | Play / Pause | Toggles HTML5 audio playback for `current` node |
| <kbd>→</kbd> (Right Arrow) | Next Track | Pointer dereference: `current = current.next` (or `head` if looping) |
| <kbd>←</kbd> (Left Arrow) | Previous Track | Pointer dereference: `current = current.prev` (or `tail` if looping) |
| 🔁 **Loop Button** | Toggle Looping | Switches between **Circular DLL** and **Linear DLL** modes |
| 🔀 **Shuffle Button** | Shuffle Playlist | Randomizes node sequence and reconstructs bidirectional pointers |
| 🔊 **Volume Slider** | Adjust Volume | Updates Web Audio gain without mutating list structure |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
