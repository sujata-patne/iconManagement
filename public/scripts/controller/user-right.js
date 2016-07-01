myApp.controller('userRightCtrl', function ($scope, $http, ngProgress, $stateParams, UserRights, $state, _, $window,$parse) {

    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');
    $('#user-right').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.CurrentPage = $state.current.name;
    $scope.SelectedRoleModule = {};
    $scope.jetPayDetials = [];
    $scope.currentPageNo = 0;
    $scope.pageLimit = 10;
    $scope.pageLimit = 10;


    // Get Users,Modules,Roles,Vendors,Stores,Role-Module Mappings for binding to UI controls
    UserRights.GetUserRights({ id: $stateParams.id,state: $scope.CurrentPage }, function (userrights) {
        $scope.StoresList=userrights.StoresList;
        $scope.VendorList=userrights.Vendors;
        $scope.AssignVendors=userrights.AssignVendors;
        $scope.UserIdList=userrights.UserIds;
        $scope.Users = GetUserData(userrights.UserIds);
        $scope.Modules=userrights.Modules;
        $scope.Roles=userrights.Roles;
        console.log($scope.AssignVendors);
        $scope.RoleModuleMappings = userrights.RoleModuleMappings;
        $scope.Users.forEach(function (value) {
            if (value.ld_id == $stateParams.id || value.ld_id == $scope.SelectedUserId) {
                $scope.ExistingStores = [];
                $scope.UserId = value.ld_id;
                $scope.SelectedUserId = $scope.UserId;
                $scope.FullName = value.ld_display_name;
                $scope.UserName = value.ld_user_name;
                $scope.EmailId = value.ld_email_id;
                $scope.MobileNo = value.ld_mobile_no;
                $scope.SelectedUserRole = value.ld_role;
                $scope.AccountExpire = value.account_validity;
                $scope.Role = value.ld_role;
                if(value.stores != null){
                    value.stores.split(',').forEach(function(store){
                        $scope.ExistingStores.push(parseFloat(store));
                    })
                    $scope.SelectedStores = angular.copy($scope.ExistingStores);
                }

                $scope.existingMappingList();
            }
        });

    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.$watch('SelectedUserId', function (nv,ov) {
//        $scope.existingMappingList();

        $scope.vendorSelectAll = false;
        $scope.storePlanSelectAll = false;
        $scope.storePackSelectAll = false;
        $scope.storePackageSelectAll = false;
        $scope.storeSiteSelectAll = false;
        $scope.storeBannerSelectAll = false;
        $scope.storeMISSelectAll = false;
        $scope.storePromoSelectAll = false;
    })
    $scope.existingMappingList = function (){
        $scope.SelectedVendor = [];
        $scope.SelectedStorePack = [];
        $scope.SelectedStorePlan = [];
        $scope.SelectedStorePackage = [];
        $scope.SelectedStoreSite = [];
        $scope.SelectedStoreMIS = [];
        $scope.SelectedStoreBanner = [];
        $scope.SelectedStorePromoLink = [];

        $scope.SelectedRoleModule['CI']= {};
        $scope.SelectedRoleModule['Pack']= {};
        $scope.SelectedRoleModule['Plan']= {};
        $scope.SelectedRoleModule['Pkg']= {};
        $scope.SelectedRoleModule['Site']= {};
        $scope.SelectedRoleModule['MIS']= {};
        $scope.SelectedRoleModule['Banner']= {};
        $scope.SelectedRoleModule['Promo']= {};

        $scope.SelectedRoleModuleStoresList = [];
        UserRights.existingMappingList({ userId: $scope.SelectedUserId }, function (mappingList) {
            mappingList.forEach(function (mappingItem) {
                if(mappingItem.module_name == 'Content Ingetions') {
                    if (!_.has( $scope.SelectedRoleModule, 'CI')) {
                        $scope.SelectedRoleModule['CI']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['CI'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['CI'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['CI'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedVendor, mappingItem.icn_vendor_detail_id)){
                        $scope.SelectedVendor.push(mappingItem.icn_vendor_detail_id);
                    }
                }
                if(mappingItem.module_name == 'Plan Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'Plan')) {
                        $scope.SelectedRoleModule['Plan']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['Plan'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['Plan'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['Plan'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStorePlan, mappingItem.icn_store_id)) {
                        $scope.SelectedStorePlan.push(mappingItem.icn_store_id);
                    }
                }
                if(mappingItem.module_name == 'Pack Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'Pack')) {
                        $scope.SelectedRoleModule['Pack']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['Pack'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['Pack'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['Pack'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStorePack, mappingItem.icn_store_id)) {
                        $scope.SelectedStorePack.push(mappingItem.icn_store_id);
                    }
                }
                if(mappingItem.module_name == 'Package Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'Pkg')) {
                        $scope.SelectedRoleModule['Pkg']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['Pkg'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['Pkg'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['Pkg'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStorePackage, mappingItem.icn_store_id)) {
                        $scope.SelectedStorePackage.push(mappingItem.icn_store_id);
                    }
                }
                if(mappingItem.module_name == 'Site Publishing Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'Site')) {
                        $scope.SelectedRoleModule['Site']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['Site'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['Site'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['Site'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStoreSite, mappingItem.icn_store_id)) {
                        $scope.SelectedStoreSite.push(mappingItem.icn_store_id);
                    }
                }
                if(mappingItem.module_name == 'MIS Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'MIS')) {
                        $scope.SelectedRoleModule['MIS']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['MIS'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['MIS'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['MIS'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStoreMIS, mappingItem.icn_store_id)) {
                        $scope.SelectedStoreMIS.push(mappingItem.icn_store_id);
                    }
                }
                if(mappingItem.module_name == 'Banner Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'Banner')) {
                        $scope.SelectedRoleModule['Banner']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['Pack'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['Banner'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['Banner'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStoreBanner, mappingItem.icn_store_id)) {
                        $scope.SelectedStoreBanner.push(mappingItem.icn_store_id);
                    }
                }
                if(mappingItem.module_name == 'Promo Link Management') {
                    if (!_.has( $scope.SelectedRoleModule, 'Promo')) {
                        $scope.SelectedRoleModule['Promo']= {};
                    }
                    if (!_.has( $scope.SelectedRoleModule['Promo'], mappingItem.role_master_id)) {
                        $scope.SelectedRoleModule['Promo'][mappingItem.role_master_id] = {};
                    }
                    $scope.SelectedRoleModule['Promo'][mappingItem.role_master_id] = mappingItem.module_master_id;
                    if(!_.contains($scope.SelectedStorePromoLink, mappingItem.icn_store_id)) {
                        $scope.SelectedStorePromoLink.push(mappingItem.icn_store_id);
                    }
                }
            });
            if(Object.keys($scope.SelectedRoleModule['CI']).length == 0){
                $scope.AssignVendors.forEach(function (value) {
                    if (_.contains($scope.SelectedStores, value.st_id)) {
                        $scope.SelectedVendor.push(value.st_id);
                    }
                })
            }            //console.log(_.unique($scope.SelectedVendor));
            if(Object.keys($scope.SelectedRoleModule['Plan']).length == 0){
                $scope.SelectedStorePlan = angular.copy($scope.SelectedStores);
            }
            if(Object.keys($scope.SelectedRoleModule['Pack']).length == 0){
                $scope.SelectedStorePack = angular.copy($scope.SelectedStores);
            }
            if(Object.keys($scope.SelectedRoleModule['Pkg']).length == 0){
                $scope.SelectedStorePackage = angular.copy($scope.SelectedStores);
            }
            if(Object.keys($scope.SelectedRoleModule['Site']).length == 0){
                $scope.SelectedStoreSite = angular.copy($scope.SelectedStores);
            }
            if(Object.keys($scope.SelectedRoleModule['MIS']).length == 0){
                $scope.SelectedStoreMIS = angular.copy($scope.SelectedStores);
            }
            if(Object.keys($scope.SelectedRoleModule['Banner']).length == 0){
                $scope.SelectedStoreBanner = angular.copy($scope.SelectedStores);
            }
            if(Object.keys($scope.SelectedRoleModule['Promo']).length == 0){
                $scope.SelectedStorePromoLink = angular.copy($scope.SelectedStores);
            }
        });
    }

    /**
     * @desc Get User Details
     * @param Users
     * @returns {*}
     * @constructor
     */
    function GetUserData(Users) {
        _.each(Users, function (user) {
            user.account_validity = setDate(user.account_validity);
            user.ld_created_on = setDate(user.ld_created_on);
            user.title = GetTitle(user.account_validity, user.ld_active);
            user.status = GetStatus(user.account_validity, user.ld_active);
            user.buttoncolor = ButtonColor(user.account_validity);
        });
         return Users;
    }
    /**
     * @desc Get Vendor Status
     * @param expirydate
     * @param active
     * @returns {string}
     * @constructor
     */
    function GetStatus(expirydate, active) {
        return active != 1 ? "User Blocked" : (Datewithouttime(expirydate) < Datewithouttime(new Date()) ? "User Expired" : "Active");
    }
    /**
     * @desc Change Button Color
     * @param expirydate
     * @param active
     * @returns {string}
     * @constructor
     */
    function ButtonColor(expirydate, active) {
        return active != 1 ? "red" : (Datewithouttime(expirydate) < Datewithouttime(new Date()) ? "darkorange" : "green");
    }

    /**
     * @desc Get Vendor Title
     * @param expirydate
     * @param active
     * @returns {string}
     * @constructor
     */
    function GetTitle(expirydate, active) {
        return active != 1 ? "UnBlock" : (Datewithouttime(expirydate) < Datewithouttime(new Date()) ? "Expired" : "Block");
    }

    $scope.resetForm = function () {
        $scope.selectUserId=[0];
        $scope.SelectedVendor = [];
        $scope.SelectedStorePack = [];
        $scope.SelectedStorePlan = [];
        $scope.SelectedStorePackage = [];
        $scope.SelectedStoreSite = [];
        $scope.SelectedStoreMIS = [];
        $scope.SelectedStoreBanner = [];
        $scope.SelectedStorePromoLink = [];

        $scope.SelectedRoleModule['CI']= {};
        $scope.SelectedRoleModule['Pack']= {};
        $scope.SelectedRoleModule['Plan']= {};
        $scope.SelectedRoleModule['Pkg']= {};
        $scope.SelectedRoleModule['Site']= {};
        $scope.SelectedRoleModule['MIS']= {};
        $scope.SelectedRoleModule['Banner']= {};
        $scope.SelectedRoleModule['Promo']= {};
    }
 
    $scope.getSelectedRole=function( ) {
        var CI = _.pick($scope.SelectedRoleModule, 'CI');
        var Plan = _.pick($scope.SelectedRoleModule, 'Plan');
        var Pack = _.pick($scope.SelectedRoleModule, 'Pack');
        var Pkg = _.pick($scope.SelectedRoleModule, 'Pkg');
        var Site = _.pick($scope.SelectedRoleModule, 'Site');
        var Banner = _.pick($scope.SelectedRoleModule, 'Banner');
        var MIS = _.pick($scope.SelectedRoleModule, 'MIS');
        var Promo = _.pick($scope.SelectedRoleModule, 'Promo');
        _.each(CI, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key, user_id:$scope.SelectedUserId, icn_vendor_detail_id:$scope.SelectedVendor};
                }else {
                   // $scope.SelectedRoleModuleStoresList.splice(key, 1);
                  //  $scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });

        _.each(Plan, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId, icn_store_id:$scope.SelectedStorePlan};
                }else {
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });

        _.each(Pack, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId , icn_store_id:$scope.SelectedStorePack};
                }else {
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });
      
        _.each(Pkg, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId , icn_store_id:$scope.SelectedStorePackage};
                }else {
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });
       
        _.each(Site, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId, icn_store_id:$scope.SelectedStoreSite};
                }else{
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });

        _.each(Banner, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId, icn_store_id:$scope.SelectedStoreBanner};
                }else {
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });

        _.each(MIS, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId, icn_store_id:$scope.SelectedStoreMIS};
                }else {
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });

        _.each(Promo, function(filesArr, fileKey) {
            _.each(filesArr, function(data, key) {
                if (data != 0) {
                    $scope.SelectedRoleModuleStoresList[key]= {role_master_id:key,user_id:$scope.SelectedUserId, icn_store_id:$scope.SelectedStorePromoLink};
                }else {
                    //$scope.SelectedRoleModuleStoresList.splice(key, 1);
                    //$scope.SelectedRoleModuleStoresList.pop(key);
                }
            })
        });
    }
    $scope.selectAllVendor = function (){
        $scope.SelectedVendor = [];
        if ($scope.vendorSelectAll) {
            $scope.VendorList.forEach(function(vendor){
                $scope.SelectedVendor.push(parseFloat(vendor.vd_id));
            })
         }
    };
    $scope.selectAllStore = function (SelectedStore,storeSelectAll){
        $scope[SelectedStore] = [];
        if (storeSelectAll) {
            $scope.StoresList.forEach(function(store){
                $scope[SelectedStore].push(parseFloat(store.st_id));
            })
        }
    };
    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;

        if (isValid) {
           $scope.getSelectedRole();

           var mappingList=$scope.SelectedRoleModuleStoresList.filter(Boolean);
           if(mappingList.length > 0) {

               ngProgress.start();
               UserRights.updateuserright({
                       'mappingList': mappingList,
                       'selectedUserId': $scope.SelectedUserId
                   }, function (data) {
                       if (data.success) {
                           $window.location.href = "#user-right";
                           toastr.success(data.message);
                           $scope.successvisible = true;
                       }
                       else {
                           $scope.error = data.message;
                           $scope.errorvisible = true;
                       }
                       ngProgress.complete();
                       $scope.SelectedRoleModuleStoresList = [];
                   }
                   , function (error) {
                       toastr.error(error);
                       $scope.errorvisible = true;
                       ngProgress.complete();
                   });
           }else{
               toastr.error("No Record selected. ");
           }
        }
    };
});
