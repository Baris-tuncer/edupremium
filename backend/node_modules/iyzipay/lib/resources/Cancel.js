'use strict';

var IyzipayResource = require('../IyzipayResource');

function Cancel() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/cancel',
            method: 'POST',
            requestModel: 'CreateCancelRequest'
        }
    };
}

Cancel.prototype = new IyzipayResource();

module.exports = Cancel;