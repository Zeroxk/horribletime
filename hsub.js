//
// hsub: A library for retrieving and reading data from horriblesubs.info.
//
// Code is shitty and hacked together as fast as possible. Coding principles be damned!
//

// Current AJAX requests.
var reqs = [];

// Stop all AJAX requests.
function stopAjaxRequests() {
    for (r of reqs)
        r.abort();
}

// Make AJAX XML HTTP Request to get horriblesubs.info's DOM object.
function makeAjax() {
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "document";
    return xhttp;
}

// Do the AJAX GET command.
function asyncGet(xhttp, url) {
    if (url === undefined)
        return;
    xhttp.open("GET", // Do a HTTP GET.
               url,   // to this website pointed by this URL.
               true); // Do it asynchronously!
    xhttp.send();
}

// Asynchronously get document object from URL and respond.
function doDoc(url, f) {
    var xhttp = makeAjax();
    reqs.push(xhttp);
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200)
            f(this.response);
    }
    asyncGet(xhttp, url);
}

// Get document object from URL and respond with self.
function selfDoDoc(self, url, f) {
    var xhttp = makeAjax();
    reqs.push(xhttp);
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200)
            f(self, this.response);
    }
    asyncGet(xhttp, url);
}

// Save directory.
var savedir = null;

// Ask user where to save the downloaded files.
function openFileDialog() {
    const {dialog} = require('electron').remote;
    var dir = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
    if (dir === undefined)
        return;
    savedir = dir;
    document.getElementById('savedir').innerText = savedir;
}

// Clear the <body>-tag in document.
function emptyBody() {
    var node = document.body;
    while (node.firstChild)
        node.removeChild(node.firstChild);
}

// Anime show.
class Show {
    // Construct anime show.
    constructor(showDocObj) {
        this.href  = showDocObj.firstChild.href;
        this.title = showDocObj.firstChild.innerText;
        selfDoDoc(this,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                  this.href,
                  this.addBoxArt);
    }

    // Add anime show box art image to <body>.
    addBoxArt(self, response) {
        var imgs = response.getElementsByClassName('series-image');
        var img = imgs[0].firstChild;

        // Change <img> for our purposes.
        img.page      = response;
        img.className = 'boxart';
        img.title     = self.title;
        img.href      = self.href;
        img.onclick   = displayShowPage;

        // Save for later use.
        self.img      = img;

        // Create <div> for image to center it.
        var divimg = document.createElement('div');
        divimg.className = 'divboxart';
        divimg.appendChild(img);

        // Create <div> for box art.
        var div = document.createElement('div');
        div.appendChild(divimg);
        div.insertAdjacentHTML('beforeend', '<div class="title-text common-margin"><b>' + self.title + '</b></div>')

        document.getElementById('shows').appendChild(div);
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
        if (e === undefined)
            continue;
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
    // Get the episodes from their PHP API.
    selfDoDoc(document.body,
              'http://horriblesubs.info/lib/getshows.php?type=show&showid=' + getShowId(page),
    // Display the episodes.
    function (self, response) {
        // Document containing magnet links to the episodes.
        var links = parseMagnetLinks(response.body);
        for (l of links) {
            var e = document.getElementById(l.ep);
            if (e !== null) {
                e.innerHTML = e.innerHTML + '<button onclick="stream(\'' + l.magnet + '\')">' + l.quality + '</button>'
                continue;
            }

            // Build a row with stream button.
            var divel = document.createElement('div'); // the <div>-tag adds a breakline.
            divel.className = 'common-margin';
            divel.id = l.ep;
            var s = '<span>' + l.ep + ': </span><button onclick="stream(\'' + l.magnet + '\')">' + l.quality + '</button>';
            divel.insertAdjacentHTML('beforeend', s);
            document.body.appendChild(divel);
        }
    });
}

// Change to the show page.
function displayShowPage() { // Called when user clicks on a box art.
    // Stop retrieving show box arts.
    stopAjaxRequests();

    // Clear the web page.
    emptyBody();

    // Insert Back button.
    document.body.insertAdjacentHTML('beforeend', '<button class="common-margin" onclick="getShows()">Back</button>');
    // Insert title.
    document.body.insertAdjacentHTML('beforeend', '<h3 class="common-margin">'+this.title+'</h3>');

    // Insert show container.
    var show       = document.createElement('div');
    show.className = 'flex-container';

    // Insert box art.
    this.onclick   = null; // 'this' is the <img> that got clicked.
    this.className = 'boxart';
    show.appendChild(this);

    // Insert description.
    var desc          = this.page.getElementsByClassName('series-desc')[0];
    var divdesc       = document.createElement('div');
    divdesc.innerText = desc.innerText;
    divdesc.className = 'flex-desc';
    show.appendChild(divdesc);

    // Insert the container to <body>.
    document.body.appendChild(show);

    // Ask user where to save the episodes downloaded.
    document.body.insertAdjacentHTML('beforeend', '<br />');
    if (savedir === null)
        document.body.insertAdjacentHTML('beforeend', '<span class="common-margin" id="savedir">Temporary directory is used as download directory.</span><button onclick="openFileDialog()">Change</button><br />');
    else
        document.body.insertAdjacentHTML('beforeend', '<span class="common-margin" id="savedir">'+savedir+'</span><button onclick="openFileDialog()">Change</button><br />');
    document.body.insertAdjacentHTML('beforeend', '<br />');

    // Display the episodes in a row.
    displayEpisodeRows(this.page);
}

// Retrieve the shows from HorribleSubs.info
function getShows() {
    // Clear <body>.
    emptyBody();

    // Create a <div> to display the show boxarts.
    document.body.insertAdjacentHTML('afterbegin', '<div class="flex-shows" id="shows"></div>');

    // Retrieve shows.
    doDoc('http://horriblesubs.info/shows/', function(response) {
        var showdocs = response.getElementsByClassName('ind-show');
        var i        = 0;

        for (s of showdocs) {
            if (i === 300)
                break;
            // Save reference to not get GC'ed.
            shows.push(new Show(s));
            i++;
        }
    });
}

// Initialize <body>.
function init() {
    // Get and display show boxarts.
    getShows();
}
