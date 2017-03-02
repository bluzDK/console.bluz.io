import React from 'react';
import {AgGridReact} from 'ag-grid-react';

import '../../node_modules/ag-grid/dist/styles/ag-grid.css';
import '../styles/ag-theme.css';

const products = {
    0: "Core",
    6: "Photon",
    8: "P1",
    10: "Electron",
    103: "bluz",
    269: "bluz gateway"
};

class DeviceTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gridAPI: {}
        };
    }

    render() {
        var columnDefs = [
            {headerName: 'Product', field: 'product_id', suppressResize: true, width: 150, cellRenderer: this.productCellRenderer},
            {headerName: 'ID', field: 'id', suppressResize: true, width: 250},
            {headerName: 'Name', field: 'name', suppressResize: true,},
            {headerName: 'Online', field: 'connected', suppressResize: true, width: 100, cellRenderer: this.onlineCellRenderer},
            {headerName: 'Last Heard', field: 'last_heard', suppressResize: true, width: 250},
            {headerName: '', field: 'product_id', suppressResize: true, width: 100, cellRenderer: this.optionsCellRenderer}
        ];

        var h = this.props.height-20;
        var width = this.props.width ? this.props.width : "95%";
        return (
            <div>
                <div className="ag-material" style={{height:h, width: width, margin: "auto"}}>
                    <AgGridReact

                        // listen for events with React callbacks
                        onGridReady={this.onGridReady.bind(this)}

                        // column definitions and row data are immutable, the grid
                        // will update when these lists change
                        columnDefs={columnDefs}
                        rowData={this.props.devices}

                        // or provide props the old way with no binding
                        enableColResize="true"

                        rowHeight="48"

                    />
                </div>
            </div>
        );
    }

    onGridReady = (params) => {
        this.setState({
            gridAPI: params.api
        });
    }

    onlineCellRenderer = (params) => {
        if (params.value) {
            return '<svg height="10" width="15"> <circle cx="5" cy="5" r="5" fill="#00ffff" /> </svg>online';
        } else {
            return '<svg height="10" width="15"> <circle cx="5" cy="5" r="5" fill="#aaaaaa" /> </svg>offline';
        }
    }

    productCellRenderer = (params) => {
        var label =  products[params.value] !== undefined ? products[params.value] : "Unknown";
        var iconLetter = products[params.value] !== undefined ? label.charAt(0) : "?";
        var icon = '<svg height="20" width="35"> <circle cx="15" cy="10" r="15" fill="#2d6fa3" /> <text x="50%" y="50%" text-anchor="middle" stroke="#ffffff" stroke-width="1px" dx="-0.1em" dy=".3em">'+iconLetter+'</text> </svg>'
        return '<div style="transform: translateY(-25%);">' + icon + label+'</div>';
    }

    optionsCellRenderer = (params) => {
        if (params.value === 269) {
            return '<button>...</button>'
        } else {
            return ""
        }

    }
}

DeviceTable.propTypes = {
    height:                 React.PropTypes.number.isRequired,
    width:                  React.PropTypes.string,
    devices:                React.PropTypes.array.isRequired
};

export default DeviceTable;