import React from 'react';
import ReactDOM from 'react-dom';

import Show               from './Show.jsx'
import { margin }         from './Margin.css'
import { title, height }  from './Box.css'
import { selfDoDoc }      from './Ajax.jsx'

// Import jQuery from npm.
global.$ = require('jquery');
// Import jQuery.appear from npm.
require('jquery-appear-poetic');

// The anime show box displayed on a grid shelf.
export default class Box extends React.Component {
    // Construct anime box.
    constructor(props) {
        super(props);

        // Save link to show page.
        this.href  = props.show.firstChild.href;
        // Save show title.
        this.title = props.show.firstChild.innerText;
    }

    // Get the built original DOM object here.
    componentDidMount() {
        // Download boxart image when the <div> is visible (appeared).
        this.shown = false;
        let self = this;
        $.appear(this); // Enable callback on DOM appear.
        // Set callback to download show page on appear.
        $(this).on('appear', function(e, appeared) {
            // Check if has already been downloaded and shown.
            if (self.shown)
                return;

            // Download and show boxart.
            self.shown = true;
            selfDoDoc(self,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                      self.href,
                      self.addBoxArt);
        });

        // Download and show <img> if it is visible (appeared).
        if ($(this).is(':appeared')) {
            self.shown = true;
            selfDoDoc(self,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                      self.href,
                      self.addBoxArt);
        }
    }

    // Add anime show box art image to <body>.
    addBoxArt(self, response) {
        // Get the boxart of the show.
        var imgs = response.getElementsByClassName('series-image');
        var img = imgs[0].firstChild;

        // Change <img> for our purposes.
        img.page      = response;        // Show page.
        img.className = 'boxart';
        img.title     = self.title;
        img.href      = self.href;
        img.onclick   = displayShowPage;

        // Save for later use.
        self.img      = img;

        // Append image.
        this.state.dom.firstChild.appendChild(img);
    }

    // Change to the show page.
    changeToShow(event) {
        ReactDOM.render(<Show />, 
                        document.getElementById('root'));
    }

    render() {
        return (
            <div>
                <div className={height}>
                    {/* Boxart image is placed here. */}
                    <div className={margin + ' ' + title} onClick={this.changeToShow}>
                        <b>{this.title}</b>
                    </div>
                </div>
            </div>);
    }
}