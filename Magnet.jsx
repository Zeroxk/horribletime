import { doDoc } from './Ajax.jsx'

// Reverse character string.
function reverse(s) {
    return s.split("").reverse().join("");
}

// Parse the show page and retrieve the magnet links.
export function get(response) {
    var shows = []; // contains all the shows.

    // Retrieve the episodes, quality and the magnet links.
    for (let e of response.childNodes) {
        if (e === undefined)
            continue;

        // Only parse release links. Skip the rest of the nonsense.
        if (e.className.includes("release-links")) {
            var count = 0, quality = '', ep = '';
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