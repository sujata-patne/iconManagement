/**
* Created by sujata.patne on 15-07-2015.
*/

myApp.controller('storeCtrl', function ($scope, $http, $stateParams, $state, ngProgress, Stores, _,$window) {
    //var json = { Stores: [{ td_store_Id: 1, td_store_name: "Wakau", td_contact_person: "Wakau", td_user_id: "abc@gmail.com", td_mobile_no: "9898983030", td_site_url: "wakau.in", store: [1, 3] },
    //            { td_store_Id: 2, td_store_name: "Daily Magic", td_contact_person: "Daily Magic", td_user_id: "plan@gmail.com", td_mobile_no: "9895675466", td_site_url: "dailymagic.in", store: [4, 3] },
    //            { td_store_Id: 3, td_store_name: "Store 1", td_contact_person: "Store 1", td_user_id: "creation@gmail.com", td_mobile_no: "9786556765", td_site_url: "store1.in", store: [2, 3]}],
    //    Channels: [{ cd_id: 1, cd_name: "All" },
    //            { cd_id: 2, cd_name: "Online[Web]" },
    //            { cd_id: 3, cd_name: "Mobile" },
    //            { cd_id: 4, cd_name: "IP TV" },
    //            { cd_id: 5, cd_name: "Kiosk"}]
    //};

    //$scope.Stores = amplify.store("Stores") ? amplify.store("Stores") : json.Stores;
    //amplify.store("Stores", $scope.Stores);
    //$scope.Channels = json.Channels;

    $('.removeActiveClass').removeClass('active');
    $('#store').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.CurrentPage = $state.current.name;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.resetvisible = $stateParams.id ? false : true;

    $scope.channel = [];
    $scope.OldStore = [];
    $scope.cmd_entity_type = 0;
    $scope.Stores = [];

    Stores.getStores({ Id: $stateParams.id, state: $scope.CurrentPage }, function (store) {
        if (store.Channels.length > 0) {
            $scope.Channels = store.Channels;
            $scope.cmd_entity_type = store.Channels[0].cm_id;
        }
        $scope.SelectStores = [];
        $scope.Stores = store.StoreList;

        if ($scope.CurrentPage == "edit-store") {
            $scope.OldStore = store.ChannelRights;

            _.each($scope.OldStore, function (channal) {
                $scope.SelectStores.push(channal.cmd_entity_detail);
            });

            $scope.Stores.forEach(function (store) {
                $scope.StoreName = store.st_name;
                $scope.StoreURL = store.st_url;
                $scope.StoreId = store.st_id;
                $scope.StoreFrontType = store.st_front_type;
            });

        }

    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    function GetDeleteStore(OldStore, SelectedStore) {
        var DeleteArray = [];
        _.each(OldStore, function (oldstore) {
            data = _.find(SelectedStore, function (selected, key) { return selected == oldstore.cmd_entity_detail; });
            if (!data) {
                DeleteArray.push(oldstore.cd_id);
            }
        });
        return DeleteArray;
    }

    function GetAddStore(OldStore, SelectedStore) {
        var AddArray = [];
        _.each(SelectedStore, function (selected) {
            data = _.find(OldStore, function (oldstore, key) { return selected == oldstore.cmd_entity_detail; });
            if (!data) {
                AddArray.push(selected);
            }
        });
        return AddArray;
    }


    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            ngProgress.start();
            var store = {
                state: $scope.CurrentPage,
                storeId: $scope.StoreId,
                store_name: $scope.StoreName,
                td_site_url: $scope.StoreURL,
                store_cmd_entity_type: $scope.cmd_entity_type,
                store: $scope.SelectStores,
                store_front_type: $scope.StoreFrontType,
                AddStore: GetAddStore($scope.OldStore, $scope.SelectStores),
                DeleteStore: GetDeleteStore($scope.OldStore, $scope.SelectStores)
            };
            ngProgress.start();
            Stores.AddEditStore(store, function (data) {

                if (data.success) {
                    if ($scope.CurrentPage == "edit-store") {
                       $window.location.href = "#add-store";
                    }
                    else {
                        $scope.StoreName = '';
                        $scope.StoreURL = '';
                        $scope.SelectStores = [];
                        $scope.storeForm.$setPristine();
                        $scope.Stores.push(data.StoreList[0]);
                    }
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
});