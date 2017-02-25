import React, { Component } from 'react';
import './App.css';

import injectTapEventPlugin from 'react-tap-event-plugin';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
    palette:{
        primary1Color: '#2d6fa3',
        primary2Color: '#69abdf',
        accent1Color: '#f78f1e'

    },
});

import Login from './Components/Login'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends Component {
  render() {
    return (
      <div className="App">
        <MuiThemeProvider muiTheme={muiTheme}>
            <Login
                loggedIn={this.loggedIn}
            />
        </MuiThemeProvider>
      </div>
    );
  }

    loggedIn = () => {
        console.log("Successfully Logged In")
    }
}

export default App;
