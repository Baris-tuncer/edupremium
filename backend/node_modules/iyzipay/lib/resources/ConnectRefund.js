'use strict';

var IyzipayResource = require('../IyzipayResource');

function ConnectRefund() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyziconnect/refund',
            method: 'POST',
            requestModel: 'CreateRefundRequest'
        }
    };
}

ConnectRefund.prototype = new IyzipayResource();

module.exports = ConnectRefund;