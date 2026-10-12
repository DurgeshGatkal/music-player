#include <iostream>
#include "MusicPlayer.h"

using namespace std;

int main() {
    MusicPlayer player;

    cout << "--- Adding Songs to Doubly Linked List ---\n";
    player.addSong("Believer", "Imagine Dragons", "../frontend/music/song1.mp3");
    player.addSong("Perfect", "Ed Sheeran", "../frontend/music/song2.mp3");
    player.addSong("Shape of You", "Ed Sheeran", "../frontend/music/song3.mp3");
    player.addSong("Heat Waves", "Glass Animals", "../frontend/music/song4.mp3");

    cout << "Total Songs in Playlist: " << player.getSize() << endl;

    player.displayPlaylist();
    player.displayPlaylistReverse();

    player.playCurrentSong();

    cout << "\nNavigating Forward:\n";
    player.nextSong();
    player.nextSong();

    cout << "\nNavigating Backward:\n";
    player.previousSong();

    cout << "\nSearching for 'Perfect':\n";
    player.searchSong("Perfect");

    cout << "\nDeleting 'Shape of You':\n";
    player.deleteSong("Shape of You");

    cout << "\nUpdated Playlist (Size: " << player.getSize() << "):";
    player.displayPlaylist();

    return 0;
}

