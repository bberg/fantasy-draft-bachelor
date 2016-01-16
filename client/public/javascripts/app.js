var env = '';

function debugObject(inputobject) {
    obj = inputobject;
    for (x in obj) {
        console.log( x + ": " + obj[x]);
    }
}

var app = angular.module('fantasyDraftBachelor', ["ngTouch","angucomplete-alt"])

app.controller()

app.controller('dashController', function($scope, $http) {
    $scope.formData = {};
    $scope.todoData = {};
    
    // Get all contestants
    $http.get('/api/v1/contestants')
        .success(function(data) {
            for(i in data){
                if(data[i] != undefined){
                    if(data[i]["name"]=="chris-harrison"){
                        data.splice(i,1)
                        console.log("removed chris")
                    }
                }
                if(data[i]['eliminated']==true){
                    data[i]['elimText'] = '- eliminated'
                }
                else{
                    data[i]['elimText'] = ''   
                }
            }
            $scope.contestants = data;

        })
        .error(function(error) {
            console.log('Error getting contestants: ' + error);
        })
    // $http.get('/api/v1/contestants/eliminated/false')
    //     .success(function(data) {
    //         $scope.nonElimContestants = data;
    //     })
    //     .error(function(error) {
    //         console.log('Error getting contestants: ' + error);
    //     })
    $http.get('/api/v1/users')
        .success(function(data) {
            $scope.users = data;
        })
        .error(function(error) {
            console.log('Error getting contestants: ' + error);
        })

    // $http.get(env+'/api/v1/orgs')
    //         .success(function(data) {
    //             $scope.orgList = data;
    //             // console.log(data);
    //         })
    //         .error(function(error) {
    //             console.log('Error getting orgs: ' + error);
    //         });    
    
//when a new voter is selected...
    $scope.selectedVoter = function(selectID) {
//        console.log(selectID);
//        console.log(selectID.description);
        if(typeof(selectID) != "undefined"){
            console.log(selectID);
            $http.post(env+'/api/v1/scores', {bioguideid: selectID.description.bioguide_id})
                .success(function(data) {
                    $scope.voteData = data;
                    console.log(data);
                })
                .error(function(error) {
                    console.log('Error: ' + error);
                })
        }

            $http.get(env+'https://www.govtrack.us/api/v2/role?person='+selectID.description.govtrack_id+'&fields=congress_numbers,role_type')
                .success(function(data) {
                    console.log(data);
                })
                .error(function(error) {
                    console.log('Error: ' + error);
                })
    };
//    };

    $scope.selectOrgs = function(orgs) {
        console.log(orgs);
        if(typeof(orgs) != "undefined"){
            $http.post(env+'/api/v1/allScores', {orgs: orgs})
                .success(function(data) {
                    $scope.plotData = data;
                })
                .error(function(error) {
                    console.log('Error: ' + error);
                });
        }
    };


    $scope.drawRect = function(data,element){
        //Make an SVG Container
        var svgContainer = d3.select(element).append("svg")
            .attr("width", 200)
            .attr("height", 200);

        //Draw the Rectangle
        var rectangle = svgContainer.append("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", 50)
            .attr("height", 100);

        return svgContainer;

    };
    var preData;
    $scope.chartData = []
    // preData = {"fw":{"name":"fw","score":16,"totalTracked":21,"votes":[{}]},"ha":{"name":"ha","score":16,"totalTracked":21,"votes":[{}]},"lcv":{"name":"lcv","score":1,"totalTracked":35,"votes":[{}]},"apf":{"name":"apf","score":0,"totalTracked":0,"votes":[{}]},"hrc":{"name":"hrc","score":0,"totalTracked":1,"votes":[{}]},"nrtl":{"name":"nrtl","score":1,"totalTracked":1,"votes":[{}]},"nisc":{"name":"nisc","score":0,"totalTracked":4,"votes":[{}]},"ara":{"name":"ara","score":0,"totalTracked":9,"votes":[{}]},"csp":{"name":"csp","score":13,"totalTracked":14,"votes":[{}]}};

    trackingOrgs = {}
    // preData = $scope.data;
    for (var each in preData){
        console.log(preData[each])
        var val = (preData[each].score / preData[each].totalTracked);
        console.log(val);
        if (isNaN(val)){
            val = 0;
        }
        $scope.chartData.push(val);
    }
    // $scope.chartData = [1,2,3,4,4,4,5,3,3,2];
    console.log($scope.chartData)
    $scope.options = {width: 300, height: 300, 'bar': 'aaa'};
    // $scope.data = [(3/9), 3, 3, 4];
    $scope.hovered = function(d){
        $scope.barValue = d;
        $scope.$apply();
    };
    $scope.barValue = 'None';
    // console.log(data);
    console.log($scope.options);

});

