myApp.service('ContentTypes', ['$http', function ($http) {
    var service = {};
	service.baseRestUrl = 'http://localhost:3000';
	
    /* Retrieving Parent Content Type  e.g. Video, Audio etc.*/

    service.GetTypes = function(data,success){
            $http.post(service.baseRestUrl + '/getTypes',data).success(function (items) {
                success(items);
            });
    }

    /* Update content type details */
    service.UpdateContentType = function(data,success){
        $http.post(service.baseRestUrl + '/updateContentType',data).success(function (items) {
            success(items);
        });
    }

    /* Adding */
    service.AddNewContentType = function(data,success){
        $http.post(service.baseRestUrl + '/addContentType',data).success(function (items) {
            success(items);
        });
    }

    return service;
}]);