var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.VariablesApi();
});
describe('VariablesApi', function(){
    describe('deleteUserTag', function(){
        it('should call deleteUserTag successfully', function(done){
            //uncomment below and update the code to test deleteUserTag
            instance.deleteUserTag(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('deleteUserVariable', function(){
        it('should call deleteUserVariable successfully', function(done){
            //uncomment below and update the code to test deleteUserVariable
            instance.deleteUserVariable(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getVariableCategories', function(){
        it('should call getVariableCategories successfully', function(done){
            //uncomment below and update the code to test getVariableCategories
            instance.getVariableCategories(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getVariables', function(){
        it('should call getVariables successfully', function(done){
            //uncomment below and update the code to test getVariables
            instance.getVariables(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postUserTags', function(){
        it('should call postUserTags successfully', function(done){
            //uncomment below and update the code to test postUserTags
            instance.postUserTags(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postUserVariables', function(){
        it('should call postUserVariables successfully', function(done){
            //uncomment below and update the code to test postUserVariables
            instance.postUserVariables(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('resetUserVariableSettings', function(){
        it('should call resetUserVariableSettings successfully', function(done){
            //uncomment below and update the code to test resetUserVariableSettings
            instance.resetUserVariableSettings(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
