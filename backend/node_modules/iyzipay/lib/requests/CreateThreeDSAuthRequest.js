'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function CreateThreeDSAuthRequest(request) {

    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        paymentId: request["paymentId"],
        conversationData: request["conversationData"]
    });
}

util.inherits(CreateThreeDSAuthRequest, BaseRequest);

module.exports = CreateThreeDSAuthRequest;