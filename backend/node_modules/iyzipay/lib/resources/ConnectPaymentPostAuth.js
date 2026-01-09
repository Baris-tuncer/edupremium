'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectPaymentPostAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/postauth',
            method: 'POST',
            requestModel: 'CreatePaymentPostAuthRequest'
        }
    };
}

ConnectPaymentPostAuth.prototype = new IyzipayResource();

module.exports = ConnectPaymentPostAuth;