'use strict';

var IyzipayResource = require('../IyzipayResource');

function BkmAuth() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/iyzipos/bkm/auth/ecom/detail',
            method: 'POST',
            requestModel: 'RetrieveBkmAuthRequest'
        }
    };
}

BkmAuth.prototype = new IyzipayResource();

module.exports = BkmAuth;