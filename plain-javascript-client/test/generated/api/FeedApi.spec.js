var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.FeedApi();
});
describe('FeedApi', function(){
    describe('getFeed', function(){
        it('should call getFeed successfully', function(done){
            //uncomment below and update the code to test getFeed
            instance.getFeed(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postFeed', function(){
        it('should call postFeed successfully', function(done){
            //uncomment below and update the code to test postFeed
            instance.postFeed(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
