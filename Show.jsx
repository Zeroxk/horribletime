import React from 'react';

import { container } from './Show.css'
import { margin } from './Margin.css'

// Page to display the show.
export default class Show extends React.Component {
    constructor() {
        super();
        this.state = {
            title: ""
        }
    }

    render() {
        <div>
            {/* Insert Back-button. */}
            <button class="margin">Back</button>
            {/* Insert title. */}
            <h3 class="margin">{this.state.title}</h3>
        </div>
    }
};