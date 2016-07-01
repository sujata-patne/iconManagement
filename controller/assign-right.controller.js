
var mysql = require('../config/db').pool;
var async = require("async");
var nodemailer = require('nodemailer');
var assingRightsManager = require( "../models/assignRightsModel");
var config = require('../config')();
var SitePath = config.site_path+":"+config.port;

var fs = require("fs");
var common = require("../helpers/common");
var wlogger= require('../config/logger');
var reload = require('require-reload')(require);

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

exports.getassignrights = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if (err) {
                        var errorInfo = {
                            userName: req.session.icon_UserName,
                            action: 'getassignrights',
                            responseCode: 500,
                            message: ' failed to get Connection ' + JSON.stringify(err.message)
                        };
                        wlogger.error(errorInfo);
                    }
                    //mysql.getConnection('GATEWAY', function (err, connection_billing_gateway) {
                    	//console.log( connection_billing_gateway );
                        async.parallel({
                            MasterList: function (callback) {
                                assingRightsManager.getMasterList( connection_ikon_cms, function( err, MasterList  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getMasterList',
                                            responseCode: 500,
                                            message: ' failed to get MasterList ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback(err, MasterList);
                                });
                            },
                            ContentTypes: function (callback) {
                                assingRightsManager.getContentTypes( connection_ikon_cms, function( err, ContentTypes  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getContentTypes',
                                            responseCode: 500,
                                            message: ' failed to get ContentTypes ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback(err, ContentTypes);
                                });
                            },
                            IconCountry: function (callback) {
                                assingRightsManager.getIconCountry( connection_ikon_cms, function( err, IconCountry  ) {

                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getIconCountry',
                                            responseCode: 500,
                                            message: ' failed to get IconCountry ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }

                                    callback(err, IconCountry);
                                });
                            },
                            IconGroupCountry: function (callback) {
                                assingRightsManager.getIconCountryGroup( connection_ikon_cms, function( err, IconCountryGroup  ) {

                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getIconCountryGroup',
                                            responseCode: 500,
                                            message: ' failed to get IconCountryGroup ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback(err, IconCountryGroup);
                                });
                            },
                            VendorCountry: function (callback) {
                                assingRightsManager.getVendorCountry( connection_ikon_cms, function( err, VendorCountry  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getVendorCountry',
                                            responseCode: 500,
                                            message: ' failed to get VendorCountry ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback( err, VendorCountry );
                                });
                            },
                            Countrys: function (callback) {
                                assingRightsManager.getCountries(connection_ikon_cms, function (err, Countrys) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getCountries',
                                            responseCode: 500,
                                            message: ' failed to get Countries ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback(err, Countrys);
                                });
                            },
                            Stores: function (callback) {
                                assingRightsManager.getStoresUserDetails( connection_ikon_cms, function( err, Stores  ) {

                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getStores',
                                            responseCode: 500,
                                            message: ' failed to get Stores ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback( err, Stores );
                                });
                            },
                            StoresUserDetails: function (callback) {
                                assingRightsManager.getStoresUserDetails( connection_ikon_cms, function( err, storeUsers  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getStoresUserDetails',
                                            responseCode: 500,
                                            message: ' failed to get StoresUserDetails ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }

                                    callback( err, storeUsers );
                                });
                            },
                            StoreChannels: function (callback) {
                                assingRightsManager.getStoreChannels( connection_ikon_cms, function( err, StoreChannels  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getStoresUserDetails',
                                            responseCode: 500,
                                            message: ' failed to get StoreChannels ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }

                                    callback( err, StoreChannels );
                                });
                            },
                            AssignCountrys: function (callback) {
                                assingRightsManager.getAssignedCountries( connection_ikon_cms, function( err, AssignCountrys  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getAssignedCountries',
                                            responseCode: 500,
                                            message: ' failed to get AssignedCountries ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }

                                    callback( err, AssignCountrys );
                                });
                            },
                            AssignPaymentTypes: function (callback) {
                                assingRightsManager.getAssignedPaymentTypes( connection_ikon_cms, function( err, AssignPaymentTypes  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getAssignedPaymentTypes',
                                            responseCode: 500,
                                            message: ' failed to get AssignedPaymentTypes ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }

                                    callback( err, AssignPaymentTypes );
                                });
                            },
                            AssignPaymentChannels: function (callback) {
                                assingRightsManager.getAssignedPaymentChannels( connection_ikon_cms, function( err, AssignPaymentChannels  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getAssignedPaymentChannels',
                                            responseCode: 500,
                                            message: ' failed to get AssignedPaymentChannels ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback( err, AssignPaymentChannels );
                                });
                            },
                            AssignContentTypes: function (callback) {
                                assingRightsManager.getAssignedContentTypes( connection_ikon_cms, function( err, AssignContentTypes  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getAssignedContentTypes',
                                            responseCode: 500,
                                            message: ' failed to get AssignedContentTypes ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback( err, AssignContentTypes );
                                });
                            },
                            AssignVendors: function (callback) {
                                assingRightsManager.getAssignedVendors( connection_ikon_cms, function( err, AssignVendors  ) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action: 'getAssignedVendors',
                                            responseCode: 500,
                                            message: ' failed to get AssignedVendors ' + JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    callback( err, AssignVendors );
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
                //});

                var info = {
                    userName: req.session.icon_UserName,
                    action : 'getassignrights',
                    responseCode:200,
                    message : ' get assignrights successfully'
                };
                wlogger.info(info);
            }
            else {

                var errorInfo = {
                    userName: "Unknown User",
                    action : 'getassignrights',
                    responseCode:500,
                    message : 'User session is not set'
                };
                wlogger.error(errorInfo);

                res.redirect('/accountlogin');
            }
        }
        else {
            var errorInfo = {
                userName: "Unknown User",
                action : 'getassignrights',
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
            action : 'getassignrights',
            responseCode:500,
            message : ' failed to get assignrights '+JSON.stringify(err.message)
        };
        wlogger.error(errorInfo);

        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

exports.updateassignright = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var country_group_id = req.body.country_group_id;
                    var payment_type_group_id = req.body.payment_type_group_id;
                    var payment_channel_group_id = req.body.payment_channel_group_id;
                    var vendor_group_id = req.body.vendor_group_id;
                    var content_type_group_id = req.body.content_type_group_id;
                    if (req.body.DeleteAssignRights.length > 0) {
                        DeleteAssignFromStore();
                    }
                    else {
                        EditStore();
                    }
                    function GetGroupId(type) {
                        var groupid = null;
                        switch (type) {
                            case "country": groupid = country_group_id; break;
                            case "paymenttype": groupid = payment_type_group_id; break;
                            case "paymentchannel": groupid = payment_channel_group_id; break;
                            case "vendor": groupid = vendor_group_id; break;
                            case "contenttype": groupid = content_type_group_id; break;

                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'GetGroupId',
                                    responseCode:200,
                                    message : ' Get GroupId successfully'
                                };
                                wlogger.info(info);

                        }
                        return groupid;
                    }

                    function SetGroupId(type, groupid) {
                        switch (type) {
                            case "country": country_group_id = groupid; break;
                            case "paymenttype": payment_type_group_id = groupid; break;
                            case "paymentchannel": payment_channel_group_id = groupid; break;
                            case "vendor": vendor_group_id = groupid; break;
                            case "contenttype": content_type_group_id = groupid; break;
                        }

                        var info = {
                            userName: req.session.icon_UserName,
                            action : 'SetGroupId',
                            responseCode:200,
                            message : ' Get Set GroupId successfully'
                        };
                        wlogger.info(info);
                    }

                    function EditStore() {
                        var storelength = req.body.AddAssignRights.length;
                        if (req.body.AddAssignRights.length > 0) {
                            loop(0);
                            function loop(cnt) {
                                var i = cnt;

                                var groupid = GetGroupId(req.body.AddAssignRights[i].Type)

                                if (groupid != null) {
                                    assingRightsManager.getLastInsertedMultiSelectMetaDataDetail( connection_ikon_cms, function (err, row) {
                                        if (err) {

                                            var errorInfo = {
                                                userName: req.session.icon_UserName,
                                                action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                responseCode:500,
                                                message : ' failed to get LastInsertedMultiSelectMetaDataDetail '+JSON.stringify(err.message)
                                            };
                                            wlogger.error(errorInfo);

                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            var metadata = {
                                                cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                cmd_group_id: groupid,
                                                cmd_entity_type: req.body.store_content_type,
                                                cmd_entity_detail: req.body.AddAssignRights[i].cmd_entity_detail

                                            }
                                            assingRightsManager.createMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function (err, result) {
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
                                                }else {
                                                    cnt = cnt + 1;
                                                    if (cnt == storelength) {
                                                        var updateQueryData = {
                                                            "country_group_id" : country_group_id,
                                                            "payment_type_group_id" : payment_type_group_id,
                                                            "payment_channel_group_id" : payment_channel_group_id,
                                                            "vendor_group_id" : vendor_group_id,
                                                            "content_type_group_id" : content_type_group_id,
                                                            "st_modified_on": new Date(),
                                                            "st_modified_by" : req.session.icon_UserName
                                                        }
                                                        assingRightsManager.updateIcnStore( connection_ikon_cms, updateQueryData, req.body.storeId, function( err, result ) {
                                                            if (err) {

                                                                var errorInfo = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'updateIcnStore',
                                                                    responseCode:500,
                                                                    message : ' failed to update IcnStore '+JSON.stringify(err.message)
                                                                };
                                                                wlogger.error(errorInfo);

                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            } else {

                                                                var info = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'updateIcnStore',
                                                                    responseCode:200,
                                                                    message : ' update IcnStore successfully'
                                                                };
                                                                wlogger.info(info);
                                                                connection_ikon_cms.release();
                                                                res.send({
                                                                    success: true,
                                                                    message: 'Store Updated successfully.'
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        loop(cnt);
                                                    }

                                                    var info = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'createMultiSelectMetaDataDetail',
                                                        responseCode:200,
                                                        message : ' create multiselect metadata detail successfully'
                                                    };
                                                    wlogger.info(info);

                                                }
                                            });

                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                responseCode:200,
                                                message : ' get Last Inserted Multi Select MetaData Detail successfully'
                                            };
                                            wlogger.info(info);
                                        }
                                    });
                                }
                                else {
                                    assingRightsManager.getLastInsertedMultiSelectMetaDataGroupId( connection_ikon_cms, function( err, result ){
                                        if (err) {

                                            var errorInfo = {
                                                userName: req.session.icon_UserName,
                                                action : 'getLastInsertedMultiSelectMetaDataGroupId',
                                                responseCode:500,
                                                message : ' failed to get Last Inserted Multi Select MetaData GroupId '+JSON.stringify(err.message)
                                            };
                                            wlogger.error(errorInfo);

                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {

                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'getLastInsertedMultiSelectMetaDataGroupId',
                                                responseCode:200,
                                                message : ' get Last Inserted Multi Select MetaData GroupId successfully'
                                            };
                                            wlogger.info(info);

                                            Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                            SetGroupId(req.body.AddAssignRights[i].Type, Groupid);

                                            assingRightsManager.getLastInsertedMultiSelectMetaDataDetail(connection_ikon_cms, function (err, row) {
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
                                                    var metadata = {
                                                        cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                        cmd_group_id: Groupid,
                                                        cmd_entity_type: req.body.store_content_type,
                                                        cmd_entity_detail: req.body.AddAssignRights[i].cmd_entity_detail
                                                    }
                                                    assingRightsManager.createMultiSelectMetaDataDetail(connection_ikon_cms, metadata, function( err, result ) {
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
                                                                var updateQueryData = {
                                                                    "country_group_id" : country_group_id,
                                                                    "payment_type_group_id" : payment_type_group_id,
                                                                    "payment_channel_group_id" : payment_channel_group_id,
                                                                    "vendor_group_id" : vendor_group_id,
                                                                    "content_type_group_id" : content_type_group_id,
                                                                    "st_modified_on": new Date(),
                                                                    "st_modified_by" : req.session.icon_UserName
                                                                }

                                                                assingRightsManager.updateIcnStore( connection_ikon_cms, updateQueryData, req.body.storeId, function( err, result ) {
                                                                    if (err) {

                                                                        var errorInfo = {
                                                                            userName: req.session.icon_UserName,
                                                                            action : 'updateIcnStore',
                                                                            responseCode:500,
                                                                            message : ' failed to update IcnStore '+JSON.stringify(err.message)
                                                                        };
                                                                        wlogger.error(errorInfo);

                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {

                                                                        var info = {
                                                                            userName: req.session.icon_UserName,
                                                                            action : 'updateIcnStore',
                                                                            responseCode:200,
                                                                            message : ' Store Updated successfully'
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
                                                                        Message += " <h5>Site Rights Updated.</h5>";
                                                                        Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                                                        Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href='"+SitePath+"/' target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Jetsynthesys. If you have not made any request then you may ignore this email";
                                                                        Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Please contact us, if you have any concerns setting up Jetsynthesys.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Jetsynthesys Team</td></tr></tbody></table>";
                                                                        var mailOptions = {
                                                                            to: req.body.storeUserEmail,
                                                                            subject: 'Store Rights Assigned.',
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
                                                                                    message : 'send Mail successfully'
                                                                                };
                                                                                wlogger.info(info);

                                                                                connection_ikon_cms.release();
                                                                                res.send({
                                                                                    success: true,
                                                                                    message: 'Store Updated successfully.'
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

                                                    var info = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'getLastInsertedMultiSelectMetaDataDetail',
                                                        responseCode:200,
                                                        message : ' get Last Inserted Multi Select MetaData Detail successfully'
                                                    };
                                                    wlogger.info(info);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        } else {
                            var updateQuery = {
                                "st_modified_on" : new Date(),
                                "st_modified_by" : req.session.icon_UserName
                            }
                            assingRightsManager.updateIcnStoreByStoreUser( connection_ikon_cms, updateQuery, req.body.storeId, function( err, result ) {
                                if (err) {

                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'updateIcnStoreByStoreUser',
                                        responseCode:500,
                                        message : ' failed to update IcnStore By Store User '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);

                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {

                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'updateIcnStoreByStoreUser',
                                        responseCode:200,
                                        message : ' update IcnStore By Store User successfully'
                                    };

                                    connection_ikon_cms.release();
                                    res.send({
                                        success: true,
                                        message: 'Store Updated successfully.'
                                    });
                                }
                            });
                        }
                    }

                    function DeleteAssignFromStore() {
                        var deletelength = req.body.DeleteAssignRights.length;
                        var count = 0;
                        deleteloop(count);
                        function deleteloop(count) {
                            assingRightsManager.deleteMultiSelectMetaDataDetail( connection_ikon_cms, req.body.DeleteAssignRights[count].cmd_group_id, req.body.DeleteAssignRights[count].cmd_entity_detail, function( err, row, fields ) {
                                if (err) {

                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'deleteMultiSelectMetaDataDetail',
                                        responseCode:500,
                                        message : ' failed delete Multi Select MetaData Detail '+JSON.stringify(err.message)
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
                                        message : ' delete Multi Select MetaData Detail successfully'
                                    };

                                    wlogger.info(info);
                                    count++;
                                    if (count == deletelength) {
                                        EditStore();
                                    }
                                    else {
                                        deleteloop(count);
                                    }
                                }
                            });
                        };
                    }

                });
            }
            else {

                var errorInfo = {
                    userName: 'Unknown User',
                    action : 'updateassignright',
                    responseCode:500,
                    message : 'User session not set'
                };
                wlogger.error(errorInfo);

                res.redirect('/accountlogin');
            }
        }
        else {
            var errorInfo = {
                userName: 'User',
                action : 'updateassignright',
                responseCode:500,
                message : 'User session not set'
            };
            wlogger.error(errorInfo);

            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}