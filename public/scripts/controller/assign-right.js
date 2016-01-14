
myApp.controller('assignRightCtrl', function ($scope, $http, ngProgress, $stateParams, AssignRights, $state, _, $window,$timeout) {
    $('.removeActiveClass').removeClass('active');
    $('#assign-right').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.CurrentPage = $state.current.name;
    $scope.jetPayDetials = [];

    AssignRights.getPricePointType(function (paymentTypes){
        if(paymentTypes && paymentTypes.length > 0){
            $scope.AllPaymentTypes = angular.copy(paymentTypes);
        }else{
            $scope.AllPaymentTypes = [{'en_id':1, 'en_display_name':'One Time'},{'en_id':2, 'en_display_name':'Subscription'}];
        }
    },function(error){
        console.log(error);
    });

    AssignRights.GetAssignRights({ state: $scope.CurrentPage }, function (assignrights) {
         $scope.Stores = assignrights.Stores;
        $scope.UserDetails = assignrights.StoresUserDetails;

        $scope.StoreChannels = assignrights.StoreChannels;
        $scope.AllContentTypes = assignrights.ContentTypes;
        $scope.AllCountrys = assignrights.Countrys;
        /*As Payment types are not added in DB table, also fuse dev are manually adding 1 : Subscription and 2: One Time in respective table*/
        //$scope.AllPaymentTypes = assignrights.PaymentTypes;
        $scope.AllPaymentChannels = assignrights.PaymentChannels;
        $scope.VendorCountry = assignrights.VendorCountry;
        $scope.IconGroupCountry = assignrights.IconGroupCountry;
        $scope.CountryGroups = _.where(assignrights.Countrys, { group_status: "group" });
        $scope.IconOnlyCountry = assignrights.IconCountry;


        $scope.AssignCountrys = assignrights.AssignCountrys;
        $scope.AssignPaymentTypes = assignrights.AssignPaymentTypes;
        $scope.AssignPaymentChannels = assignrights.AssignPaymentChannels;
        $scope.AssignContentTypes = assignrights.AssignContentTypes;
        $scope.AssignVendors = assignrights.AssignVendors;

        var srorecontent = _.find(assignrights.MasterList, function (store) { return store.cm_name == "Store" });
        if (srorecontent) {
            $scope.StoreContentType = srorecontent.cd_id;
        }
        if ($scope.CurrentPage == "assign-right-manage") {
            $scope.SelectedStore = parseInt($stateParams.id);

            if($scope.SelectedStore != undefined && $scope.SelectedStore != '' && $scope.SelectedStore != null){
                $scope.getJetPayDetails($scope.SelectedStore);
            }
             $scope.storeChange();
        }

    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    /*$scope.$watch('SelectedStore',function(){
        if($scope.SelectedStore != undefined && $scope.SelectedStore != '' && $scope.SelectedStore != null){
            $scope.getJetPayDetailsForAlaCart($scope.SelectedStore);
            $scope.getJetPayDetailsForSubscription($scope.SelectedStore);
        }
    }, {},true);*/

    $scope.getAlaCartEvents = function(storeId) {
        AssignRights.getJetPayDetailsForAlaCart(storeId, function (jetPayDetials) {
            $scope.jetPayDetials[2] = angular.copy(jetPayDetials);
        })
    }

    $scope.getSubscriptionEvents = function(storeId) {
        AssignRights.getJetPayDetailsForSubscription(storeId, function (jetPayDetials) {
            $scope.jetPayDetials[1] = angular.copy(jetPayDetials);
        })
    }

    $scope.getJetPayDetails = function(storeId){
        $scope.getAlaCartEvents(storeId);
        $scope.getSubscriptionEvents(storeId);
        $timeout(function(){
            if($scope.jetPayDetials.length > 0){
                $scope.getPaymentChannels();
            }
            $scope.countryChange();
        }, 1000)

    }

    $scope.getPaymentChannels = function(){
        $scope.PaymentChannels = [];
        var countries = GetSelectedCountry($scope.SelectedGeoLocation);
        var channelarray = [];
        var paymentchannels = [];
        Object.keys($scope.jetPayDetials).forEach(function(paymentType) {
            _.filter($scope.SelectedPaymentType, function (paymentType) {
                paymentchannels = _.filter($scope.jetPayDetials[paymentType], function (channel) {
                    if(channel.country != null ) {
                        return _.contains(countries, channel.country)
                    }
                });

                _.each(paymentchannels, function (channel) {
                    if (!_.has( $scope.PaymentChannels, channel.partner_id)) {
                        $scope.PaymentChannels[channel.partner_id] = {};
                    }
                    if (channelarray.indexOf(channel.partner_id) === -1) {
                        channelarray.push(channel.partner_id);
                        $scope.PaymentChannels[channel.partner_id] = channel.partner_name;
                    }
                });
            })
        })
    }


    $scope.$watch('SelectedPaymentType',function(){
        $scope.getPaymentChannels();
    }, {}, true);

    $scope.$watch('SelectedGeoLocation',function(){

        $scope.getPaymentChannels();
        $scope.countryChange();

    }, {},true);

    $scope.storeChange = function () {

        var store = _.find($scope.Stores, function (store) { return store.st_id == $scope.SelectedStore });
        if (store) {
            var storeUsers = _.find($scope.UserDetails, function (user) { return user.su_st_id == $scope.SelectedStore });

            $scope.storeUserEmail = storeUsers.ld_email_id;

            $scope.PricePointDetail = store.st_pricepoint_url;
            $scope.country_group_id = store.st_country_distribution_rights;
            $scope.payment_type_group_id = store.st_payment_type;
            $scope.payment_channel_group_id = store.st_payment_channel;
            $scope.vendor_group_id = store.st_vendor;
            $scope.content_type_group_id = store.st_content_type;
            $scope.ContentTypes = $scope.AllContentTypes;
            $scope.Countrys = $scope.AllCountrys;
            $scope.PaymentTypes = $scope.AllPaymentTypes;
            $scope.SelectedGeoLocation = _.pluck(_.where($scope.AssignCountrys, { cmd_group_id: store.st_country_distribution_rights }), "cmd_entity_detail");
            $scope.SelectedPaymentType = _.pluck(_.where($scope.AssignPaymentTypes, { cmd_group_id: store.st_payment_type }), "cmd_entity_detail");
            $scope.SelectContentType = _.pluck(_.where($scope.AssignContentTypes, { cmd_group_id: store.st_content_type }), "cmd_entity_detail");

            $scope.SelectedVendor = _.pluck(_.where($scope.AssignVendors, { cmd_group_id: store.st_vendor }), "cmd_entity_detail");
            $scope.SelectedPaymentChannel = _.pluck(_.where($scope.AssignPaymentChannels, { cmd_group_id: store.st_payment_channel }), "cmd_entity_detail");

            if($scope.SelectedStore != undefined && $scope.SelectedStore != '' && $scope.SelectedStore != null){
                $scope.getJetPayDetails($scope.SelectedStore);
            }
        }
        else {
            $scope.storeUserEmail = null;
            $scope.PricePointDetail = null;
            $scope.country_group_id = null;
            $scope.payment_type_group_id = null;
            $scope.payment_channel_group_id = null;
            $scope.vendor_group_id = null;
            $scope.content_type_group_id = null;
            $scope.Vendors = [];
            $scope.ContentTypes = [];
            $scope.Countrys = [];
            $scope.PaymentTypes = [];
            $scope.PaymentChannels = [];
            $scope.SelectedGeoLocation = [];
            $scope.SelectedPaymentType = [];
            $scope.SelectedPaymentChannel = [];
            $scope.SelectContentType = [];
            $scope.SelectedVendor = [];
        }
    }

    function GetSelectedCountry(selectedcountry) {
        var country = [];
        var group = [];
        _.each(selectedcountry, function (item) {
            var match = _.find($scope.IconOnlyCountry, function (country) { return country.cd_id == item });
            if (match) {
                country.push(item);
            }
            else {
                group.push(item);
            }
        });

        _.each(group, function (item) {

            var match = _.find($scope.CountryGroups, function (country) {
                return country.cd_id == item });
            if (match) {

                var groupcountry = _.where($scope.IconGroupCountry, { cm_name: match.cd_name });

                _.each(groupcountry, function (item) {

                    country.push(item.cd_id);
                });
            }
        });

        country = _.unique(country);

        return country;
    }

    $scope.countryChange = function () {

        var countries = GetSelectedCountry($scope.SelectedGeoLocation);
       // console.log(countries)

        var Vendors = _.filter($scope.VendorCountry, function (country) {
            return _.contains(countries, country.r_country_distribution_rights) });
        var Vendorarray = [];
        $scope.Vendors = [];
        _.each(Vendors, function (cnt) {
            if (Vendorarray.indexOf(cnt.vd_id) == -1) {
                Vendorarray.push(cnt.vd_id);
                $scope.Vendors.push(cnt);
            }
        });
        /*var storechannels = _.pluck(_.where($scope.StoreChannels, { st_id: $scope.SelectedStore }), "cmd_entity_detail");
        var paymentchannels = _.filter($scope.PartnerDistibutionChannels, function (channel) { return _.contains($scope.SelectedGeoLocation, channel.partner_cty_id) && _.contains(storechannels, channel.en_id) });
        var channelarray = [];
        $scope.PaymentChannels = [];
        _.each(paymentchannels, function (channel) {
            if (channelarray.indexOf(channel.partner_id) == -1) {
                channelarray.push(channel.partner_id);
                $scope.PaymentChannels.push(channel);
            }
        });*/

    }

    function GetDeleteAssignRights(OldData, SelectedData, GroupId, type, DeleteArray) {
        _.each(OldData, function (old) {
            var data = _.find(SelectedData, function (selected, key) { return selected == old.cmd_entity_detail && old.cmd_group_id == GroupId });
            if (!data) {
                DeleteArray.push({ cmd_entity_detail: old.cmd_entity_detail, cmd_group_id: GroupId, Type: type });
            }
        });
        return DeleteArray;
    }

    function GetAddAssignRights(OldData, SelectedData, GroupId, type, AddArray) {
        _.each(SelectedData, function (selected) {
            var data = _.find(OldData, function (old, key) { return selected == old.cmd_entity_detail && old.cmd_group_id == GroupId });
            if (!data) {
                AddArray.push({ cmd_entity_detail: selected, cmd_group_id: GroupId, Type: type });
            }
        });
        return AddArray;
    }

    $scope.resetForm = function () {
$scope.PaymentTypes = [];
        $scope.Countrys = [];
        $scope.PaymentChannels = [];
        $scope.Vendors = [];
        $scope.ContentTypes = [];
        $scope.successvisible = false;
        $scope.errorvisible = false;
    }

    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            var AddArray = [];
            var DeleteArray = [];
            AddArray = GetAddAssignRights(_.where($scope.AssignCountrys, { cmd_group_id: $scope.country_group_id }), $scope.SelectedGeoLocation, $scope.country_group_id, "country", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignCountrys, { cmd_group_id: $scope.country_group_id }), $scope.SelectedGeoLocation, $scope.country_group_id, "country", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignPaymentTypes, { cmd_group_id: $scope.payment_type_group_id }), $scope.SelectedPaymentType, $scope.payment_type_group_id, "paymenttype", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignPaymentTypes, { cmd_group_id: $scope.payment_type_group_id }), $scope.SelectedPaymentType, $scope.payment_type_group_id, "paymenttype", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignPaymentChannels, { cmd_group_id: $scope.payment_channel_group_id }), $scope.SelectedPaymentChannel, $scope.payment_channel_group_id, "paymentchannel", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignPaymentChannels, { cmd_group_id: $scope.payment_channel_group_id }), $scope.SelectedPaymentChannel, $scope.payment_channel_group_id, "paymentchannel", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignContentTypes, { cmd_group_id: $scope.content_type_group_id }), $scope.SelectContentType, $scope.content_type_group_id, "contenttype", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignContentTypes, { cmd_group_id: $scope.content_type_group_id }), $scope.SelectContentType, $scope.content_type_group_id, "contenttype", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignVendors, { cmd_group_id: $scope.vendor_group_id }), $scope.SelectedVendor, $scope.vendor_group_id, "vendor", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignVendors, { cmd_group_id: $scope.vendor_group_id }), $scope.SelectedVendor, $scope.vendor_group_id, "vendor", DeleteArray);

            var store = {
                storeId: $scope.SelectedStore,
                storeUserEmail: $scope.storeUserEmail,
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
                if (data.success) {
                    $window.location.href = "#add-store";
                    toastr.success(data.message);
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            }
            , function (error) {
                toastr.error(error);
                $scope.errorvisible = true;
                ngProgress.complete();
            });
        }
    };

});
