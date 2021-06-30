var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.MeasurementsApi();
});
describe('MeasurementsApi', function(){
    describe('deleteMeasurement', function(){
        it('should call deleteMeasurement successfully', function(done){
            //uncomment below and update the code to test deleteMeasurement
            instance.deleteMeasurement(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('getMeasurements', function(){
        it('should call getMeasurements successfully', function(done){
            instance.getMeasurements(function(error){
                if(error) throw error;
                expect().to.be();
            });
            done();
        });
    });
    describe('getPairs', function(){
        it('should call getPairs successfully', function(done){
            //uncomment below and update the code to test getPairs
            instance.getPairs(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('measurementExportRequest', function(){
        it('should call measurementExportRequest successfully', function(done){
            //uncomment below and update the code to test measurementExportRequest
            instance.measurementExportRequest(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('postMeasurements', function(){
        it('should call postMeasurements successfully', function(done){
            //uncomment below and update the code to test postMeasurements
            instance.postMeasurements(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
    describe('updateMeasurement', function(){
        it('should call updateMeasurement successfully', function(done){
            //uncomment below and update the code to test updateMeasurement
            instance.updateMeasurement(function(error, response){
                if(error) throw error;
                expect(response).to.be();
                done();
            });
        });
    });
});
