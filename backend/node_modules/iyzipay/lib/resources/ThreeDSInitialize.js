'use strict';

var IyzipayResource = require('../IyzipayResource');

function ThreeDSInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/initialize3ds/ecom',
            method: 'POST',
            requestModel: 'CreateThreeDSInitializeRequest'
        }
    };
}

ThreeDSInitialize.prototype = new IyzipayResource();

module.exports = ThreeDSInitialize;
