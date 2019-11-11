/////////////////////////
// Console Transfer JS //
/////////////////////////

// (C) Andrew Springman 2019
// Released under GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

// This script is a quick and dirty way to export JSON for all songs matching a tag and their arrangements
// and then import them into another account.

// You sign into your account
// Browse to api.planningcenteronline.com
// Open the console by right clicking, choosing inspect, and then clicking on the console tab

//PASTE THIS INTO THE CONSOLE
//BEGIN
class song_transfer_class {
    constructor(tags, creds) {
        this.tags = tags;
        this.creds = creds;
        this.export_get_init = {
            method: 'GET', 
            headers: {
                'Authorization': 'Basic ' + btoa(this.creds.export.id + ":" + this.creds.export.secret)
            }
        };
        this.import_get_init = {
            method: 'GET', 
            headers: {
                'Authorization': 'Basic ' + btoa(this.creds.import.id + ":" + this.creds.import.secret)
            }
        };
        this.import_delete_init = {
            method: 'DELETE',
            headers: {
                'Authorization': 'Basic ' + btoa(this.creds.import.id + ":" + this.creds.import.secret)
            }
        }
    }

    build_songs_url_from_tags_array(tags) {
        let url = 'https://api.planningcenteronline.com/services/v2/songs?per_page=1'; //one at a time for sleep delay
        tags.forEach(tag => {
            url = url + '&where[song_tag_ids][]=' + tag;
        })
        return url;
    }

