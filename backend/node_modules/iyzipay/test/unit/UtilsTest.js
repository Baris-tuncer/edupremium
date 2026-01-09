var assert = require('assert'),
    should = require('should'),
    utils = require('../../lib/utils');

describe('Iyzipay', function () {

    var iyziWsHeaderName;
    var apiKey;
    var secretKey;
    var separator;
    var randomString;
    var body;

    before(function () {
        iyziWsHeaderName = "IYZWS";
        apiKey = "api_key";
        secretKey = "secret_key";
        separator = ":";
        randomString = "random_string";
        body = "body";
    });

    it('should return api methods', function (done) {
        var apiMethods = {
            RETRIEVE: 'retrieve',
            CREATE: 'create',
            DELETE: 'delete',
            UPDATE: 'update'
        };
        should.deepEqual(apiMethods, utils.apiMethod);
        done();
    });

    it('should generate authorization header', function (done) {
        var header = utils.generateAuthorizationHeader(iyziWsHeaderName, apiKey, separator, secretKey, body, randomString);
        header.should.be.equal("IYZWS api_key:ikF+xhjLA0/xsvl+eJjoHWkwh5g=");
        done();
    });

    it('should generate hash', function (done) {
        var hash = utils.generateHash(apiKey, randomString, secretKey, body);
        hash.should.be.equal("ikF+xhjLA0/xsvl+eJjoHWkwh5g=");
        done();
    });

    it('should generate request string for basic request', function (done) {
        var requestString = utils.generateRequestString({
            name: "John",
            surname: "Doe"
        });
        requestString.should.be.equal("[name=John,surname=Doe]");
        done();
    });

    it('should generate request string for request that has array values', function (done) {
        var requestString = utils.generateRequestString({
            name: "John",
            surname: "Doe",
            friends: [{name: "Johnny"}, {name: "Mike"}]
        });
        requestString.should.be.equal("[name=John,surname=Doe,friends=[[name=Johnny], [name=Mike]]]");
        done();
    });

    it('should generate random string', function (done) {
        var randomString = utils.generateRandomString(8);
        randomString.should.not.be.null;
        done();
    });

    it('should convert non-float price', function (done) {
        var price = utils.formatPrice('22');
        price.should.be.equal('22.0');
        done();
    });

    it('should convert float price', function (done) {
        var price = utils.formatPrice('23.0');
        price.should.be.equal('23.0');
        done();
    });

    it('should eliminate floating zeros', function (done) {
        var price = utils.formatPrice('15.340000');
        price.should.be.equal('15.34');
        done();
    });

    it('should not eliminate leading zero', function (done) {
        var price = utils.formatPrice('0.12345');
        price.should.be.equal('0.12345');
        done();
    });

    it('should eliminate leading zero containing only one zero', function (done) {
        var price = utils.formatPrice('22.00');
        price.should.be.equal('22.0');
        done();
    });

    it('should not eliminate zeros in floating value', function (done) {
        var price = utils.formatPrice('23.00450067');
        price.should.be.equal('23.00450067');
        done();
    });

    it('should be undefined', function (done) {
        var data = [];
        var price = utils.formatPrice(data['price']);
        should.not.exist(price);
        done();
    });
});