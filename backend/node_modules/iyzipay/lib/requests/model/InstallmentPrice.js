'use strict';

var utils = require('../../utils');

function InstallmentPrice() {
}

InstallmentPrice.body = function (data) {

    return typeof data !== 'undefined' ? {
        installmentPrice: utils.formatPrice(data["installmentPrice"]),
        totalPrice: utils.formatPrice(data["totalPrice"]),
        installmentNumber: data["installmentNumber"]
    } : undefined
};

module.exports = InstallmentPrice;