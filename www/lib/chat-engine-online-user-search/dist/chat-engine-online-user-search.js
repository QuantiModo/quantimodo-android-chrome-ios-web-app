(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

    const package = require('../package.json');
    window.ChatEngineCore.plugin[package.name] = require('../src/plugin.js');

})();

},{"../package.json":3,"../src/plugin.js":4}],2:[function(require,module,exports){
//
// Dotty makes it easy to programmatically access arbitrarily nested objects and
// their properties.
//

//
// `object` is an object, `path` is the path to the property you want to check
// for existence of.
//
// `path` can be provided as either a `"string.separated.with.dots"` or as
// `["an", "array"]`.
//
// Returns `true` if the path can be completely resolved, `false` otherwise.
//

var exists = module.exports.exists = function exists(object, path) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return false;
  }

  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return false;
  }

  if (path.length === 0) {
    return Object.hasOwnProperty.apply(object, [key]);
  } else {
    return exists(object[key], path);
  }
};

//
// These arguments are the same as those for `exists`.
//
// The return value, however, is the property you're trying to access, or
// `undefined` if it can't be found. This means you won't be able to tell
// the difference between an unresolved path and an undefined property, so you 
// should not use `get` to check for the existence of a property. Use `exists`
// instead.
//

var get = module.exports.get = function get(object, path) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return;
  }

  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return;
  }

  if (path.length === 0) {
    return object[key];
  }

  if (path.length) {
    return get(object[key], path);
  }
};

//
// Arguments are similar to `exists` and `get`, with the exception that path
// components are regexes with some special cases. If a path component is `"*"`
// on its own, it'll be converted to `/.*/`.
//
// The return value is an array of values where the key path matches the
// specified criterion. If none match, an empty array will be returned.
//

var search = module.exports.search = function search(object, path) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return;
  }

  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return;
  }

  if (key === "*") {
    key = ".*";
  }

  if (typeof key === "string") {
    key = new RegExp(key);
  }

  if (path.length === 0) {
    return Object.keys(object).filter(key.test.bind(key)).map(function(k) { return object[k]; });
  } else {
    return Array.prototype.concat.apply([], Object.keys(object).filter(key.test.bind(key)).map(function(k) { return search(object[k], path); }));
  }
};

//
// The first two arguments for `put` are the same as `exists` and `get`.
//
// The third argument is a value to `put` at the `path` of the `object`.
// Objects in the middle will be created if they don't exist, or added to if
// they do. If a value is encountered in the middle of the path that is *not*
// an object, it will not be overwritten.
//
// The return value is `true` in the case that the value was `put`
// successfully, or `false` otherwise.
//

var put = module.exports.put = function put(object, path, value) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return false;
  }
  
  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return false;
  }

  if (path.length === 0) {
    object[key] = value;
  } else {
    if (typeof object[key] === "undefined") {
      object[key] = {};
    }

    if (typeof object[key] !== "object" || object[key] === null) {
      return false;
    }

    return put(object[key], path, value);
  }
};

//
// `remove` is like `put` in reverse!
//
// The return value is `true` in the case that the value existed and was removed
// successfully, or `false` otherwise.
//

var remove = module.exports.remove = function remove(object, path, value) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return false;
  }
  
  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return false;
  }

  if (path.length === 0) {
    if (!Object.hasOwnProperty.call(object, key)) {
      return false;
    }

    delete object[key];

    return true;
  } else {
    return remove(object[key], path, value);
  }
};

//
// `deepKeys` creates a list of all possible key paths for a given object.
//
// The return value is always an array, the members of which are paths in array
// format. If you want them in dot-notation format, do something like this:
//
// ```js
// dotty.deepKeys(obj).map(function(e) {
//   return e.join(".");
// });
// ```
//
// *Note: this will probably explode on recursive objects. Be careful.*
//