app.directive('ngWidth', function() {
    return function(scope, element, attrs) {
        scope.$watch(attrs.ngWidth, function(value) {
            if(isNaN(value)){
                value = 0;
            }

            var outputVal = (value*100).toString() + '%';
            // console.log(outputVal);
            element.attr('width', outputVal);
        });
     };
})

app.directive('rectangle', ['$compile', function ($compile) {
    return {
        restrict: 'A',
//        templateUrl: 'rectangle.svg',
        width: '{{(thisOrg.score/thisOrg.totalTracked)*100}}%',
        link: function(scope, element, attrs){
            attrs.$observe('name',function(){
                element.attr("id", attrs.name);
                console.log("name: ", attrs.name);
            })
            attrs.$observe('rectangle',function(){
                console.log(attrs.rectangle);
                element.attr("width", attrs.rectangle)
            })
        }
    }
}]);


//        link: function (scope, element, attrs) {
//            scope.elementId = element.attr("id");
//            scope.rectClick = function () {
//                alert(scope.dummyData[scope.elementId].value);
//            };
//            element.attr("ng-click", "rectClick()");
////            element.attr("ng-attr-fill", "{{dummyData[elementId].value | map_colour}}"); //<--- THIS BIT!
////            element.removeAttr("region");
//            $compile(element)(scope);
//        }


//        link: function (scope, element, attrs) {
//            var regions = element[0].querySelectorAll('.state');
//            angular.forEach(regions, function (path, key) {
//                var regionElement = angular.element(path);
//                regionElement.attr("region", "");
//                regionElement.attr("dummy-data", "dummyData");
//                $compile(regionElement)(scope);
//            })
//        }



//app.directive('rectangle',function(){
//    return {
//        restrict: 'E',
//        scope:{
//            theScore: '=score',
//            theTotal: '=total',
//        },
//        controller: function AppCtrl ($scope) {
//
//        },
//        template: ''
//
//        };
//})

// app.directive('scatterplot', function showScatterPlot(data) {
//         // just to have some space around items. 
//         var margins = {
//             "left": 40,
//                 "right": 30,
//                 "top": 30,
//                 "bottom": 30
//         };
        
//         var width = 500;
//         var height = 500;
        
//         // this will be our colour scale. An Ordinal scale.
//         var colors = d3.scale.category10();

//         // we add the SVG component to the scatter-load div
//         var svg = d3.select("#scatter-load").append("svg").attr("width", width).attr("height", height).append("g")
//             .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

//         // this sets the scale that we're using for the X axis. 
//         // the domain define the min and max variables to show. In this case, it's the min and max prices of items.
//         // this is made a compact piece of code due to d3.extent which gives back the max and min of the price variable within the dataset
//         var x = d3.scale.linear()
//             .domain(d3.extent(data, function (d) {
//             return d.price;
//         }))
//         // the range maps the domain to values from 0 to the width minus the left and right margins (used to space out the visualization)
//             .range([0, width - margins.left - margins.right]);

//         // this does the same as for the y axis but maps from the rating variable to the height to 0. 
//         var y = d3.scale.linear()
//             .domain(d3.extent(data, function (d) {
//             return d.rating;
//         }))
//         // Note that height goes first due to the weird SVG coordinate system
//         .range([height - margins.top - margins.bottom, 0]);

//         // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
//         svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
//         svg.append("g").attr("class", "y axis");

