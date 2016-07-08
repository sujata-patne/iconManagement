
var mysql = require('../config/db').pool;
var async = require("async");
var nodemailer = require('nodemailer');
var userRightsManager = require( "../models/userRightsModel");
var assignRightsManager = require( "../models/assignRightsModel");
var config = require('../config')();
//var SitePath = config.site_path+":"+config.port;
var SitePath = config.site_path;
 var port = config.port;
var url = SitePath+":"+port;
var fs = require("fs");
var wlogger= require('../config/logger');
var reload = require('require-reload')(require);
var _ = require("underscore");
var common = require("../helpers/common");

/**
 * @desc Create a log file if not exist.
 * @param req
 * @param res
 * @param next
 */
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
/**
 * @desc Get User Rights for All Users
 * @param req
 * @param res
 * @param next
 */
exports.getuserrights = function (req, res, next) {
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
                    async.parallel({
                        StoresList: function (callback) {
                           // userRightsManager.getStores( connection_ikon_cms, function( err, Stores  ) {
                            assignRightsManager.getStores( connection_ikon_cms, function( err, Stores  ) {
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
                        UserIds: function (callback) {
                            userRightsManager.getUserIds( connection_ikon_cms, req.body, function( err, userIds  ) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action: 'getUserIds',
                                        responseCode: 500,
                                        message: ' failed to get Stores ' + JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                callback( err, userIds );
                            });
                        } ,
                        Vendors: function (callback) {
                            userRightsManager.getVendors( connection_ikon_cms, function( err, Vendors  ) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action: 'getMasterList',
                                        responseCode: 500,
                                        message: ' failed to get MasterList ' + JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                callback(err, Vendors);
                            });
                        },
                        AssignVendors: function (callback) {
                            //userRightsManager.getAssignedVendors( connection_ikon_cms, function( err, AssignVendors  ) {
                            assignRightsManager.getAssignedVendors( connection_ikon_cms, function( err, AssignVendors  ) {
                                //console.log(AssignVendors)
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
                        Modules: function (callback) {
                            userRightsManager.getModules( connection_ikon_cms, function( err, modules) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action: 'getMasterList',
                                        responseCode: 500,
                                        message: ' failed to get MasterList ' + JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                callback(err, modules);
                            });
                        },
                        Roles: function (callback) {
                            userRightsManager.getRoles( connection_ikon_cms, function( err, roles) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action: 'getMasterList',
                                        responseCode: 500,
                                        message: ' failed to get MasterList ' + JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                callback(err, roles);
                            });
                        },
                        RoleModuleMappings: function (callback) {
                            userRightsManager.getRoleModuleMappings( connection_ikon_cms, function( err, roleModuleMappings) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action: 'getMasterList',
                                        responseCode: 500,
                                        message: ' failed to get MasterList ' + JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                callback(err, roleModuleMappings);
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
        res.status(500).json(err.message);
    }
}

/**
 * @desc Get Existing User Role and Module mapping list
 * @param req
 * @param res
 * @param next
 */
exports.existingMappingList = function (req, res, next) {
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
                    }else {
                        if (req.body.userId) {
                            userRightsManager.getExistingUserRoleMapping(connection_ikon_cms, req.body.userId, function (err, existingMappingList) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action: 'getExistingUserRoleMapping',
                                        responseCode: 500,
                                        message: ' failed to get existing users ' + JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                } else {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action: 'getassignrights',
                                        responseCode: 200,
                                        message: ' get assignrights successfully'
                                    };
                                    wlogger.info(info);
                                    connection_ikon_cms.release();
                                    res.send(existingMappingList);
                                }
                            });
                        }
                    }
                });
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
/**
 * @desc Add and Update User Role Module mapping
 * @param req
 * @param res
 * @param next
 */
