var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.MessagesApi();
});
describe('MessagesApi', function(){
    describe('getMessagesMessages', function(){
        it('should call getMessagesMessages successfully', function(done){
            //uncomment below and update the code to test getMessagesMessages
            instance.getMessagesMessages(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getMessagesNotices', function(){
        it('should call getMessagesNotices successfully', function(done){
            //uncomment below and update the code to test getMessagesNotices
            instance.getMessagesNotices(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getMessagesRecipients', function(){
        it('should call getMessagesRecipients successfully', function(done){
            //uncomment below and update the code to test getMessagesRecipients
            instance.getMessagesRecipients(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postMessagesMessages', function(){
        it('should call postMessagesMessages successfully', function(done){
            //uncomment below and update the code to test postMessagesMessages
            instance.postMessagesMessages(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postMessagesNotices', function(){
        it('should call postMessagesNotices successfully', function(done){
            //uncomment below and update the code to test postMessagesNotices
            instance.postMessagesNotices(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postMessagesRecipients', function(){
        it('should call postMessagesRecipients successfully', function(done){
            //uncomment below and update the code to test postMessagesRecipients
            instance.postMessagesRecipients(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
