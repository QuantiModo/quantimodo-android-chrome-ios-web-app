var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.AnalyticsApi();
});
describe('AnalyticsApi', function(){
    describe('getCorrelationExplanations', function(){
        it('should call getCorrelationExplanations successfully', function(done){
            //uncomment below and update the code to test getCorrelationExplanations
            instance.getCorrelationExplanations(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
describe('getCorrelations', function(){
    it('should call getCorrelations successfully', function(done){
        //uncomment below and update the code to test getCorrelations
        instance.getCorrelations(function(error, response){
            if(error) throw error;
            expect(response).to.be();
            done();
        });
    })
})