var deepKeys = module.exports.deepKeys = function deepKeys(object, prefix) {
  if (typeof prefix === "undefined") {
    prefix = [];
  }

  var keys = [];

  for (var k in object) {
    if (!Object.hasOwnProperty.call(object, k)) {
      continue;
    }

    keys.push(prefix.concat([k]));

    if (typeof object[k] === "object" && object[k] !== null) {
      keys = keys.concat(deepKeys(object[k], prefix.concat([k])));
    }
  }

  return keys;
};

},{}],3:[function(require,module,exports){
module.exports={
  "author": "Ian Jennings",
  "name": "chat-engine-online-user-search",
  "version": "0.0.7",
  "main": "src/plugin.js",
  "dependencies": {
    "chat-engine": "^0.5.2",
    "dotty": "0.0.2"
  }
}

},{}],4:[function(require,module,exports){
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

},{"dotty":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4wL2xpYi9ub2RlX21vZHVsZXMvY2hhdC1lbmdpbmUtcGx1Z2luL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIudG1wL3dyYXAuanMiLCJub2RlX21vZHVsZXMvZG90dHkvbGliL2luZGV4LmpzIiwicGFja2FnZS5qc29uIiwic3JjL3BsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgcGFja2FnZSA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuICAgIHdpbmRvdy5DaGF0RW5naW5lQ29yZS5wbHVnaW5bcGFja2FnZS5uYW1lXSA9IHJlcXVpcmUoJy4uL3NyYy9wbHVnaW4uanMnKTtcblxufSkoKTtcbiIsIi8vXG4vLyBEb3R0eSBtYWtlcyBpdCBlYXN5IHRvIHByb2dyYW1tYXRpY2FsbHkgYWNjZXNzIGFyYml0cmFyaWx5IG5lc3RlZCBvYmplY3RzIGFuZFxuLy8gdGhlaXIgcHJvcGVydGllcy5cbi8vXG5cbi8vXG4vLyBgb2JqZWN0YCBpcyBhbiBvYmplY3QsIGBwYXRoYCBpcyB0aGUgcGF0aCB0byB0aGUgcHJvcGVydHkgeW91IHdhbnQgdG8gY2hlY2tcbi8vIGZvciBleGlzdGVuY2Ugb2YuXG4vL1xuLy8gYHBhdGhgIGNhbiBiZSBwcm92aWRlZCBhcyBlaXRoZXIgYSBgXCJzdHJpbmcuc2VwYXJhdGVkLndpdGguZG90c1wiYCBvciBhc1xuLy8gYFtcImFuXCIsIFwiYXJyYXlcIl1gLlxuLy9cbi8vIFJldHVybnMgYHRydWVgIGlmIHRoZSBwYXRoIGNhbiBiZSBjb21wbGV0ZWx5IHJlc29sdmVkLCBgZmFsc2VgIG90aGVyd2lzZS5cbi8vXG5cbnZhciBleGlzdHMgPSBtb2R1bGUuZXhwb3J0cy5leGlzdHMgPSBmdW5jdGlvbiBleGlzdHMob2JqZWN0LCBwYXRoKSB7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgfVxuXG4gIGlmICghKHBhdGggaW5zdGFuY2VvZiBBcnJheSkgfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwYXRoID0gcGF0aC5zbGljZSgpO1xuXG4gIHZhciBrZXkgPSBwYXRoLnNoaWZ0KCk7XG5cbiAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIgfHwgb2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5hcHBseShvYmplY3QsIFtrZXldKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZXhpc3RzKG9iamVjdFtrZXldLCBwYXRoKTtcbiAgfVxufTtcblxuLy9cbi8vIFRoZXNlIGFyZ3VtZW50cyBhcmUgdGhlIHNhbWUgYXMgdGhvc2UgZm9yIGBleGlzdHNgLlxuLy9cbi8vIFRoZSByZXR1cm4gdmFsdWUsIGhvd2V2ZXIsIGlzIHRoZSBwcm9wZXJ0eSB5b3UncmUgdHJ5aW5nIHRvIGFjY2Vzcywgb3Jcbi8vIGB1bmRlZmluZWRgIGlmIGl0IGNhbid0IGJlIGZvdW5kLiBUaGlzIG1lYW5zIHlvdSB3b24ndCBiZSBhYmxlIHRvIHRlbGxcbi8vIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gYW4gdW5yZXNvbHZlZCBwYXRoIGFuZCBhbiB1bmRlZmluZWQgcHJvcGVydHksIHNvIHlvdSBcbi8vIHNob3VsZCBub3QgdXNlIGBnZXRgIHRvIGNoZWNrIGZvciB0aGUgZXhpc3RlbmNlIG9mIGEgcHJvcGVydHkuIFVzZSBgZXhpc3RzYFxuLy8gaW5zdGVhZC5cbi8vXG5cbnZhciBnZXQgPSBtb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwYXRoKSB7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgfVxuXG4gIGlmICghKHBhdGggaW5zdGFuY2VvZiBBcnJheSkgfHwgcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBwYXRoID0gcGF0aC5zbGljZSgpO1xuXG4gIHZhciBrZXkgPSBwYXRoLnNoaWZ0KCk7XG5cbiAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIgfHwgb2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iamVjdFtrZXldO1xuICB9XG5cbiAgaWYgKHBhdGgubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGdldChvYmplY3Rba2V5XSwgcGF0aCk7XG4gIH1cbn07XG5cbi8vXG4vLyBBcmd1bWVudHMgYXJlIHNpbWlsYXIgdG8gYGV4aXN0c2AgYW5kIGBnZXRgLCB3aXRoIHRoZSBleGNlcHRpb24gdGhhdCBwYXRoXG4vLyBjb21wb25lbnRzIGFyZSByZWdleGVzIHdpdGggc29tZSBzcGVjaWFsIGNhc2VzLiBJZiBhIHBhdGggY29tcG9uZW50IGlzIGBcIipcImBcbi8vIG9uIGl0cyBvd24sIGl0J2xsIGJlIGNvbnZlcnRlZCB0byBgLy4qL2AuXG4vL1xuLy8gVGhlIHJldHVybiB2YWx1ZSBpcyBhbiBhcnJheSBvZiB2YWx1ZXMgd2hlcmUgdGhlIGtleSBwYXRoIG1hdGNoZXMgdGhlXG4vLyBzcGVjaWZpZWQgY3JpdGVyaW9uLiBJZiBub25lIG1hdGNoLCBhbiBlbXB0eSBhcnJheSB3aWxsIGJlIHJldHVybmVkLlxuLy9cblxudmFyIHNlYXJjaCA9IG1vZHVsZS5leHBvcnRzLnNlYXJjaCA9IGZ1bmN0aW9uIHNlYXJjaChvYmplY3QsIHBhdGgpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSBcInN0cmluZ1wiKSB7XG4gICAgcGF0aCA9IHBhdGguc3BsaXQoXCIuXCIpO1xuICB9XG5cbiAgaWYgKCEocGF0aCBpbnN0YW5jZW9mIEFycmF5KSB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHBhdGggPSBwYXRoLnNsaWNlKCk7XG5cbiAgdmFyIGtleSA9IHBhdGguc2hpZnQoKTtcblxuICBpZiAodHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIiB8fCBvYmplY3QgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoa2V5ID09PSBcIipcIikge1xuICAgIGtleSA9IFwiLipcIjtcbiAgfVxuXG4gIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiKSB7XG4gICAga2V5ID0gbmV3IFJlZ0V4cChrZXkpO1xuICB9XG5cbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdCkuZmlsdGVyKGtleS50ZXN0LmJpbmQoa2V5KSkubWFwKGZ1bmN0aW9uKGspIHsgcmV0dXJuIG9iamVjdFtrXTsgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIE9iamVjdC5rZXlzKG9iamVjdCkuZmlsdGVyKGtleS50ZXN0LmJpbmQoa2V5KSkubWFwKGZ1bmN0aW9uKGspIHsgcmV0dXJuIHNlYXJjaChvYmplY3Rba10sIHBhdGgpOyB9KSk7XG4gIH1cbn07XG5cbi8vXG4vLyBUaGUgZmlyc3QgdHdvIGFyZ3VtZW50cyBmb3IgYHB1dGAgYXJlIHRoZSBzYW1lIGFzIGBleGlzdHNgIGFuZCBgZ2V0YC5cbi8vXG4vLyBUaGUgdGhpcmQgYXJndW1lbnQgaXMgYSB2YWx1ZSB0byBgcHV0YCBhdCB0aGUgYHBhdGhgIG9mIHRoZSBgb2JqZWN0YC5cbi8vIE9iamVjdHMgaW4gdGhlIG1pZGRsZSB3aWxsIGJlIGNyZWF0ZWQgaWYgdGhleSBkb24ndCBleGlzdCwgb3IgYWRkZWQgdG8gaWZcbi8vIHRoZXkgZG8uIElmIGEgdmFsdWUgaXMgZW5jb3VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgcGF0aCB0aGF0IGlzICpub3QqXG4vLyBhbiBvYmplY3QsIGl0IHdpbGwgbm90IGJlIG92ZXJ3cml0dGVuLlxuLy9cbi8vIFRoZSByZXR1cm4gdmFsdWUgaXMgYHRydWVgIGluIHRoZSBjYXNlIHRoYXQgdGhlIHZhbHVlIHdhcyBgcHV0YFxuLy8gc3VjY2Vzc2Z1bGx5LCBvciBgZmFsc2VgIG90aGVyd2lzZS5cbi8vXG5cbnZhciBwdXQgPSBtb2R1bGUuZXhwb3J0cy5wdXQgPSBmdW5jdGlvbiBwdXQob2JqZWN0LCBwYXRoLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHBhdGggPT09IFwic3RyaW5nXCIpIHtcbiAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gIH1cblxuICBpZiAoIShwYXRoIGluc3RhbmNlb2YgQXJyYXkpIHx8IHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICBwYXRoID0gcGF0aC5zbGljZSgpO1xuXG4gIHZhciBrZXkgPSBwYXRoLnNoaWZ0KCk7XG5cbiAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIgfHwgb2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdFtrZXldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IHt9O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb2JqZWN0W2tleV0gIT09IFwib2JqZWN0XCIgfHwgb2JqZWN0W2tleV0gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHV0KG9iamVjdFtrZXldLCBwYXRoLCB2YWx1ZSk7XG4gIH1cbn07XG5cbi8vXG4vLyBgcmVtb3ZlYCBpcyBsaWtlIGBwdXRgIGluIHJldmVyc2UhXG4vL1xuLy8gVGhlIHJldHVybiB2YWx1ZSBpcyBgdHJ1ZWAgaW4gdGhlIGNhc2UgdGhhdCB0aGUgdmFsdWUgZXhpc3RlZCBhbmQgd2FzIHJlbW92ZWRcbi8vIHN1Y2Nlc3NmdWxseSwgb3IgYGZhbHNlYCBvdGhlcndpc2UuXG4vL1xuXG52YXIgcmVtb3ZlID0gbW9kdWxlLmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKG9iamVjdCwgcGF0aCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSBcInN0cmluZ1wiKSB7XG4gICAgcGF0aCA9IHBhdGguc3BsaXQoXCIuXCIpO1xuICB9XG5cbiAgaWYgKCEocGF0aCBpbnN0YW5jZW9mIEFycmF5KSB8fCBwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgcGF0aCA9IHBhdGguc2xpY2UoKTtcblxuICB2YXIga2V5ID0gcGF0aC5zaGlmdCgpO1xuXG4gIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSBcIm9iamVjdFwiIHx8IG9iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9iamVjdFtrZXldO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlbW92ZShvYmplY3Rba2V5XSwgcGF0aCwgdmFsdWUpO1xuICB9XG59O1xuXG4vL1xuLy8gYGRlZXBLZXlzYCBjcmVhdGVzIGEgbGlzdCBvZiBhbGwgcG9zc2libGUga2V5IHBhdGhzIGZvciBhIGdpdmVuIG9iamVjdC5cbi8vXG4vLyBUaGUgcmV0dXJuIHZhbHVlIGlzIGFsd2F5cyBhbiBhcnJheSwgdGhlIG1lbWJlcnMgb2Ygd2hpY2ggYXJlIHBhdGhzIGluIGFycmF5XG4vLyBmb3JtYXQuIElmIHlvdSB3YW50IHRoZW0gaW4gZG90LW5vdGF0aW9uIGZvcm1hdCwgZG8gc29tZXRoaW5nIGxpa2UgdGhpczpcbi8vXG4vLyBgYGBqc1xuLy8gZG90dHkuZGVlcEtleXMob2JqKS5tYXAoZnVuY3Rpb24oZSkge1xuLy8gICByZXR1cm4gZS5qb2luKFwiLlwiKTtcbi8vIH0pO1xuLy8gYGBgXG4vL1xuLy8gKk5vdGU6IHRoaXMgd2lsbCBwcm9iYWJseSBleHBsb2RlIG9uIHJlY3Vyc2l2ZSBvYmplY3RzLiBCZSBjYXJlZnVsLipcbi8vXG5cbnZhciBkZWVwS2V5cyA9IG1vZHVsZS5leHBvcnRzLmRlZXBLZXlzID0gZnVuY3Rpb24gZGVlcEtleXMob2JqZWN0LCBwcmVmaXgpIHtcbiAgaWYgKHR5cGVvZiBwcmVmaXggPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBwcmVmaXggPSBbXTtcbiAgfVxuXG4gIHZhciBrZXlzID0gW107XG5cbiAgZm9yICh2YXIgayBpbiBvYmplY3QpIHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgaykpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGtleXMucHVzaChwcmVmaXguY29uY2F0KFtrXSkpO1xuXG4gICAgaWYgKHR5cGVvZiBvYmplY3Rba10gPT09IFwib2JqZWN0XCIgJiYgb2JqZWN0W2tdICE9PSBudWxsKSB7XG4gICAgICBrZXlzID0ga2V5cy5jb25jYXQoZGVlcEtleXMob2JqZWN0W2tdLCBwcmVmaXguY29uY2F0KFtrXSkpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ga2V5cztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiYXV0aG9yXCI6IFwiSWFuIEplbm5pbmdzXCIsXG4gIFwibmFtZVwiOiBcImNoYXQtZW5naW5lLW9ubGluZS11c2VyLXNlYXJjaFwiLFxuICBcInZlcnNpb25cIjogXCIwLjAuN1wiLFxuICBcIm1haW5cIjogXCJzcmMvcGx1Z2luLmpzXCIsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImNoYXQtZW5naW5lXCI6IFwiXjAuNS4yXCIsXG4gICAgXCJkb3R0eVwiOiBcIjAuMC4yXCJcbiAgfVxufVxuIiwiLyoqXG4qIFNlYXJjaGVzIGEge0BsaW5rIENoYXR9IGZvciBhIHtAbGluayBVc2VyfSB3aXRoIGEgYGBgc3RhdGUudXNlcm5hbWVgYGAgY29udGFpbmluZyBhIGdpdmVuIHN0cmluZy5cbiogQG1vZHVsZSBjaGF0LWVuZ2luZS1vbmxpbmUtdXNlci1zZWFyY2hcbiovXG5cbmNvbnN0IGRvdHR5ID0gcmVxdWlyZSgnZG90dHknKTtcblxuLyoqXG4qIEBmdW5jdGlvblxuKiBAcGFyYW0ge09iamVjdH0gW2NvbmZpZ10gVGhlIGNvbmZpZyBvYmplY3RcbiogQHBhcmFtIHtTdHJpbmd9IFtwcm9wPVwidXNlcm5hbWVcIl0gVGhlIHtAbGluayBVc2VyI3N0YXRlfSBwcm9wZXJ0eSB0byB1c2UgZm9yIHN0cmluZyBtYXRjaGluZ1xuKiBAcGFyYW0ge0Jvb2xlYW59IFtjYXNlU2Vuc2l0aXZlPWZhbHNlXSBFbmFibGUgdG8gY29uc2lkZXIgYGBgY29uZmlnLnByb3BgYGAgY2hhcmFjdGVyIGNhc2Ugd2hlbiBzZWFyY2hpbmcuXG4qIEBleGFtcGxlXG4qIGNoYXQgPSBuZXcgQ2hhdEVuZ2luZS5DaGF0KCdtYXJrZG93bi1jaGF0Jyk7XG4qIGNoYXQucGx1Z2luKG9ubGluZVVzZXJTZWFyY2goe30pKTtcbiogbGV0IGZvdW5kVXNlcnMgPSBjaGF0LnNlYXJjaCgncmVkJyk7XG4qL1xubW9kdWxlLmV4cG9ydHMgPSAoY29uZmlnID0ge30pID0+IHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25maWcucHJvcCA9IGNvbmZpZy5wcm9wIHx8ICd1c2VybmFtZSc7XG4gICAgY29uZmlnLmNhc2VTZW5zaXRpdmUgPSBjb25maWcuY2FzZVNlbnNpdGl2ZSB8fCBmYWxzZTtcblxuICAgIC8vIHRoZXNlIGFyZSBuZXcgbWV0aG9kcyB0aGF0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGV4dGVuZGVkIGNsYXNzXG5cbiAgICAvKipcbiAgICAqIEBtZXRob2QgIHNlYXJjaFxuICAgICogQGNlZXh0ZW5kcyBDaGF0XG4gICAgKiBAcGFyYW0ge1N0cmluZ30gbmVlZGxlIFRoZSB1c2VybmFtZSB0byBzZWFyY2ggZm9yLlxuICAgICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiB7QGxpbmsgVXNlcn1zIHRoYXQgbWF0Y2ggdGhlIGlucHV0IHN0cmluZy5cbiAgICAqL1xuICAgIGNsYXNzIGV4dGVuc2lvbiB7XG4gICAgICBzZWFyY2gobmVlZGxlKSB7XG5cbiAgICAgICAgICAvLyBhbiBlbXB0eSBhcnJheSBvZiB1c2VycyB3ZSBmb3VuZFxuICAgICAgICAgIHZhciByZXR1cm5MaXN0ID0gW107XG5cbiAgICAgICAgICBpZihjb25maWcuY2FzZVNlbnNpdGl2ZSkge1xuICAgICAgICAgICAgICBuZWVkbGUgPSBuZWVkbGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBmb3IgZXZlcnkgdXNlciB0aGF0IHRoZSBwYXJlbnQgY2hhdCBrbm93cyBhYm91dFxuICAgICAgICAgIGZvcih2YXIga2V5IGluIHRoaXMucGFyZW50LnVzZXJzKSB7XG5cbiAgICAgICAgICAgICAgbGV0IGhheXN0YWNrICA9IHRoaXMucGFyZW50LnVzZXJzW2tleV0uc3RhdGU7XG4gICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBkb3R0eS5nZXQoaGF5c3RhY2ssIGNvbmZpZy5wcm9wKTtcblxuICAgICAgICAgICAgICAvLyBzZWUgaWYgdGhhdCB1c2VyIHVzZXJuYW1lIGluY2x1ZGVzIHRoZSBpbnB1dCB0ZXh0XG4gICAgICAgICAgICAgIGlmKGhheXN0YWNrICYmIHRhcmdldCkge1xuXG4gICAgICAgICAgICAgICAgICBpZighY29uZmlnLmNhc2VTZW5zaXRpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmluZGV4T2YobmVlZGxlKSA+IC0xKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBkb2VzLCBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgcmV0dXJuZWQgdXNlcnNcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm5MaXN0LnB1c2godGhpcy5wYXJlbnQudXNlcnNba2V5XSk7XG5cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gcmV0dXJuIGFsbCBmb3VuZCB1c2Vyc1xuICAgICAgICAgIHJldHVybiByZXR1cm5MaXN0O1xuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWRkIHRoaXMgcGx1Z2luIHRvIHRoZSBDaGF0IGNsYXNzZXNcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZXNwYWNlOiAnb25saW5lVXNlclNlYXJjaCcsXG4gICAgICBleHRlbmRzOiB7XG4gICAgICAgICAgQ2hhdDogZXh0ZW5zaW9uXG4gICAgICB9XG4gICAgfVxuXG5cbn1cbiJdfQ==
