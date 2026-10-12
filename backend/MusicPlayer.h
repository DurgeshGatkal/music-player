#ifndef MUSIC_PLAYER_H
#define MUSIC_PLAYER_H

#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include "Song.h"

using namespace std;

class MusicPlayer {
private:
    Song* head;
    Song* tail;
    Song* current;

public:
    MusicPlayer() {
        head = nullptr;
        tail = nullptr;
        current = nullptr;
    }

    void addSong(string title, string artist, string filePath) {
        Song* newSong = new Song(title, artist, filePath);

        if (head == nullptr) {
            head = newSong;
            tail = newSong;
            current = newSong;
            return;
        }

        tail->next = newSong;
        newSong->prev = tail;
        tail = newSong;
    }

    int getSize() {
        int count = 0;
        Song* temp = head;
        while (temp != nullptr) {
            count++;
            temp = temp->next;
        }
        return count;
    }

    void displayPlaylist() {
        Song* temp = head;

        cout << "\n========== PLAYLIST (FORWARD) ==========\n";
        if (temp == nullptr) {
            cout << "(Playlist is empty)\n";
        }
        while (temp != nullptr) {
            if (temp == current) {
                cout << " -> [NOW PLAYING] " << temp->title << " - " << temp->artist << endl;
            } else {
                cout << "    " << temp->title << " - " << temp->artist << endl;
            }
            temp = temp->next;
        }
        cout << "========================================\n";
    }

    void displayPlaylistReverse() {
        Song* temp = tail;

        cout << "\n========== PLAYLIST (REVERSE) ==========\n";
        if (temp == nullptr) {
            cout << "(Playlist is empty)\n";
        }
        while (temp != nullptr) {
            if (temp == current) {
                cout << " -> [NOW PLAYING] " << temp->title << " - " << temp->artist << endl;
            } else {
                cout << "    " << temp->title << " - " << temp->artist << endl;
            }
            temp = temp->prev;
        }
        cout << "========================================\n";
    }

    void playCurrentSong() {
        if (current == nullptr) {
            cout << "Playlist is empty.\n";
            return;
        }

        cout << "\nNow Playing: "
             << current->title << " - "
             << current->artist << " (" << current->filePath << ")" << endl;
    }

    void nextSong() {
        if (current == nullptr) {
            cout << "Playlist is empty.\n";
            return;
        }

        if (current->next != nullptr) {
            current = current->next;
            playCurrentSong();
        } else {
            cout << "\nAlready at the last song.\n";
        }
    }

    void previousSong() {
        if (current == nullptr) {
            cout << "Playlist is empty.\n";
            return;
        }

        if (current->prev != nullptr) {
            current = current->prev;
            playCurrentSong();
        } else {
            cout << "\nAlready at the first song.\n";
        }
    }

    Song* getCurrentSong() {
        return current;
    }

    void deleteSong(string title) {
        Song* temp = head;

        while (temp != nullptr) {
            if (temp->title == title) {

                if (temp == head) {
                    head = temp->next;

                    if (head != nullptr) {
                        head->prev = nullptr;
                    } else {
                        tail = nullptr;
                    }
                }
                else if (temp == tail) {
                    tail = temp->prev;
                    if (tail != nullptr) {
                        tail->next = nullptr;
                    }
                }
                else {
                    temp->prev->next = temp->next;
                    temp->next->prev = temp->prev;
                }

                if (current == temp) {
                    current = head;
                }

                delete temp;

                cout << "\nSong '" << title << "' deleted successfully.\n";
                return;
            }

            temp = temp->next;
        }

        cout << "\nSong '" << title << "' not found.\n";
    }

    void searchSong(string title) {
        Song* temp = head;

        while (temp != nullptr) {
            if (temp->title == title) {
                cout << "\n[Found] Title: " << temp->title << " | Artist: " << temp->artist << endl;
                return;
            }

            temp = temp->next;
        }

        cout << "\nSong '" << title << "' not found.\n";
    }

    void clear() {
        Song* temp = head;
        while (temp != nullptr) {
            Song* nextSong = temp->next;
            delete temp;
            temp = nextSong;
        }
        head = nullptr;
        tail = nullptr;
        current = nullptr;
    }

    ~MusicPlayer() {
        clear();
    }
};

#endif

