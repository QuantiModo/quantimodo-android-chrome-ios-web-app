(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

    const package = require('../package.json');
    window.ChatEngineCore.plugin[package.name] = require('../src/plugin.js');

})();

},{"../package.json":2,"../src/plugin.js":3}],2:[function(require,module,exports){
module.exports={
  "author": "Ian Jennings",
  "name": "chat-engine-typing-indicator",
  "version": "0.0.6",
  "main": "src/plugin.js",
  "dependencies": {
    "chat-engine": "^0.5.2"
  }
}

},{}],3:[function(require,module,exports){
/**
* @module chat-engine-typing-indicator
* @requires {@link ChatEngine}
*/

/**
* @function
* @param {Object} [config] The plugin config object
* @param {Integer} [config.timeout] Fires the "stopTyping" event if have not typed within this setting. Milliseconds.
*/
module.exports = (config = {}) => {

    // set the default for typing
    // if the client types input, we wont fire "stopTyping" unless the client
    // doesn't type anything for this timeout
    config.timeout = config.timeout || 1000;

    // create a place to store the setTimeout in
    let stopTypingTimeout = null;

    // define the methods that will be attached to the class Chat
    class extension  {
        construct() {

            // will set Chat.typing.isTyping to false immediately
            this.isTyping = false;

        }

        /**
        @method typingindicator"."startTyping
        @ceextends Chat
        */
        startTyping() {

            // this is called manually by the client

            // set boolean that we're in middle of typing
            this.isTyping = true;

            /**
            @event $typingIndicator.startTyping
            @ceextends Chat
            */
            // emit an event over the network that this user started typing
            //
            /**
            broadcast a stoptyping event
            @event $typingIndiciator"."startTyping
            @ceextends Chat
            */
            this.parent.emit(['$' + 'typingIndicator', 'startTyping'].join('.'));

            // kill any existing timeouts
            clearTimeout(stopTypingTimeout);

            // create a new timeout
            stopTypingTimeout = setTimeout (() => {

                // trigger stop typing after a set amount of time
                this.stopTyping();

            }, config.timeout);

        }

        /**
        @method typingindicator"."stopTyping
        @ceextends Chat
        */
        stopTyping() {

            // we must be currently typing to stop typing
            // if(this.isTyping) {

                // remove the timeout
                clearTimeout(stopTypingTimeout);

                /**
                broadcast a stoptyping event
                @event $typingIndiciator"."stopTyping
                @ceextends Chat
                */
                this.parent.emit(['$' + 'typingIndicator', 'stopTyping'].join('.'));

                // stop typing indicator
                this.isTyping = false;

            // }

        }
    }

    // define emit middleware
    let emit = {
        message: (payload, next) => {

            // it's worth noting here, we can't access ```extension``` here
            // because this function runs in a different context

            // on every message, tell the chat to stop typing
            payload.chat.typingIndicator.stopTyping();

            // continue on
            next(null, payload);
        }
    };

    // define both the extended methods and the middleware in our plugin
    return {
        namespace: 'typingIndicator',
        extends: {
            Chat: extension
        },
        middleware: {
            emit
        }
    }


};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4wL2xpYi9ub2RlX21vZHVsZXMvY2hhdC1lbmdpbmUtcGx1Z2luL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIudG1wL3dyYXAuanMiLCJwYWNrYWdlLmpzb24iLCJzcmMvcGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBjb25zdCBwYWNrYWdlID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG4gICAgd2luZG93LkNoYXRFbmdpbmVDb3JlLnBsdWdpbltwYWNrYWdlLm5hbWVdID0gcmVxdWlyZSgnLi4vc3JjL3BsdWdpbi5qcycpO1xuXG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImF1dGhvclwiOiBcIklhbiBKZW5uaW5nc1wiLFxuICBcIm5hbWVcIjogXCJjaGF0LWVuZ2luZS10eXBpbmctaW5kaWNhdG9yXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMC42XCIsXG4gIFwibWFpblwiOiBcInNyYy9wbHVnaW4uanNcIixcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiY2hhdC1lbmdpbmVcIjogXCJeMC41LjJcIlxuICB9XG59XG4iLCIvKipcbiogQG1vZHVsZSBjaGF0LWVuZ2luZS10eXBpbmctaW5kaWNhdG9yXG4qIEByZXF1aXJlcyB7QGxpbmsgQ2hhdEVuZ2luZX1cbiovXG5cbi8qKlxuKiBAZnVuY3Rpb25cbiogQHBhcmFtIHtPYmplY3R9IFtjb25maWddIFRoZSBwbHVnaW4gY29uZmlnIG9iamVjdFxuKiBAcGFyYW0ge0ludGVnZXJ9IFtjb25maWcudGltZW91dF0gRmlyZXMgdGhlIFwic3RvcFR5cGluZ1wiIGV2ZW50IGlmIGhhdmUgbm90IHR5cGVkIHdpdGhpbiB0aGlzIHNldHRpbmcuIE1pbGxpc2Vjb25kcy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IChjb25maWcgPSB7fSkgPT4ge1xuXG4gICAgLy8gc2V0IHRoZSBkZWZhdWx0IGZvciB0eXBpbmdcbiAgICAvLyBpZiB0aGUgY2xpZW50IHR5cGVzIGlucHV0LCB3ZSB3b250IGZpcmUgXCJzdG9wVHlwaW5nXCIgdW5sZXNzIHRoZSBjbGllbnRcbiAgICAvLyBkb2Vzbid0IHR5cGUgYW55dGhpbmcgZm9yIHRoaXMgdGltZW91dFxuICAgIGNvbmZpZy50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQgfHwgMTAwMDtcblxuICAgIC8vIGNyZWF0ZSBhIHBsYWNlIHRvIHN0b3JlIHRoZSBzZXRUaW1lb3V0IGluXG4gICAgbGV0IHN0b3BUeXBpbmdUaW1lb3V0ID0gbnVsbDtcblxuICAgIC8vIGRlZmluZSB0aGUgbWV0aG9kcyB0aGF0IHdpbGwgYmUgYXR0YWNoZWQgdG8gdGhlIGNsYXNzIENoYXRcbiAgICBjbGFzcyBleHRlbnNpb24gIHtcbiAgICAgICAgY29uc3RydWN0KCkge1xuXG4gICAgICAgICAgICAvLyB3aWxsIHNldCBDaGF0LnR5cGluZy5pc1R5cGluZyB0byBmYWxzZSBpbW1lZGlhdGVseVxuICAgICAgICAgICAgdGhpcy5pc1R5cGluZyA9IGZhbHNlO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgQG1ldGhvZCB0eXBpbmdpbmRpY2F0b3JcIi5cInN0YXJ0VHlwaW5nXG4gICAgICAgIEBjZWV4dGVuZHMgQ2hhdFxuICAgICAgICAqL1xuICAgICAgICBzdGFydFR5cGluZygpIHtcblxuICAgICAgICAgICAgLy8gdGhpcyBpcyBjYWxsZWQgbWFudWFsbHkgYnkgdGhlIGNsaWVudFxuXG4gICAgICAgICAgICAvLyBzZXQgYm9vbGVhbiB0aGF0IHdlJ3JlIGluIG1pZGRsZSBvZiB0eXBpbmdcbiAgICAgICAgICAgIHRoaXMuaXNUeXBpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEBldmVudCAkdHlwaW5nSW5kaWNhdG9yLnN0YXJ0VHlwaW5nXG4gICAgICAgICAgICBAY2VleHRlbmRzIENoYXRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICAvLyBlbWl0IGFuIGV2ZW50IG92ZXIgdGhlIG5ldHdvcmsgdGhhdCB0aGlzIHVzZXIgc3RhcnRlZCB0eXBpbmdcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIGJyb2FkY2FzdCBhIHN0b3B0eXBpbmcgZXZlbnRcbiAgICAgICAgICAgIEBldmVudCAkdHlwaW5nSW5kaWNpYXRvclwiLlwic3RhcnRUeXBpbmdcbiAgICAgICAgICAgIEBjZWV4dGVuZHMgQ2hhdFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoWyckJyArICd0eXBpbmdJbmRpY2F0b3InLCAnc3RhcnRUeXBpbmcnXS5qb2luKCcuJykpO1xuXG4gICAgICAgICAgICAvLyBraWxsIGFueSBleGlzdGluZyB0aW1lb3V0c1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHN0b3BUeXBpbmdUaW1lb3V0KTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IHRpbWVvdXRcbiAgICAgICAgICAgIHN0b3BUeXBpbmdUaW1lb3V0ID0gc2V0VGltZW91dCAoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBzdG9wIHR5cGluZyBhZnRlciBhIHNldCBhbW91bnQgb2YgdGltZVxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcFR5cGluZygpO1xuXG4gICAgICAgICAgICB9LCBjb25maWcudGltZW91dCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBAbWV0aG9kIHR5cGluZ2luZGljYXRvclwiLlwic3RvcFR5cGluZ1xuICAgICAgICBAY2VleHRlbmRzIENoYXRcbiAgICAgICAgKi9cbiAgICAgICAgc3RvcFR5cGluZygpIHtcblxuICAgICAgICAgICAgLy8gd2UgbXVzdCBiZSBjdXJyZW50bHkgdHlwaW5nIHRvIHN0b3AgdHlwaW5nXG4gICAgICAgICAgICAvLyBpZih0aGlzLmlzVHlwaW5nKSB7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHRpbWVvdXRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc3RvcFR5cGluZ1RpbWVvdXQpO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgYnJvYWRjYXN0IGEgc3RvcHR5cGluZyBldmVudFxuICAgICAgICAgICAgICAgIEBldmVudCAkdHlwaW5nSW5kaWNpYXRvclwiLlwic3RvcFR5cGluZ1xuICAgICAgICAgICAgICAgIEBjZWV4dGVuZHMgQ2hhdFxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdChbJyQnICsgJ3R5cGluZ0luZGljYXRvcicsICdzdG9wVHlwaW5nJ10uam9pbignLicpKTtcblxuICAgICAgICAgICAgICAgIC8vIHN0b3AgdHlwaW5nIGluZGljYXRvclxuICAgICAgICAgICAgICAgIHRoaXMuaXNUeXBpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZWZpbmUgZW1pdCBtaWRkbGV3YXJlXG4gICAgbGV0IGVtaXQgPSB7XG4gICAgICAgIG1lc3NhZ2U6IChwYXlsb2FkLCBuZXh0KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIGl0J3Mgd29ydGggbm90aW5nIGhlcmUsIHdlIGNhbid0IGFjY2VzcyBgYGBleHRlbnNpb25gYGAgaGVyZVxuICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGlzIGZ1bmN0aW9uIHJ1bnMgaW4gYSBkaWZmZXJlbnQgY29udGV4dFxuXG4gICAgICAgICAgICAvLyBvbiBldmVyeSBtZXNzYWdlLCB0ZWxsIHRoZSBjaGF0IHRvIHN0b3AgdHlwaW5nXG4gICAgICAgICAgICBwYXlsb2FkLmNoYXQudHlwaW5nSW5kaWNhdG9yLnN0b3BUeXBpbmcoKTtcblxuICAgICAgICAgICAgLy8gY29udGludWUgb25cbiAgICAgICAgICAgIG5leHQobnVsbCwgcGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gZGVmaW5lIGJvdGggdGhlIGV4dGVuZGVkIG1ldGhvZHMgYW5kIHRoZSBtaWRkbGV3YXJlIGluIG91ciBwbHVnaW5cbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lc3BhY2U6ICd0eXBpbmdJbmRpY2F0b3InLFxuICAgICAgICBleHRlbmRzOiB7XG4gICAgICAgICAgICBDaGF0OiBleHRlbnNpb25cbiAgICAgICAgfSxcbiAgICAgICAgbWlkZGxld2FyZToge1xuICAgICAgICAgICAgZW1pdFxuICAgICAgICB9XG4gICAgfVxuXG5cbn07XG4iXX0=
