var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.NotificationsApi();
});
describe('NotificationsApi', function(){
    describe('getNotificationPreferences', function(){
        it('should call getNotificationPreferences successfully', function(done){
            //uncomment below and update the code to test getNotificationPreferences
            instance.getNotificationPreferences(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getNotifications', function(){
        it('should call getNotifications successfully', function(done){
            //uncomment below and update the code to test getNotifications
            instance.getNotifications(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postDeviceToken', function(){
        it('should call postDeviceToken successfully', function(done){
            //uncomment below and update the code to test postDeviceToken
            instance.postDeviceToken(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postNotifications', function(){
        it('should call postNotifications successfully', function(done){
            //uncomment below and update the code to test postNotifications
            instance.postNotifications(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
