'use strict';

var IyzipayResource = require('../IyzipayResource');

function ThreeDSInitializePreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/initialize3ds/preauth/ecom',
            method: 'POST',
            requestModel: 'CreateThreeDSInitializeRequest'
        }
    };
}

ThreeDSInitializePreAuth.prototype = new IyzipayResource();

module.exports = ThreeDSInitializePreAuth;
