var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.FriendsApi();
});
describe('FriendsApi', function(){
    describe('getFriends', function(){
        it('should call getFriends successfully', function(done){
            //uncomment below and update the code to test getFriends
            instance.getFriends(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postFriends', function(){
        it('should call postFriends successfully', function(done){
            //uncomment below and update the code to test postFriends
            instance.postFriends(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
