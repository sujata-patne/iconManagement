myApp.service('ContentTypes', ['$http', function ($http) {
    var service = {};
	service.baseRestUrl = 'http://localhost:3000';
	
    /* Retrieving Parent Content Type  e.g. Video, Audio etc.*/

    service.GetTypes = function(success){
            $http.get(service.baseRestUrl + '/getTypes').success(function (items) {
                success(items);
            });
    }

	// service.GetParentContentType = function(success){
	//     $http.get(service.baseRestUrl + '/getparentcontenttype').success(function (items) {
 //            success(items);
 //        });
 //    }

    /* Get All the details for particular content type */
    service.GetContentDetails = function(data,success){
        $http.get(service.baseRestUrl + '/getContentDetails?cid='+data).success(function (items) {
            success(items);
        });
    }  

    /* Update content type details */
    service.UpdateContentType = function(data,success){
        $http.post(service.baseRestUrl + '/updateContentType',data).success(function (items) {
            success(items);
        });
    }

    /* Retrieving all delivery types eg Download , streaming etc.*/
    // service.GetDeliveryType = function(success){
	   //  $http.get(service.baseRestUrl + '/getdeliverytype').success(function (items) {
    //         success(items);
    //     });
    // }

    /* Adding */
    service.AddNewContentType = function(data,success){
        $http.post(service.baseRestUrl + '/addContentType',data).success(function (items) {
            success(items);
        });
    }

    /*Fetching all content types*/
    // service.GetAllContentTypes = function(success){
    //     $http.get(service.baseRestUrl + '/getAllContentTypes').success(function (items) {
    //         success(items);
    //     });
    // }
    return service;
}]);