//         // this is our X axis label. Nothing too special to see here.
//         svg.append("text")
//             .attr("fill", "#414241")
//             .attr("text-anchor", "end")
//             .attr("x", width / 2)
//             .attr("y", height - 35)
//             .text("Price in pence (£)");


//         // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
//         var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2);
//         var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

//         // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
//         svg.selectAll("g.y.axis").call(yAxis);
//         svg.selectAll("g.x.axis").call(xAxis);

//         // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the name. Not usually a great key, but fine for this example.
//         var chocolate = svg.selectAll("g.node").data(data, function (d) {
//             return d.name;
//         });

//         // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
        
//         var chocolateGroup = chocolate.enter().append("g").attr("class", "node")
//         // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
//         .attr('transform', function (d) {
//             return "translate(" + x(d.price) + "," + y(d.rating) + ")";
//         });

//         // we add our first graphics element! A circle! 
//         chocolateGroup.append("circle")
//             .attr("r", 5)
//             .attr("class", "dot")
//             .style("fill", function (d) {
//                 // remember the ordinal scales? We use the colors scale to get a colour for our manufacturer. Now each node will be coloured
//                 // by who makes the chocolate. 
//                 return colors(d.manufacturer);
//         });

//         // now we add some text, so we can see what each item is.
//         chocolateGroup.append("text")
//             .style("text-anchor", "middle")
//             .attr("dy", -10)
//             .text(function (d) {
//                 // this shouldn't be a surprising statement.
//                 return d.name;
//         });
// });

// app.controller('chartController', function AppCtrl ($scope) {
//     var preData;
//     $scope.chartData = []
//     preData = {"fw":{"name":"fw","score":16,"totalTracked":21,"votes":[{}]},"ha":{"name":"ha","score":16,"totalTracked":21,"votes":[{}]},"lcv":{"name":"lcv","score":1,"totalTracked":35,"votes":[{}]},"afp":{"name":"apf","score":0,"totalTracked":0,"votes":[{}]},"hrc":{"name":"hrc","score":0,"totalTracked":1,"votes":[{}]},"nrtl":{"name":"nrtl","score":1,"totalTracked":1,"votes":[{}]},"nisc":{"name":"nisc","score":0,"totalTracked":4,"votes":[{}]},"ara":{"name":"ara","score":0,"totalTracked":9,"votes":[{}]},"csp":{"name":"csp","score":13,"totalTracked":14,"votes":[{}]}};
//     // preData = $scope.data;
//     for (var each in preData){
//         console.log(preData[each])
//         var val = (preData[each].score / preData[each].totalTracked);
//         console.log(val);
//         if (isNaN(val)){
//             val = 0;
//         }
//         $scope.chartData.push(val);
//     }
//     // $scope.chartData = [1,2,3,4,4,4,5,3,3,2];
//     console.log($scope.chartData)
//     $scope.options = {width: 300, height: 300, 'bar': 'aaa'};
//     $scope.data = [(3/9), 3, 3, 4];
//     $scope.hovered = function(d){
//         $scope.barValue = d;
//         $scope.$apply();
//     };
//     $scope.barValue = 'None';
//     // console.log(data);
//     console.log($scope.options);
// })

// app.directive('barChart', function(){
//     var chart = d3.custom.barChart();
//     return {
//         restrict: 'E',
//         replace: true,
//         template: '<div class="chart"></div>',
//         scope:{
//             height: '=height',
//             score: '=score',
//             total: '=total',
//             data: '=data',
//             hovered: '&hovered'
//         },
//         // data = [score/total,1];
//         // console.log(data)
//         link: function(scope, element, attrs) {
//             var chartEl = d3.select(element[0]);
//             chart.on('customHover', function(d, i){
//                 scope.hovered({args:d});
//             });

//             scope.$watch('data', function (newVal, oldVal) {
//                 chartEl.datum(newVal).call(chart);
//             });

//             scope.$watch('height', function(d, i){
//                 chartEl.call(chart.height(scope.height));
//             })
//         }
//     }
// })