exports.updateuserright = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var mappingList = req.body.mappingList; 
                    var mapping_userId = req.body.selectedUserId;
                     async.waterfall([
                        function (callback) {
                            userRightsManager.getExistingMappingforUser(connection_ikon_cms,mapping_userId, function( err, existingMappingList ) {
                                callback(err,existingMappingList);
                            });
                        },
                        function (existingMappingList, callback) { 
                            async.eachSeries(existingMappingList, function(data, callback) {
                                 userRightsManager.updateExistingMappingforUser(connection_ikon_cms, data, function( err, result ) {
                                    if (err) {
                                        var error = {
                                            userName: req.session.icon_UserName,
                                            action: 'updateuserright',
                                            responseCode: 500,
                                            message: JSON.stringify(err.message)
                                        }
                                        wlogger.error(error); // for err
                                        callback(err, null);
                                    }
                                    else {
                                        callback();
                                    }
                                 });
                            }, function done() {
                                callback();
                            })
                        },
                        function(callback) {
                            userRightsManager.getLastInsertedIdFromUserRoleMapping(connection_ikon_cms, function (err, lastInsertedId) {
                                if (err) {
                                    var error = {
                                        userName: req.session.icon_UserName,
                                        action: 'updateuserright',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for err
                                    callback(err, null);
                                }
                                else {
                                    var userRolemappingId = (lastInsertedId != null || lastInsertedId != 0) ? parseInt(lastInsertedId) : 0;
                                    callback(null, userRolemappingId);
                                }
                            });
                        },
                        function (getMaxMappingId ,callback) {
                            var userRolemappingId = getMaxMappingId;
                            var addedData = [];
                            AddUpdateRights(0);
                            function AddUpdateRights(cnt) {
                                var mappingitem = mappingList[cnt];
                                var userRightMapping = {
                                    created_at: new Date(),
                                    created_by: req.session.icon_UserName
                                };
                                if (mappingitem.hasOwnProperty('role_master_id')) {
                                    userRightMapping.role_master_id = mappingitem.role_master_id;
                                }
                                if (mappingitem.hasOwnProperty('user_id')) {
                                    userRightMapping.user_id = mappingitem.user_id;
                                }
                                if (mappingitem.hasOwnProperty('icn_vendor_detail_id')) {
                                     async.eachSeries(mappingitem.icn_vendor_detail_id, function (mappingColumn, callback) {
                                        userRightMapping.icn_vendor_detail_id = mappingColumn;
                                        addedData.push(userRightMapping);
                                        addUpdateUserRoleMapping(connection_ikon_cms, req, userRightMapping, ++userRolemappingId, function (err, data) {
                                            if (err) {
                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action: 'updateuserright',
                                                    responseCode: 500,
                                                    message: 'Failed to add/update User Role  ' + JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);
                                            }
                                             callback();
                                        });
                                    }, function done() {
                                        cnt = cnt + 1;
                                        if (cnt == mappingList.length) {
                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'updateuserright',
                                                responseCode: 200,
                                                message: "User Rights Added/updated successfully."
                                            }
                                            wlogger.info(info); // for information
                                            callback();
                                        }
                                        else {
                                            AddUpdateRights(cnt);
                                        }
                                    })
                                }
                                else if (mappingitem.hasOwnProperty('icn_store_id')) {
                                     async.eachSeries(mappingitem.icn_store_id, function (mappingColumn, callback) {
                                        userRightMapping.icn_store_id = mappingColumn;
                                        addedData.push(userRightMapping);
                                        addUpdateUserRoleMapping(connection_ikon_cms, req, userRightMapping, ++userRolemappingId, function (err, data) {
                                            if (err) {
                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action: 'updateuserright',
                                                    responseCode: 500,
                                                    message: 'Failed to add/update User Role  ' + JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);
                                            }
                                            callback();
                                         });
                                    }, function done() {
                                        cnt = cnt + 1;
                                        if (cnt == mappingList.length) {
                                            var info = {
                                                userName: req.session.icon_UserName,
                                                action : 'updateuserright',
                                                responseCode: 200,
                                                message: "User Rights Added/updated successfully."
                                            }
                                            wlogger.info(info); // for information
                                            callback();
                                        }
                                        else {
                                            AddUpdateRights(cnt);
                                        }
                                    })
                                }
                            }
                             var smtpTransport = nodemailer.createTransport({
                                service: "Gmail",
                                auth: {
                                    user: "jetsynthesis@gmail.com",
                                    pass: "j3tsynthes1s"
                                }
                            });
                            var Message = "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                            Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;\">Admin Assigned User Rights to a User "+req.body.UserId +" at Jetsynthesys.";
                            Message += " </td></tr>";
                            Message += " <h5>User Rights Assigned.</h5>";
                            Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                            Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\"  href="+SitePath+" target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Jetsynthesys. If you have not made any request then you may ignore this email";
                            Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Please contact us, if you have any concerns setting up Jetsynthesys.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Jetsynthesys Team</td></tr></tbody></table>";
                            var mailOptions = {
                                to: req.body.EmailId,
                                subject: 'User Rights Assigned.',
                                html: Message
                            }
                            smtpTransport.sendMail(mailOptions, function (error, response) {
                                if (error) {

                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'updateuserright',
                                        responseCode:500,
                                        message : ' failed to send Mail '+JSON.stringify(error.message)
                                    };
                                    wlogger.error(errorInfo);

                                    console.log(error);
                                    res.end("error");
                                } else {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action: 'updateuserright',
                                        responseCode: 200,
                                        message: "User Rights Added/updated successfully and Mail sent successfully."
                                    }
                                    wlogger.info(info); // for information
                                }
                            })
                        }
                    ], function (err, results) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            connection_ikon_cms.release();
                            res.send({success: true, message: 'User Roles set successfully'});
                        }
                    });
                });
            }
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}
/**
 * @desc Insert or Update User Role Module mapping
 * @param connection_ikon_cms
 * @param req
 * @param userRightMapping
 * @param newMappingId
 * @param callback
 */
