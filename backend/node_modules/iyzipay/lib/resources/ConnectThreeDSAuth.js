'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectThreeDSAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/auth3ds',
            method: 'POST',
            requestModel: 'CreateConnectThreeDSAuthRequest'
        }
    };
}

ConnectThreeDSAuth.prototype = new IyzipayResource();

module.exports = ConnectThreeDSAuth;
