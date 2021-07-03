var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.AuthenticationApi();
});
describe('AuthenticationApi', function(){
    describe('getAccessToken', function(){
        it('should call getAccessToken successfully', function(done){
            //uncomment below and update the code to test getAccessToken
            instance.getAccessToken(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getOauthAuthorizationCode', function(){
        it('should call getOauthAuthorizationCode successfully', function(done){
            //uncomment below and update the code to test getOauthAuthorizationCode
            instance.getOauthAuthorizationCode(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postGoogleIdToken', function(){
        it('should call postGoogleIdToken successfully', function(done){
            //uncomment below and update the code to test postGoogleIdToken
            instance.postGoogleIdToken(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});