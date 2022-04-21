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
