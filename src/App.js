import React, { Component } from 'react';
import './App.css';
import 'flexboxgrid';

import AppFetcher from './fetch/AppFetcher'

import injectTapEventPlugin from 'react-tap-event-plugin';

import AppBar from 'material-ui/AppBar';

import Login from './components/Login'
import Dashboard from './components/Dashboard'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            tryAgain: false
        };
    }

    render() {
        return (
          <div>
            <AppBar
              title="bluz console"
              iconClassNameRight="muidocs-icon-navigation-expand-more"
            />
            {AppFetcher.fetchToken() === "" &&
            <Login
                loggedIn={this.loggedIn}
            />}
            {AppFetcher.fetchToken() !== "" &&
            <Dashboard
              accessToken={AppFetcher.fetchToken()}
            />}
          </div>
        );
    }

    loggedIn = () => {
        console.log("Successfully Logged In")
    }
}

export default App;
