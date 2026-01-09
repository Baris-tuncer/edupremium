'use strict';

var IyzipayResource = require('../IyzipayResource');

function ThreeDSAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/auth3ds/ecom',
            method: 'POST',
            requestModel: 'CreateThreeDSAuthRequest'
        },
        retrieve: {
            path: '/payment/detail',
            method: 'POST',
            requestModel: 'RetrievePaymentRequest'
        }
    };
}

ThreeDSAuth.prototype = new IyzipayResource();

module.exports = ThreeDSAuth;
