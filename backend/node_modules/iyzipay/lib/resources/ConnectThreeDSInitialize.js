'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectThreeDSInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/initialize3ds',
            method: 'POST',
            requestModel: 'CreateConnectThreeDSInitializeRequest'
        }
    };
}

ConnectThreeDSInitialize.prototype = new IyzipayResource();

module.exports = ConnectThreeDSInitialize;
