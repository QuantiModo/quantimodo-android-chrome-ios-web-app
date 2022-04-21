**angular-wikipedia-api-factory** is an angularjs module with a wikipedia api factory.

[![npm version](https://badge.fury.io/js/angular-wikipedia-api-factory.svg)](https://badge.fury.io/js/angular-wikipedia-api-factory)
[![Bower version](https://badge.fury.io/bo/angular-wikipedia-api-factory.svg)](https://badge.fury.io/bo/angular-wikipedia-api-factory)
 
Author: Jonathan Hornung ([JohnnyTheTank](https://github.com/JohnnyTheTank))

## Usage

1. Install via either [bower](http://bower.io/), [npm](https://www.npmjs.com/) or downloaded files:
    1. `bower install --save angular-wikipedia-api-factory`
    2. `npm install --save angular-wikipedia-api-factory`
    3. download [angular-wikipedia-api-factory.zip](https://github.com/JohnnyTheTank/angular-wikipedia-api-factory/zipball/master)
2. Include dependencies in your HTML.
    1. When using bower:
    ```html
    <script src="bower_components/angular-wikipedia-api-factory/dist/angular-wikipedia-api-factory.min.js"></script>
    ```
    2. When using npm:
    ```html
    <script src="node_modules/angular-wikipedia-api-factory/dist/angular-wikipedia-api-factory.min.js"></script>
    ```
    3. when using downloaded files
    ```html
    <script src="angular-wikipedia-api-factory.min.js"></script>
    ```
3. Add **`jtt_wikipedia`** to your application's module dependencies
  
    ```JavaScript
    angular.module('app', ['jtt_wikipedia']);
    ```
4. Use the factory `wikipediaFactory`

    ```JavaScript
    angular.module('app')
        .controller('appController', function($scope, wikipediaFactory){
        
            wikipediaFactory.getArticle({
                term: 'Oktoberfest'
            }).then(function (_data) {
                //on success
            });
            
        });
    ```

### factory methods

#### searchArticles

```js
wikipediaFactory.searchArticles({
    term: '<TERM>', // Searchterm
    lang: '<LANGUAGE>', // (optional) default: 'en'
    gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
    pithumbsize: '<PAGE_IMAGES_THUMBNAIL_SIZE>', // (optional) default: 400
    pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
    exlimit: '<EX_LIMIT>', // (optional) 'max': extracts for all articles, otherwise only for the first
    exintro: '<EX_INTRO>', // (optional) '1': if we just want the intro, otherwise it shows all sections
}).then(function (_data) {
    //on success
}).catch(function (_data) {
    //on error
});
```


```js
wikipediaFactory.searchArticlesByTitle({
    term: '<TERM>', // Searchterm
    lang: '<LANGUAGE>', // (optional) default: 'en'
    gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
    pithumbsize: '<PAGE_IMAGES_THUMBNAIL_SIZE>', // (optional) default: 400
    pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
    exlimit: '<EX_LIMIT>', // (optional) 'max': extracts for all articles, otherwise only for the first
    exintro: '<EX_INTRO>', // (optional) '1': if we just want the intro, otherwise it shows all sections
}).then(function (_data) {
    //on success
}).catch(function (_data) {
    //on error
});
```

#### getArticle

```js
wikipediaFactory.getArticle({
    term: '<TERM>', // Searchterm
    lang: '<LANGUAGE>', // (optional) default: 'en'
    pithumbsize: '<PAGE_IMAGE_THUMBNAIL_SIZE>', // (optional) default: '400'
}).then(function (_data) {
    //on success
}).catch(function (_data) {
    //on error
});
```

## Wikipedia JSONP API

* Documentation: https://www.mediawiki.org/wiki/API:Main_page/en
* API Sandbox: https://www.mediawiki.org/wiki/Special:ApiSandbox

## More angular-api-factories
[bandsintown](https://github.com/JohnnyTheTank/angular-bandsintown-api-factory) - [dailymotion](https://github.com/JohnnyTheTank/angular-dailymotion-api-factory) - [facebook](https://github.com/JohnnyTheTank/angular-facebook-api-factory) - [flickr](https://github.com/JohnnyTheTank/angular-flickr-api-factory) - [footballdata](https://github.com/JohnnyTheTank/angular-footballdata-api-factory) - [github](https://github.com/JohnnyTheTank/angular-github-api-factory) - [openweathermap](https://github.com/JohnnyTheTank/angular-openweathermap-api-factory) - [tumblr](https://github.com/JohnnyTheTank/angular-tumblr-api-factory) - [vimeo](https://github.com/JohnnyTheTank/angular-vimeo-api-factory) - **wikipedia** - [youtube](https://github.com/JohnnyTheTank/angular-youtube-api-factory)



## License

MIT