'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectPaymentAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/auth',
            method: 'POST',
            requestModel: 'CreateConnectPaymentRequest'
        }
    };
}

ConnectPaymentAuth.prototype = new IyzipayResource();

module.exports = ConnectPaymentAuth;