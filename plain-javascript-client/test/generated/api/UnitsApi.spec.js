const expect = require('expect.js'), Quantimodo = require('../../src/index');
'use strict';
let instance;
beforeEach(function(){
    instance = new Quantimodo.UnitsApi();
});
describe('UnitsApi', function(){
    describe('getUnitCategories', function(){
        it('should call getUnitCategories successfully', function(done){
            //uncomment below and update the code to test getUnitCategories
            instance.getUnitCategories(function(error, data){
                if(error) throw error;
                expect(data).to.be.an('array');
                expect(data).to.have.length(13);
                done();
            });
        });
    });
    describe('getUnits', function(){
        it('should call getUnits successfully', function(done){
            //uncomment below and update the code to test getUnits
            instance.getUnits(function(error, data){
                if(error) throw error;
                expect(data).to.be.an('array');
                expect(data).to.have.length(62);
                done();
            });
        });
    });
});