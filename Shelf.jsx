import React         from 'react';

import { container } from './Shelf.css'

import { doDoc }     from './Ajax.jsx'
import Show          from './Show.jsx'
import Box           from './Box.jsx'

// The shelf of anime show boxes.
export default class Shows extends React.Component {
    constructor() {
        super();

        // Set the current scroll-position of the <div>.
        this.state = {
            scrollTop: 0,
            boxes: []
        };
        document.body.scrollTop = 0;

        // Retrieve shows from horriblesubs.info.
        doDoc('http://horriblesubs.info/shows/', function(response) {
            var shows = response.getElementsByClassName('ind-show');
            for (s of shows) {
                // If show is empty and has no links.
                if (s.className.includes('linkless'))
                    continue;
                this.state.boxes.push(new Box(s));
            }
        });
    }

    render() {
        // Return back to the previous scroll position.
        document.body.scrollTop = this.state.scrollTop;

        // Create a <div> to display the show boxarts.
        return (
            <div className={container}>
                { this.state.boxes }
            </div>
        )
    }
};
