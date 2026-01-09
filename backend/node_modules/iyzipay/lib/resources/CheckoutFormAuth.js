'use strict';

var IyzipayResource = require('../IyzipayResource');

function CheckoutFormAuth() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/iyzipos/checkoutform/auth/ecom/detail',
            method: 'POST',
            requestModel: 'RetrieveCheckoutFormAuthRequest'
        }
    };
}

CheckoutFormAuth.prototype = new IyzipayResource();

module.exports = CheckoutFormAuth;