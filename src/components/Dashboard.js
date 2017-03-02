import React, { Component } from 'react';
import Particle from 'particle-api-js';

import AppFetcher from '../fetch/AppFetcher'
import DeviceTable from './DeviceTable'

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: []
        };
    }

    render() {
        return (
        <div className="row">
            <div className="col-xs-offset-2 col-xs-9">
                <div className="box">
                    <br/>
                    <DeviceTable
                        devices={this.state.devices}
                        height={window.innerHeight-80}
                    />
                </div>
            </div>
        </div>
        )
    }

    componentDidMount() {
        var particle = new Particle();
        particle.listDevices({ auth: this.props.accessToken }).then(
            function(devices){
                this.setState({
                    devices: devices.body
                })
            }.bind(this),
            function(err) {
                console.log("List devices failed");
                AppFetcher.deleteToken();
            }
        );
    }
}

Dashboard.propTypes = {
    accessToken:            React.PropTypes.string.isRequired
};

export default Dashboard;
