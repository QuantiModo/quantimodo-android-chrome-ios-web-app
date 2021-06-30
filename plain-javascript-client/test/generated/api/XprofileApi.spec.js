var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.XprofileApi();
});
describe('XprofileApi', function(){
    describe('getXprofileData', function(){
        it('should call getXprofileData successfully', function(done){
            //uncomment below and update the code to test getXprofileData
            instance.getXprofileData(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getXprofileFields', function(){
        it('should call getXprofileFields successfully', function(done){
            //uncomment below and update the code to test getXprofileFields
            instance.getXprofileFields(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getXprofileGroups', function(){
        it('should call getXprofileGroups successfully', function(done){
            //uncomment below and update the code to test getXprofileGroups
            instance.getXprofileGroups(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postXprofileData', function(){
        it('should call postXprofileData successfully', function(done){
            //uncomment below and update the code to test postXprofileData
            instance.postXprofileData(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postXprofileFields', function(){
        it('should call postXprofileFields successfully', function(done){
            //uncomment below and update the code to test postXprofileFields
            instance.postXprofileFields(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postXprofileGroups', function(){
        it('should call postXprofileGroups successfully', function(done){
            //uncomment below and update the code to test postXprofileGroups
            instance.postXprofileGroups(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
