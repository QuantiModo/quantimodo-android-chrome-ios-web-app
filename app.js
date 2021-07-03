var Bugsnag = require('@bugsnag/js')
var BugsnagPluginExpress = require('@bugsnag/plugin-express')
const {getenvOrException} = require("./ts/env-helper")
const {envs} = require("./ts/env-helper")
Bugsnag.start({
    apiKey: getenvOrException(envs.BUGSNAG_API_KEY),
    plugins: [BugsnagPluginExpress],
})
var express = require('express')
    var app = express()
var middleware = Bugsnag.getPlugin('express')
// This must be the first piece of middleware in the stack.
// It can only capture errors in downstream middleware
app.use(middleware.requestHandler)
app.use(express.static('src'))
// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    next()
})
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.status(404).send('what???')
})
app.set('port', process.env.PORT || 5000)
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'))
})
// This handles any errors that Express catches. This needs to go before other
// error handlers. Bugsnag will call the `next` error handler if it exists.
app.use(middleware.errorHandler)
