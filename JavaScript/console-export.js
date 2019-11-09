///////////////////////
// Console Export JS //
///////////////////////

// (C) Andrew Springman 2019
// Released under GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

// This script is a quick and dirty way to export JSON for all songs matching a tag and their arrangements.  

// You sign into you account
// Browse to api.planningcenteronline.com
// Open the console by right clicking, choosing inspect, and then clicking on the console tab

//PASTE THIS INTO THE CONSOLE
//BEGIN
class Song_With_Arrangements {
    constructor(song) {
        this.song = song;
        this.add_arrangements();
    }

    add_arrangements() {
        console.log('fetching ' + this.song.links.self);
        fetch(this.song.links.self)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            console.log('fetching ' + json.data.links.arrangements);
            fetch(json.data.links.arrangements)
            .then(response => response.json())
            .then(json => {
                console.log(json);
                this.song.arrangements = json.data;
            })
        })
    }

    get json() {
        return this.song;
    }
}

class Console_Export {
    constructor(tags) {
        this.songs = [];
        let url = this.build_songs_url_from_tags_array(tags);
        this.get_songs_with_arrangements(url);
 
    }

    build_songs_url_from_tags_array(tags) {
        let url = 'https://api.planningcenteronline.com/services/v2/songs?per_page=100';
        tags.forEach(tag => {
            url = url + '&where[song_tag_ids][]=' + tag;
        })
        return url;
    }

    add_this_batch_of_songs(song_array) {
        song_array.forEach(song => {
            let song_with_arrangements = new Song_With_Arrangements(song);
            this.songs.push(song_with_arrangements.json);
        })
    }
    
    get_songs_with_arrangements(url) {
        console.log('fetching ' + url);
        fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            this.add_this_batch_of_songs(json.data);
            if (typeof(json.links.next) !== 'undefined') {
                this.get_songs_with_arrangements(json.links.next, songs_object); //Oooo, recursive!
            }
        })
    }    

    write_to_document() {
        console.log(this.songs);
        document.write('<pre>' + JSON.stringify(this.songs, null, 4) + '</pre>');
        console.log("Go back to the page.  Your Export JSON is there.");
    }
}
//END
//PRESS ENTER
//Now that you have defined the class, you don't need to do that again.

//PASTE THIS INTO THE CONSOLE
tags = ['6862901']; 
songs = new Console_Export(tags);
//Edit the array of tag ids to your liking and then PRESS ENTER.

//wait and then run this
songs.write_to_document();
//Your results are back on the page where you entered the console by chooseing inspect