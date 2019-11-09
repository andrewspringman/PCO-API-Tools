///////////////////////
// Console Export JS //
///////////////////////

// (C) Andrew Springman 2019
// Released under GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

// This script is a quick and dirty way to export JSON for all songs matching a tag and their arrangements.  

// You sign into your account
// Browse to api.planningcenteronline.com
// Open the console by right clicking, choosing inspect, and then clicking on the console tab

//PASTE THIS INTO THE CONSOLE
//BEGIN


class Console_Export {
    constructor(tags) {
        this.songs = [];
        this.url = this.build_songs_url_from_tags_array(tags);
    }

    async export() {
        await this.get_songs(this.url);
        await this.add_arrangements_to_songs();
        this.write_to_document();
    }

    build_songs_url_from_tags_array(tags) {
        let url = 'https://api.planningcenteronline.com/services/v2/songs?per_page=100';
        tags.forEach(tag => {
            url = url + '&where[song_tag_ids][]=' + tag;
        })
        return url;
    }

    async get_songs(url) {
        var response, json;
        console.log('fetching ' + url);
        response = await fetch(url);
        json = await response.json();
        console.log(json);
        json.data.forEach(song => {
            this.songs.push(song);
        })
        if (typeof(json.links.next) !== 'undefined') {
            await this.get_songs(json.links.next); //Oooo, recursive!
        }
    }    

    async add_arrangements_to_songs() {
        for (let i = 0; i < this.songs.length; i++) {
            await this.add_arrangements_to_song(i);
        }
    }

    write_to_document() {
        console.log(this.songs);
        document.write('<pre>' + JSON.stringify(this.songs, null, 4) + '</pre>');
        console.log("Go back to the page.  Your Export JSON is there.");
    }

    async add_arrangements_to_song(i) {
        var response, json;
        console.log('fetching ' + this.songs[i].links.self);
        response = await fetch(this.songs[i].links.self);
        json = await response.json();
        console.log(json);
        console.log('fetching ' + json.data.links.arrangements);
        response = await fetch(json.data.links.arrangements);
        json = await response.json();
        console.log(json);
        this.songs[i].arrangements = json.data;
    }
}
//END
//PRESS ENTER
//Now that you have defined the class, you don't need to do that again.

//PASTE THIS INTO THE CONSOLE
tags = ['6862901']; 
songs = new Console_Export(tags);
songs.export();
//Edit the array of tag ids to your liking and then PRESS ENTER.
