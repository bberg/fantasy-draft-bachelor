var env = '';

function debugObject(inputobject) {
    obj = inputobject;
    for (x in obj) {
        console.log( x + ": " + obj[x]);
    }
}

var app = angular.module('fantasyDraftBachelor', ["ngTouch"])

app.controller()

app.controller('dashController', function($scope, $http) {
    $scope.ranks = [1,2,3,4,5]
    
    // Get all contestants
    $http.get('/api/v1/contestants')
        .success(function(data) {
            for(i in data){
                if(data[i]['eliminated']==true){
                    data[i]['elimText'] = '- eliminated'
                }
                else{
                    data[i]['elimText'] = ''   
                }
            }
            $scope.contestants = data.slice(0)
            $scope.contestantsA = data.splice(0,(data.length/2))
            $scope.contestantsB = data
        })
        .error(function(error) {
            console.log('Error getting contestants: ' + error);
        })

    // Get all users with mappings to contestants
    $http.get('/api/v1/usersWithMappings')
        .success(function(users) {            
            for(i in users){
                elimArray = []
                // console.log('user:', users[i])
                for(j in users[i]['data']){
                    // console.log(users[i]['data'][j])
                    if(users[i]['data'][j]['eliminated']==true){
                       users[i]['data'][j]['elimText'] = '- eliminated'
                       elimArray.push(users[i]['data'][j]['rank'])
                    }
                    else{
                        users[i]['data'][j]['elimText'] = ''   
                    }
                }
                users[i]['elimArray'] = elimArray
                users[i]['elimArrayFlipped'] = []
                users[i]['remainingPoints'] = 15
                for(j in users[i]['elimArray']){
                    users[i]['elimArrayFlipped'].push(6-users[i]['elimArray'][j])
                    users[i]['remainingPoints'] = users[i]['remainingPoints'] - (6-users[i]['elimArray'][j])

                }
                users[i]['numRemaining'] = 5 - users[i]['elimArray'].length
            }
            $scope.users = users;
        })
        .error(function(error) {
            console.log('Error getting contestants: ' + error);
            $scope.users = []
        })


    $scope.getUsersWithMappings = function(){
        $http.get('/api/v1/usersWithMappings')
            .success(function(users) {            
                $scope.users = users;
            })
            .error(function(error) {
                console.log('Error getting contestants: ' + error);
                $scope.users = []
            })
    }

    $http.get('/api/v1/users')
        .success(function(usersBasic) {            
            $scope.usersBasic = usersBasic;
        })
        .error(function(error) {
            console.log('Error getting contestants: ' + error);
            $scope.usersBasic = []
        })


////////////////////  for the edit page ///////////////////////
    $scope.formData = {}
    $scope.createMapping = function(data){
        console.log($scope.formData)
        $http.post('/api/v1/mappings',$scope.formData)
            .success(function(result) {
                $scope.getUsersWithMappings()          
            })
            .error(function(error) {
                console.log('Error getting contestants: ' + error);
            })
    }        

    $scope.deleteMapping = function(data){
        console.log(data)
        $http.delete('/api/v1/mappings/'+data.did)
        .success(function(result) {
            $scope.getUsersWithMappings()          
        })
        .error(function(error) {
            console.log('Error getting contestants: ' + error);
        })
    }   
});
