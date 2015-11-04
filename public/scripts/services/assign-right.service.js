 
myApp.service('AssignRights', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';

    service.GetAssignRights = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getassignright', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    service.getJetPayDetailsByStoreId = function(storeId,success){
        $http.get('http://192.168.3.67:8234/BillingUtilService/GetStoreDetails?STORE='+storeId).success(function (items) {
            success(items);
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