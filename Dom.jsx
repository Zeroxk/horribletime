// Clear the <body>.
export function emptyBody() {
    var n = document.body;
    while (n.firstChild)
        n.removeChild(n.firstChild);
}