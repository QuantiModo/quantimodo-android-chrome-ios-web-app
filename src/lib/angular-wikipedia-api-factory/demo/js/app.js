var app = angular.module("app", ['jtt_wikipedia']);
app.controller('controller', ['$scope', 'wikipediaFactory', function($scope, wikipediaFactory) {

    wikipediaFactory.searchArticlesByTitle({
        term:"Jonathan",
        gsrlimit: 3
    }).then(function(_data){
        console.info("search articles by title", _data);
    });

    wikipediaFactory.searchArticles({
        term:"soccer",
        gsrlimit: 20
    }).then(function(_data){
        console.info("search articles", _data);
    });

    wikipediaFactory.getArticle({
        term:"United States Soccer Federation",
    }).then(function(_data){
        console.info("get article", _data);
    });

}]);
