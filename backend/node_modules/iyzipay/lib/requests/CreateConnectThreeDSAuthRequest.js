'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function CreateConnectThreeDSAuthRequest(request) {

    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        paymentId: request["paymentId"],
        conversationData: request["conversationData"]
    });
}

util.inherits(CreateConnectThreeDSAuthRequest, BaseRequest);

module.exports = CreateConnectThreeDSAuthRequest;