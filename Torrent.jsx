// Create the streaming torrent engine.
var torrentStream = require('torrent-stream'); // namespace containing functions for streaming torrents.
var streams = []; // Torrent streams.

// The save directory.
export var saveDirectory = null;

// Stream the file.
export function stream(magnet) {
    var engine; // The torrent stream engine.

    // Check if the save directory is set.
    if (saveDirectory === null) {
        alert("No download directory is set!");
        return;
    } else {
        console.log("Trying to fetch: " + magnet);
        engine = torrentStream(magnet, {
            path: savedir
        });
    }

    // Save to not get GC'ed.
    streams.push(engine);

    // Called after fetching the torrent from magnet.
    engine.on('ready', function() {
        engine.files.forEach(function(file) {
            console.log('Downloading: ', file.name);
            var s = file.createReadStream(); // readable stream to containing the file content.
        });
	});

    // Called when finished downloading the file.
    engine.on('idle', function() {
        console.log("Finished downloading: " + engine.files[0].name);
    });
}