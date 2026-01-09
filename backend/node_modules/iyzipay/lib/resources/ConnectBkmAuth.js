'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectBkmAuth() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/iyziconnect/bkm/auth/detail',
            method: 'POST',
            requestModel: 'RetrieveBkmAuthRequest'
        }
    };
}

ConnectBkmAuth.prototype = new IyzipayResource();

module.exports = ConnectBkmAuth;