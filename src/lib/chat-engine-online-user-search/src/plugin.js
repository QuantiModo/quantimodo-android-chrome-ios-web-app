/**
* Searches a {@link Chat} for a {@link User} with a ```state.username``` containing a given string.
* @module chat-engine-online-user-search
*/

const dotty = require('dotty');

/**
* @function
* @param {Object} [config] The config object
* @param {String} [prop="username"] The {@link User#state} property to use for string matching
* @param {Boolean} [caseSensitive=false] Enable to consider ```config.prop``` character case when searching.
* @example
* chat = new ChatEngine.Chat('markdown-chat');
* chat.plugin(onlineUserSearch({}));
* let foundUsers = chat.search('red');
*/
module.exports = (config = {}) => {

    config = config || {};
    config.prop = config.prop || 'username';
    config.caseSensitive = config.caseSensitive || false;

    // these are new methods that will be added to the extended class

    /**
    * @method  search
    * @ceextends Chat
    * @param {String} needle The username to search for.
    * @returns {Array} An array of {@link User}s that match the input string.
    */
    class extension {
      search(needle) {

          // an empty array of users we found
          var returnList = [];

          if(config.caseSensitive) {
              needle = needle.toLowerCase();
          }

          // for every user that the parent chat knows about
          for(var key in this.parent.users) {

              let haystack  = this.parent.users[key].state;
              let target = dotty.get(haystack, config.prop);

              // see if that user username includes the input text
              if(haystack && target) {

                  if(!config.caseSensitive) {
                      target = target.toLowerCase();
                  }

                  if(target.indexOf(needle) > -1) {

                      // if it does, add it to the list of returned users
                      returnList.push(this.parent.users[key]);

                  }
              }

          }

          // return all found users
          return returnList;

      }
    }

    // add this plugin to the Chat classes
    return {
      namespace: 'onlineUserSearch',
      extends: {
          Chat: extension
      }
    }


}
