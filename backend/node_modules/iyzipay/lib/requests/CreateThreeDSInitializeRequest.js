'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    Payment = require('./model/Payment');

function CreateThreeDSInitializeRequest(request) {

    var payment = Payment.body(request);
    payment['callbackUrl'] = request["callbackUrl"];
    BaseRequest.call(this, payment);
}

util.inherits(CreateThreeDSInitializeRequest, BaseRequest);

module.exports = CreateThreeDSInitializeRequest;