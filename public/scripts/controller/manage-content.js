myApp.controller('manageContentCtrl', function ($scope, $http, ngProgress, $stateParams, ContentTypes) {
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.SelectedParentContentType = "";
    $scope.SelectedDeliveryType = [];
    $scope.isReadOnly = "no";

//Get All the content Types : Parent, Delivery , Content
    ContentTypes.GetTypes(function(data){
        $scope.ParentContentType = data.parentType;
        $scope.AudioVideoDeliveryType = data.deliveryType;
        $scope.ContentType = data.contentType;
    });

//If Id is there in the url for the edit page : 
    if ($stateParams.id) {
        $scope.isReadOnly = "yes";
        //Fetching details of a particular content type based on id : 
        ContentTypes.GetContentDetails($stateParams.id,function(data){
            $scope.NewContentType = data.c[0].child_name;
            $scope.SelectedParentContentType = data.c[0].parent_id;
            ContentTypes.GetTypes(function(data){
                $scope.AudioVideoDeliveryType = data.deliveryType;
                $scope.DeliveryType =  $scope.AudioVideoDeliveryType;
            });
             var delivery_type_arr =  data.d[0].delivery_types.split(",");
             for(i =0 ; i < delivery_type_arr.length; i++){
                $scope.SelectedDeliveryType.push(parseInt(delivery_type_arr[i]));   
             }             
        });
    }





//Content Type Change ..
    $scope.SelectParentContentTypeChange = function () {
        $scope.SelectedDeliveryType = [];
        if ($scope.SelectedParentContentType == 9 || $scope.SelectedParentContentType == 10) {
            $scope.DeliveryType = $scope.AudioVideoDeliveryType ;
        } else if ($scope.SelectedParentContentType == 8 || $scope.SelectedParentContentType == 11 || $scope.SelectedParentContentType == 12) {
            $scope.DeliveryType = $scope.AudioVideoDeliveryType.filter(function(el){
                     return el.cd_name == "Download";
             });
        }
    }

    $('.removeActiveClass').removeClass('active');
    $('#manage-content').addClass('active');




    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            ngProgress.start();
            //For edit:
            if ($stateParams.id) {
                var datas = {
                    new_name : $scope.NewContentType,
                    mct_id : $stateParams.id
                }

                ContentTypes.UpdateContentType(datas,function(data){
                        if(data.success){
                            $scope.success = data.message;
                            $scope.successvisible = true;
                        }
                        location.href = "/#/manage-content";
                });
                


            }
            else {
                //For new : 
                var datas = {
                    NewContentType: $scope.NewContentType,
                    DeliveryTypes:$scope.SelectedDeliveryType,
                    ParentContentTypeId:$scope.SelectedParentContentType
                }

                 ContentTypes.AddNewContentType(datas,function(data){
                     if(data.success){
                         $scope.success = data.message;
                         $scope.successvisible = true;
                         ContentTypes.GetTypes(function(data){
                            $scope.ContentType = data.contentType;
                         });

                     }
                 });
            }
            ngProgress.complete();

        }
    };
});