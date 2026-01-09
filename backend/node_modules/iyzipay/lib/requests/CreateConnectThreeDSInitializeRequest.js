'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    ConnectPayment = require('./model/ConnectPayment');

function CreateConnectThreeDSInitializeRequest(request) {

    var payment = ConnectPayment.body(request);
    payment['callbackUrl'] = request["callbackUrl"];
    BaseRequest.call(this, payment);
}

util.inherits(CreateConnectThreeDSInitializeRequest, BaseRequest);

module.exports = CreateConnectThreeDSInitializeRequest;