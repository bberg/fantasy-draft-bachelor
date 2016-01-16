angular.module('nodeVote').directive('svgMap', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        templateUrl: 'US_Congressional_districts.svg',
        link: function (scope, element, attrs) {
            var districts = element[0].querySelectorAll('path');
//            console.log(districts);
            angular.forEach(districts, function (district, key) {
                var districtElement = angular.element(district)
//                console.log(districtElement.attr("id"))
                if (districtElement.attr("id") != "State_Border"){
                    districtElement.attr("district", "");  //is this necessary?
                    districtElement.attr("class", "district");  //is this necessary?
                    districtElement.attr("value-Data", "valueData");
    //                districtElement.attr("ng-click", "regionClick()");  //is this necessary?
                }
                else{
                    districtElement.attr('fill',"rgba(255,255,255,1)");
                }
        
                $compile(districtElement)(scope); //is this necessary?
            })
        }
    }
}]);

angular.module('nodeVote').directive('district', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        scope: {
            valueData: "="
        },
        link: function (scope, element, attrs) {
            scope.elementId = element.attr("id");
            scope.districtClick = function () {
//                alert(scope.elementId);
//                console.log(scope);
                alert(scope.valueData[scope.elementId]);
                
                
                console.log(scope);
            };
            element.attr("ng-click", "districtClick()");
            element.attr("ng-attr-fill", "{{valueData[elementId] | map_colour}}"); //<--- THIS BIT!
            element.removeAttr("district");
            $compile(element)(scope);
        }
    }
}]);

//angular.module('nodeVote').directive('district', ['$compile', function ($compile) {
//    return {
//        restrict: 'A',
//        scope: true,
//        link: function (scope, element, attrs) {
////            scope.elementId = element.attr("id");
////            scope.regionClick = function () {
////                console.log("clicked");
////                alert(scope.elementId);
////                $scope.createDummyData();
////            };
////            element.attr("ng-hover", "districtClick()");
////            element.attr("ng-attr-fill", "{{dummyData[elementId].value | map_colour}}"); //<--- THIS BIT!
////            element.removeAttr("region");
//            $compile(element)(scope);
//        }
//    }
//
//}]);