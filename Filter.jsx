import React     from 'react';
import ReactDOM  from 'react-dom';

import { input } from './Filter.css' 
import { margin } from './Show.css' 

var callbacks = [];

export function register(cb) {
    callbacks.push(cb);
}

function signal(val) {
    for (let c of callbacks) {
        c(val);
    }
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