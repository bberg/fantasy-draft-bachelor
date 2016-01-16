angular.module('nodeVote').filter('map_colour', [function () {
    return function (input){
//        For now, just catch errrors where the actual value is undefined and set it to a midpoint value 
        if ((input == undefined) == true){
            input = 0.5;
//            alpha = 80;
//            r = 120;
//            g = 120;
//            b = 120;
        }
        
//        var alpha = 200 + Math.floor(input * 55);
//        var alpha = 120;
        var g = 60 + Math.floor(input * 140);
        var r = 60 + Math.floor(input * 140);
        var b = 60 + Math.floor(input * 140);

//        var b = 255 - Math.floor(input * 255);
        
//        console.log("rgba("+alpha+"," + r + "," + g + ","+b+")");
        return "rgb("+ r + "," + g + ","+b+")";
    }
}]);