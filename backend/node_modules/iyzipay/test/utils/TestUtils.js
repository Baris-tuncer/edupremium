var TestUtils = module.exports = {
    prepareInstallmentDetails: function () {
        return [
            TestUtils.isbankInstallmentDetails(),
            TestUtils.finansbankInstallmentDetails(),
            TestUtils.akbankInstallmentDetails(),
            TestUtils.ykbInstallmentDetails(),
            TestUtils.denizbankInstallmentDetails(),
            TestUtils.halkbankInstallmentDetails()
        ];
    },
    bankInstallmentDetails: function (bankId) {
        return {
            bankId: bankId,
            installmentPrices: [
                {
                    installmentNumber: '1',
                    totalPrice: '1.0'
                },
                {
                    installmentNumber: '2',
                    totalPrice: '1.1'
                },
                {
                    installmentNumber: '3',
                    totalPrice: '1.1'
                },
                {
                    installmentNumber: '6',
                    totalPrice: '1.2'
                },
                {
                    installmentNumber: '9',
                    totalPrice: '1.4'
                }
            ]
        };
    },
    isbankInstallmentDetails: function () {
        return TestUtils.bankInstallmentDetails(64);
    },
    finansbankInstallmentDetails: function () {
        return TestUtils.bankInstallmentDetails(111);
    },
    akbankInstallmentDetails: function () {
        return TestUtils.bankInstallmentDetails(46);
    },
    ykbInstallmentDetails: function () {
        return TestUtils.bankInstallmentDetails(67);
    },
    denizbankInstallmentDetails: function () {
        return TestUtils.bankInstallmentDetails(134);
    },
    halkbankInstallmentDetails: function () {
        return TestUtils.bankInstallmentDetails(12);
    }
};