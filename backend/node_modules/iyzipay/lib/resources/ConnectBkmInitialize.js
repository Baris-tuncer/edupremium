'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectBkmInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/bkm/initialize',
            method: 'POST',
            requestModel: 'CreateConnectBkmInitializeRequest'
        }
    };
}

ConnectBkmInitialize.prototype = new IyzipayResource();

module.exports = ConnectBkmInitialize;