var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.ConnectorsApi();
});
describe('ConnectorsApi', function(){
    describe('connectConnector', function(){
        it('should call connectConnector successfully', function(done){
            //uncomment below and update the code to test connectConnector
            instance.connectConnector(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('disconnectConnector', function(){
        it('should call disconnectConnector successfully', function(done){
            //uncomment below and update the code to test disconnectConnector
            instance.disconnectConnector(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getConnectors', function(){
        it('should call getConnectors successfully', function(done){
            //uncomment below and update the code to test getConnectors
            instance.getConnectors(function(error, GetConnectorsResponse){
                if(error) throw error;
                var connectors = GetConnectorsResponse.connectorList;
                expect(connectors.length).to.be.above(3);
                done();
            });
        });
    });
    describe('getIntegrationJs', function(){
        it('should call getIntegrationJs successfully', function(done){
            //uncomment below and update the code to test getIntegrationJs
            instance.getIntegrationJs(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getMobileConnectPage', function(){
        it('should call getMobileConnectPage successfully', function(done){
            //uncomment below and update the code to test getMobileConnectPage
            instance.getMobileConnectPage(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('updateConnector', function(){
        it('should call updateConnector successfully', function(done){
            //uncomment below and update the code to test updateConnector
            instance.updateConnector(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});