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
    xhttp.onreadystatechange = function() {
        // Was GET successful?
        if (this.readyState === 4 && this.status === 200)
            f(self, this.response);
    }
    asyncGet(xhttp, url);
}