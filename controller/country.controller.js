
var mysql = require('../config/db').pool;
var async = require("async");
var countryManager = require("../models/countryModel");

var fs = require("fs");
var wlogger= require('../config/logger');
var reload = require('require-reload')(require);
var config = require('../config')();

function Pad(padString, value, length) {
    var str = value.toString();
    while (str.length < length)
        str = padString + str;

    return str;
}

exports.allAction = function (req, res, next) {
    var currDate = Pad("0",parseInt(new Date().getDate()), 2)+'_'+Pad("0",parseInt(new Date().getMonth() + 1), 2)+'_'+new Date().getFullYear();
    if (wlogger.logDate == currDate) {
        var logDir = config.log_path;
        var filePath = logDir + 'logs_'+currDate+'.log';
        fs.stat(filePath, function(err, stat) {
            if(err != null&& err.code == 'ENOENT') {
                wlogger = reload('../config/logger');
            }
        });
        next();
    } else {
        wlogger = reload('../config/logger');
        next();
    }
}

exports.getcountrydata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {

                    if(err)
                    {
                        var errorInfo = {
                            userName: req.session.icon_UserName,
                            action : 'getcountrydata.getConnection',
                            responseCode:500,
                            message : ' failed to get Connection '+JSON.stringify(err.message)
                        };
                        wlogger.error(errorInfo);
                    }
                    else
                    {
                        var info = {
                            userName: req.session.icon_UserName,
                            action : 'getcountrydata.getConnection',
                            responseCode:200,
                            message : ' get Connection successfully'
                        };
                        wlogger.info(info);
                    }

                    async.parallel({
                        CountryList: function (callback) {
                            countryManager.getCountryList(connection_ikon_cms, function( err, CountryList ) {

                                if(err)
                                {
                                var errorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'getCountryList',
                                    responseCode:500,
                                    message : ' failed to get CountryList '+JSON.stringify(err.message)
                                };
                                wlogger.error(errorInfo);
                            }
                                else  {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getCountryList',
                                        responseCode:200,
                                        message : ' get CountryList successfully'
                                    };
                                    wlogger.info(info);
                                }

                                callback( err, CountryList );
                            });
                        },
                        CountryGroups: function (callback) {
                            countryManager.getCountryGroups(connection_ikon_cms, function( err, CountryGroups ) {

                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getCountryGroups',
                                        responseCode:500,
                                        message : ' failed to get CountryGroups '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getCountryGroups',
                                        responseCode:200,
                                        message : ' get CountryGroups successfully'
                                    };
                                    wlogger.info(info);
                                }

                                callback( err, CountryGroups );
                            });
                        },
                        MasterCountryList: function (callback) {
                            countryManager.getMasterCountryList(connection_ikon_cms,function (err, MasterCountryList) {

                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getMasterCountryList',
                                        responseCode:500,
                                        message : ' failed to get Master CountryList '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getMasterCountryList',
                                        responseCode:200,
                                        message : ' get Master CountryList successfully'
                                    };
                                    wlogger.info(info);
                                }

                                callback(err, MasterCountryList);
                            });
                        },
                        CountryCurrency: function (callback) {
                            countryManager.getCountryCurrency(connection_ikon_cms,function (err, countryCurrency) {

                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getCountryCurrency',
                                        responseCode:500,
                                        message : ' failed to get Country Currency '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getCountryCurrency',
                                        responseCode:200,
                                        message : ' get Country Currency successfully'
                                    };
                                    wlogger.info(info);
                                }

                                callback(err, countryCurrency);
                            });
                        },
                        UserRole: function (callback) {
                            callback(null, req.session.icon_UserRole);
                        }
                    }, function (err, results) {

                        if (err) {

                            var errorInfo = {
                                userName: req.session.icon_UserName,
                                action : 'getcountrydata',
                                responseCode:500,
                                message : ' failed to get countrydata '+JSON.stringify(err.message)
                            };
                            wlogger.error(errorInfo);

                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {

                            var info = {
                                userName: req.session.icon_UserName,
                                action : 'getcountrydata',
                                responseCode:200,
                                message : ' get countrydata successfully'
                            };
                            wlogger.info(info);

                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
                });
            }
            else {

                var errorInfo = {
                    userName:'Unknown user',
                    action : 'getmanagecontentdata',
                    responseCode:500,
                    message : 'User session is not set'
                };
                wlogger.error(errorInfo);

                res.redirect('/accountlogin');
            }
        }
        else {

            var errorInfo = {
                userName:'Unknown user',
                action : 'getmanagecontentdata',
                responseCode:500,
                message : 'Session is not set'
            };
            wlogger.error(errorInfo);

            res.redirect('/accountlogin');
        }
    }
    catch (err) {

        var errorInfo = {
            userName: req.session.icon_UserName,
            action : 'getcountrydata',
            responseCode:500,
            message : ' failed to get countrydata '+JSON.stringify(err.message)
        };
        wlogger.error(errorInfo);

        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

exports.submitcountry = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {

                    if(err)
                    {
                        var errorInfo = {
                            userName: req.session.icon_UserName,
                            action : 'submitcountry.getConnection',
                            responseCode:500,
                            message : ' failed to get Connection '+JSON.stringify(err.message)
                        };
                        wlogger.error(errorInfo);
                    }
                    else
                    {
                        var info = {
                            userName: req.session.icon_UserName,
                            action : 'submitcountry.getConnection',
                            responseCode:200,
                            message : ' get Connection successfully'
                        };
                        wlogger.info(info);
                    }

                    if (req.body.status == "NewGroup") {
                        countryManager.getCountryGroupByGroupName(connection_ikon_cms, req.body.group_name.toLowerCase(), function( err, result ) {
                            if (err) {

                                var errorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'getCountryGroupByGroupName',
                                    responseCode:500,
                                    message : ' failed to get Country Group By GroupName '+JSON.stringify(err.message)
                                };
                                wlogger.error(errorInfo);

                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {

                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'getCountryGroupByGroupName',
                                    responseCode:200,
                                    message : ' get Country Group By GroupName successfully'
                                };
                                wlogger.info(info);


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

                            var info = {
                                userName: req.session.icon_UserName,
                                action : 'ChangedCountry',
                                responseCode:200,
                                message : ' Changed Country successfully'
                            };
                            wlogger.info(info);

                            changeloop(0);
                            function changeloop(cnt) {
                                var i = cnt;
                                countryManager.getLastInsertedCatalogueId( connection_ikon_cms, function( err, row ) {
                                    if (err) {

                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'getLastInsertedCatalogueId',
                                            responseCode:500,
                                            message : ' failed to get Last Inserted CatalogueId '+JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);

                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'getLastInsertedCatalogueId',
                                            responseCode:200,
                                            message : ' get Last Inserted CatalogueId-'+row[0].id+' successfully'
                                        };
                                        wlogger.info(info);

                                        var icon_country = {
                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                            cd_cm_id: req.body.icon_content_type,
                                            cd_name: req.body.ChangedCountry[i].cd_name,
                                            cd_display_name: req.body.ChangedCountry[i].cd_name,
                                            cd_desc: null,
                                            cd_desc1: null
                                        }
                                        console.log(icon_country);
                                        countryManager.createCatalogDetailForCountry( connection_ikon_cms, icon_country, function (err, result) {
                                            if (err) {

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'createCatalogDetailForCountry',
                                                    responseCode:500,
                                                    message : ' failed to create Catalog Detail For Country-'+req.body.ChangedCountry[i].cd_name+' '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'createCatalogDetailForCountry',
                                                    responseCode:200,
                                                    message : ' create Catalog Detail-'+req.body.ChangedCountry[0].cd_name+' For Country successfully'
                                                };
                                                wlogger.info(info);

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

                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'AddUpdateGroupCountry',
                                    responseCode:200,
                                    message : ' Added Update Group-'+req.body.group_name+' for Country successfully'
                                };
                                wlogger.info(info);

                                countryManager.getLastInsertedCatalogueId(connection_ikon_cms, function( err, row ) {
                                    if (err) {

                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'getLastInsertedCatalogueId',
                                            responseCode:500,
                                            message : ' failed to get Last Inserted CatalogueId '+JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);

                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'getLastInsertedCatalogueId',
                                            responseCode:200,
                                            message : ' get Last Inserted CatalogueId-'+req.body.group_name+' successfully'
                                        };
                                        wlogger.info(info);

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

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'createCatalogDetailForCountry',
                                                    responseCode:500,
                                                    message : ' failed to create Catalog Detail-'+req.body.group_name+' For Country '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'createCatalogDetailForCountry',
                                                    responseCode:200,
                                                    message : ' create Catalog Detail-'+req.body.group_name+' For Country successfully'
                                                };
                                                wlogger.info(info);

                                                countryManager.getLastInsertedIdFromCatalogMaster( connection_ikon_cms, function( err, result ) {
                                                    if (err) {

                                                        var errorInfo = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'getLastInsertedIdFromCatalogMaster',
                                                            responseCode:500,
                                                            message : ' failed to get Last Inserted Id-'+result[0].id+' From Catalog Master '+JSON.stringify(err.message)
                                                        };
                                                        wlogger.error(errorInfo);

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    } else {

                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'getLastInsertedIdFromCatalogMaster',
                                                            responseCode:200,
                                                            message : ' get Last Inserted Id-'+result[0].id+' From Catalog Master successfully'
                                                        };
                                                        wlogger.info(info);


                                                        Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                                        var country_master_group = {
                                                            cm_id: Groupid,
                                                            cm_name: req.body.group_name
                                                        }
                                                        countryManager.createCountryMasterGroup( connection_ikon_cms, country_master_group, function(err, result ) {
                                                            if (err) {

                                                                var errorInfo = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'createCountryMasterGroup',
                                                                    responseCode:500,
                                                                    message : ' failed to create Country MasterGroup-'+req.body.group_name+' '+JSON.stringify(err.message)
                                                                };
                                                                wlogger.error(errorInfo);

                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {

                                                                var info = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'createCountryMasterGroup',
                                                                    responseCode:200,
                                                                    message : ' create Country MasterGroup-'+req.body.group_name+' successfully'
                                                                };
                                                                wlogger.info(info);

                                                                countryManager.getLastInsertedCatalogueId(connection_ikon_cms, function(err, row ) {
                                                                    if (err) {

                                                                        var errorInfo = {
                                                                            userName: req.session.icon_UserName,
                                                                            action : 'getLastInsertedCatalogueId',
                                                                            responseCode:500,
                                                                            message : ' failed to get Last Inserted CatalogueId-'+row[0].id+' '+JSON.stringify(err.message)
                                                                        };
                                                                        wlogger.error(errorInfo);

                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {

                                                                        var info = {
                                                                            userName: req.session.icon_UserName,
                                                                            action : 'getLastInsertedCatalogueId',
                                                                            responseCode:200,
                                                                            message : ' get Last Inserted CatalogueId successfully'
                                                                        };
                                                                        wlogger.info(info);

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

                                                                                var errorInfo = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'createCatalogDetailForCountry',
                                                                                    responseCode:500,
                                                                                    message : ' failed to create Catalog Detail-'+req.body.group_name+' For Country '+JSON.stringify(err.message)
                                                                                };
                                                                                wlogger.error(errorInfo);

                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {

                                                                                var info = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'createCatalogDetailForCountry',
                                                                                    responseCode:200,
                                                                                    message : 'create Catalog Detail-'+req.body.group_name+' For Country successfully'
                                                                                };
                                                                                wlogger.info(info);

                                                                                addloop(0);
                                                                                function addloop(cnt) {
                                                                                    var i = cnt;
                                                                                    countryManager.getLastInsertedCatalogueId(connection_ikon_cms, function( err, row ) {
                                                                                        if (err) {

                                                                                            var errorInfo = {
                                                                                                userName: req.session.icon_UserName,
                                                                                                action : 'getLastInsertedCatalogueId',
                                                                                                responseCode:500,
                                                                                                message : ' failed to get Last Inserted CatalogueId '+JSON.stringify(err.message)
                                                                                            };
                                                                                            wlogger.error(errorInfo);

                                                                                            connection_ikon_cms.release();
                                                                                            res.status(500).json(err.message);
                                                                                        } else {

                                                                                            var info = {
                                                                                                userName: req.session.icon_UserName,
                                                                                                action : 'getLastInsertedCatalogueId',
                                                                                                responseCode:200,
                                                                                                message : ' get Last Inserted CatalogueId-'+row[0].id+' successfully'
                                                                                            };
                                                                                            wlogger.info(info);

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

                                                                                                    var errorInfo = {
                                                                                                        userName: req.session.icon_UserName,
                                                                                                        action : 'createCatalogDetailForCountry',
                                                                                                        responseCode:500,
                                                                                                        message : ' failed to create Catalog Detail-'+req.body.AddCountryForGroup[0].cd_name+' For Country '+JSON.stringify(err.message)
                                                                                                    };
                                                                                                    wlogger.error(errorInfo);


                                                                                                    connection_ikon_cms.release();
                                                                                                    res.status(500).json(err.message);
                                                                                                }
                                                                                                else {

                                                                                                    var info = {
                                                                                                        userName: req.session.icon_UserName,
                                                                                                        action : 'createCatalogDetailForCountry',
                                                                                                        responseCode:200,
                                                                                                        message : 'create Catalog Detail For Country-'+req.body.AddCountryForGroup[0].cd_name+' successfully'
                                                                                                    };
                                                                                                    wlogger.info(info);

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
                                            var errorInfo = {
                                                userName: req.session.icon_UserName,
                                                action : 'getLastInsertedCatalogueId',
                                                responseCode:500,
                                                message : ' failed to get Last Inserted CatalogueId-'+row[0].id+' '+JSON.stringify(err.message)
                                            };
                                            wlogger.error(errorInfo);

                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {

                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'getLastInsertedCatalogueId',
                                                responseCode:200,
                                                message : 'get Last Inserted CatalogueId-'+row[0].id+' successfully'
                                            };
                                            wlogger.info(info);


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

                                                    var errorInfo = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'createCatalogDetailForCountry',
                                                        responseCode:500,
                                                        message : ' failed to create Catalog Detail-'+req.body.AddCountryForGroup[i].cd_name+' For Country '+JSON.stringify(err.message)
                                                    };
                                                    wlogger.error(errorInfo);

                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {

                                                    var info = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'createCatalogDetailForCountry',
                                                        responseCode:200,
                                                        message : ' create Catalog Detail-'+req.body.AddCountryForGroup[i].cd_name+' For Country successfully'
                                                    };
                                                    wlogger.info(info);

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

                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'deleteCountryByGroupId',
                                            responseCode:500,
                                            message : ' failed to delete Country By GroupId-'+req.body.group_id+' '+JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);

                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'deleteCountryByGroupId',
                                            responseCode:200,
                                            message : ' delete Country By GroupId-'+req.body.group_id+' successfully'
                                        };
                                        wlogger.info(info);

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

                                var errorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'getCountries',
                                    responseCode:500,
                                    message : req.session.icon_UserName +' failed to get Countries '+JSON.stringify(err.message)
                                };
                                wlogger.error(errorInfo);

                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'getCountries',
                                    responseCode:200,
                                    message : ' get Countries successfully'
                                };
                                wlogger.info(info);

                                countryManager.getCountryGroups( connection_ikon_cms, function( err, CountryGroups ) {
                                    if (err) {

                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'getCountryGroups',
                                            responseCode:500,
                                            message : ' failed to get Country Groups '+JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);

                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'getCountryGroups',
                                            responseCode:200,
                                            message : ' get Country Groups successfully'
                                        };
                                        wlogger.info(info);

                                        countryManager.getCountryCurrency(connection_ikon_cms,function (err, countryCurrency) {
                                            if (err) {

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getCountryCurrency',
                                                    responseCode:500,
                                                    message : ' failed to get Country Currency '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getCountryCurrency',
                                                    responseCode:200,
                                                    message : ' get Country Currency successfully'
                                                };
                                                wlogger.info(info);

                                                countryManager.getMasterCountryList(connection_ikon_cms, function (err, MasterCountryList) {
                                                    if (err) {

                                                        var errorInfo = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'getMasterCountryList',
                                                            responseCode:500,
                                                            message : ' failed to get Master CountryList '+JSON.stringify(err.message)
                                                        };
                                                        wlogger.error(errorInfo);

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {

                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'getMasterCountryList',
                                                            responseCode:200,
                                                            message : ' get Master CountryList successfully'
                                                        };
                                                        wlogger.info(info);

                                                        connection_ikon_cms.release();

                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'submitcountry',
                                                            responseCode:200,
                                                            message : 'Country Data updated successfully.'
                                                        };
                                                        wlogger.info(info);

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
                var errorInfo = {
                    userName:'Unknown user',
                    action : 'submitcountry',
                    responseCode:500,
                    message : 'User session is not set'
                };
                wlogger.error(errorInfo);

                res.redirect('/accountlogin');
            }
        }
        else {

            var errorInfo = {
                userName:'Unknown user',
                action : 'submitcountry',
                responseCode:500,
                message : 'Session is not set'
            };

            res.redirect('/accountlogin');
        }
    }
    catch (err) {

        var errorInfo = {
            userName: req.session.icon_UserName,
            action : 'submitcountry',
            responseCode:500,
            message : ' failed to submit country '+JSON.stringify(err.message)
        };
        wlogger.error(errorInfo);

        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}