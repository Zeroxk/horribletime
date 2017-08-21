import React from 'react';

import { emptyBody }         from './Dom.jsx'
import { prevScrollTop }     from './Box.jsx'
import { shelf }             from './Shelf.jsx'
import { container, margin } from './Show.css'

import EpisodeRows           from './EpisodeRows.jsx'

export var savedir = null;

// Page to display the show.
export default class Show extends React.Component {
    constructor(props) {
        super(props);

        this.page   = props.parent.page;  // horriblesubs.info show page.
        this.title  = props.parent.title, // title of the show.
        this.boxart = props.parent.img;   // boxart of the show.

        this.state = {
            savedir: 'No download directory is set.'
        };
    }

    // Show the shelf again.
    goBackToShelf() {
        // Show the shelf again.
        emptyBody();
        document.body.appendChild(shelf);
        // Set it to the scrollTop-position the user left it.
        document.body.scrollTop = prevScrollTop;
    }

    componentDidMount() {
        // Insert boxart image.
        var img = this.boxart.cloneNode();
        img.style.margin = '10px';
        this.container.insertAdjacentElement('afterbegin', img);

        // Insert description.
        var desc            = this.page.getElementsByClassName('series-desc')[0];
        this.desc.innerText = desc.innerText;
    }

    openFileDialog() {
        // Ask user where to save the downloaded files.
        const { dialog } = require('electron').remote;
        let dir = dialog.showOpenDialog({properties: ['openDirectory']});
        if (dir === undefined)
            return;
        savedir = dir[0];
        this.setState({
            savedir: dir[0]
        });
    }

    render() {
        return (
            <div>
                {/* Back-button. */}
                <button className={margin} onClick={this.goBackToShelf}>Back</button>

                {/* Title. */}
                <h3 className={margin}>{this.title}</h3>

                <div className={container} ref={(o) => { this.container = o; }}>
                    {/* Image will be later added here by code... */}

                    {/* Description */}
                    <div className = {margin} ref={(o) => { this.desc = o; }}>
                    </div>
                </div>
                <span className={margin}>{this.state.savedir}</span><button onClick={this.openFileDialog.bind(this)}>Change</button>

                <EpisodeRows page={this.page} />
            </div>
        )
    }
};