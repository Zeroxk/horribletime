import React from 'react';
import ReactDOM from 'react-dom';

import Shelf from './Shelf.jsx';

// Render the root component into the <body.>
ReactDOM.render(<Shelf />, 
                // Render into root-<div>. React warns against rendering directly into document.body.
                document.getElementById('root'));