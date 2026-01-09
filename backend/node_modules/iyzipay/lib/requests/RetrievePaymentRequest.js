'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveInstallmentInfoRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        paymentId: request['paymentId'],
        paymentConversationId: request['paymentConversationId']
    });
}

util.inherits(RetrieveInstallmentInfoRequest, BaseRequest);

module.exports = RetrieveInstallmentInfoRequest;