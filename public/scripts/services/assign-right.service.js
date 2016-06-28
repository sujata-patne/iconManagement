
myApp.service('AssignRights', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';

    service.GetAssignRights = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getassignright', data).success(function (items) {
            console.log(items);
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    service.getPricePointType = function(success,error){
        //$http.post('http://103.43.2.5/BillingUtilService/GetEnumDetails?Type=payment_type')
        $http.post('http://192.168.1.165:8060/BillingUtilService/GetEnumDetails?Type=payment_type')
            .success(function (items) {
                success(items);
            }).error(function (err) {
                error(err);
            });
    }
    service.getJetPayDetailsForSubscription = function(storeId,success){
        //$http.post('http://103.43.2.5/BillingUtilService/GetStoreDetails?Store='+storeId).success(function (items) {
        $http.post('http://192.168.1.165:8060/BillingUtilService/GetStoreDetails?Store='+storeId).success(function (items) {
            success(items);
        });
    }
    service.getJetPayDetailsForAlaCart = function(storeId,success){
        //$http.post('http://103.43.2.5/BillingUtilService/GetStoreDetailsAla?Store='+storeId).success(function (items) {
        $http.post('http://192.168.1.165:8060/BillingUtilService/GetStoreDetailsAla?Store='+storeId).success(function (items) {

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