var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.StudiesApi();
});
describe('StudiesApi', function(){
    describe('createStudy', function(){
        it('should call createStudy successfully', function(done){
            //uncomment below and update the code to test createStudy
            instance.createStudy(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('deleteVote', function(){
        it('should call deleteVote successfully', function(done){
            //uncomment below and update the code to test deleteVote
            instance.deleteVote(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getOpenStudies', function(){
        it('should call getOpenStudies successfully', function(done){
            //uncomment below and update the code to test getOpenStudies
            instance.getOpenStudies(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getStudies', function(){
        it('should call getStudies successfully', function(done){
            //uncomment below and update the code to test getStudies
            instance.getStudies(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getStudiesCreated', function(){
        it('should call getStudiesCreated successfully', function(done){
            //uncomment below and update the code to test getStudiesCreated
            instance.getStudiesCreated(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getStudiesJoined', function(){
        it('should call getStudiesJoined successfully', function(done){
            //uncomment below and update the code to test getStudiesJoined
            instance.getStudiesJoined(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getStudy', function(){
        it('should call getStudy successfully', function(done){
            //uncomment below and update the code to test getStudy
            instance.getStudy(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('joinStudy', function(){
        it('should call joinStudy successfully', function(done){
            //uncomment below and update the code to test joinStudy
            instance.joinStudy(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postVote', function(){
        it('should call postVote successfully', function(done){
            //uncomment below and update the code to test postVote
            instance.postVote(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('publishStudy', function(){
        it('should call publishStudy successfully', function(done){
            //uncomment below and update the code to test publishStudy
            instance.publishStudy(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
