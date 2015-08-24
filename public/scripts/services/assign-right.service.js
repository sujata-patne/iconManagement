/**
* Created by sujata.patne on 24-07-2015.
*/
myApp.service('AssignRights', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';

    service.GetAssignRights = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getassignright', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    service.UpdateAssignRights = function (data, success, error) {
        $http.post(service.baseRestUrl + '/updateassignright', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }



    return service;
} ]);