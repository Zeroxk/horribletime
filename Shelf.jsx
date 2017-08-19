import React         from 'react';

import { container } from './Shelf.css'
import Show          from './Show.jsx'
import Box           from './Box.jsx'
import { doDoc, selfDoDoc } from './Ajax.jsx'

// The shelf of anime show boxes.
export default class Shelf extends React.Component {
    constructor() {
        super();

        // Set the current scroll-position of the <div>.
        this.state = {
            scrollTop: 0,
            boxes: []
        };
        document.body.scrollTop = 0;

        // Retrieve shows from horriblesubs.info.
        selfDoDoc(this, 'http://horriblesubs.info/shows/', function(self, response) {
            let shows = response.getElementsByClassName('ind-show');
            for (let s of shows) {
                // If show is empty and has no links.
                if (s.className.includes('linkless'))
                    continue;

                // Update boxes.
                let b = self.state.boxes;
                b.push(<Box show={s} />);
                self.setState({
                    boxes: b
                });
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
