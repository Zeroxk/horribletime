import React from 'react';

import { get }    from './Magnet.jsx'
import { margin } from './Show.css'
import { doDoc }  from './Ajax.jsx'
import { stream } from './Torrent.jsx'

// Get the ID of the anime show from the show web page.
function getShowId(page) {
    var text = page.getElementsByClassName('entry-content')[0].childNodes[5].firstChild.innerText;
    return text.split('=')[1].replace(/[=;\s]/g, '');
}

// Display the episodes in a row.
export default class Eps extends React.Component {
    // Construct the display of rows.
    constructor(props) {
        super(props);

        this.state = {
            rows: 'Loading...'
        }

        // Get the show id of the show.
        this.showid = getShowId(props.page);
        this.nextid = 0;

        // Get the episodes from their PHP API.
        doDoc('http://horriblesubs.info/lib/getshows.php?type=show&showid=' + this.showid,
              this.add.bind(this));
    }

    // Add an episode row. Called when a page has been finished retrieved.
    add(response) {
        // Is there more episodes to parse?
        var rt = response.body.innerText;
        if (rt === 'There are no individual episodes for this show.') {
            this.setState({
                rows: 'There are no individual episodes for this show.'
            });
            return;
        }
        if (rt === 'DONE')
            return;

        // Get magnet links.
        let links = get(response.body);

        // Create <buttons> for streaming them.
        let eps = [];
        for (let l of links) {
            // Find an existing element.
            let found = false;
            for (let i = 0; i < eps.length; ++i) {
                let e = eps[i];
                if (e.key == l.ep) {
                    eps[i] = (<div key={l.ep}>
                                  {e.props.children}<button onClick={ () => { stream(l.magnet) }}>{l.quality}</button>
                              </div>);
                    found = true;
                    break;
                }
            }
            if (found)
                continue;

            // Build a row with stream button.
            eps.push(<div key={l.ep}>
                        <span>{l.ep}: </span><button onClick={ () => { stream(l.magnet) } }>{l.quality}</button>
                     </div>);
        }

        // First time?
        if (this.nextid === 0) {
            this.setState({
                rows: eps
            });
        } else {
            this.setState({
                rows: this.state.rows.concat(eps)
            });
        }

        // Look for more episodes.
        ++this.nextid;
        doDoc('http://horriblesubs.info/lib/getshows.php?type=show&showid=' + this.showid + '&nextid=' + this.nextid,
              this.add.bind(this));
    }

    render() {
        return (
            <div className={margin}>
                { this.state.rows }
            </div>
        );
    }
}