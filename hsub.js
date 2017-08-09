//
// hsub: A library for retrieving and reading data from horriblesubs.info.
//

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

// Asynchronously get document object from URL and respond.
function doDoc(url, f) {
    var xhttp = makeAjax();
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200)
            f(this.response);
    }
    xhttp.open("GET",                // Do a HTTP GET.
               url,
               true);                // Do it asynchronously!
    xhttp.send();
}

// Get document object from URL and respond with self.
function selfDoDoc(self, url, f) {
    var xhttp = makeAjax();
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200)
            f(self, this.response);
    }
    xhttp.open("GET",                // Do a HTTP GET.
               url,
               true);                // Do it asynchronously!
    xhttp.send();
}

function openFileDialog() {
    const {dialog} = require('electron').remote;
    console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));
}

// Clear the <body>-tag in document.
function emptyBody() {
    var node = document.body;
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

// Anime show.
class Show {
    constructor(showDocObj) {
        this.href  = showDocObj.firstChild.href;
        this.title = showDocObj.firstChild.innerText;
        selfDoDoc(this,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                  this.href,
                  this.setBoxArt);
    }

    // Set anime show box art image.
    setBoxArt(self, response) {
        var imgs         = response.getElementsByClassName('series-image');
        self.img         = imgs[0].firstChild;
        self.img.page    = response;
        self.img.title   = self.title;
        self.img.href    = self.href;
        self.img.onclick = boxartClick;
        document.getElementById('anime').appendChild(self.img);
    }
}

// Saves all the references to the show to not get removed by the garbage collector.
var shows = [];

// Get the id of a show from the web page.
function getShowId(page) {
    var text = page.getElementsByClassName('entry-content')[0].childNodes[5].firstChild.innerText;
    return text.split('=')[1].replace(/[=;\s]/g, '');
}

var torrentStream = require('torrent-stream');
//var engine        = torrentStream('magnet:my-magnet-link');

// Change to the show page.
function boxartClick() { // Called when user clicks on a box art.
    // Clear the web page.
    emptyBody();

    // Insert title.
    document.body.insertAdjacentHTML('afterbegin', '<h3>'+this.title+'<h3');
    // Insert box art.
    this.onclick = null;
    document.body.appendChild(this);
    // Insert description.
    document.body.appendChild(this.page.getElementsByClassName('series-desc')[0]);

    // Ask user where to save the episodes downloaded.
    document.body.insertAdjacentHTML('beforeend', '<button onclick="openFileDialog()">Save</button>');

    // Display episodes.
    selfDoDoc(document.body,
              'http://horriblesubs.info/lib/getshows.php?type=show&showid=' + getShowId(this.page),
    function (self, response) {
        self.appendChild(response.body);
    });
}

// Retrieve the shows from HorribleSubs.info
function getShows() {
    doDoc('http://horriblesubs.info/shows/', function(response) {
        var showdocs = response.getElementsByClassName('ind-show');
        var i        = 0;

        for (s of showdocs) {
            if (i === 5)
                break;
            // Save reference to not get GC'ed.
            shows.push(new Show(s));
            i++;
        }
    });
}

// Filter out shows using the user input written in the input textbox.
function filter() {
    var filter = document.getElementById('filter');
    var anime  = document.getElementById('anime');
}
