'use strict';

var IyzipayResource = require('../IyzipayResource');

function PaymentPostAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/postauth',
            method: 'POST',
            requestModel: 'CreatePaymentPostAuthRequest'
        }
    };
}

PaymentPostAuth.prototype = new IyzipayResource();

module.exports = PaymentPostAuth;