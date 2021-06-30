var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.GroupsApi();
});
describe('GroupsApi', function(){
    describe('getGroups', function(){
        it('should call getGroups successfully', function(done){
            //uncomment below and update the code to test getGroups
            instance.getGroups(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getGroupsMembers', function(){
        it('should call getGroupsMembers successfully', function(done){
            //uncomment below and update the code to test getGroupsMembers
            instance.getGroupsMembers(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postGroups', function(){
        it('should call postGroups successfully', function(done){
            //uncomment below and update the code to test postGroups
            instance.postGroups(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postGroupsMembers', function(){
        it('should call postGroupsMembers successfully', function(done){
            //uncomment below and update the code to test postGroupsMembers
            instance.postGroupsMembers(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
