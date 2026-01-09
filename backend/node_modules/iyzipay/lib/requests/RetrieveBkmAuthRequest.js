'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveBkmAuthRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        token: request['token']
    });
}

util.inherits(RetrieveBkmAuthRequest, BaseRequest);

module.exports = RetrieveBkmAuthRequest;