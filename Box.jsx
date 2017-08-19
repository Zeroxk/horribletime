import React from 'react';
import ReactDOM from 'react-dom';

import Show                        from './Show.jsx'
import { title, height, padding }  from './Box.css'
import { selfDoDoc }               from './Ajax.jsx'

// Import jQuery from npm.
global.$ = require('jquery');
// Import jQuery.appear from npm.
require('jquery-appear-poetic');

// Previous scrollTop of <body>.
export var prevScrollTop = 0;

// Clear the <body>.
export function emptyBody() {
    var n = document.body;
    while (n.firstChild)
        n.removeChild(n.firstChild);
}

// The anime show box displayed on a grid shelf.
export default class Box extends React.Component {
    // Construct anime box.
    constructor(props) {
        super(props);

        // Save link to show page.
        this.href  = props.show.firstChild.href;

        // Save show title.
        //this.title = props.show.firstChild.innerText;
        this.title = props.show.firstChild.title;
    }

    // Get the built original DOM object here.
    componentDidMount() {
        // Download boxart image when the <div> is visible (appeared).
        var dom = this.dom;

        // Pass from React DOM to DOM DOM.
        dom.href      = this.href;
        dom.title     = this.title;
        dom.shown     = false;
        dom.addBoxArt = this.addBoxArt.bind(this);

        // Enable callback on DOM appear.
        $.appear(dom); 
        // Set callback to download show page on appear.
        $(dom).on('appear', function(e, appeared) {
            // Check if has already been downloaded and shown.
            if (dom.shown)
                return;

            // Download and show boxart.
            dom.shown = true;
            selfDoDoc(dom,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                      dom.href,
                      dom.addBoxArt);
        });

        // Download and show <img> if it is visible (appeared).
        if ($(dom).is(':appeared')) {
            dom.shown = true;
            selfDoDoc(dom,            // Provide reference to this object, because the global 'this'-variable gets changed to 'undefined' when entering the response-function.
                      dom.href,
                      dom.addBoxArt);
        }
    }

    // Add anime show box art image to <body>.
    addBoxArt(self, response) {
        // Save horriblesubs.info's show page.
        this.page        = response; // Bound to this component.

        // Get the boxart of the show.
        var imgs = response.getElementsByClassName('series-image');
        var img = imgs[0].firstChild;

        // Change <img> for our purposes.
        img.className    = 'boxart';
        img.title        = self.title;
        img.href         = self.href;
        img.style.width  = '225px';

        // Append image.
        self.firstChild.appendChild(img);
    }

    // Change to the show page.
    changeToShow() {
        if (this.page == undefined)
            return;

        prevScrollTop = document.body.scrollTop;

        let show = document.createElement('div');
        ReactDOM.render(<Show parent={this}/>, show);

        emptyBody();
        document.body.appendChild(show);
    }

    // Build React's DOM of the anime box.
    render() {
        return (<div className={padding} ref={ (o) => {this.dom = o}} onClick={this.changeToShow.bind(this)}>
                    <div className={height}>
                        {/* Boxart image <img> is placed here. */}
                    </div>
                    <div className={title}>
                        <b>{this.title}</b>
                    </div>
                </div>);
    }
}