function addUpdateUserRoleMapping(connection_ikon_cms, req, userRightMapping,newMappingId,callback){
    userRightsManager.isUserRoleExist(connection_ikon_cms, userRightMapping, function( err, mappingid ) {
        var existingUserRoleMappingId = (mappingid != null || mappingid != 0) ? (parseInt(mappingid)):0;
         if(existingUserRoleMappingId == 0) {
            userRightMapping.id = newMappingId;
            userRightMapping.modified_at = new Date();
            userRightMapping.modified_by = req.session.icon_UserName;
            userRightsManager.insertUserRightMapping(connection_ikon_cms, userRightMapping, function (err, result) {
                callback(err,result);
            });
        } else {
            userRightMapping.id = existingUserRoleMappingId;
            userRightMapping.modified_at = new Date();
            userRightMapping.modified_by = req.session.icon_UserName;
            userRightsManager.updateUserRightMapping(connection_ikon_cms, userRightMapping,function (err, result) {
                callback(err,result);
            });
        }
    });
}

/**
 * @class
 * @classdesc add and update user data.
 * @param {object} req - http requset object.
 * @param {object} res - http response object.
 */
exports.addedituser = function (req, res, next) {
      try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var flag = true;

                    var query = connection_ikon_cms.query('SELECT * FROM icn_login_detail where LOWER(ld_user_id) = ?', [req.body.UserName.toString().toLowerCase()], function (err, result) {
                        if (err) {
                            var error = {
                                userName: req.session.icon_UserName,
                                action : 'addedituser',
                                responseCode: 500,
                                message: JSON.stringify(err.message)
                            }
                            wlogger.error(error); // for error
                            connection_ikon_cms.release();;
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].ld_id != req.body.UserId) {
                                    flag = false;
                                }
                            }
                            if (flag) {
                                var query = connection_ikon_cms.query('SELECT *  FROM icn_login_detail where LOWER(ld_email_id) = ?', [req.body.EmailId.toString().toLowerCase()], function (err, result) {
                                    if (err) {
                                        var error = {
                                            userName: req.session.icon_UserName,
                                            action : 'addedituser',
                                            responseCode: 500,
                                            message: JSON.stringify(err.message)
                                        }
                                        wlogger.error(error); // for error
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                             if (result[0].ld_id != req.body.UserId) {
                                                flag = false;
                                            }
                                        }
                                        if (flag) {
                                            var query = connection_ikon_cms.query('SELECT *  FROM icn_login_detail where ld_mobile_no= ?', [req.body.MobileNo], function (err, result) {
                                                 if (err) {
                                                    var error = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'addedituser',
                                                        responseCode: 500,
                                                        message: JSON.stringify(err.message)
                                                    }
                                                    wlogger.error(error); // for error
                                                    connection_ikon_cms.release();;
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    if (result.length > 0) {
                                                        if (result[0].ld_id != req.body.UserId) {
                                                            flag = false;
                                                        }
                                                    }
                                                    if (flag) {
                                                        if (req.body.UserId) {
                                                            if (req.body.DeletedStores.length > 0) {
                                                                DeleteStoreUser(0);
                                                            }
                                                            else {
                                                              EditUser();
                                                            }
                                                        }
                                                        else {
                                                            AddUser();
                                                        }
                                                    }
                                                    else {
                                                        var error = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'addedituser',
                                                            responseCode: 500,
                                                            message: 'Mobile No. must be Unique.'
                                                        }
                                                        wlogger.error(error); // for error
                                                        connection_ikon_cms.release();;
                                                        res.send({ success: false, message: 'Mobile No. must be Unique.' });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            var error = {
                                                userName: req.session.icon_UserName,
                                                action : 'addedituser',
                                                responseCode: 500,
                                                message: 'Email must be Unique.'
                                            }
                                            wlogger.error(error); // for error
                                            connection_ikon_cms.release();
                                            res.send({ success: false, message: 'Email must be Unique.' });
                                        }
                                    }
                                });
                            }
                            else {
                                var error = {
                                    userName: req.session.icon_UserName,
                                    action : 'addedituser',
                                    responseCode: 500,
                                    message: 'UserName must be Unique.'
                                }
                                wlogger.error(error); // for error
                                connection_ikon_cms.release();;
                                res.send({ success: false, message: 'UserName must be Unique.' });
                            }
                        }
                    });

                    function AddUser() {
                        var query = connection_ikon_cms.query('SELECT MAX(ld_id) AS id FROM icn_login_detail', function (err, userdata) {
                            if (err) {
                                var error = {
                                    userName: req.session.icon_UserName,
                                    action : 'addedituser',
                                    responseCode: 500,
                                    message: JSON.stringify(err.message)
                                }
                                wlogger.error(error); // for error
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                var Ld_id = userdata[0].id != null ? (parseInt(userdata[0].id) + 1) : 1;
                                var datas = {
                                    ld_id: Ld_id,
                                    ld_active: 1,
                                    ld_user_id: req.body.UserName,
                                    ld_user_pwd: 'icon',
                                    account_validity: common.setDBDate(req.body.AccountExpire),
                                    ld_user_name: req.body.UserName,
                                    ld_display_name: req.body.FullName,
                                    ld_email_id: req.body.EmailId,
                                    ld_mobile_no: req.body.MobileNo,
                                   // ld_role: req.body.Role,
                                    ld_created_on: new Date(),
                                    ld_created_by: req.session.icon_UserName,
                                    ld_modified_on: new Date(),
                                    ld_modified_by: req.session.icon_UserName,
                                    ld_last_login: new Date()
                                };
                                var query = connection_ikon_cms.query('INSERT INTO icn_login_detail SET ?', datas, function (err, rightresult) {
                                    if (err) {
                                        var error = {
                                            userName: req.session.icon_UserName,
                                            action : 'addedituser',
                                            responseCode: 500,
                                            message: JSON.stringify(err.message)
                                        }
                                        wlogger.error(error); // for error
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var storelength = req.body.SelectedStores.length;
                                        var UserStore = [];
                                        if (storelength > 0) {
                                            loop(0);
                                            function loop(cnt) {
                                                var i = cnt;
                                                var store = {
                                                    su_ld_id: Ld_id,
                                                    su_st_id: req.body.SelectedStores[i],
                                                    su_created_on: new Date(),
                                                    su_created_by: req.session.icon_UserName,
                                                    su_modified_on: new Date(),
                                                    su_modified_by: req.session.icon_UserName
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO icn_store_user SET ?', store, function (err, rightresult) {
                                                    if (err) {
                                                        var error = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'addedituser',
                                                            responseCode: 500,
                                                            message: JSON.stringify(err.message)
                                                        }
                                                        wlogger.error(error); // for error
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        UserStore.push(store);
                                                        cnt = cnt + 1;
                                                        if (cnt == storelength) {
                                                            var query = connection_ikon_cms.query('SELECT su.su_ld_id, st.st_name, st.st_url FROM ' +
                                                                'icn_store_user as su,icn_store as st where st.st_id =su.su_st_id and su.su_ld_id = ?', [Ld_id], function (err, UserStore) {
                                                                if (err) {
                                                                    var error = {
                                                                        userName: req.session.icon_UserName,
                                                                        action : 'addedituser',
                                                                        responseCode: 500,
                                                                        message: JSON.stringify(err.message)
                                                                    }
                                                                    wlogger.error(error); // for error
                                                                    connection_ikon_cms.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    var smtpTransport = nodemailer.createTransport({
                                                                        service: "Gmail",
                                                                        auth: {
                                                                            user: "jetsynthesis@gmail.com",
                                                                            pass: "j3tsynthes1s"
                                                                        }
                                                                    });
                                                                    var Message = "";
                                                                    Message += "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                                                                    Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;text-align:left\">You have requested a New User from Icon";
                                                                    Message += " </td></tr><tr><td></td></tr><tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:15px;font-weight: bold;line-height:24px;text-align:left\">Your Username : " + req.body.UserName;
                                                                    Message += " </td></tr><tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:15px;font-weight: bold;line-height:24px;text-align:left\">Your Password : " + "icon";
                                                                    Message += " </td></tr>";
                                                                    Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                                                    Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href="+SitePath+" target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Icon. If you have not made any request then you may ignore this email.";
                                                                    Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">If you have any concerns please contact us.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Icon Team</td></tr></tbody></table>";
                                                                    var mailOptions = {
                                                                        to: req.body.EmailId,
                                                                        subject: 'New User',
                                                                        html: Message
                                                                    }
                                                                    smtpTransport.sendMail(mailOptions, function (error, response) {
                                                                        if (err) {
                                                                            var error = {
                                                                                userName: req.session.icon_UserName,
                                                                                action : 'addedituser',
                                                                                responseCode: 500,
                                                                                message: JSON.stringify(err.message)
                                                                            }
                                                                            wlogger.error(error); // for error
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        } else {
                                                                            var info = {
                                                                                userName: req.session.icon_UserName,
                                                                                action : 'addedituser',
                                                                                responseCode: 200,
                                                                                message: "User added successfully."
                                                                            }
                                                                            wlogger.info(info); // for error
                                                                            res.send({ success: true, message: 'User added successfully. Temporary Password sent to register email.', user: datas, UserStore: UserStore });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            loop(cnt);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            var smtpTransport = nodemailer.createTransport({
                                                service: "Gmail",
                                                auth: {
                                                    user: "jetsynthesis@gmail.com",
                                                    pass: "j3tsynthes1s"
                                                }
                                            });
                                            var Message = "";
                                            Message += "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                                            Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;text-align:left\">You have requested a New User from Icon";
                                            Message += " </td></tr><tr><td></td></tr><tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:15px;font-weight: bold;line-height:24px;text-align:left\">Your Username : " + req.body.UserName;
                                            Message += " </td></tr><tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:15px;font-weight: bold;line-height:24px;text-align:left\">Your Password : " + "icon";
                                            Message += " </td></tr>";
                                            Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                            Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href="+SitePath+" target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Icon. If you have not made any request then you may ignore this email.";
                                            Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">If you have any concerns please contact us.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Icon Team</td></tr></tbody></table>";
                                            var mailOptions = {
                                                to: req.body.EmailId,
                                                subject: 'New User',
                                                html: Message
                                            }
                                            smtpTransport.sendMail(mailOptions, function (error, response) {
                                                if (error) {
                                                    var error = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'addedituser',
                                                        responseCode: 500,
                                                        message: JSON.stringify(err.message)
                                                    }
                                                    wlogger.error(error); // for error
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(error.message);
                                                } else {
                                                    var info = {
                                                        userName: req.session.icon_UserName,
                                                        action : 'addedituser',
                                                        responseCode: 200,
                                                        message: "User added successfully."
                                                    }
                                                    wlogger.info(info); // for error
                                                     res.send({ success: true, message: 'User added successfully. Temporary Password sent to register email.', user: datas, UserStore: UserStore });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }

                    function DeleteStoreUser(cnt) {
                             var i = cnt;
                            var query = connection_ikon_cms.query('Update icn_store_user SET su_crud_isactive = ? WHERE su_ld_id = ? and su_st_id = ?',[req.body.DeletedStores[cnt],req.body.UserId, req.body.DeletedStores[cnt]], function (err, row, fields) {
                                if (err) {
                                    var error = {
                                        userName: req.session.icon_UserName,
                                        action : 'addedituser',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    cnt = cnt + 1;
                                    if (cnt < req.body.DeletedStores.length) {
                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action: 'updateuserright',
                                            responseCode: 200,
                                            message: "User Store Id "+req.body.DeletedStores[cnt]+" deleted successfully."
                                        }
                                        wlogger.info(info); // for information
                                        DeleteStoreUser(cnt);
                                    }else {
                                         EditUser();
                                    }
                                }
                            })
                        }

                    function EditUser() {
                         var datas = {
                            ld_user_id: req.body.UserName,
                            account_validity: common.setDBDate(req.body.AccountExpire),
                            ld_user_name: req.body.UserName,
                            ld_display_name: req.body.FullName,
                            ld_email_id: req.body.EmailId,
                            ld_mobile_no: req.body.MobileNo,
                            ld_modified_on: new Date(),
                            ld_modified_by: req.session.icon_UserName,
                        };
                        var query = 'UPDATE icn_login_detail SET ? ' +
                            'where ld_id= ? ';
                            connection_ikon_cms.query(query, [datas, req.body.UserId], function (err, result) {
                            if (err) {
                                var error = {
                                    userName: req.session.icon_UserName,
                                    action : 'addedituser',
                                    responseCode: 500,
                                    message: JSON.stringify(err.message)
                                }
                                wlogger.error(error); // for error
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                if (req.body.SelectedStores.length > 0) {
                                    var vendorlength = req.body.SelectedStores.length;
                                    var count = 0;
                                    loop(count);
                                    function loop(count) {
                                        var query = connection_ikon_cms.query('SELECT * FROM icn_store_user where isnull(su_crud_isactive) and su_ld_id = ? and su_st_id =?', [req.body.UserId, req.body.SelectedStores[count]], function (err, row) {
                                            if (err) {
                                                var error = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'addedituser',
                                                    responseCode: 500,
                                                    message: JSON.stringify(err.message)
                                                }
                                                wlogger.error(error); // for error
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                if (!row.length > 0) {
                                                    var store = {
                                                        su_ld_id: req.body.UserId,
                                                        su_st_id: req.body.SelectedStores[count],
                                                        su_created_on: new Date(),
                                                        su_created_by: req.session.icon_UserName,
                                                        su_modified_on: new Date(),
                                                        su_modified_by: req.session.icon_UserName
                                                    }
                                                    var query = connection_ikon_cms.query('INSERT INTO icn_store_user SET ?', store, function (err, rightresult) {
                                                        if (err) {
                                                            var error = {
                                                                userName: req.session.icon_UserName,
                                                                action : 'addedituser',
                                                                responseCode: 500,
                                                                message: JSON.stringify(err.message)
                                                            }
                                                            wlogger.error(error); // for error
                                                            connection_ikon_cms.release();;
                                                            res.status(500).json(err.message);
                                                        }
                                                        else {
                                                            count++;
                                                            if (count == vendorlength) {
                                                                var info = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'addedituser',
                                                                    responseCode: 200,
                                                                    message: "User inserted successfully."
                                                                }
                                                                wlogger.info(info); // for error
                                                                 res.send({ success: true, message: 'User updated successfully.' });
                                                            }
                                                            else {
                                                                loop(count);
                                                            }
                                                        }
                                                    });

                                                }
                                                else {
                                                    count++;
                                                    if (count == vendorlength) {
                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'addedituser',
                                                            responseCode: 200,
                                                            message: "User updated successfully."
                                                        }
                                                        wlogger.info(info); // for error
                                                        res.send({ success: true, message: 'User updated successfully.' });
                                                    }
                                                    else {
                                                        loop(count);
                                                    }
                                                }
                                            }
                                        });
                                    };
                                }
                                else {
                                     res.send({ success: true, message: 'User updated successfully.' });
                                }
                            }
                        });
                    }
                });
            }
            else {
                var error = {
                    userName: "Unknown User",
                    action : 'addedituser',
                    responseCode: 500,
                    message: 'Not Valid Username'
                }
                wlogger.error(error); // for error
                res.redirect('/accountlogin');
            }
        }
        else {
            var error = {
                userName: "Unknown User",
                action : 'addedituser',
                responseCode: 500,
                message: 'Not Valid User session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        var error = {
            userName: "Unknown User",
            action : 'addedituser',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
}
/**
 * @class
 * @classdesc block and unblock vendor.
 * @param {object} req - http requset object.
 * @param {object} res - http response object.
 */
exports.blockunblockuser = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM icn_login_detail where ld_id = ?', [req.body.ld_Id], function (err, vendor) {
                        if (err) {
                            var error = {
                                userName: req.session.icon_UserName,
                                action : 'blockunblockuser',
                                responseCode: 200,
                                message: JSON.stringify(err.message)
                            }
                            wlogger.error(error); // for error
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_cms.query('UPDATE icn_login_detail SET ld_active= ? where ld_id= ?', [req.body.active, req.body.ld_Id], function (err, result) {
                                if (err) {
                                    var error = {
                                        userName: req.session.icon_UserName,
                                        action : 'blockunblockuser',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'blockunblockuser',
                                        responseCode: 200,
                                        message: 'Vendor ' + (req.body.active == 1 ? 'unblocked' : 'blocked') + ' successfully.'
                                    }
                                    wlogger.info(info); // for information
                                    res.send({ success: true, message: 'User ' + (req.body.active == 1 ? 'unblocked' : 'blocked') + ' successfully.' });
                                }
                            });
                        }
                    });
                });
            }
            else {
                var error = {
                    userName: "Unknown User",
                    action : 'blockunblockuser',
                    responseCode: 500,
                    message: 'Not Valid Username'
                }
                wlogger.error(error); // for error
                res.redirect('/accountlogin');
            }
        }
        else {
            var error = {
                userName: "Unknown User",
                action : 'blockunblockuser',
                responseCode: 500,
                message: 'Not Valid User session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }
    catch (err) {

        var error = {
            userName: "Unknown User",
            action : 'blockunblockuser',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
}