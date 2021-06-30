var expect = require('expect.js');
var Quantimodo = require('../../index');
var instance;
beforeEach(function(){
    instance = new Quantimodo.AppSettingsApi();
});
describe('AppSettingsApi', function(){
  describe('getAppSettings', function(){
    it('should call getAppSettings successfully', function(done){
      var expectedClientId = "medimodo";
      instance.getAppSettings({clientId: expectedClientId}, function(error, appSettingsResponse){
        if(error) throw error;
        var appSettings = appSettingsResponse.appSettings;
        var actualClientId = appSettings.clientId;
        expect(actualClientId).to.be(expectedClientId);
        var actualClientSecret = appSettings.clientSecret;
        expect(actualClientSecret).to.be(null);
        done();
      });
    });
  });
});