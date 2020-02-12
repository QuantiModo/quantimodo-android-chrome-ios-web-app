var bugsnag = require('@bugsnag/js');
var bugsnagExpress = require('@bugsnag/plugin-express');
var bugsnagClient = bugsnag('ae7bc49d1285848342342bb5c321a2cf');
bugsnagClient.use(bugsnagExpress);
var express = require('express'),
    app = express();
var middleware = bugsnagClient.getPlugin('express');
// This must be the first piece of middleware in the stack.
// It can only capture errors in downstream middleware
app.use(middleware.requestHandler);
app.use(express.static('www'));
// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.status(404).send('what???');
});
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
// This handles any errors that Express catches
app.use(middleware.errorHandler);
