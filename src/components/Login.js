import React, { Component } from 'react';

import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import AppFetcher from '../fetch/AppFetcher'

import Particle from 'particle-api-js';

class Login extends Component {
    

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            tryAgain: false
        };
    }

    render() {
        const actions = [
            <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.handleSubmit.bind(this)}
            />
        ];

        return (
            <div>
                <Dialog
                    title="Sign in with your Particle Account to get started"
                    actions={actions}
                    modal={true}
                    open={true}>
                    <TextField
                        name="email"
                        fullWidth={true}
                        defaultValue=""
                        floatingLabelText="Particle Email Address"
                        onChange={this.textFieldChanged.bind(this)}
                    />
                    <TextField
                        name="password"
                        fullWidth={true}
                        defaultValue=""
                        type="password"
                        floatingLabelText="Password"
                        onChange={this.textFieldChanged.bind(this)}
                    />
                    {this.state.tryAgain && <p style={{color: "red"}}>Login Unsuccessful. Please try again</p>}
                </Dialog>
            </div>
        );
    }

    handleSubmit() {
        this.login();
    };

    setStateSearchCriteria(name, value) {
        var newState = Object.assign({}, this.state);
        newState[name] = value;

        this.setState(newState);
    }

    textFieldChanged(object, value) {
        this.setStateSearchCriteria(object.target.name, value);
    }

    login() {
        var particle = new Particle();
        particle.login({username: this.state.email, password:  this.state.password}).then(
            function(data){
                AppFetcher.storeToken(data.body.access_token);
                this.props.loggedIn();
            }.bind(this),
            function(err) {
                this.setState({
                    tryAgain: true
                });
            }.bind(this)
        );
    }

}

Login.propTypes = {
    loggedIn:           React.PropTypes.func.isRequired
};

export default Login;