'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectThreeDSInitializePreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/initialize3ds/preauth',
            method: 'POST',
            requestModel: 'CreateConnectThreeDSInitializeRequest'
        }
    };
}

ConnectThreeDSInitializePreAuth.prototype = new IyzipayResource();

module.exports = ConnectThreeDSInitializePreAuth;
