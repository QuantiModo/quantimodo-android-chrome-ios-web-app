var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.ActivitiesApi();
});
describe('ActivitiesApi', function(){
    describe('getActivities', function(){
        it('should call getActivities successfully', function(done){
            //uncomment below and update the code to test getActivities
            instance.getActivities(function(error){
                if(error) throw error;
                expect().to.be();
            });
            done();
        });
    });
    describe('postActivities', function(){
        it('should call postActivities successfully', function(done){
            //uncomment below and update the code to test postActivities
            instance.postActivities(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
