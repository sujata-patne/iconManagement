 
myApp.service('AssignRights', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';
    service.getPricePointType = function(success,error){
        $http.get('http://103.43.2.10/BillingUtilService/GetEnumDetails?Type=payment_type')
        .success(function (items) {
            console.log(items)
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    service.GetAssignRights = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getassignright', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    service.getJetPayDetailsByStoreId = function(storeId,success){
        $http.get('http://103.43.2.10/BillingUtilService/GetStoreDetails?Store='+storeId).success(function (items) {
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