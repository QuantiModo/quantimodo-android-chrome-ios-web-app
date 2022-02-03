(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

    const package = require('../package.json');
    window.ChatEngineCore.plugin[package.name] = require('../src/plugin.js');

})();

},{"../package.json":2,"../src/plugin.js":3}],2:[function(require,module,exports){
module.exports={
  "author": "Ian Jennings",
  "name": "chat-engine-random-username",
  "version": "0.0.4",
  "main": "src/plugin.js",
  "dependencies": {
    "chat-engine": "^0.5.2"
  }
}

},{}],3:[function(require,module,exports){
/**
* Update a {@link Me}'s state by randomly combining a color and an animal. Ex: "teal_seal"
* @module chat-engine-random-username
*/
const randomName = () => {

    // list of friendly animals
    let animals = ['pigeon', 'seagull', 'bat', 'owl', 'sparrows', 'robin', 'bluebird', 'cardinal', 'hawk', 'fish', 'shrimp', 'frog', 'whale', 'shark', 'eel', 'seal', 'lobster', 'octopus', 'mole', 'shrew', 'rabbit', 'chipmunk', 'armadillo', 'dog', 'cat', 'lynx', 'mouse', 'lion', 'moose', 'horse', 'deer', 'raccoon', 'zebra', 'goat', 'cow', 'pig', 'tiger', 'wolf', 'pony', 'antelope', 'buffalo', 'camel', 'donkey', 'elk', 'fox', 'monkey', 'gazelle', 'impala', 'jaguar', 'leopard', 'lemur', 'yak', 'elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'grizzlybear'];

    // list of friendly colors
    let colors = ['silver', 'gray', 'black', 'red', 'maroon', 'olive', 'lime', 'green', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];

    // randomly generate a combo of the two and return it
    return colors[Math.floor(Math.random() * colors.length)] + '_' + animals[Math.floor(Math.random() * animals.length)];

}

/**
* @function
*/
module.exports = () => {

    class extension {

        construct () {

            let state = this.parent.state;

            /**
            @member state"."username
            @ceextends User
            */
            state.username = randomName();

            this.parent.update(state);
        }

    };

    // define both the extended methods and the middleware in our plugin
    return {
        namespace: 'random-username',
        extends: {
            Me: extension
        }
    }

}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4wL2xpYi9ub2RlX21vZHVsZXMvY2hhdC1lbmdpbmUtcGx1Z2luL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIudG1wL3dyYXAuanMiLCJwYWNrYWdlLmpzb24iLCJzcmMvcGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgcGFja2FnZSA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuICAgIHdpbmRvdy5DaGF0RW5naW5lQ29yZS5wbHVnaW5bcGFja2FnZS5uYW1lXSA9IHJlcXVpcmUoJy4uL3NyYy9wbHVnaW4uanMnKTtcblxufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJhdXRob3JcIjogXCJJYW4gSmVubmluZ3NcIixcbiAgXCJuYW1lXCI6IFwiY2hhdC1lbmdpbmUtcmFuZG9tLXVzZXJuYW1lXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMC40XCIsXG4gIFwibWFpblwiOiBcInNyYy9wbHVnaW4uanNcIixcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiY2hhdC1lbmdpbmVcIjogXCJeMC41LjJcIlxuICB9XG59XG4iLCIvKipcbiogVXBkYXRlIGEge0BsaW5rIE1lfSdzIHN0YXRlIGJ5IHJhbmRvbWx5IGNvbWJpbmluZyBhIGNvbG9yIGFuZCBhbiBhbmltYWwuIEV4OiBcInRlYWxfc2VhbFwiXG4qIEBtb2R1bGUgY2hhdC1lbmdpbmUtcmFuZG9tLXVzZXJuYW1lXG4qL1xuY29uc3QgcmFuZG9tTmFtZSA9ICgpID0+IHtcblxuICAgIC8vIGxpc3Qgb2YgZnJpZW5kbHkgYW5pbWFsc1xuICAgIGxldCBhbmltYWxzID0gWydwaWdlb24nLCAnc2VhZ3VsbCcsICdiYXQnLCAnb3dsJywgJ3NwYXJyb3dzJywgJ3JvYmluJywgJ2JsdWViaXJkJywgJ2NhcmRpbmFsJywgJ2hhd2snLCAnZmlzaCcsICdzaHJpbXAnLCAnZnJvZycsICd3aGFsZScsICdzaGFyaycsICdlZWwnLCAnc2VhbCcsICdsb2JzdGVyJywgJ29jdG9wdXMnLCAnbW9sZScsICdzaHJldycsICdyYWJiaXQnLCAnY2hpcG11bmsnLCAnYXJtYWRpbGxvJywgJ2RvZycsICdjYXQnLCAnbHlueCcsICdtb3VzZScsICdsaW9uJywgJ21vb3NlJywgJ2hvcnNlJywgJ2RlZXInLCAncmFjY29vbicsICd6ZWJyYScsICdnb2F0JywgJ2NvdycsICdwaWcnLCAndGlnZXInLCAnd29sZicsICdwb255JywgJ2FudGVsb3BlJywgJ2J1ZmZhbG8nLCAnY2FtZWwnLCAnZG9ua2V5JywgJ2VsaycsICdmb3gnLCAnbW9ua2V5JywgJ2dhemVsbGUnLCAnaW1wYWxhJywgJ2phZ3VhcicsICdsZW9wYXJkJywgJ2xlbXVyJywgJ3lhaycsICdlbGVwaGFudCcsICdnaXJhZmZlJywgJ2hpcHBvcG90YW11cycsICdyaGlub2Nlcm9zJywgJ2dyaXp6bHliZWFyJ107XG5cbiAgICAvLyBsaXN0IG9mIGZyaWVuZGx5IGNvbG9yc1xuICAgIGxldCBjb2xvcnMgPSBbJ3NpbHZlcicsICdncmF5JywgJ2JsYWNrJywgJ3JlZCcsICdtYXJvb24nLCAnb2xpdmUnLCAnbGltZScsICdncmVlbicsICd0ZWFsJywgJ2JsdWUnLCAnbmF2eScsICdmdWNoc2lhJywgJ3B1cnBsZSddO1xuXG4gICAgLy8gcmFuZG9tbHkgZ2VuZXJhdGUgYSBjb21ibyBvZiB0aGUgdHdvIGFuZCByZXR1cm4gaXRcbiAgICByZXR1cm4gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbG9ycy5sZW5ndGgpXSArICdfJyArIGFuaW1hbHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYW5pbWFscy5sZW5ndGgpXTtcblxufVxuXG4vKipcbiogQGZ1bmN0aW9uXG4qL1xubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG5cbiAgICBjbGFzcyBleHRlbnNpb24ge1xuXG4gICAgICAgIGNvbnN0cnVjdCAoKSB7XG5cbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IHRoaXMucGFyZW50LnN0YXRlO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEBtZW1iZXIgc3RhdGVcIi5cInVzZXJuYW1lXG4gICAgICAgICAgICBAY2VleHRlbmRzIFVzZXJcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBzdGF0ZS51c2VybmFtZSA9IHJhbmRvbU5hbWUoKTtcblxuICAgICAgICAgICAgdGhpcy5wYXJlbnQudXBkYXRlKHN0YXRlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIC8vIGRlZmluZSBib3RoIHRoZSBleHRlbmRlZCBtZXRob2RzIGFuZCB0aGUgbWlkZGxld2FyZSBpbiBvdXIgcGx1Z2luXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZXNwYWNlOiAncmFuZG9tLXVzZXJuYW1lJyxcbiAgICAgICAgZXh0ZW5kczoge1xuICAgICAgICAgICAgTWU6IGV4dGVuc2lvblxuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=
