angular.module('myApp', ['angularChart'])

angular
  .module('myApp')
  .controller('Controller', function($scope) {
    console.log("running");
 
    $scope.options = {
      data: [
        {
          sales: 130,
          income: 250
        }
      ],
      dimensions: {
        sales: {
          type: 'bar'
        },
        income: {
          axis: 'y2'
        }
      }
    };
    
  });