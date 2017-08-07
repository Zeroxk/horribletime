//
// hsub: A library for retrieving and reading data from horriblesubs.info
//

// Contains all the shows.
var shows;

// Read the shows on the site into a list.
function parse(d) {
    var objs  = d.getElementsByClassName('ind-show');
    var anime = document.getElementById('anime');
    console.log(objs);

    // Read all the shows.
    [].forEach.call(objs, function (o) {
        //anime.appendChild(o);
        console.log(o.firstChild.href);
    });
}

// Make AJAX XML HTTP Request to get horriblesubs.info's DOM object.
function makeAjax() {
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "document";
    return xhttp;
}

// Get show image from show web page.
function getShowImage() {
    var i = 0;
    for (show of shows) {
        if (i === 50)
            break;

        var xhttp = makeAjax();
        xhttp.onreadystatechange = function() {
            // Was GET successful?
            if (this.readyState === 4 && this.status === 200) {
                var imgs  = this.response.getElementsByClassName('series-image');
                var anime = document.getElementById('anime');

                [].forEach.call(imgs, function (o) {
                    anime.appendChild(o.firstChild);
                })
            }
        }
        xhttp.open("GET",                // Do a HTTP GET.
                   show.firstChild.href, // Get link to show web page.
                   true);                // Do it asynchronously!
        xhttp.send();

        i++;
    }
}

// Retrieve the shows from HorribleSubs.info
function getShows() {
    var xhttp = makeAjax();
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200) {
            shows = this.response.getElementsByClassName('ind-show');
            getShowImage();
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
