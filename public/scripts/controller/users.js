myApp.controller('usersCtrl', function ($scope, $http, ngProgress, $stateParams, UserRights,Users, $state, _, $window,$timeout) {
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');
    $('#add-user').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.CurrentPage = $state.current.name;
    $scope.IsAddUser = $scope.CurrentPage == "edit-user" ? false : true;
    $scope.PageTitle = $scope.CurrentPage == "edit-user" ? "Edit" : "Add";
     $scope.SelectedRoleModule = {};
    $scope.jetPayDetials = [];
    $scope.currentPageNo = 0;
    $scope.pageLimit = 10;
    $scope.SelectedStores= [];
    $scope.ExistingStores = [];
    $scope.DeletingStores = [];
    $scope.orderByField = 'ld_id'; //Added orderByField and reverseSort paramenter in input object for sorting and pagination banners list.
    $scope.reverseSort = true;
    $scope.sortIcon = "fa fa-caret-down";

    /**
     * @desc open datepicker for start date
     * @param evt
     */
    $scope.openDatepicker = function (evt) {
        $scope.open = true;
        evt.preventDefault();
        evt.stopPropagation();
    }    // Get Users,Modules,Roles,Vendors,Stores,Role-Module Mappings for binding to UI controls

    UserRights.GetUserRights({ state: $scope.CurrentPage }, function (userrights) {
         $scope.StoresList = userrights.StoresList;
        $scope.VendorList = userrights.Vendors;
        $scope.UserIdList = userrights.UserIds;
        $scope.Users = GetUserData(userrights.UserIds);

        $scope.Modules=userrights.Modules;
        $scope.Roles=userrights.Roles;
        $scope.RoleModuleMappings = userrights.RoleModuleMappings;
        $scope.SelectedStores = [];
        $scope.DeletingStores = [];
        if ($scope.CurrentPage == "edit-user") {
            $scope.Users.forEach(function (value) {
                if (value.ld_id == $stateParams.id) {
                    $scope.ExistingStores = [];
                    $scope.UserId = value.ld_id;
                    $scope.FullName = value.ld_display_name;
                    $scope.UserName = value.ld_user_name;
                    $scope.EmailId = value.ld_email_id;
                    $scope.MobileNo = value.ld_mobile_no;
                    $scope.SelectedUserRole = value.ld_role;
                    $scope.AccountExpire = setDate(value.account_validity);
                     if(value.stores != null){
                        value.stores.split(',').forEach(function(store){
                            $scope.ExistingStores.push(parseFloat(store));
                        })
                        $scope.SelectedStores = angular.copy($scope.ExistingStores);
                    }
                }
            });
        }
    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.backToAdd = function () {
        $state.go('add-user')
    }
    //Added orderBy function for sorting and pagination published banners list
    $scope.OrderBy=function (orderByField,reverseSort) {
        var sortOrder = reverseSort==true?"asc":"desc";
        $scope.sortIcon = reverseSort==false?"fa fa-caret-up":"fa fa-caret-down";
        $scope.listCriteria = {
            perPageItems: 10,
            currentPage: $scope.CurrentPage,
            totalItemsFound: 0,
             orderBy:orderByField +" "+sortOrder
        };
        UserRights.GetUserRights($scope.listCriteria, function (userrights) {
            $scope.StoresList = userrights.StoresList;
            $scope.VendorList = userrights.Vendors;
            $scope.UserIdList = userrights.UserIds;
            $scope.Users = GetUserData(userrights.UserIds);
            $scope.Modules=userrights.Modules;
            $scope.Roles=userrights.Roles;
            $scope.RoleModuleMappings = userrights.RoleModuleMappings;
            $scope.SelectedStores = [];
            $scope.DeletingStores = [];
            if ($scope.CurrentPage == "edit-user") {
                $scope.Users.forEach(function (value) {
                    if (value.ld_id == $stateParams.id) {
                        $scope.ExistingStores = [];
                        $scope.UserId = value.ld_id;
                        $scope.FullName = value.ld_display_name;
                        $scope.UserName = value.ld_user_name;
                        $scope.EmailId = value.ld_email_id;
                        $scope.MobileNo = value.ld_mobile_no;
                        $scope.SelectedUserRole = value.ld_role;
                        $scope.AccountExpire = setDate(value.account_validity);
                        if(value.stores != null){
                            value.stores.split(',').forEach(function(store){
                                $scope.ExistingStores.push(parseFloat(store));
                            })
                            $scope.SelectedStores = angular.copy($scope.ExistingStores);
                        }
                    }
                });
            }
        }, function (error) {
            $scope.error = error;
            $scope.errorvisible = true;
        });
    };

    /**
     * Set Deleted Stores in an array
     * @constructor
     */
   $scope.SelectStoresChange = function () {
       $scope.DeletingStores = GetDeleteStores($scope.ExistingStores,$scope.SelectedStores);

       console.log('$scope.SelectedStores')
       console.log($scope.SelectedStores)
       console.log('$scope.DeletingStores')
       console.log($scope.DeletingStores)
    }
    /**
     * Get Deleted Vendors List
     * @param Oldvendors
     * @param SelectedVendors
     * @returns {Array}
     * @constructor
     */
    function GetDeleteStores(ExistingStores, SelectedStores) {
        var DeleteArray = [];
        _.each(ExistingStores, function (oldStore) {
            data = _.find(SelectedStores, function (selected, key) { return selected == oldStore; });
            if (!data) {
                DeleteArray.push(parseInt(oldStore));
            }
        });
        return DeleteArray;
    }

    /**
     * Get added Vendors List
     * @param Oldvendors
     * @param SelectedVendors
     * @returns {Array}
     * @constructor
     */
   function GetAddStores(ExistingStores, SelectedStores) {
        var AddArray = [];
        _.each(SelectedStores, function (selected) {
            data = _.find(ExistingStores, function (oldStore, key) { return selected == oldStore; });
            if (!data) {
                AddArray.push(parseInt(selected));
            }
        });
        /*_.each(ExistingStores, function (oldStore) {
            data = _.find(SelectedStores, function (selected, key) { return selected == oldvendor; });
            if (!data) {
                AddArray.push(parseInt(oldStore));
            }
        });*/
        return AddArray;
   }

   function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);

    }
   $scope.addEditUsers = function (id) {
        $scope.error = "";
        $scope.success = "";
        Users.addEditUsers({ ld_id: id }, function (user) {
            if (user.RoleUser === "Super Admin") {
                $scope.UserRole = angular.copy(user.UserRole);
                $scope.FullName = user.UserData[0].ld_display_name;
                $scope.UserName = user.UserData[0].ld_user_name;
                $scope.EmailId = user.UserData[0].ld_email_id;
                $scope.MobileNo = user.UserData[0].ld_mobile_no;
                $scope.ld_Id = user.UserData[0].ld_id;

            }
            else {
                location.href = "/";
            }
        });
    }
   $scope.SaveUserDetails = function (isValid) {
        $scope.NameValidation = false;
        $scope.UserNameValidation = false;
        $scope.EmailValidation = false;
        $scope.MobileValidation = false;
        $scope.StoreValidationVisible = false;
        $scope.VendorValidation = false;

        $scope.errorvisible = false;
        $scope.error = "";
        $scope.success = "";
        if(isValid) {
            if ($scope.FullName != "") {
                if ($scope.UserName != "") {
                    if ($scope.EmailId != "" && validateEmail($scope.EmailId)) {
                        if (!isNaN($scope.MobileNo) && $scope.MobileNo != "" && $scope.MobileNo.toString().length == 10) {
                            if ($scope.SelectedStores.length != 0) {
                                if ($scope.ld_Id === undefined) {
                                    ngProgress.start();
                                    var datas = {
                                        UserId: $scope.UserId,
                                        FullName: $scope.FullName,
                                        UserName: $scope.UserName,
                                        EmailId: $scope.EmailId,
                                        MobileNo: $scope.MobileNo,
                                        AccountExpire: getDate($scope.AccountExpire),
                                        SelectedStores: $scope.SelectedStores,
                                       // DeletedStores: GetDeleteStores($scope.ExistingStores, $scope.SelectedStores)
                                        DeletedStores: $scope.DeletingStores
                                    }
                                    Users.saveUser(datas, function (data) {
                                        console.log(data);
                                        if (data.success != false) {
                                            UserRights.GetUserRights({state: $scope.CurrentPage}, function (userrights) {
                                                $scope.Users = GetUserData(userrights.UserIds);
                                            });
                                            if ($scope.CurrentPage == 'add-user') {

                                                $scope.UserId = '';
                                                $scope.FullName = '';
                                                $scope.UserName = '';
                                                $scope.EmailId = '';
                                                $scope.MobileNo = '';
                                                $scope.SelectedUserRole = '';
                                                $scope.AccountExpire = '';
                                                $scope.Checked = '';
                                                $scope.SelectedStores = [];
                                                $scope.DeletedStores = [];
                                                $scope.successvisible = true;
                                               // toastr.success("Record inserted successfully. Temporary Password sent to register email.");
                                            }
                                            ngProgress.complete();
                                            toastr.success(data.message);
                                        }else{
                                            ngProgress.complete();
                                            toastr.error(data.message);

                                        }
                                    })
                                }
                            }
                            else {
                                $scope.StoreValidationVisible = true;
                                console.log('invalid store');
                            }
                        }
                        else {
                            $scope.MobileValidation = true;
                            console.log('invalid mobile');
                        }
                    }
                    else {
                        $scope.EmailValidation = true;
                        console.log('invalid email');
                    }
                }
                else {
                    $scope.UserNameValidation = true;
                    console.log('invalid username');
                }
            }
            else {
                $scope.NameValidation = true;
                console.log('invalid fullname');
            }
        }
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
            user.buttoncolor = ButtonColor(user.account_validity, user.ld_active);
        });
        return Users;
    }
    /**
     * @desc Block and unblock vendors
     * @param Id
     * @param Status
     * @param classtext
     * @constructor
     */
    $scope.BlockUnBlockUser = function (Id, Status, classtext) {
        if (Status !== "Expired" && classtext !== "darkorange") {
            bootbox.confirm("Are you sure want to " + Status + " this user?", function (result) {
                if (result) {
                    ngProgress.start();
                    var user_data = {
                        ld_Id: Id,
                        active: Status == "Block" ? 0 : 1
                    }
                    UserRights.BlockUnBlockUser(user_data, function (data) {
                        if (data.success != false) {
                            user = _.find($scope.UserIdList, function (vdr, key) { return Id == vdr.ld_id; });
                            if (user) {
                                user.ld_active = user_data.active;
                                user.account_validity = setDate(user.account_validity);
                                user.ld_created_on = setDate(user.ld_created_on);
                                user.title = GetTitle(user.account_validity, user.ld_active);
                                user.status = GetStatus(user.account_validity, user.ld_active);
                                user.buttoncolor = ButtonColor(user.account_validity, user.ld_active);
                            }
                            toastr.success(data.message)
                        }
                        else {
                            toastr.error(data.message);
                        }
                        ngProgress.complete();
                    }, function (err) {
                        toastr.error(err);
                        ngProgress.complete();
                    });
                }
            });
        }

    }

})
