//
// hsub: A library for retrieving and reading data from horriblesubs.info
//

// Contains all the shows.
var shows;

// Read the shows on the site into a list.
function parse(d) {
    var objs  = d.getElementsByClassName('ind-show');
    var anime = document.getElementById('anime');

    // Read all the shows.
    [].forEach.call(objs, function (o) {
        anime.appendChild(o);
    });
}

// Retrieve the shows from HorribleSubs.info
function get() {
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "document";
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            shows = this.response;
            parse(shows);
        }
    };
    xhttp.open("GET", 'http://horriblesubs.info/shows/', true);
    xhttp.send();
}

// Filter out shows using the user input written in the input textbox.
function filter() {
    var filter = document.getElementById('filter');
    var anime  = document.getElementById('anime');
}