// app.directive('chartForm', function(){
//     return {
//         restrict: 'E',
//         replace: true,
//         controller: function AppCtrl ($scope) {
//             $scope.update = function(d, i){ $scope.data = randomData(); };
//             function randomData(){
//                 return d3.range(~~(Math.random()*50)+1).map(function(d, i){return ~~(Math.random()*1000);});
//             }
//         },
//         template: '<div class="form">' +
//                 'Height: {{options.height}}<br />' +
//                 '<input type="range" ng-model="options.height" min="100" max="800"/>' +
//                 '<br /><button ng-click="update()">Update Data</button>' +
//                 '<br />Hovered bar data: {{barValue}}</div>'
//     }


app.controller('MapController', function ($scope, $http) {
    
     $http.get(env+'/api/v1/orgs')
        .success(function(data) {
            $scope.orgList = data;
//            console.log(data);
//            for (var i = 0; i < data.length; i++) {
//                if (data[i].district != null){
//                    d = '-'+data[i].district;
//                }
//                else{
//                    d = '';
//                }
        })
        .error(function(error) {
            console.log('Error getting voters: ' + error);
        });
    
//    When a new organziation is selected...
   $scope.selectedOrg = function(selectID) {
    console.log(selectID);
    if(typeof(selectID) != "undefined"){
        $http.post(env+'/api/v3/allScores', {key: selectID.description.key})
            .success(function(data) {
                $scope.districtData = {}
                $scope.valueData = {}
                $scope.districtData = data.rows;
//                console.log($scope.districtData);
                for (var i = 0; i < $scope.districtData.length; i++) {
//                    console.log($scope.districtData[i])
                    if($scope.districtData[i].state=='MT'){
                        console.log($scope.districtData[i]);
                    }
                    if ($scope.districtData[i].district != null && $scope.districtData[i].district != '0' && $scope.districtData[i].district != ''){
                        var d = $scope.districtData[i].state+'_'+$scope.districtData[i].district;
                    }
                    else{
                        var d = $scope.districtData[i].state+'_At-Large';
                    }
               var voteRatio = parseInt($scope.districtData[i].scorefor)/(parseInt($scope.districtData[i].scorenull)+parseInt($scope.districtData[i].scoreagainst)+parseInt($scope.districtData[i].scorefor));
//               console.log($scope.districtData[i].scorefor,($scope.districtData[i].scoreagainst+$scope.districtData[i].scorefor),voteRatio);
               
//               console.log(voteRatio);
//                console.log($scope.districtData[i].state + d);
                $scope.districtData[i].stateDistrict =  + d;
                $scope.valueData[d] = voteRatio
                }
                console.log($scope.districtData);
                console.log($scope.valueData);
//                for (var person in data.rows){
//                    console.log(person);
//                }
            })
            .error(function(error) {
                console.log('Error: ' + error);
            })
    }
   }

    
//    var states = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL",
//            "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
//            "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA",
//            "WA", "WV", "WI", "WY"];
    
//    $scope.createDummyData = function () {
//        var dataTemp = {};
//        angular.forEach(states, function (state, key) {
//            dataTemp[state] = {value: Math.random()}
//        });
//        $scope.dummyData = dataTemp;
//    };
//    $scope.createDummyData();

    $scope.regionClick = function (district) {
//            console.log(district.elementID);
            console.log(district);
//        alert('cats');
//            angular.forEach(states, function (state, key) {
//                dataTemp[state] = {value: Math.random()}
//            });
//            $scope.dummyData = dataTemp;
    };
});
// });

angular.module('nodeTodo', [])

.controller('mainController', function($scope, $http) {

    $scope.formData = {};
    $scope.todoData = {};

    // Get all todos
    $http.get(env+'/api/v1/todos')
        .success(function(data) {
            $scope.todoData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });

    // Delete a todo
    $scope.deleteTodo = function(todoID) {
        $http.delete('/api/v1/todos/' + todoID)
            .success(function(data) {
                $scope.todoData = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // Create a new todo
    $scope.createTodo = function(todoID) {
        $http.post(env+'/api/v1/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.todoData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };
});


var testApp = angular.module('testApp', []);

testApp.controller('testController', function($scope, $http){
    console.log("testApp testController Loaded");



});