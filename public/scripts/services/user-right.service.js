
myApp.service('UserRights', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';

    service.existingMappingList = function (data, success, error) {
        $http.post(service.baseRestUrl + '/existingMappingList', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    service.GetUserRights = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getuserright', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    service.updateuserright = function (data, success, error) {
        $http.post(service.baseRestUrl + '/updateuserright', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    /**
     * @desc Block & Unblock Vendors
     * @param data
     * @param success
     * @param error
     * @constructor
     */
    service.BlockUnBlockUser = function (data, success, error) {
        $http.post(service.baseRestUrl + '/blockunblockuser', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return service;
} ]);