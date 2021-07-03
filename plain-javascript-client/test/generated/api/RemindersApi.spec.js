var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.RemindersApi();
});
describe('RemindersApi', function(){
    describe('deleteTrackingReminder', function(){
        it('should call deleteTrackingReminder successfully', function(done){
            //uncomment below and update the code to test deleteTrackingReminder
            instance.deleteTrackingReminder(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getTrackingReminderNotifications', function(){
        it('should call getTrackingReminderNotifications successfully', function(done){
            //uncomment below and update the code to test getTrackingReminderNotifications
            instance.getTrackingReminderNotifications(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getTrackingReminders', function(){
        it('should call getTrackingReminders successfully', function(done){
            //uncomment below and update the code to test getTrackingReminders
            instance.getTrackingReminders(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postTrackingReminderNotifications', function(){
        it('should call postTrackingReminderNotifications successfully', function(done){
            //uncomment below and update the code to test postTrackingReminderNotifications
            instance.postTrackingReminderNotifications(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postTrackingReminders', function(){
        it('should call postTrackingReminders successfully', function(done){
            //uncomment below and update the code to test postTrackingReminders
            instance.postTrackingReminders(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
