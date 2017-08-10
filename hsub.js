//
// hsub: A library for retrieving and reading data from horriblesubs.info.
//

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
               url,                  // to this website pointed by this URL.
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
               url,                  // to this website pointed by this URL.
               true);                // Do it asynchronously!
    xhttp.send();
}

// Save directory.
var savedir = null;

// Ask user where to save the downloaded files.
function openFileDialog() {
    const {dialog} = require('electron').remote;
    savedir        = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
    document.getElementById('savedir').innerText = savedir;
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
        self.img.onclick = displayShowPage;
        document.getElementById('shows').appendChild(self.img);
    }
}

// Saves all the references to the show to not get removed by the garbage collector.
var shows = [];

// Get the id of a show from the web page.
function getShowId(page) {
    var text = page.getElementsByClassName('entry-content')[0].childNodes[5].firstChild.innerText;
    return text.split('=')[1].replace(/[=;\s]/g, '');
}

// Create the streaming torrent engine.
var torrentStream = require('torrent-stream');

// Stream the file.
function stream(magnet) {
    var engine;

    if (savedir === null) {
        console.log("Use temporary directory.");
        engine = torrentStream(magnet);
    } else {
        engine = torrentStream(magnet, {
            path: savedir[0]
        });
    }

    engine.on('ready', function() {
        engine.files.forEach(function(file) {
            console.log('Filename:', file.name);
            var stream = file.createReadStream();
            // stream is readable stream to containing the file content
        });
	});
}

// Reverse character string.
function reverse(s) {
    return s.split("").reverse().join("");
}

// Parse the magnet links from the show page.
function parseMagnetLinks(r) {
    var shows = [];

    for (e of r.childNodes) {
        if (e.className.includes("release-links")) {
            var count = 0;
            var quality = '',
                ep = '';
            for (var i = e.className.length - 1; i >= 0; --i) {
                var c = e.className[i];
                if (c == '-') {
                    ++count
                    if (count >= 2)
                        break;
                    continue;
                }
                if (count == 0)
                    quality += c;
                if (count == 1)
                    ep += c;
            }
            shows.push({
                ep: reverse(ep),
                quality: reverse(quality),
                magnet: e.getElementsByClassName('hs-magnet-link')[0].firstChild.firstChild.href,
            });
        }
    }

    return shows;
}

// Display the episodes in a row.
function displayEpisodeRows(page) {
    // Display episodes.
    selfDoDoc(document.body,
              'http://horriblesubs.info/lib/getshows.php?type=show&showid=' + getShowId(page),
    function (self, response) {
        // Document containing magnet links to the episodes.
        var links = parseMagnetLinks(response.body);
        for (l of links) {
            var s = '<span>' + l.ep + ' - ' + l.quality + '</span><button onclick="stream(\'' + l.magnet + '\')">Stream</button><br />';
            document.body.insertAdjacentHTML('beforeend', s);
        }
    });
}

// Change to the show page.
function displayShowPage() { // Called when user clicks on a box art.
    // Clear the web page.
    emptyBody();

    // Insert title.
    document.body.insertAdjacentHTML('afterbegin', '<h3>'+this.title+'<h3');
    // Insert box art.
    this.onclick = null;
    document.body.appendChild(this);
    // Insert description.
    document.body.appendChild(this.page.getElementsByClassName('series-desc')[0]);

    // Breakline!
    document.body.insertAdjacentHTML('beforeend', '<br />');
    // Ask user where to save the episodes downloaded.
    document.body.insertAdjacentHTML('beforeend', '<span id="savedir">Temporary directory is used as download directory.</span><button onclick="openFileDialog()">Change</button><br />');
    // Breakline!
    document.body.insertAdjacentHTML('beforeend', '<br />');

    // Display the episodes in a row.
    displayEpisodeRows(this.page);
}

// Retrieve the shows from HorribleSubs.info
function getShows() {
    doDoc('http://horriblesubs.info/shows/', function(response) {
        var showdocs = response.getElementsByClassName('ind-show');
        var i        = 0;

        for (s of showdocs) {
            if (i === 100)
                break;
            // Save reference to not get GC'ed.
            shows.push(new Show(s));
            i++;
        }
    });
}

function init() {
    document.body.insertAdjacentHTML('afterbegin', '<div id="shows"></div>');
    getShows();
}
