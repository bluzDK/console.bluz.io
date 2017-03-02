import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
    palette:{
        primary1Color: '#2d6fa3',
        primary2Color: '#69abdf',
        accent1Color: '#f78f1e'

    },
});

ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
        <App />
    </MuiThemeProvider>,
  document.getElementById('root')
);
