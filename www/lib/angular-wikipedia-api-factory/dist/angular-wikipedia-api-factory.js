/**
    @name: angular-wikipedia-api-factory 
    @version: 0.2.4 (12-03-2017) 
    @author: Jonathan Hornung 
    @url: https://github.com/JohnnyTheTank/angular-wikipedia-api-factory#readme 
    @license: MIT
*/
"use strict";

angular.module("jtt_wikipedia", [])
    .factory('wikipediaFactory', ['$http', 'wikipediaSearchDataService', function ($http, wikipediaSearchDataService) {

        var wikipediaFactory = {};

        wikipediaFactory.searchArticlesByTitle = function (_params) {

            var wikipediaSearchData = wikipediaSearchDataService.getNew("searchArticlesByTitle", _params);

            return $http.jsonp(
                wikipediaSearchData.url,
                {
                    method: 'GET',
                    params: wikipediaSearchData.object,
                }
            );
        };

        wikipediaFactory.searchArticles = function (_params) {

            var wikipediaSearchData = wikipediaSearchDataService.getNew("searchArticles", _params);

            return $http.jsonp(
                wikipediaSearchData.url,
                {
                    method: 'GET',
                    params: wikipediaSearchData.object,
                }
            );
        };

        wikipediaFactory.getArticle = function (_params) {

            var wikipediaSearchData = wikipediaSearchDataService.getNew("getArticle", _params);

            return $http.jsonp(
                wikipediaSearchData.url,
                {
                    method: 'GET',
                    params: wikipediaSearchData.object,
                }
            );
        };

        return wikipediaFactory;
    }])
    .service('wikipediaSearchDataService', function () {
        this.getApiBaseUrl = function (_lang) {
            return 'https://' + _lang + ".wikipedia.org/w/api.php";
        };

        this.fillDataInObjectByList = function (_object, _params, _list) {

            angular.forEach(_list, function (value, key) {
                if (angular.isDefined(_params[value])) {
                    _object.object[value] = _params[value];
                }
            });

            return _object;
        };

        this.getNew = function (_type, _params) {

            var wikipediaSearchData = {
                object: {
                    callback: "JSON_CALLBACK",
                    action: 'query',
                    format: 'json',
                    formatversion: 2,
                },
                url: "",
            };

            if (angular.isUndefined(_params.lang)) {
                _params.lang = 'en'
            }

            if (angular.isUndefined(_params.pithumbsize)) {
                _params.pithumbsize = '400'
            }

            switch (_type) {
                case "searchArticlesByTitle":
                    wikipediaSearchData.object.prop = 'extracts|pageimages|info';
                    wikipediaSearchData.object.generator = 'search';
                    wikipediaSearchData.object.gsrsearch = 'intitle:' + _params.term;
                    wikipediaSearchData.object.pilimit = 'max';
                    wikipediaSearchData.object.exlimit = 'max';
                    wikipediaSearchData.object.exintro = '';

                    wikipediaSearchData = this.fillDataInObjectByList(wikipediaSearchData, _params, [
                        'prop', 'generator', 'gsrsearch', 'pilimit', 'exlimit', 'exintro', 'rvparse', 'formatversion', 'prop', 'pithumbsize', 'gsrlimit'
                    ]);
                    wikipediaSearchData.url = this.getApiBaseUrl(_params.lang);
                    break;

                case "searchArticles":
                    wikipediaSearchData.object.prop = 'extracts|pageimages|info';
                    wikipediaSearchData.object.generator = 'search';
                    wikipediaSearchData.object.gsrsearch = _params.term;
                    wikipediaSearchData.object.pilimit = 'max';
                    wikipediaSearchData.object.exlimit = 'max';
                    wikipediaSearchData.object.exintro = '';

                    wikipediaSearchData = this.fillDataInObjectByList(wikipediaSearchData, _params, [
                        'prop', 'generator', 'gsrsearch', 'pilimit', 'exlimit', 'exintro', 'rvparse', 'formatversion', 'prop', 'pithumbsize', 'gsrlimit'
                    ]);
                    wikipediaSearchData.url = this.getApiBaseUrl(_params.lang);
                    break;

                case "getArticle":
                    wikipediaSearchData.object.prop = 'extracts|pageimages|images|info';
                    wikipediaSearchData.object.titles = _params.term;

                    wikipediaSearchData = this.fillDataInObjectByList(wikipediaSearchData, _params, [
                        'prop', 'rvparse', 'formatversion', 'prop', 'pithumbsize', 'redirects'
                    ]);
                    wikipediaSearchData.url = this.getApiBaseUrl(_params.lang);
                    break;
            }
            return wikipediaSearchData;
        };
    });