#ifndef SONG_H
#define SONG_H

#include <string>

using namespace std;

class Song {
public:
    string title;
    string artist;
    string filePath;

    Song* prev;
    Song* next;

    Song(string t, string a, string f) {
        title = t;
        artist = a;
        filePath = f;
        prev = nullptr;
        next = nullptr;
    }
};

#endif
