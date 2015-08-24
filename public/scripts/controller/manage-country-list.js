myApp.controller('manageCountryListCtrl', function ($scope, $http, ngProgress, $state, $stateParams, Countrys) {

    $('.removeActiveClass').removeClass('active');
    $('#manage-country-list').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.CurrentPage = $state.current.name;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.resetvisible = $stateParams.id ? false : true;
    $scope.country_content_type = "";
    $scope.addgroupvisible = false;
    $scope.groupcountryvisible = false;

    function GetCountrys(CountryData) {
        var CountryList = [];
        _.each($scope.AllCountryList, function (cnt) {
            var data = _.find(CountryData, function (managecnt) { return cnt.cd_id == managecnt.cty_id })
            if (!data) {
                CountryList.push(cnt);
            }
        })
        return CountryList;
    }



    function BindPageData(country) {
        $scope.SelectedGroup = "";
        $scope.selectedCountries = [];
        $scope.AllCountryList = _.where(country.CountryList, { cm_name: "Country" });
        var dist = _.find(country.CountryList, function (dist) { return dist.cm_name == "Country Distribution" });
        if (dist) {
            $scope.country_content_type = dist.cd_id;
        }
        $scope.OldManageCountry = _.where(country.ManagedCountrys, { isgroup: 0 });
        $scope.CountryList = GetCountrys($scope.OldManageCountry);
        $scope.ManagedCountrys = [];
        _.each(country.ManagedCountrys, function (cnt) {
            $scope.ManagedCountrys.push({ icn_ct_id: cnt.cty_id, icn_ct_name: cnt.isgroup == 1 ? cnt.cty_name : cnt.cd_name, isgroup: cnt.isgroup, isadded: false, groupdata: [] });
        })
        $scope.AllGroups = _.where(country.ManagedCountrys, { isgroup: 1 });
        $scope.AllGroups.unshift({ cty_id: -1, cty_name: "Add New Group", isgroup: 1 });
        $scope.ManagedGroupCountry = [];
        _.each(country.ManagedGroupCountry, function (cnt) {
            $scope.ManagedGroupCountry.push({ cd_id: cnt.cd_id, cd_name: cnt.cd_name, cmd_group_id: cnt.cmd_group_id, cmd_entity_detail: cnt.cmd_entity_detail, cmd_entity_type: cnt.cmd_entity_type, status: 'old' });
        })
        $scope.OldManagedGroupCountry = country.ManagedGroupCountry;
        $scope.SelectGroupChange();
    }

    Countrys.getCountrys({ state: $scope.CurrentPage }, function (country) {
        $scope.CountryPageLoadData = country;
        BindPageData($scope.CountryPageLoadData);
    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.resetform = function () {
        $scope.errorvisible = false;
        $scope.successvisible = false;
        BindPageData($scope.CountryPageLoadData);
    }

    $scope.add_countries = function () {
        _.each($scope.selectedCountries, function (selected) {
            var index = _.findIndex($scope.CountryList, function (cnt) { return cnt.cd_id == selected })
            if (index > -1) {
                var data = $scope.CountryList[index];
                $scope.ManagedCountrys.push({ icn_ct_id: data.cd_id, icn_ct_name: data.cd_name, isgroup: 0, isadded: true, groupdata: [] });
                $scope.CountryList.splice(index, 1);
            }
        })
        $scope.selectedCountries = [];
    }

    function GetGroupCountry(CountryData) {
        var CountryList = [];
        _.each($scope.AllCountryList, function (cnt) {
            var data = _.find(CountryData, function (managecnt) { return cnt.cd_id == managecnt.cmd_entity_detail })
            if (!data) {
                CountryList.push(cnt);
            }
        })
        return CountryList;
    }

    $scope.SelectGroupChange = function () {
        if (!$scope.SelectedGroup || $scope.SelectedGroup == "") {
            $scope.groupcountryvisible = false;
            $scope.addgroupvisible = false;
        }
        else if ($scope.SelectedGroup == -1) {
            $scope.GroupPendingCountry = [];
            _.each($scope.AllCountryList, function (country) {
                $scope.GroupPendingCountry.push(country)
            })
            $scope.GroupCountry = [];
            $scope.addgroupvisible = true;
            $scope.groupcountryvisible = true;
        }
        else {
            var groupcountry = _.where($scope.ManagedGroupCountry, { cmd_group_id: $scope.SelectedGroup });
            $scope.OldGroupPendingCountry = [];
            _.each(groupcountry, function (country) {
                $scope.OldGroupPendingCountry.push(country);
            });
            $scope.GroupPendingCountry = GetGroupCountry(groupcountry);
            $scope.GroupCountry = groupcountry;
            $scope.addgroupvisible = false;
            $scope.groupcountryvisible = true;
        }
    }

    $scope.left_countries = function () {
        _.each($scope.SelectedPendingCountry, function (selected) {
            var index = _.findIndex($scope.GroupPendingCountry, function (cnt) { return cnt.cd_id == selected })
            if (index > -1) {
                var data = $scope.GroupPendingCountry[index];
                $scope.GroupCountry.push({ cd_id: data.cd_id, cd_name: data.cd_name, cmd_group_id: $scope.SelectedGroup, cmd_entity_detail: data.cd_id, cmd_entity_type: $scope.country_content_type });
                $scope.GroupPendingCountry.splice(index, 1);
            }
        })
        $scope.SelectedPendingCountry = [];
    }

    $scope.right_countries = function () {
        _.each($scope.SelectedGroupCountry, function (selected) {
            var index = _.findIndex($scope.GroupCountry, function (cnt) { return cnt.cd_id == selected })
            if (index > -1) {
                var data = _.find($scope.AllCountryList, function (cnt) { return cnt.cd_id == selected })
                $scope.GroupPendingCountry.push(data);
                $scope.GroupCountry.splice(index, 1);
            }
        })
        $scope.SelectedGroupCountry = [];
    }

    function GetAddNewCountryInGroup(OldData, TotalData, group_id) {
        var AddArray = [];
        _.each(TotalData, function (total) {
            var data = _.find(OldData, function (old) { return old.cd_id == total.cmd_entity_detail });
            if (!data) {
                AddArray.push(total);
            }
        })
        return AddArray;
    }
    function GetDeleteNewCountryInGroup(OldData, TotalData, group_id) {
        var DeleteArray = [];
        _.each(OldData, function (old) {
            var data = _.find(TotalData, function (total) { return old.cd_id == total.cmd_entity_detail });
            if (!data) {
                DeleteArray.push(old);
            }
        })
        return DeleteArray;
    }

    $scope.SubmitForm = function (isValid) {
        $scope.errorvisible = false;
        $scope.successvisible = false;
        if (isValid) {

            var group;
            if (!$scope.SelectedGroup || $scope.SelectedGroup == "") {
                group = {
                    status: "NoGroup",
                    group_id: $scope.SelectedGroup,
                    group_name: '',
                    AddCountryForGroup: [],
                    DeleteCountryForGroup: [],
                    ChangedCountry: _.where($scope.ManagedCountrys, { isadded: true })
                }
            }
            else if ($scope.SelectedGroup == -1) {
                if ($scope.NewGroupName && $scope.NewGroupName != "") {
                    if ($scope.GroupCountry.length > 0) {
                        group = {
                            status: "NewGroup",
                            group_name: $scope.NewGroupName,
                            group_id: $scope.SelectedGroup,
                            AddCountryForGroup: $scope.GroupCountry,
                            DeleteCountryForGroup: [],
                            ChangedCountry: _.where($scope.ManagedCountrys, { isadded: true })
                        }
                    }
                    else {
                        $scope.error = "Please select country for new Group.";
                        $scope.errorvisible = true;
                    }
                }
                else {
                    $scope.error = "Group Name is required.";
                    $scope.errorvisible = true;
                }
            }
            else {
                if ($scope.GroupCountry.length > 0) {
                    group = {
                        status: "UpdateGroup",
                        group_id: $scope.SelectedGroup,
                        group_name: '',
                        AddCountryForGroup: GetAddNewCountryInGroup($scope.OldGroupPendingCountry, $scope.GroupCountry, $scope.SelectedGroup),
                        DeleteCountryForGroup: GetDeleteNewCountryInGroup($scope.OldGroupPendingCountry, $scope.GroupCountry, $scope.SelectedGroup),
                        ChangedCountry: _.where($scope.ManagedCountrys, { isadded: true })
                    }
                }
                else {
                    $scope.error = "Please select country for Group.";
                    $scope.errorvisible = true;
                }
            }
            if (group) {
                if (group.ChangedCountry.length > 0 || group.AddCountryForGroup.length > 0 || group.DeleteCountryForGroup.length > 0) {
                    ngProgress.start();
                    Countrys.SubmitCountrys(group, function (country) {
                        if (country.success) {
                            $scope.CountryPageLoadData = country;
                            BindPageData($scope.CountryPageLoadData);
                            $scope.success = country.message;
                            $scope.successvisible = true;
                        }
                        else {
                            $scope.error = country.message;
                            $scope.errorvisible = true;
                        }
                        ngProgress.complete();
                    }, function (error) {
                        $scope.error = error;
                        $scope.errorvisible = true;
                    });
                }
            }
        }
    }


});