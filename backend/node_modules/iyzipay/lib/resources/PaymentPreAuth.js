'use strict';

var IyzipayResource = require('../IyzipayResource');

function PaymentPreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/preauth/ecom',
            method: 'POST',
            requestModel: 'CreatePaymentRequest'
        },
        retrieve: {
            path: '/payment/detail',
            method: 'POST',
            requestModel: 'RetrievePaymentRequest'
        }
    };
}

PaymentPreAuth.prototype = new IyzipayResource();

module.exports = PaymentPreAuth;