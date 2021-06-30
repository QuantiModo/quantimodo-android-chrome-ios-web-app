var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.SharesApi();
});
describe('SharesApi', function(){
    describe('deleteShare', function(){
        it('should call deleteShare successfully', function(done){
            //uncomment below and update the code to test deleteShare
            instance.deleteShare(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getShares', function(){
        it('should call getShares successfully', function(done){
            //uncomment below and update the code to test getShares
            instance.getShares(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('inviteShare', function(){
        it('should call inviteShare successfully', function(done){
            //uncomment below and update the code to test inviteShare
            instance.inviteShare(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