    import_key(key, song_id, arrangement_id) {

        //prune key for import
        delete key.data.id;
        delete key.data.links;
        delete key.data.relationships;
        delete key.included;
        delete key.meta;
        let whitelist = [
            'name',
            'starting_key',
            'ending_key',
            'alternate_keys'
        ];
        let attributes = Object.keys(key.data.attributes);
        for (let i = 0; i < attributes.length; i++) {
            if (!whitelist.includes(attributes[i])) {
                delete key.data.attributes[attributes[i]];
            }
        }
        for (let i=0; i<whitelist.length; i++) {
            if (key.data.attributes[whitelist[i]]===null) {
                delete key.data.attributes[whitelist[i]]
            }
        }

        //post the key
        let url = 'https://api.planningcenteronline.com/services/v2/songs/'+song_id+'/arrangements/'+arrangement_id+'/keys';
        //console.log(url);
        //console.log(JSON.stringify(key,null,4));
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(key),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(this.creds.import.id + ":" + this.creds.import.secret)
            }
        })
    }

    get_key(url, song_id, arrangement_id) {
        //console.log(url);
        fetch(url, this.export_get_init)
        .then(response => response.json())
        .then(key => this.import_key(key, song_id, arrangement_id))
    }

    get_keys(url, song_id, arrangement_id) {
        //console.log(url);
        fetch(url, this.export_get_init)
        .then(response => response.json())
        .then(keys => {
            keys.data.forEach(key => {
                this.get_key(key.links.self, song_id, arrangement_id);
            })
        })
    }
    
    import_arrangement(arrangement, song_id) {
        let keys_url = arrangement.data.links.keys;

        //prune arrangement for import
        delete arrangement.data.id;
        delete arrangement.data.links;
        delete arrangement.data.relationships;
        delete arrangement.included;
        delete arrangement.meta;
        let whitelist = [
            'bpm',
            'chord_chart',
            'chord_chart_chord_color',
            'chord_chart_columns',
            'chord_chart_font',
            'chord_chart_font_size',
            'chord_chart_key',
            'isrc',
            'length',
            'lyrics_enabled',
            'meter',
            'name',
            'notes',
            'number_chart_enabled',
            'numeral_chart_enabled',
            'print_margin',
            'print_orientation',
            'print_page_size',
            'rehearsal_mix_id',
            'sequence'
        ];
        let attributes = Object.keys(arrangement.data.attributes);
        for (let i = 0; i < attributes.length; i++) {
            if (!whitelist.includes(attributes[i])) {
                delete arrangement.data.attributes[attributes[i]];
            }
        }
        for (let i=0; i<whitelist.length; i++) {
            if (arrangement.data.attributes[whitelist[i]]===null) {
                delete arrangement.data.attributes[whitelist[i]]
            }
        }

        //post the arrangement
        let url = 'https://api.planningcenteronline.com/services/v2/songs/'+song_id+'/arrangements';
        //console.log(url);
        //console.log(JSON.stringify(arrangement,null,4));
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(arrangement),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(this.creds.import.id + ":" + this.creds.import.secret)
            }
        })
        .then(response => response.json())
        .then(imported_arrangement => this.get_keys(keys_url, song_id, imported_arrangement.data.id));
    }

    get_arrangement(url, song_id) {
        //console.log(url);
        fetch(url, this.export_get_init)
        .then(response => response.json())
        .then(arrangement => this.import_arrangement(arrangement, song_id))
    }

    get_arrangements(url, song_id) {
        //console.log(url);
        fetch(url, this.export_get_init)
        .then(response => response.json())
        .then(arrangements => {
            arrangements.data.forEach(arrangement => {
                this.get_arrangement(arrangement.links.self, song_id);
            })
        })
    }

    delete_default_arrangement(url) {
        fetch(url, this.import_get_init)
        .then(response => response.json())
        .then(arrangements => {
            let delete_url = arrangements.links.self+'/'+arrangements.data[0].id;
            console.log(delete_url);
            fetch(delete_url, this.import_delete_init);
        })
    }

    import_song(song) {
        let arrangements_url = song.data.links.arrangements;

        //prune song for import
        delete song.data.id;
        delete song.data.links;
        delete song.included;
        delete song.meta;
        let whitelist = [
            'title',
            'admin',
            'author',
            'copyright',
            'ccli_number',
            'hidden',
            'themes'
        ];
        let attributes = Object.keys(song.data.attributes);
        for (let i = 0; i < attributes.length; i++) {
            if (!whitelist.includes(attributes[i])) {
                delete song.data.attributes[attributes[i]];
            }
        }
        for (let i=0; i<whitelist.length; i++) {
            if (song.data.attributes[whitelist[i]]===null) {
                delete song.data.attributes[whitelist[i]]
            }
        }

        //post the song
        let url = 'https://api.planningcenteronline.com/services/v2/songs';
        //console.log(url);
        //console.log(JSON.stringify(song,null,4));
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(song),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(this.creds.import.id + ":" + this.creds.import.secret)
            }
        })
        .then(response => response.json())
        .then(imported_song => {
            this.delete_default_arrangement(imported_song.data.links.arrangements);
            this.get_arrangements(arrangements_url, imported_song.data.id);
        });
    }

    get_song(url) {
        //console.log(url);
        fetch(url, this.export_get_init)
        .then(response => response.json())
        .then(song => this.import_song(song))
    }

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    get_songs(url) {
        //console.log(url);
        fetch(url, this.export_get_init)
        .then(response => response.json())
        .then(song_list => {
            song_list.data.forEach(song => {
                this.get_song(song.links.self);
            })
            if (typeof(song_list.links.next) !== 'undefined') {
                this.sleep(1000) //don't go too fast!
                .then(() => this.get_songs(song_list.links.next)); //Oooo, recursive!
            }    
        })
    }

    transfer_songs(tags,keys) {
        this.get_songs(this.build_songs_url_from_tags_array(this.tags));
    }
}
//END
//PRESS ENTER
//Now that you have defined the class, you don't need to do that again.

//PASTE THIS INTO THE CONSOLE
creds = {
    export:{
        id:'0000000000000000000000000000000000000000000000000000000000000000',
        secret:'0000000000000000000000000000000000000000000000000000000000000000'
    },
    import:{
        id:'0000000000000000000000000000000000000000000000000000000000000000',
        secret:'0000000000000000000000000000000000000000000000000000000000000000'
    }
};
tags = ['6862901']; 
song_transfer_object = new song_transfer_class(tags,creds);
song_transfer_object.transfer_songs();
//Edit the credsx object and the array of tag ids to your liking and then PRESS ENTER.
