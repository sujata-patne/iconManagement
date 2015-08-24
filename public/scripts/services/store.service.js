/**
* Created by sujata.patne on 14-07-2015.
*/
myApp.service('Stores', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
    service.getStores = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getstore', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

     service.AddEditStore = function (data, success, error) {
        $http.post(service.baseRestUrl + '/addeditstore', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return service;
} ]);