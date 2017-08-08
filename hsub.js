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

// Asynchronously get document object from URL and respond.
function doDoc(url, f) {
    var xhttp = makeAjax();
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200) {
            f(this.response);
        }
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
        if (this.readyState === 4 && this.status === 200) {
            f(self, this.response);
        }
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
        this.href = showDocObj.firstChild.href;
        selfDoDoc(this,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                  this.href,
                  this.setBoxArt);
    }

    // Set anime show box art image.
    setBoxArt(self, response) {
        var imgs         = response.getElementsByClassName('series-image');
        self.img         = imgs[0].firstChild;
        self.img.onclick = boxartClick;
        document.getElementById('anime').appendChild(self.img);
    }
}

var showObjects = [];

// Called when user clicks on a box art.
function boxartClick() {
    // TODO: Change to new web page.
    emptyBody();
    doDoc('', function (response) {
    });
}

function asd() {
    var imgs  = this.response.getElementsByClassName('series-image');
    var anime = document.getElementById('anime');
    [].forEach.call(imgs, function (o) {
        o.firstChild.onclick = boxartClick;
        anime.appendChild(o.firstChild);
    })
}

// Retrieve the shows from HorribleSubs.info
function getShows() {
    doDoc('http://horriblesubs.info/shows/', function(response) {
        shows = response.getElementsByClassName('ind-show');
        var i = 0;
        for (s of shows) {
            if (i === 3)
                break;
            showObjects.push(new Show(s));
           i++;
        }
        console.log(showObjects);
    });
}

// Filter out shows using the user input written in the input textbox.
function filter() {
    var filter = document.getElementById('filter');
    var anime  = document.getElementById('anime');
}
