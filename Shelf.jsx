import React                from 'react';
import ReactDOM             from 'react-dom';

import { container }        from './Shelf.css'
import Show                 from './Show.jsx'
import Box                  from './Box.jsx'
import { doDoc, selfDoDoc } from './Ajax.jsx'
import Filter, { register } from './Filter.jsx'

// The shelf of anime show boxes.
export default class Shelf extends React.Component {
    constructor() {
        super();

        // Set the current scroll-position of the <div>.
        this.state = {
            boxes: <div style={{margin: '10px'}}>Loading shows...</div>,
            domboxes: []
        };

        register(this.filter.bind(this));

        // Retrieve shows from horriblesubs.info.
        selfDoDoc(this, 'http://horriblesubs.info/shows/', function(self, response) {
            let shows = response.getElementsByClassName('ind-show');
            var i = 0;

            self.state.boxes = [];

            for (let s of shows) {
                // If show is empty and has no links.
                if (s.className.includes('linkless'))
                    continue;

                // Update boxes.
                let b = self.state.boxes;
                b.push(<Box key={i} show={s} ref={ (o) => { self.state.domboxes.push(o) }} />);

                // Set new state, which re-renders.
                self.setState({
                    boxes: b
                });

                ++i; // unique key to squash warning.
            }
        });
    }

    // Filter shows.
    filter(s) {
        if (s == '') {
            for (let b of this.state.domboxes)
                b.show();
            return;
        }

        const l = s.toLowerCase();
        for (let b of this.state.domboxes) {
            let t = b.title.toLowerCase();
            if (t.includes(l))
                b.show();
            else
                b.hide();
        }
    }

    render() {
        // Create a <div> to display the show boxarts.
        return (
            <div>
                <Filter />
                <div className={container}>
                    { this.state.boxes }
                </div>
            </div>
        )
    }
};

export var shelf = document.createElement('div');
ReactDOM.render(<Shelf />, shelf);
document.body.appendChild(shelf);