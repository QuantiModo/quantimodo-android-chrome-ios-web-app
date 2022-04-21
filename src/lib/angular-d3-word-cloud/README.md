# angular-d3-word-cloud #

[![Build Status](https://travis-ci.org/weihanchen/angular-d3-word-cloud.svg?branch=master)](https://travis-ci.org/weihanchen/angular-d3-word-cloud)
[![Coverage Status](https://coveralls.io/repos/github/weihanchen/angular-d3-word-cloud/badge.svg?branch=master)](https://coveralls.io/github/weihanchen/angular-d3-word-cloud?branch=master)

## Run examples with server ##
```
$ npm install
$ npm run test
$ npm run dev //default server port is 8000
$ npm run release //build release files
```

## Dependencies ##
* [angular.js](https://angularjs.org/)
* [d3.js](https://d3js.org/)
* [d3.layout.cloud.js](https://www.jasondavies.com/wordcloud/)

## Demo ##
Watch the wordcloud component in action on the [demo page](https://weihanchen.github.io/angular-d3-word-cloud/).

## How to use ##

### Install ###

##### bower #####

    $ bower install angular-d3-word-cloud

[angular.js](https://angularjs.org/), [d3.js](https://d3js.org/), [d3.layout.cloud.js](https://www.jasondavies.com/wordcloud/) would be install as dependencies auto. If it won't for some error, install it manually.

    $ bower install angular
    $ bower install d3
    $ bower install d3-cloud


##### npm #####
```
$ npm install angular-d3-word-cloud
```

## Inject scripts ##
Add dependencies to the <head> section of your index html:

```html
<meta charset="utf-8">  <!-- it's important for d3.js -->
<script src="[bower_components/node_modules]/jquery/dist/jquery.min.js"></script>
<script src="[bower_components/node_modules]/angular/angular.min.js"></script>
<script src="[bower_components/node_modules]/d3/d3.min.js"></script>
<script src="[bower_components/node_modules]/d3-cloud/build/d3.layout.cloud.js"></script>
<script src="[bower_components/node_modules]/angular-d3-word-cloud/dist/angular-word-cloud.min.js"></script>
```

## Options ##
Note: if words element not contains color property, default will use [d3 schemeCategory20](https://github.com/d3/d3-scale#category-scales)
* `words=[array]` -> [{text: '',size: 0, color: '#6d989e'}]
* `height=[number]`
* `width=[number]`
* `padding=[string]` -> [optional] padding for each word, defaults to `5`
* `on-click=[function]` -> word clicked callback

## Directive Usage ##
```html
<div id="wordsCloud">
   <word-cloud words="appCtrl.words" width="appCtrl.width" height="appCtrl.height" padding="5" on-click="appCtrl.wordClicked">
   </word-cloud>
</div>
```

## Basic usage ##
Inject `angular-d3-word-cloud` into angular module, set up some options to our controller

```javascript
	(function(){
	angular.module('app',['angular-d3-word-cloud'])
		.controller('appController',['$window','$element',appController])
	function appController($window,$element){
		var self = this;
		self.height = $window.innerHeight * 0.5;
		self.width = $element.find('#wordsCloud')[0].offsetWidth;
		self.wordClicked = wordClicked;
		self.words = [
			{text: 'Angular',size: 25, color: '#6d989e'},
			{text: 'Angular2',size: 35, color: '#473fa3'}
		]

		function wordClicked(word){
			alert('text: ' + word.text + ',size: ' + word.size);
		}
	}
})()
```
## Advanced usage ##
### Define some content and split(/\s+/g) ###

```javascript
	var content = 'Angular Angular2 Angular3 Express Nodejs';
	originWords = self.content.split(/\s+/g);
    originWords = originWords.map(function(word) {
        return {
            text: word,
            count: Math.floor(Math.random() * maxWordCount)
        }
     }).sort(function(a, b) {
          return b.count - a.count;
     })
```

### Font size calculations ###

```javascript
	 var element = $element.find('#wordsCloud');
     var height = $window.innerHeight * 0.75;
     element.height(height);
     var width = element[0].offsetWidth;
     var maxCount = originWords[0].count;
     var minCount = originWords[originWords.length - 1].count;
     var maxWordSize = width * 0.15;
     var minWordSize = maxWordSize / 5;
     var spread = maxCount - minCount;
     if (spread <= 0) spread = 1;
     var step = (maxWordSize - minWordSize) / spread;
     self.words = originWords.map(function(word) {
         return {
             text: word.text,
             size: Math.round(maxWordSize - ((maxCount - word.count) * step)),
             color: '#473fa3'//you can assign custom color
         }
     })
     self.width = width;
     self.height = height;
```

## References ##
* [Word Cloud Layout](https://github.com/jasondavies/d3-cloud) by [Jason Davies](https://www.jasondavies.com/).
* [D3.js](https://github.com/d3/d3)
