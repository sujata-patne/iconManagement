/**
* Created by sujata.patne on 15-07-2015.
*/
myApp.controller('assignRightCtrl', function ($scope, $http, ngProgress, $stateParams, AssignRights, $state, _, $window) {
    $('.removeActiveClass').removeClass('active');
    $('#assign-right').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.CurrentPage = $state.current.name;
    $scope.Vendors = [];
    $scope.PaymentTypes = [];
    $scope.PaymentChannels = [];
    $scope.Countrys = [];





    AssignRights.GetAssignRights({ state: $scope.CurrentPage }, function (assignrights) {
        console.log(assignrights)
        $scope.Stores = assignrights.Stores;
        $scope.Vendors = assignrights.VendorList;
        $scope.ContentTypes = assignrights.ContentTypes;
        $scope.AssignCountrys = assignrights.AssignCountrys;
        $scope.AssignPaymentTypes = assignrights.AssignPaymentTypes;
        $scope.AssignPaymentChannels = assignrights.AssignPaymentChannels;
        $scope.AssignContentTypes = assignrights.AssignContentTypes;
        $scope.AssignVendors = assignrights.AssignVendors;
        $scope.Countrys = assignrights.Countrys;
        _.each(assignrights.MasterList, function (catalog) {
            if (catalog.cm_name == "Payment Channel") {
                $scope.PaymentChannels.push(catalog);
            }
            else if (catalog.cm_name == "Payment Type") {
                $scope.PaymentTypes.push(catalog);
            }
            else if (catalog.cm_name == "Store") {
                $scope.StoreContentType = catalog.cd_id;
            }

        })
        if ($scope.CurrentPage == "assign-right-manage") {
            $scope.SelectedStore = parseInt($stateParams.id);
            $scope.storeChange();
        }

    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.storeChange = function () {
        var store = _.find($scope.Stores, function (store) { return store.st_id == $scope.SelectedStore });
        if (store) {
            $scope.PricePointDetail = store.st_pricepoint_url;
            $scope.country_group_id = store.st_country_distribution_rights;
            $scope.payment_type_group_id = store.st_payment_type;
            $scope.payment_channel_group_id = store.st_payment_channel;
            $scope.vendor_group_id = store.st_vendor;
            $scope.content_type_group_id = store.st_content_type;
            $scope.SelectedGeoLocation = _.pluck(_.where($scope.AssignCountrys, { cmd_group_id: store.st_country_distribution_rights }), "cmd_entity_detail");
            $scope.SelectedPaymentType = _.pluck(_.where($scope.AssignPaymentTypes, { cmd_group_id: store.st_payment_type }), "cmd_entity_detail");
            $scope.SelectedPaymentChannel = _.pluck(_.where($scope.AssignPaymentChannels, { cmd_group_id: store.st_payment_channel }), "cmd_entity_detail");
            $scope.SelectContentType = _.pluck(_.where($scope.AssignContentTypes, { cmd_group_id: store.st_content_type }), "cmd_entity_detail");
            $scope.SelectedVendor = _.pluck(_.where($scope.AssignVendors, { cmd_group_id: store.st_vendor }), "cmd_entity_detail");
        }
        else {
            $scope.PricePointDetail = null;
            $scope.country_group_id = null;
            $scope.payment_type_group_id = null;
            $scope.payment_channel_group_id = null;
            $scope.vendor_group_id = null;
            $scope.content_type_group_id = null;
            $scope.SelectedGeoLocation = [];
            $scope.SelectedPaymentType = [];
            $scope.SelectedPaymentChannel = [];
            $scope.SelectContentType = [];
            $scope.SelectedVendor = [];
        }
    }




    function GetDeleteAssignRights(OldData, SelectedData, GroupId, type, DeleteArray) {
        _.each(OldData, function (old) {
            data = _.find(SelectedData, function (selected, key) { return selected == old.cmd_entity_detail && old.cmd_group_id == GroupId });
            if (!data) {
                DeleteArray.push({ cmd_entity_detail: old.cmd_entity_detail, cmd_group_id: GroupId, Type: type });
            }
        });
        return DeleteArray;
    }

    function GetAddAssignRights(OldData, SelectedData, GroupId, type, AddArray) {
        _.each(SelectedData, function (selected) {
            data = _.find(OldData, function (old, key) { return selected == old.cmd_entity_detail && old.cmd_group_id == GroupId });
            if (!data) {
                AddArray.push({ cmd_entity_detail: selected, cmd_group_id: GroupId, Type: type });
            }
        });
        return AddArray;
    }

    $scope.SelectGeolocationChange = function () {

    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            var AddArray = [];
            var DeleteArray = [];
            AddArray = GetAddAssignRights($scope.AssignCountrys, $scope.SelectedGeoLocation, $scope.country_group_id, "country", AddArray);
            DeleteArray = GetDeleteAssignRights($scope.AssignCountrys, $scope.SelectedGeoLocation, $scope.country_group_id, "country", DeleteArray);
            AddArray = GetAddAssignRights($scope.AssignPaymentTypes, $scope.SelectedPaymentType, $scope.payment_type_group_id, "paymenttype", AddArray);
            DeleteArray = GetDeleteAssignRights($scope.AssignPaymentTypes, $scope.SelectedPaymentType, $scope.payment_type_group_id, "paymenttype", DeleteArray);
            AddArray = GetAddAssignRights($scope.AssignPaymentChannels, $scope.SelectedPaymentChannel, $scope.payment_channel_group_id, "paymentchannel", AddArray);
            DeleteArray = GetDeleteAssignRights($scope.AssignPaymentChannels, $scope.SelectedPaymentChannel, $scope.payment_channel_group_id, "paymentchannel", DeleteArray);
            AddArray = GetAddAssignRights($scope.AssignContentTypes, $scope.SelectContentType, $scope.content_type_group_id, "contenttype", AddArray);
            DeleteArray = GetDeleteAssignRights($scope.AssignContentTypes, $scope.SelectContentType, $scope.content_type_group_id, "contenttype", DeleteArray);
            AddArray = GetAddAssignRights($scope.AssignVendors, $scope.SelectedVendor, $scope.vendor_group_id, "vendor", AddArray);
            DeleteArray = GetDeleteAssignRights($scope.AssignVendors, $scope.SelectedVendor, $scope.vendor_group_id, "vendor", DeleteArray);


            var store = {
                storeId: $scope.SelectedStore,
                AddAssignRights: AddArray,
                DeleteAssignRights: DeleteArray,
                country_group_id: $scope.country_group_id,
                payment_type_group_id: $scope.payment_type_group_id,
                payment_channel_group_id: $scope.payment_channel_group_id,
                vendor_group_id: $scope.vendor_group_id,
                content_type_group_id: $scope.content_type_group_id,
                pricepoint_url: $scope.PricePointDetail,
                store_content_type: $scope.StoreContentType
            }
            ngProgress.start();
            AssignRights.UpdateAssignRights(store, function (data) {
                console.log(data)
                if (data.success) {
                    $window.location.href = "#add-store";
                    $scope.success = data.message;
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            }
            , function (error) {
                $scope.error = error;
                $scope.errorvisible = true;
            });
        }
    };

    $scope.durationOptions = [
        { cd_id: 'Hours', cd_name: 'Hours' },
        { cd_id: 'Days', cd_name: 'Days' },
    ]
});