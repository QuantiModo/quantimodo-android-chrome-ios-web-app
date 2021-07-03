var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.UserApi();
});
describe('UserApi', function(){
    describe('deleteUser', function(){
        it('should call deleteUser successfully', function(done){
            //uncomment below and update the code to test deleteUser
            instance.deleteUser(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getUser', function(){
        it('should call getUser successfully', function(done){
            //uncomment below and update the code to test getUser
            instance.getUser(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getUserBlogs', function(){
        it('should call getUserBlogs successfully', function(done){
            //uncomment below and update the code to test getUserBlogs
            instance.getUserBlogs(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getUsers', function(){
        it('should call getUsers successfully', function(done){
            //uncomment below and update the code to test getUsers
            instance.getUsers(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postUserBlogs', function(){
        it('should call postUserBlogs successfully', function(done){
            //uncomment below and update the code to test postUserBlogs
            instance.postUserBlogs(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postUserSettings', function(){
        it('should call postUserSettings successfully', function(done){
            //uncomment below and update the code to test postUserSettings
            instance.postUserSettings(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
