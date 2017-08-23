import React     from 'react';
import ReactDOM  from 'react-dom';

import { input } from './Filter.css' 
import { margin } from './Show.css' 

var callbacks = []; // callbacks containing functions to call on filter change.

// Register a callback to signal changes to the filter input.
export function register(cb) {
    callbacks.push(cb);
}

// Signal elements that user wants to filter shows.
function signal(val) {
    for (let c of callbacks)
        c(val);
}

// Filter anime shows displaying those within the filter.
export default class Filter extends React.Component {
    constructor() {
        super();
    }

    // Filter shows.
    filter(e) {
        signal(e.target.value);
    }

    render() {
        return (
            <div>
                <input className={ margin + ' ' + input } onChange={ this.filter } />
            </div>
        )
    }
};