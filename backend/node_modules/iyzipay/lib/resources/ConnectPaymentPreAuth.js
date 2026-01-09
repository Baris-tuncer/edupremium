'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectPaymentPreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/preauth',
            method: 'POST',
            requestModel: 'CreateConnectPaymentRequest'
        }
    };
}

ConnectPaymentPreAuth.prototype = new IyzipayResource();

module.exports = ConnectPaymentPreAuth;