import React from 'react';

import { shelf }                    from './Shelf.jsx'
import { prevScrollTop, emptyBody } from './Box.jsx'
import { container, margin }        from './Show.css'

// Page to display the show.
export default class Show extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: props.parent.title
        }
    }

    // Show the shelf again.
    goBackToShelf() {
        // Show the shelf again.
        emptyBody();
        document.body.appendChild(shelf);
        // Set it to the scrollTop-position the user left it.
        document.body.scrollTop = prevScrollTop;
    }

    render() {
        return (
            <div>
                {/* Insert Back-button. */}
                <button className={margin} onClick={this.goBackToShelf}>Back</button>

                {/* Insert title. */}
                <h3 className={margin}>{this.state.title}</h3>
            </div>
        )
    }
};