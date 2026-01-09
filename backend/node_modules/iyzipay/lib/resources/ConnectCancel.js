'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectCancel() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/cancel',
            method: 'POST',
            requestModel: 'CreateCancelRequest'
        }
    };
}

ConnectCancel.prototype = new IyzipayResource();

module.exports = ConnectCancel;