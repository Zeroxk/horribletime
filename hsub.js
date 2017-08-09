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

// Save directory.
var savedir = null;

// Ask user where to save the downloaded files.
function openFileDialog() {
    const {dialog} = require('electron').remote;
    savedir = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
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

// Create the streaming torrent engine.
var torrentStream = require('torrent-stream');

const testmagnet = 'magnet:?xt=urn:btih:7JDH3N6F5AK5TNMMGVV37EYBFDJR67OM&amp;tr=http://nyaa.tracker.wf:7777/announce&amp;tr=udp://tracker.coppersurfer.tk:6969/announce&amp;tr=udp://tracker.internetwarriors.net:1337/announce&amp;tr=udp://tracker.leechers-paradise.org:6969/announce&amp;tr=http://tracker.internetwarriors.net:1337/announce&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=http://tracker.opentrackr.org:1337/announce&amp;tr=udp://tracker.zer0day.to:1337/announce&amp;tr=http://explodie.org:6969/announce&amp;tr=http://p4p.arenabg.com:1337/announce&amp;tr=udp://p4p.arenabg.com:1337/announce&amp;tr=http://mgtracker.org:6969/announce&amp;tr=udp://mgtracker.org:6969/announce';

const testmagnet2 = 'magnet:?xt=urn:btih:7WPHHMMLZHM26J2HYVAD7EL5T2GP422P&dn=%5BUTW%5D_Fate_Apocrypha_-_06_%5Bh264-720p%5D%5BC7A63CDA%5D.mkv&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.doko.moe%3A6969&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce'

var files = [];

// Stream the file.
function stream(magnet) {
    if (savedir === null) {
        alert("No save directory specified!");
        return;
    }

    var engine = torrentStream(magnet, {
        path: savedir[0]
    });

    engine.on('ready', function() {
        engine.files.forEach(function(file) {
            console.log('Filename:', file.name);
            files.push(file);
            var stream = file.createReadStream();
            // stream is readable stream to containing the file content
        });
	});
}

function reverse(s) {
    return s.split("").reverse().join("");
}

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

function createEpisodeRows(page) {
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
    document.body.insertAdjacentHTML('beforeend', '<button onclick="openFileDialog()">Save</button><br />');

    createEpisodeRows(this.page);
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
