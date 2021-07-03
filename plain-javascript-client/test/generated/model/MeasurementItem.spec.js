(function(root, factory){
    if(typeof define === 'function' && define.amd){
        // AMD.
        define(['expect.js', '../../src/index'], factory);
    }else if(typeof module === 'object' && module.exports){
        // CommonJS-like environments that support module.exports, like Node.
        factory(require('expect.js'), require('../../src/index'));
    }else{
        // Browser globals (root is window)
        factory(root.expect, root.Quantimodo);
    }
}(this, function(expect, Quantimodo){
    'use strict';
    var instance;
    beforeEach(function(){
        instance = new Quantimodo.MeasurementItem();
    });
    describe('MeasurementItem', function(){
        it('should create an instance of MeasurementItem', function(){
            // uncomment below and update the code to test MeasurementItem
            var instance = new Quantimodo.MeasurementItem();
            expect(instance).to.be.a(Quantimodo.MeasurementItem);
        });
        it('should have the property note (base name: "note")', function(){
            // uncomment below and update the code to test the property note
            //var instance = new Quantimodo.MeasurementItem();
            //expect(instance).to.be();
        });
        it('should have the property timestamp (base name: "timestamp")', function(){
            // uncomment below and update the code to test the property timestamp
            //var instance = new Quantimodo.MeasurementItem();
            //expect(instance).to.be();
        });
        it('should have the property value (base name: "value")', function(){
            // uncomment below and update the code to test the property value
            //var instance = new Quantimodo.MeasurementItem();
            //expect(instance).to.be();
        });
    });
