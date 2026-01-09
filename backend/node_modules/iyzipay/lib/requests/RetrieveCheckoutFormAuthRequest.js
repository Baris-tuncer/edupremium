'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveCheckoutFormAuthRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        token: request['token']
    });
}

util.inherits(RetrieveCheckoutFormAuthRequest, BaseRequest);

module.exports = RetrieveCheckoutFormAuthRequest;