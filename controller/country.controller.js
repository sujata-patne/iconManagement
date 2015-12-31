
var mysql = require('../config/db').pool;
var async = require("async");
var countryManager = require("../models/countryModel");
exports.getcountrydata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                        CountryList: function (callback) {
                            countryManager.getCountryList(connection_ikon_cms, function( err, CountryList ) {
                                callback( err, CountryList );
                            });
                        },
                        CountryGroups: function (callback) {
                            countryManager.getCountryGroups(connection_ikon_cms, function( err, CountryGroups ) {
                                callback( err, CountryGroups );
                            });
                        },
                        MasterCountryList: function (callback) {
                            countryManager.getMasterCountryList(connection_ikon_cms,function (err, MasterCountryList) {
                                callback(err, MasterCountryList);
                            });
                        },
                        CountryCurrency: function (callback) {
                            countryManager.getCountryCurrency(connection_ikon_cms,function (err, countryCurrency) {
                                callback(err, countryCurrency);
                            });
                        },
                        UserRole: function (callback) {
                            callback(null, req.session.icon_UserRole);
                        }
                    }, function (err, results) {

                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

exports.submitcountry = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {

                    if (req.body.status == "NewGroup") {
                        countryManager.getCountryGroupByGroupName(connection_ikon_cms, req.body.group_name.toLowerCase(), function( err, result ) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                if (result.length > 0) {
                                    res.send({
                                        success: false,
                                        message: 'Group Name must be Unique.',
                                        CountryGroups: [],
                                        CountryList: [],
                                        RoleUser: req.session.icon_UserRole
                                    });
                                }
                                else {
                                    ChangedCountry();
                                }
                            }
                        });
                    }
                    else {
                        ChangedCountry();
                    }

                    function ChangedCountry() {
                        var storelength = req.body.ChangedCountry.length;
                        if (req.body.ChangedCountry.length > 0) {
                            changeloop(0);
                            function changeloop(cnt) {
                                var i = cnt;
                                countryManager.getLastInsertedCatalogueId( connection_ikon_cms, function( err, row ) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var icon_country = {
                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                            cd_cm_id: req.body.icon_content_type,
                                            cd_name: req.body.ChangedCountry[i].cd_name,
                                            cd_display_name: req.body.ChangedCountry[i].cd_name,
                                            cd_desc: null,
                                            cd_desc1: null
                                        }
                                        countryManager.createCatalogDetailForCountry( connection_ikon_cms, icon_country, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                cnt = cnt + 1;
                                                if (cnt == storelength) {
                                                    AddUpdateGroupCountry();
                                                } else {
                                                    changeloop(cnt);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            AddUpdateGroupCountry();
                        }
                    }
                    function AddUpdateGroupCountry() {
                        if (req.body.status == "NewGroup") {
                            var storelength = req.body.AddCountryForGroup.length;
                            if (req.body.AddCountryForGroup.length > 0) {
                                countryManager.getLastInsertedCatalogueId(connection_ikon_cms, function( err, row ) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var icon_country = {
                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                            cd_cm_id: req.body.content_group,
                                            cd_name: req.body.group_name,
                                            cd_display_name: req.body.group_name,
                                            cd_desc: null,
                                            cd_desc1: null
                                        }
                                        countryManager.createCatalogDetailForCountry( connection_ikon_cms, icon_country, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                countryManager.getLastInsertedIdFromCatalogMaster( connection_ikon_cms, function( err, result ) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    } else {
                                                        Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                                        var country_master_group = {
                                                            cm_id: Groupid,
                                                            cm_name: req.body.group_name
                                                        }
                                                        countryManager.createCountryMasterGroup( connection_ikon_cms, country_master_group, function(err, result ) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                countryManager.getLastInsertedCatalogueId(connection_ikon_cms, function(err, row ) {
                                                                    if (err) {
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {
                                                                        var icon_country = {
                                                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                            cd_cm_id: req.body.icon_content_type,
                                                                            cd_name: req.body.group_name,
                                                                            cd_display_name: req.body.group_name,
                                                                            cd_desc: null,
                                                                            cd_desc1: null
                                                                        }
                                                                        countryManager.createCatalogDetailForCountry( connection_ikon_cms, icon_country, function( err, result ){
                                                                            if (err) {
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                addloop(0);
                                                                                function addloop(cnt) {
                                                                                    var i = cnt;
                                                                                    countryManager.getLastInsertedCatalogueId(connection_ikon_cms, function( err, row ) {
                                                                                        if (err) {
                                                                                            connection_ikon_cms.release();
                                                                                            res.status(500).json(err.message);
                                                                                        } else {
                                                                                            var icon_country = {
                                                                                                cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                                                cd_cm_id: Groupid,
                                                                                                cd_name: req.body.AddCountryForGroup[i].cd_name,
                                                                                                cd_display_name: req.body.AddCountryForGroup[i].cd_name,
                                                                                                cd_desc: null,
                                                                                                cd_desc1: null
                                                                                            }
                                                                                            countryManager.createCatalogDetailForCountry(connection_ikon_cms, icon_country, function( err, result ) {
                                                                                                if (err) {
                                                                                                    connection_ikon_cms.release();
                                                                                                    res.status(500).json(err.message);
                                                                                                }
                                                                                                else {
                                                                                                    cnt = cnt + 1;
                                                                                                    if (cnt == storelength) {
                                                                                                        GetAllReturnData();
                                                                                                    } else {
                                                                                                        addloop(cnt);
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                GetAllReturnData();
                            }
                        }
                        else if (req.body.status == "UpdateGroup") {
                            var storelength = req.body.AddCountryForGroup.length;
                            if (req.body.AddCountryForGroup.length > 0) {
                                updateloop(0);
                                function updateloop(cnt) {
                                    var i = cnt;
                                    countryManager.getLastInsertedCatalogueId( connection_ikon_cms, function( err, row ) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            var icon_country = {
                                                cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                cd_cm_id: req.body.group_id,
                                                cd_name: req.body.AddCountryForGroup[i].cd_name,
                                                cd_display_name: req.body.AddCountryForGroup[i].cd_name,
                                                cd_desc: null,
                                                cd_desc1: null
                                            }
                                            countryManager.createCatalogDetailForCountry(connection_ikon_cms, icon_country, function( err, result ) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    cnt = cnt + 1;
                                                    if (cnt == storelength) {
                                                        DeleteGroupCountry();
                                                    } else {
                                                        updateloop(cnt);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                DeleteGroupCountry();
                            }
                        }
                        else {
                            GetAllReturnData();
                        }
                    }
                    function DeleteGroupCountry() {
                        console.log(req.body.DeleteCountryForGroup);
                        var storelength = req.body.DeleteCountryForGroup.length;
                        if (storelength > 0) {
                            var count = 0;
                            deleteloop(count);
                            function deleteloop(i) {
                                countryManager.deleteCountryByGroupId( connection_ikon_cms, req.body.DeleteCountryForGroup[i].cd_id, req.body.group_id, function( err, row, fields ) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        count++;
                                        if (count == storelength) {
                                            GetAllReturnData();
                                        }
                                        else {
                                            deleteloop(count);
                                        }
                                    }
                                });
                            };
                        }
                        else {
                            GetAllReturnData();
                        }
                    }
                    function GetAllReturnData() {
                        countryManager.getCountries( connection_ikon_cms, function( err, Countrys ) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                countryManager.getCountryGroups( connection_ikon_cms, function( err, CountryGroups ) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        countryManager.getCountryCurrency(connection_ikon_cms,function (err, countryCurrency) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                countryManager.getMasterCountryList(connection_ikon_cms, function (err, MasterCountryList) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        connection_ikon_cms.release();
                                                        res.send({
                                                            success: true,
                                                            message: 'Country Data updated successfully.',
                                                            MasterCountryList: MasterCountryList,
                                                            CountryGroups: CountryGroups,
                                                            CountryCurrency: countryCurrency,
                                                            CountryList: Countrys,
                                                            RoleUser: req.session.icon_UserRole
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}