'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    ConnectPayment = require('./model/ConnectPayment');

function CreateConnectPaymentRequest(request) {

    BaseRequest.call(this, ConnectPayment.body(request));
}

util.inherits(CreateConnectPaymentRequest, BaseRequest);

module.exports = CreateConnectPaymentRequest;