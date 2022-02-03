/*
 * angular-d3-word-cloud 0.3.0
 * Running example base on express server
 * https://weihanchen.github.io/angular-d3-word-cloud/
 *
 * Released under the MIT license.
*/

(function() {
   'use strict';
   angular.module('angular-d3-word-cloud', [])
      .directive('wordCloud', [wordCloud]);

   function wordCloud() {
      return {
         restrict: 'E',
         scope: {
            padding: '=?',
            words: '=',
            width: '=',
            height: '=',
            onClick: '='
         },
         template: '<div></div>',
         controller: ['$scope', '$element', wordsCloudController],
         controllerAs: 'wordsCloudCtrl',
         bindToController: true
      };

      function wordsCloudController($scope, $element) {
         var self = this;
         /* istanbul ignore next */
         var fill = (d3.hasOwnProperty('scale')) ? d3.scale.category20() : d3.scaleOrdinal(d3.schemeCategory20);
         /**
          * layout grnerator by d3 and use drawListener to generator word cloud.
          */
         var layout = d3.layout.cloud()
            .rotate(function() {
               return ~~(Math.random() * 2) * 60;
            })
            .fontSize(function(d) {
               return d.size;
            })
            .on('end', drawListener);

         $scope.$watch(watchParameters, watchListener, true);

         function drawListener(words) {
            var wordsCloudSVGDiv = d3.select($element[0]);
            var width = layout.size()[0];
            var height = layout.size()[1];
            wordsCloudSVGDiv.select('svg').remove();
            wordsCloudSVGDiv.append('svg')
               .attr('width', width)
               .attr('height', height)
               .append('g')
               .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
               .selectAll('text')
               .data(words)
               .enter().append('text')
               .on('click', function(d) { //call back clicked element
                  if (self.onClick) self.onClick(d);
               })
               .on('mouseover', function() { //zoom in font-size
                  d3.select(this).transition().style('font-size', function(d) {
                     return d.size * 1.2 + 'px';
                  }).attr('opacity', 0.5);
               })
               .on('mouseout', function() {
                  d3.select(this).transition().style('font-size', function(d) {
                     return d.size + 'px';
                  }).attr('opacity', 1);
               })
               .style('font-size', function(d) {
                  return d.size + 'px';
               })
               .style('font-family', 'Impact')
               .style('fill', function(d, i) {
                  return d.color || fill(i);
               })
               .attr('text-anchor', 'middle')
               .attr('cursor', 'pointer')
               .transition()
               .attr('transform', function(d) {
                  return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
               })
               .text(function(d) {
                  return d.text;
               });
         }

         function updateLayout(width, height, words, padding) {
            padding = padding || 5;
            layout.size([width, height])
               .padding(padding)
               .words(words);
            layout.start();
         }

         /**
          * watch binding scope parameters
          */
         function watchParameters() {
            return self;
         }

         function watchListener(newVal) {
            var parameters = angular.copy(newVal);
            if (angular.isUndefined(parameters.words) || angular.isUndefined(parameters.width) || angular.isUndefined(parameters.height)) return;
            updateLayout(parameters.width, parameters.height, parameters.words, parameters.padding);
         }
      }
   }
})();
