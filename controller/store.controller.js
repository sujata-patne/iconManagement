
var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');
var async = require("async");
var storeManager = require("../models/storeModel");
var userManager = require("../models/userModel");
var config = require('../config')();
var SitePath = config.site_path+":"+config.port;

var fs = require("fs");
var wlogger= require('../config/logger');
var reload = require('require-reload')(require);
var common = require("../helpers/common");


exports.allAction = function (req, res, next) {
    var currDate = common.Pad("0",parseInt(new Date().getDate()), 2)+'_'+common.Pad("0",parseInt(new Date().getMonth() + 1), 2)+'_'+new Date().getFullYear();
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

exports.getstoredata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if(err)
                    {
                        var errorInfo = {
                            userName: req.session.icon_UserName,
                            action : 'getstoredata.getConnection',
                            responseCode:500,
                            message : ' failed to get Connection '+JSON.stringify(err.message)
                        };
                        wlogger.error(errorInfo);
                    }
                    else
                    {
                        var info = {
                            userName: req.session.icon_UserName,
                            action : 'getstoredata.getConnection',
                            responseCode:200,
                            message : ' get Connection successfully'
                        };
                        wlogger.info(info);
                    }

                    async.parallel({
                        Channels: function( callback ) {
                            storeManager.getDistributionChannelList(connection_ikon_cms,function (err, Channels) {
                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getDistributionChannelList',
                                        responseCode:500,
                                        message : ' failed to get Distribution Channel List '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getDistributionChannelList',
                                        responseCode:200,
                                        message : ' get Distribution ChannelList successfully'
                                    };
                                    wlogger.info(info);
                                }
                                callback(err, Channels);
                            });
                        },
                        StoreList: function (callback) {
                            storeManager.getStoreList(connection_ikon_cms, req.body, function (err, StoreList) {
                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getStoreList',
                                        responseCode:500,
                                        message : ' failed to get Store List '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getStoreList',
                                        responseCode:200,
                                        message : ' get StoreList successfully'
                                    };
                                    wlogger.info(info);
                                }

                                callback(err, StoreList);
                            });
                        },
                        ChannelRights: function (callback) {
                            storeManager.getChannelRights(connection_ikon_cms, req.body.state, req.body.Id, function (err, ChannelRights) {
                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getChannelRights',
                                        responseCode:500,
                                        message : ' failed to get ChannelRights '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getChannelRights',
                                        responseCode:200,
                                        message : ' get Channel Rights successfully'
                                    };
                                    wlogger.info(info);
                                }
                                callback(err, ChannelRights);
                            });
                        },
                        UserRole: function (callback) {
                            callback(null, req.session.icon_UserRole);
                        }
                    }, function (err, results) {
                        if (err) {

                            var errorInfo = {
                                userName: req.session.icon_UserName,
                                action : 'getstoredata',
                                responseCode:500,
                                message : ' failed to get storedata '+JSON.stringify(err.message)
                            };
                            wlogger.error(errorInfo);

                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {

                            var info = {
                                userName: req.session.icon_UserName,
                                action : 'getstoredata',
                                responseCode:200,
                                message : ' get storedata successfully'
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
                        action : 'getstoredata',
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
                action : 'getstoredata',
                responseCode:500,
                message : 'Session is not set'
            };
            wlogger.error(errorInfo);

            res.redirect('/accountlogin');
        }
    }
    catch (err) {

        if(err)
        {
            var errorInfo = {
                userName: req.session.icon_UserName,
                action : 'getstoredata',
                responseCode:500,
                message : ' failed to get storedata '+JSON.stringify(err.message)
            };
            wlogger.error(errorInfo);
        }

        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

exports.AddEditStore = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    userManager.getIcnUserByEmailId( connection_ikon_cms, req.body.store_email.toLowerCase(), function( err, result) {
                        if (err) {
                            var errorInfo = {
                                userName: req.session.icon_UserName,
                                action : 'getIcnUserByEmailId',
                                responseCode:500,
                                message : ' failed to get IcnUserByEmailId '+JSON.stringify(err.message)
                            };
                            wlogger.error(errorInfo);

                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {

                            var info = {
                                userName: req.session.icon_UserName,
                                action : 'getIcnUserByEmailId',
                                responseCode:200,
                                message : ' get IcnUser By EmailId successfully'
                            };
                            wlogger.info(info);

                            if (result.length > 0) {
                                if (result[0].ld_id == req.body.store_ld_id && req.body.state == "edit-store") {
                                    storeManager.getStoreDetailsByStoreSiteUrl( connection_ikon_cms, req.body.store_site_url.toLowerCase(), function( err, result ) {
                                        if (err) {

                                            var errorInfo = {
                                                userName: req.session.icon_UserName,
                                                action : 'getStoreDetailsByStoreSiteUrl',
                                                responseCode:500,
                                                message : ' failed to get Store Details By Store Site Url '+JSON.stringify(err.message)
                                            };
                                            wlogger.error(errorInfo);

                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {

                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'getStoreDetailsByStoreSiteUrl',
                                                responseCode:200,
                                                message : 'get Store Details By Store Site Url successfully'
                                            };
                                            wlogger.info(info);

                                            if (result.length > 0) {
                                                if (result[0].st_id == req.body.store_id) {
                                                    StoreCrud();
                                                }
                                                else {
                                                    connection_ikon_cms.release();
                                                    res.send({ success: false, message: 'Site Url Must be Unique' });
                                                }
                                            } else {
                                                StoreCrud();
                                            }
                                        }
                                    });
                                }
                                else {
                                    connection_ikon_cms.release();
                                    res.send({ success: false, message: 'User Id Must be Unique' });
                                }
                            }
                            else {
                                storeManager.getStoreDetailsByStoreSiteUrl( connection_ikon_cms, req.body.store_site_url.toLowerCase(), function( err, result ) {
                                    if (err) {

                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'getStoreDetailsByStoreSiteUrl',
                                            responseCode:500,
                                            message : ' failed to get Store Details By Store Site Url '+JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);

                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'getStoreDetailsByStoreSiteUrl',
                                            responseCode:200,
                                            message : 'get Store Details By Store Site Url successfully'
                                        };
                                        wlogger.info(info);

                                        if (result.length > 0) {
                                            if (result[0].st_id == req.body.store_id) {
                                                StoreCrud();
                                            }
                                            else {
                                                connection_ikon_cms.release();
                                                res.send({ success: false, message: 'Site Url Must be Unique' });
                                            }
                                        } else {
                                            StoreCrud();
                                        }
                                    }
                                });
                            }
                        }
                    });


                    function StoreCrud() {
                        var uniqueID = ("_"+new Date().getTime()).substring(9,13);

                        storeManager.getStoreByName( connection_ikon_cms, req.body.store_name.toLocaleLowerCase(), function( err, result ) {
                            if (err) {

                                var errorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'getStoreByName',
                                    responseCode:500,
                                    message :' failed to get Store-'+req.body.store_name +' By Name '+JSON.stringify(err.message)
                                };
                                wlogger.error(errorInfo);

                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'getStoreByName',
                                    responseCode:200,
                                    message : ' got Store-'+req.body.store_name +' By Name successfully'
                                };
                                wlogger.info(info);

                                if (result.length > 0) {
                                    if (result[0].st_id == req.body.store_id && req.body.state == "edit-store") {
                                        if (req.body.DeleteStoreChannels.length > 0) {
                                            DeleteChannelsforStore();
                                        }
                                        else {
                                            EditStore();
                                        }
                                    }
                                    else {
                                        res.send({ success: false, message: 'Store Name Must be Unique' });
                                    }
                                }
                                else {
                                    if (req.body.state == "edit-store") {
                                        if (req.body.DeleteStoreChannels.length > 0) {
                                            DeleteChannelsforStore();
                                        }
                                        else {
                                            EditStore();
                                        }
                                    }else {
                                        AddStoreChannels();
                                    }
                                }
                                function EditStore() {
                                    var updateQuery = {
                                        "st_name" : req.body.store_name,
                                        "st_url" : req.body.store_site_url,
                                        "st_modified_on" : new Date(),
                                        "st_modified_by" : req.session.icon_UserName
                                    }
                                    storeManager.updateIcnStore( connection_ikon_cms, updateQuery, req.body.store_id, function( err, result ){
                                        if (err) {
                                            var errorInfo = {
                                                userName: req.session.icon_UserName,
                                                action : 'updateIcnStore',
                                                responseCode:500,
                                                message : ' failed to update Store-'+req.body.store_name +JSON.stringify(err.message)
                                            };
                                            wlogger.error(errorInfo);

                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {

                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'updateIcnStore',
                                                responseCode:200,
                                                message : ' updated store-'+req.body.store_name +' successfully'
                                            };
                                            wlogger.info(info);

                                            updateIcnLoginDetailsQuery = {
                                               // "ld_user_id" : req.body.store_email.split('@')[0],
                                                "ld_user_name" : req.body.store_email,
                                                "ld_email_id" : req.body.store_email,
                                                "ld_display_name" : req.body.store_contact_person,
                                                "ld_mobile_no" : req.body.store_user_no,
                                                "ld_modified_on" : new Date(),
                                                "ld_modified_by" :req.session.icon_UserName
                                            }

                                            storeManager.updateIcnLoginDetails( connection_ikon_cms, updateIcnLoginDetailsQuery, req.body.store_ld_id, function( err, result ) {
                                                if (err) {

                                                    var errorInfo = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'updateIcnLoginDetails',
                                                        responseCode:500,
                                                        message : ' failed to update Icn Login Details '+JSON.stringify(err.message)
                                                    };
                                                    wlogger.error(errorInfo);

                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                } else {

                                                    var info = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'updateIcnLoginDetails',
                                                        responseCode:200,
                                                        message : ' update Icn Login Details successfully'
                                                    };
                                                    wlogger.info(info);

                                                    var storelength = req.body.AddStoreChannels.length;
                                                    if (req.body.AddStoreChannels.length > 0) {
                                                        loop(0);
                                                        function loop(cnt) {
                                                            var i = cnt;
                                                            storeManager.getLastInsertedMultiSelectMetaDataDetail( connection_ikon_cms, function( err, row ) {
                                                                if (err) {

                                                                    var errorInfo = {
                                                                        userName: req.session.icon_UserName,
                                                                        action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                                        responseCode:500,
                                                                        message : ' failed get Last Inserted Multi Select MetaData Detail '+JSON.stringify(err.message)
                                                                    };
                                                                    wlogger.error(errorInfo);


                                                                    connection_ikon_cms.release(); ;
                                                                    res.status(500).json(err.message);
                                                                } else {

                                                                    var info = {
                                                                        userName: req.session.icon_UserName,
                                                                        action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                                        responseCode:200,
                                                                        message : ' get Last Inserted Multi Select MetaData Detail successfully'
                                                                    };
                                                                    wlogger.info(info);

                                                                    var metadata = {
                                                                        cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                        cmd_group_id: req.body.store_front_type,
                                                                        cmd_entity_type: req.body.store_cmd_entity_type,
                                                                        cmd_entity_detail: req.body.AddStoreChannels[i]
                                                                    }
                                                                    storeManager.createMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function( err, result ){
                                                                        if (err) {

                                                                            var errorInfo = {
                                                                                userName: req.session.icon_UserName,
                                                                                action : 'createMultiSelectMetaDataDetail',
                                                                                responseCode:500,
                                                                                message : ' failed to create Multi Select MetaData Detail '+JSON.stringify(err.message)
                                                                            };
                                                                            wlogger.error(errorInfo);

                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        }
                                                                        else {
                                                                            var info = {
                                                                                userName: req.session.icon_UserName,
                                                                                action : 'createMultiSelectMetaDataDetail',
                                                                                responseCode:200,
                                                                                message : ' create Multi Select MetaData Detail successfully'
                                                                            };
                                                                            wlogger.info(info);

                                                                            cnt = cnt + 1;
                                                                            if (cnt == storelength) {

                                                                                var info = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'EditStore',
                                                                                    responseCode:200,
                                                                                    message : 'Store-'+req.body.store_name +' updated successfully.'
                                                                                };
                                                                                wlogger.info(info);      ;

                                                                                res.send({
                                                                                    StoreList: [],
                                                                                    success: true,
                                                                                    message:'Store-'+ req.body.store_name +' updated successfully.'
                                                                                });
                                                                            } else {
                                                                                loop(cnt);
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        connection_ikon_cms.release();

                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'EditStore',
                                                            responseCode:200,
                                                            message :'Store-'+ req.body.store_name + ' updated successfully.'
                                                        };
                                                        wlogger.info(info);

                                                        res.send({
                                                            StoreList: [],
                                                            success: true,
                                                            message:'Store-'+ req.body.store_name+' updated successfully.'
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }

                                function DeleteChannelsforStore() {
                                    var storelength = req.body.DeleteStoreChannels.length;
                                    var count = 0;
                                    deleteloop(count);
                                    function deleteloop(count) {
                                        storeManager.deleteMultiSelectMetaDataDetail( connection_ikon_cms, req.body.store_front_type, req.body.DeleteStoreChannels[count], function( err, rew, fields ) {
                                            if (err) {

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'deleteMultiSelectMetaDataDetail',
                                                    responseCode:500,
                                                    message : ' failed to delete MultiSelect MetaData Detail '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            }
                                            else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'deleteMultiSelectMetaDataDetail',
                                                    responseCode:200,
                                                    message : ' delete MultiSelect MetaData Detail successfully'
                                                };
                                                wlogger.info(info);

                                                count++;
                                                if (count == storelength) {
                                                    EditStore();
                                                }
                                                else {
                                                    deleteloop(count);
                                                }
                                            }
                                        });
                                    };
                                }

                                function AddStoreChannels() {
                                    var Groupid = 0;
                                    var storelength = req.body.AddStoreChannels.length;
                                    if (req.body.AddStoreChannels.length > 0) {
                                        storeManager.getLastInsertedMultiSelectMetaDataDetailByCmdGroupId( connection_ikon_cms, function( err, result ) {
                                            if (err) {

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedMultiSelectMetaDataDetailByCmdGroupId',
                                                    responseCode:500,
                                                    message : ' failed to get Last Inserted Multi Select MetaData Detail By Cmd GroupId '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedMultiSelectMetaDataDetailByCmdGroupId',
                                                    responseCode:200,
                                                    message : ' get Last Inserted Multi Select MetaData Detail By Cmd GroupId successfully'
                                                };
                                                wlogger.info(info);

                                                Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                                loop(0);
                                                function loop(cnt) {
                                                    var i = cnt;
                                                    storeManager.getLastInsertedMultiSelectMetaDataDetail( connection_ikon_cms, function( err, row ) {
                                                        if (err) {

                                                            var errorInfo = {
                                                                userName: req.session.icon_UserName,
                                                                action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                                responseCode:500,
                                                                message : ' failed to get Last Inserted Multi Select MetaData Detail '+JSON.stringify(err.message)
                                                            };
                                                            wlogger.error(errorInfo);

                                                            connection_ikon_cms.release(); ;
                                                            res.status(500).json(err.message);
                                                        } else {
                                                            var info = {
                                                                userName: req.session.icon_UserName,
                                                                action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                                responseCode:200,
                                                                message : ' get Last Inserted Multi Select MetaData Detail successfully'
                                                            };
                                                            wlogger.info(info);

                                                            var metadata = {
                                                                cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                cmd_group_id: Groupid,
                                                                cmd_entity_type: req.body.store_cmd_entity_type,
                                                                cmd_entity_detail: req.body.AddStoreChannels[i]
                                                            }
                                                            storeManager.createMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function( err, result ){
                                                                if (err) {

                                                                    var errorInfo = {
                                                                        userName: req.session.icon_UserName,
                                                                        action : 'createMultiSelectMetaDataDetail',
                                                                        responseCode:500,
                                                                        message : ' failed to create MultiSelect MetaData Detail '+JSON.stringify(err.message)
                                                                    };
                                                                    wlogger.error(errorInfo);

                                                                    connection_ikon_cms.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {

                                                                    var info = {
                                                                        userName: req.session.icon_UserName,
                                                                        action : 'createMultiSelectMetaDataDetail',
                                                                        responseCode:200,
                                                                        message : ' create MultiSelect MetaData Detail successfully'
                                                                    };
                                                                    wlogger.info(info);

                                                                    cnt = cnt + 1;
                                                                    if (cnt == storelength) {
                                                                        // add store
                                                                        storeManager.getLastInsertedStoreIdFromIcnStore( connection_ikon_cms, function (err, result) {
                                                                            if (err) {

                                                                                var errorInfo = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'getLastInsertedStoreIdFromIcnStore',
                                                                                    responseCode:500,
                                                                                    message : ' failed get Last Inserted StoreId From Store-'+ req.body.store_name +' '+JSON.stringify(err.message)
                                                                                };
                                                                                wlogger.error(errorInfo);

                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            } else {

                                                                                var info = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'getLastInsertedStoreIdFromIcnStore',
                                                                                    responseCode:200,
                                                                                    message : ' get Last Inserted StoreId From Store-'+ req.body.store_name +' successfully'
                                                                                };
                                                                                wlogger.info(info);

                                                                                var store_id = result[0].id != null ? (parseInt(result[0].id) + 1) : 1;
                                                                                var store = {
                                                                                    st_id: store_id,
                                                                                    st_name: req.body.store_name,
                                                                                    st_url: req.body.store_site_url,
                                                                                    st_country_distribution_rights: null,
                                                                                    st_front_type: Groupid,
                                                                                    st_payment_type: null,
                                                                                    st_payment_channel: null,
                                                                                    st_vendor: null,
                                                                                    st_content_type: null,
                                                                                    st_created_on: new Date(),
                                                                                    st_modified_on: new Date(),
                                                                                    st_created_by: req.session.icon_UserName,
                                                                                    st_modified_by: req.session.icon_UserName
                                                                                }
                                                                                storeManager.createIcnStore( connection_ikon_cms, store, function( err, result ) {
                                                                                    if (err) {

                                                                                        var errorInfo = {
                                                                                            userName: req.session.icon_UserName,
                                                                                            action : 'createIcnStore',
                                                                                            responseCode:500,
                                                                                            message : ' failed to create Store-'+ req.body.store_name +' '+JSON.stringify(err.message)
                                                                                        };
                                                                                        wlogger.error(errorInfo);

                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    } else {

                                                                                        var info = {
                                                                                            userName: req.session.icon_UserName,
                                                                                            action : 'createIcnStore',
                                                                                            responseCode:200,
                                                                                            message :'Store-'+ req.body.store_name + ' created successfully'
                                                                                        };
                                                                                        wlogger.info(info);

                                                                                        // add store user
                                                                                        storeManager.getLastInsertedIdFromIcnLoginDetail( connection_ikon_cms, function( err, result ) {
                                                                                            if (err) {

                                                                                                var errorInfo = {
                                                                                                    userName: req.session.icon_UserName,
                                                                                                    action : 'getLastInsertedIdFromIcnLoginDetail',
                                                                                                    responseCode:500,
                                                                                                    message : ' failed to get Last Inserted Id From Icn Login Detail '+JSON.stringify(err.message)
                                                                                                };
                                                                                                wlogger.error(errorInfo);

                                                                                                connection_ikon_cms.release();
                                                                                                res.status(500).json(err.message);
                                                                                            } else {

                                                                                                var info = {
                                                                                                    userName: req.session.icon_UserName,
                                                                                                    action : 'getLastInsertedIdFromIcnLoginDetail',
                                                                                                    responseCode:200,
                                                                                                    message : ' get Last Inserted Id From Icn Login Detail successfully'
                                                                                                };
                                                                                                wlogger.info(info);

                                                                                                var ld_id = result[0].id != null ? (parseInt(result[0].id) + 1) : 1;
                                                                                                var storeuser = {
                                                                                                    ld_id: ld_id,
                                                                                                    ld_active: 1,
                                                                                                    ld_user_id: req.body.store_email.split('@')[0] + uniqueID,
                                                                                                    ld_user_pwd: 'icon',
                                                                                                    ld_user_name: req.body.store_email,
                                                                                                    ld_display_name: req.body.store_contact_person,
                                                                                                    ld_email_id: req.body.store_email,
                                                                                                    ld_mobile_no: req.body.store_user_no,
                                                                                                    ld_role: "Store Manager",
                                                                                                    ld_user_type: 'Store User',
                                                                                                    ld_last_login: new Date(),
                                                                                                    ld_created_on: new Date(),
                                                                                                    ld_created_by: req.session.icon_UserName,
                                                                                                    ld_modified_on: new Date(),
                                                                                                    ld_modified_by: req.session.icon_UserName
                                                                                                };
                                                                                                storeManager.createIcnLoginDetail( connection_ikon_cms, storeuser, function( err, result ) {
                                                                                                    if (err) {

                                                                                                        var errorInfo = {
                                                                                                            userName: req.session.icon_UserName,
                                                                                                            action : 'createIcnLoginDetail',
                                                                                                            responseCode:500,
                                                                                                            message : ' failed to create Icon Login Detail '+JSON.stringify(err.message)
                                                                                                        };
                                                                                                        wlogger.error(errorInfo);

                                                                                                        connection_ikon_cms.release();
                                                                                                        res.status(500).json(err.message);
                                                                                                    } else {

                                                                                                        var info = {
                                                                                                            userName: req.session.icon_UserName,
                                                                                                            action : 'createIcnLoginDetail',
                                                                                                            responseCode:200,
                                                                                                            message : ' create Icon Login Detail successfully'
                                                                                                        };
                                                                                                        wlogger.info(info);

                                                                                                        var storeusermapping = {
                                                                                                            su_st_id: store_id,
                                                                                                            su_ld_id: ld_id,
                                                                                                            su_created_on: new Date(),
                                                                                                            su_created_by: req.session.icon_UserName,
                                                                                                            su_modified_on: new Date(),
                                                                                                            su_modified_by: req.session.icon_UserName
                                                                                                        };
                                                                                                        storeManager.createIcnStoreUser( connection_ikon_cms, storeusermapping, function( err, result ) {
                                                                                                            if (err) {

                                                                                                                var errorInfo = {
                                                                                                                    userName: req.session.icon_UserName,
                                                                                                                    action : 'createIcnStoreUser',
                                                                                                                    responseCode:500,
                                                                                                                    message : ' failed to create Icon Store User '+JSON.stringify(err.message)
                                                                                                                };
                                                                                                                wlogger.error(errorInfo);

                                                                                                                console.log(err.message, 3)
                                                                                                                connection_ikon_cms.release();
                                                                                                                res.status(500).json(err.message);
                                                                                                            } else {
                                                                                                                var info = {
                                                                                                                    userName: req.session.icon_UserName,
                                                                                                                    action : 'createIcnStoreUser',
                                                                                                                    responseCode:200,
                                                                                                                    message :' Created user for Store-'+req.body.store_name + ' successfully'
                                                                                                                };
                                                                                                                wlogger.info(info);

                                                                                                                storeManager.getStoreListByStoreId( connection_ikon_cms, store_id, function( err, StoreList ) {
                                                                                                                    if (err) {

                                                                                                                        var errorInfo = {
                                                                                                                            userName: req.session.icon_UserName,
                                                                                                                            action : 'getStoreListByStoreId',
                                                                                                                            responseCode:500,
                                                                                                                            message : ' failed to get Store List By StoreId '+JSON.stringify(err.message)
                                                                                                                        };
                                                                                                                        wlogger.error(errorInfo);

                                                                                                                        connection_ikon_cms.release();
                                                                                                                        res.status(500).json(err.message);
                                                                                                                    } else {

                                                                                                                        var info = {
                                                                                                                            userName: req.session.icon_UserName,
                                                                                                                            action : 'getStoreListByStoreId',
                                                                                                                            responseCode:200,
                                                                                                                            message : ' get Store List By StoreId successfully'
                                                                                                                        };
                                                                                                                        wlogger.info(info);

                                                                                                                        var smtpTransport = nodemailer.createTransport({
                                                                                                                            service: "Gmail",
                                                                                                                            auth: {
                                                                                                                                user: "jetsynthesis@gmail.com",
                                                                                                                                pass: "j3tsynthes1s"
                                                                                                                            }
                                                                                                                        });
                                                                                                                        var Message = "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                                                                                                                        Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;\">Store Admin created a new account at Jetsynthesys.";
                                                                                                                        Message += " </td></tr>";
                                                                                                                        Message += " <h5>Please find below login details : </h5>";
                                                                                                                        Message += " <tr><td style=\"font-weight:bold;font-size:15px;color:#3d849b;\">Username : </td><td>" + req.body.store_email.split('@')[0] + uniqueID + "</td></tr>";
                                                                                                                        Message += " <tr><td style=\"font-weight:bold;font-size:15px;color:#3d849b;\">Temporary Password : </td><td>icon</td></tr>";
                                                                                                                        Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                                                                                                        Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href='"+SitePath+"/' target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Jetsynthesys. If you have not made any request then you may ignore this email";
                                                                                                                        Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Please contact us, if you have any concerns setting up Jetsynthesys.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Jetsynthesys Team</td></tr></tbody></table>";
                                                                                                                        var mailOptions = {
                                                                                                                            to: req.body.store_email,
                                                                                                                            subject: 'New Store User',
                                                                                                                            html: Message
                                                                                                                        }
                                                                                                                        smtpTransport.sendMail(mailOptions, function (error, response) {
                                                                                                                            if (error) {

                                                                                                                                var errorInfo = {
                                                                                                                                    userName: req.session.icon_UserName,
                                                                                                                                    action : 'sendMail',
                                                                                                                                    responseCode:500,
                                                                                                                                    message : ' failed to send Mail '+JSON.stringify(error.message)
                                                                                                                                };
                                                                                                                                wlogger.error(errorInfo);

                                                                                                                                console.log(error);
                                                                                                                                res.end("error");
                                                                                                                            } else {

                                                                                                                                var info = {
                                                                                                                                    userName: req.session.icon_UserName,
                                                                                                                                    action : 'sendMail',
                                                                                                                                    responseCode:200,
                                                                                                                                    message : ' send Mail successfully'
                                                                                                                                };
                                                                                                                                wlogger.info(info);

                                                                                                                                connection_ikon_cms.release();
                                                                                                                                res.send({
                                                                                                                                    StoreList: StoreList,
                                                                                                                                    success: true,
                                                                                                                                    message: 'Store added successfully. Temporary Password sent to register store user email.'
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
                                                                                });
                                                                            }
                                                                        });
                                                                    } else {
                                                                        loop(cnt);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                            }
                                        });
                                    }
                                    else {
                                        storeManager.getLastInsertedStoreIdFromIcnStore( connection_ikon_cms, function (err, result) {
                                            if (err) {

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedStoreIdFromIcnStore',
                                                    responseCode:500,
                                                    message : ' failed to get Last Inserted StoreId From Icon Store '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedStoreIdFromIcnStore',
                                                    responseCode:200,
                                                    message : ' get Last Inserted StoreId From Icon Store successfully'
                                                };
                                                wlogger.info(info);

                                                var store_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                                var store = {
                                                    st_id: store_id,
                                                    st_name: req.body.store_name,
                                                    st_url: req.body.store_site_url,
                                                    st_country_distribution_rights: null,
                                                    st_front_type: Groupid,
                                                    st_payment_type: null,
                                                    st_payment_channel: null,
                                                    st_vendor: null,
                                                    st_content_type: null,
                                                    st_created_on: new Date(),
                                                    st_modified_on: new Date(),
                                                    st_created_by: req.session.icon_UserName,
                                                    st_modified_by: req.session.icon_UserName
                                                }

                                                storeManager.createIcnStore( connection_ikon_cms, store, function (err, result) {
                                                    if (err) {

                                                        var errorInfo = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createIcnStore',
                                                            responseCode:500,
                                                            message : ' failed to create Icon Store '+JSON.stringify(err.message)
                                                        };
                                                        wlogger.error(errorInfo);

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    } else {

                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createIcnStore',
                                                            responseCode:200,
                                                            message : ' create Icon Store successfully'
                                                        };
                                                        wlogger.info(info);

                                                        // add store user
                                                        storeManager.getLastInsertedIdFromIcnLoginDetail( connection_ikon_cms, function (err, result) {
                                                            if (err) {

                                                                var errorInfo = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'getLastInsertedIdFromIcnLoginDetail',
                                                                    responseCode:500,
                                                                    message : ' failed to get Last Inserted Id From Icon Login Detail '+JSON.stringify(err.message)
                                                                };
                                                                wlogger.error(errorInfo);

                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            } else {

                                                                var info = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'getLastInsertedIdFromIcnLoginDetail',
                                                                    responseCode:200,
                                                                    message : ' get Last Inserted Id From Icon Login Detail successfully'
                                                                };
                                                                wlogger.info(info);

                                                                var ld_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                                                var storeuser = {
                                                                    ld_id: ld_id,
                                                                    ld_active: 1,
                                                                    ld_user_id: req.body.store_email.split('@')[0] + uniqueID,
                                                                    ld_user_pwd: 'icon',
                                                                    ld_user_name: req.body.store_email,
                                                                    ld_display_name: req.body.store_contact_person,
                                                                    ld_email_id: req.body.store_email,
                                                                    ld_mobile_no: req.body.store_user_no,
                                                                    ld_role: "Store Manager",
                                                                    ld_user_type: 'Store User',
                                                                    ld_last_login: new Date(),
                                                                    ld_created_on: new Date(),
                                                                    ld_created_by: req.session.icon_UserName,
                                                                    ld_modified_on: new Date(),
                                                                    ld_modified_by: req.session.icon_UserName
                                                                };
                                                                storeManager.createIcnLoginDetail( connection_ikon_cms, storeuser, function( err, result ) {
                                                                    if (err) {

                                                                        var errorInfo = {
                                                                            userName: req.session.icon_UserName,
                                                                            action : 'createIcnLoginDetail',
                                                                            responseCode:500,
                                                                            message : ' failed to create Icon Login Detail '+JSON.stringify(err.message)
                                                                        };
                                                                        wlogger.error(errorInfo);

                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {

                                                                        var info = {
                                                                            userName: req.session.icon_UserName,
                                                                            action : 'createIcnLoginDetail',
                                                                            responseCode:200,
                                                                            message : ' create Icon Login Detail successfully'
                                                                        };
                                                                        wlogger.info(info);

                                                                        var storeusermapping = {
                                                                            su_st_id: store_id,
                                                                            su_ld_id: ld_id,
                                                                            su_created_on: new Date(),
                                                                            su_created_by: req.session.icon_UserName,
                                                                            su_modified_on: new Date(),
                                                                            su_modified_by: req.session.icon_UserName
                                                                        };
                                                                        storeManager.createIcnStoreUser( connection_ikon_cms, storeusermapping, function( err, result ) {
                                                                            if (err) {

                                                                                var errorInfo = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'createIcnStoreUser',
                                                                                    responseCode:500,
                                                                                    message : ' failed to create Icon StoreUser '+JSON.stringify(err.message)
                                                                                };
                                                                                wlogger.error(errorInfo);

                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            } else {
                                                                                var info = {
                                                                                    userName: req.session.icon_UserName,
                                                                                    action : 'createIcnStoreUser',
                                                                                    responseCode:200,
                                                                                    message : ' create Icon StoreUser successfully'
                                                                                };
                                                                                wlogger.info(info);

                                                                                storeManager.getStoreListByStoreId( connection_ikon_cms, storeId, function( err, StoreList ) {
                                                                                    if (err) {

                                                                                        var errorInfo = {
                                                                                            userName: req.session.icon_UserName,
                                                                                            action : 'getStoreListByStoreId',
                                                                                            responseCode:500,
                                                                                            message : ' failed to get Store List By StoreId '+JSON.stringify(err.message)
                                                                                        };
                                                                                        wlogger.error(errorInfo);

                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    } else {

                                                                                        var info = {
                                                                                            userName: req.session.icon_UserName,
                                                                                            action : 'getStoreListByStoreId',
                                                                                            responseCode:200,
                                                                                            message : ' get Store List By StoreId successfully'
                                                                                        };
                                                                                        wlogger.info(info);

                                                                                        var smtpTransport = nodemailer.createTransport({
                                                                                            service: "Gmail",
                                                                                            auth: {
                                                                                                user: "jetsynthesis@gmail.com",
                                                                                                pass: "j3tsynthes1s"
                                                                                            }
                                                                                        });
                                                                                        var Message = "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                                                                                        Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;\">Store Admin created a new account at Jetsynthesys.";
                                                                                        Message += " </td></tr>";
                                                                                        Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                                                                        Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href='"+SitePath+"/' target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Jetsynthesys. If you have not made any request then you may ignore this email";
                                                                                        Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Please contact us, if you have any concerns setting up Jetsynthesys.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Jetsynthesys Team</td></tr></tbody></table>";
                                                                                        var mailOptions = {
                                                                                            to: req.body.store_email,
                                                                                            subject: 'New Store User',
                                                                                            html: Message
                                                                                        }
                                                                                        smtpTransport.sendMail(mailOptions, function (error, response) {
                                                                                            if (error) {

                                                                                                var errorInfo = {
                                                                                                    userName: req.session.icon_UserName,
                                                                                                    action : 'sendMail',
                                                                                                    responseCode:500,
                                                                                                    message : ' failed to send Mail '+JSON.stringify(error.message)
                                                                                                };
                                                                                                wlogger.error(errorInfo);

                                                                                                console.log(error);
                                                                                                res.end("error");
                                                                                            } else {

                                                                                                var info = {
                                                                                                    userName: req.session.icon_UserName,
                                                                                                    action : 'sendMail',
                                                                                                    responseCode:200,
                                                                                                    message : ' send Mail successfully'
                                                                                                };
                                                                                                wlogger.info(info);

                                                                                                connection_ikon_cms.release();
                                                                                                res.send({
                                                                                                    StoreList: StoreList,
                                                                                                    success: true,
                                                                                                    message: 'Store added successfully. Temporary Password sent to register store user email.'
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
                                                });
                                            }
                                        });
                                    }
                                }
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