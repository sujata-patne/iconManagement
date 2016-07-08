var mysql = require('../config/db').pool;
var async = require("async");
var contentManager = require( "../models/manageContentModel");
var countryManager = require("../models/countryModel");

var fs = require("fs");
var wlogger= require('../config/logger');
var reload = require('require-reload')(require);
var config = require('../config')();
var common = require("../helpers/common");

/**
 * @desc create a log file if not exist.
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
 * @desc Get Detials to Manage Content Type Data
 * @param req
 * @param res
 * @param next
 */
exports.getmanagecontentdata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if(err) {
                        var errorInfo = {
                            userName: req.session.icon_UserName,
                            action : 'getmanagecontentdata.getConnection',
                            responseCode:500,
                            message : ' failed to get Connection '+JSON.stringify(err.message)
                        };
                        wlogger.error(errorInfo);
                    }
                    else {
                        var info = {
                            userName: req.session.icon_UserName,
                            action : 'getmanagecontentdata.getConnection',
                            responseCode:200,
                            message : ' get Connection successfully'
                        };
                        wlogger.info(info);
                    }
                    async.parallel({
                        ContentMasterList: function (callback) {
                            contentManager.getContentMasterList( connection_ikon_cms, function (err, ContentMasterList) {

                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getContentMasterList',
                                        responseCode:500,
                                        message : ' failed to get Content MasterList '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getContentMasterList',
                                        responseCode:200,
                                        message : ' get Content MasterList successfully'
                                    };
                                    wlogger.info(info);
                                }
                                callback( err, ContentMasterList );
                            });
                        },
                        ContentList: function (callback) {
                            contentManager.getContentList( connection_ikon_cms, req.body.state, req.body.Id, function( err, ContentList ) {

                                if(err)
                                {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getContentList',
                                        responseCode:500,
                                        message :' failed to get ContentList '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);
                                }
                                else
                                {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getContentList',
                                        responseCode:200,
                                        message :' getContentList successfully'
                                    };
                                    wlogger.info(info);
                                }

                                callback(err, ContentList);
                            });
                        },
                        ContentRights: function (callback) {
                            if (req.body.state == "edit-content") {
                                contentManager.getContentRights( connection_ikon_cms, [req.body.Id], function (err, ContentRights) {

                                    if(err)
                                    {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'getContentRights',
                                            responseCode:500,
                                            message : ' failed to get Content Rights '+JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);
                                    }
                                    else
                                    {
                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'getContentRights',
                                            responseCode:200,
                                            message : ' get Content Rights successfully'
                                        };
                                        wlogger.info(info);
                                    }
                                    callback(err, ContentRights);
                                });
                            }else {
                                callback(null, []);
                            }
                        },
                        UserRole: function (callback) {
                            callback(null, req.session.icon_UserRole);
                        }
                    }, function (err, results) {
                        if (err) {

                            var errorInfo = {
                                userName: req.session.icon_UserName,
                                action : 'getmanagecontentdata',
                                responseCode:500,
                                message : ' failed to get manage content data '+JSON.stringify(err.message)
                            };
                            wlogger.error(errorInfo);

                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
                });
            } else {

                var errorInfo = {
                    userName:'Unknown user',
                    action : 'getmanagecontentdata',
                    responseCode:500,
                    message : 'User session is not set'
                };
                wlogger.error(errorInfo);

                res.redirect('/accountlogin');
            }
        } else {

            var errorInfo = {
                userName:'Unknown user',
                action : 'getmanagecontentdata',
                responseCode:500,
                message : 'Session is not set'
            };

            wlogger.error(errorInfo);
            res.redirect('/accountlogin');
        }
    } catch (error) {

        var errorInfo = {
            userName: req.session.icon_UserName,
            action : 'getmanagecontentdata',
            responseCode:500,
            message : ' failed to get manage content data '+JSON.stringify(err.message)
        };
        wlogger.error(errorInfo);

        connection_ikon_cms.release();
        res.status(500).json(error.message);
    }
}
/**
 * @desc Add and update Child Content Types
 * @param req
 * @param res
 * @param next
 */
exports.addeditcontenttype = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if(err)
                    {
                        var errorInfo = {
                            userName: req.session.icon_UserName,
                            action : 'addeditcontenttype.getConnection',
                            responseCode:500,
                            message : ' failed to get Connection '+JSON.stringify(err.message)
                        };
                        wlogger.error(errorInfo);
                    }
                    else
                    {
                        var info = {
                            userName: req.session.icon_UserName,
                            action : 'addeditcontenttype.getConnection',
                            responseCode:200,
                            message : ' get Connection successfully'
                        };
                        wlogger.info(info);
                    }

                    contentManager.getContentTypeByNameByParentContentId( connection_ikon_cms, req.body.parent_content_type, req.body.content_name, function (err, result) {
                        if (err) {
                            var errorInfo = {
                                userName: req.session.icon_UserName,
                                action : 'getContentTypeByNameByParentContentId',
                                responseCode:500,
                                message : ' failed to get Content Type-'+req.body.content_name+' By Name and Parent ContentId '+JSON.stringify(err.message)
                            };
                            wlogger.error(errorInfo);

                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            var info = {
                                userName: req.session.icon_UserName,
                                action : 'getContentTypeByNameByParentContentId',
                                responseCode:200,
                                message :' get Content Type-'+req.body.content_name+' By Name and Parent ContentId'
                            };
                            wlogger.info(info);

                            if (result.length > 0) {
                                if (req.body.state == "edit-content" && result[0].contentid == req.body.content_id) {
                                    if (req.body.DeleteDeliveryType.length > 0) {
                                        DeleteDeliveryType();
                                    }
                                    else {
                                        EditDeliveryType();
                                    }
                                }
                                else {
                                    connection_ikon_cms.release();
                                    res.send({
                                        success: false,
                                        message: "Content Type must be Unique.",
                                        ContentList: [],
                                        RoleUser: req.session.icon_UserRole
                                    });
                                }
                            }
                            else {
                                if (req.body.state == "edit-content") {
                                    if (req.body.DeleteDeliveryType.length > 0) {
                                        DeleteDeliveryType();
                                    }
                                    else {
                                        EditDeliveryType();
                                    }
                                }
                                else {
                                    AddDeliveryType();
                                }
                            }
                        }
                    });

                    function EditDeliveryType() {
                        contentManager.updateContent( connection_ikon_cms, req.body.content_name, req.body.content_id, function( err, result ) {
                            if (err) {
                                var errorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'updateContent',
                                    responseCode:500,
                                    message :' failed to update Content-'+req.body.content_name+' '+JSON.stringify(err.message)
                                };
                                wlogger.error(errorInfo);

                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'updateContent',
                                    responseCode:200,
                                    message : 'update Content-'+req.body.content_name+' '+' successfully'
                                };
                                wlogger.info(info);

                                var storelength = req.body.AddDeliveryType.length;
                                if (req.body.AddDeliveryType.length > 0) {
                                    loop(0);
                                    function loop(cnt) {
                                        var i = cnt;
                                        contentManager.getLastInsertedContentId( connection_ikon_cms,  function (err, row) {
                                            if (err) {
                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedContentId',
                                                    responseCode:500,
                                                    message : ' failed to get Last Inserted ContentId-'+req.body.content_id+' '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedContentId',
                                                    responseCode:200,
                                                    message : ' get Last Inserted ContentId-'+req.body.content_id+' successfully'
                                                };
                                                wlogger.info(info);

                                                var metadata = {
                                                    cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                    cmd_group_id: req.body.content_delivery_type,
                                                    cmd_entity_type: req.body.parent_content_type,
                                                    cmd_entity_detail: req.body.AddDeliveryType[i]
                                                }
                                                contentManager.createContentTypeMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function( err, result ) {
                                                    if (err) {
                                                        var errorInfo = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createContentTypeMultiSelectMetaDataDetail',
                                                            responseCode:500,
                                                            message : ' failed to create Content Type MultiSelect MetaData Detail '+JSON.stringify(err.message)
                                                        };
                                                        wlogger.error(errorInfo);

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createContentTypeMultiSelectMetaDataDetail',
                                                            responseCode:200,
                                                            message : ' to create Content Type MultiSelect MetaData Detail successfully'
                                                        };
                                                        wlogger.info(info);

                                                        cnt = cnt + 1;
                                                        if (cnt == storelength) {
                                                            connection_ikon_cms.release();
                                                            var info = {
                                                                userName: req.session.icon_UserName,
                                                                action : 'EditDeliveryType',
                                                                responseCode:200,
                                                                message : ' updated Content Type-'+req.body.content_name+' successfully'
                                                            };
                                                            wlogger.info(info);

                                                            res.send({
                                                                success: true,
                                                                message: "Content Type updated successfully.",
                                                                ContentList: [],
                                                                RoleUser: req.session.icon_UserRole
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
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'EditDeliveryType',
                                        responseCode:200,
                                        message : ' updated Content Type-'+req.body.content_name+' successfully'
                                    };
                                    wlogger.info(info);

                                    connection_ikon_cms.release();
                                    res.send({
                                        success: true,
                                        message: "Content Type updated successfully.",
                                        ContentList: [],
                                        RoleUser: req.session.icon_UserRole
                                    });
                                }

                            }
                        });
                    }

                    function DeleteDeliveryType() {
                        var storelength = req.body.DeleteDeliveryType.length;
                        var count = 0;
                        deleteloop(count);
                        function deleteloop(count) {
                            contentManager.deleteDeliverType( connection_ikon_cms, req.body.content_delivery_type, req.body.DeleteDeliveryType[count], function( err, row, fields ) {
                                if( err ) {

                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'deleteDeliverType',
                                        responseCode:500,
                                        message : ' failed to delete DeliverType-'+req.body.content_delivery_type+' '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);

                                    connection_ikon_cms.release(); ;
                                    res.status(500).json(err.message);
                                }else {

                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'deleteDeliverType',
                                        responseCode:200,
                                        message : ' delete DeliverType-'+req.body.content_delivery_type+' '+' successfully'
                                    };
                                    wlogger.info(info);

                                    count++;
                                    if (count == storelength) {
                                        EditDeliveryType();
                                    }
                                    else {
                                        deleteloop(count);
                                    }
                                }
                            });
                        };
                    }

                    function AddDeliveryType() {
                        var Groupid = 0;
                        var storelength = req.body.AddDeliveryType.length;
                        if (req.body.AddDeliveryType.length > 0) {

                            var info = {
                                userName: req.session.icon_UserName,
                                action : 'AddDeliveryType',
                                responseCode:200,
                                message : 'Delivery Type-'+req.body.AddDeliveryType+' added  successfully'
                            };
                            wlogger.error(info);

                            contentManager.getLastInsertedContentGroupId( connection_ikon_cms, function( err, result ) {
                                if (err) {
                                    var errorInfo = {
                                        userName: req.session.icon_UserName,
                                        action : 'getLastInsertedContentGroupId',
                                        responseCode:500,
                                        message : ' failed to get Last Inserted Content GroupId '+JSON.stringify(err.message)
                                    };
                                    wlogger.error(errorInfo);

                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    var info = {
                                        userName: req.session.icon_UserName,
                                        action : 'getLastInsertedContentGroupId',
                                        responseCode:200,
                                        message : ' get Last Inserted Content GroupId-'+result[0].id+' successfully'
                                    };
                                    wlogger.info(info);

                                    Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                    loop(0);
                                    function loop(cnt) {
                                        var i = cnt;
                                        contentManager.getLastInsertedContentId( connection_ikon_cms, function( err, row ) {
                                            if (err) {

                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedContentId',
                                                    responseCode:500,
                                                    message : ' failed to get Last Inserted ContentId '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {

                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedContentId',
                                                    responseCode:200,
                                                    message : ' get Last Inserted ContentId-'+row[0].id+' successfully'
                                                };
                                                wlogger.info(info);

                                                var deliveryType = {
                                                    cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                    cmd_group_id: Groupid,
                                                    cmd_entity_type: req.body.parent_content_type,
                                                    cmd_entity_detail: req.body.AddDeliveryType[i]
                                                }
                                                contentManager.createDeliveryType( connection_ikon_cms, deliveryType , function( err, result ) {
                                                    if (err) {

                                                        var errorInfo = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createDeliveryType',
                                                            responseCode:500,
                                                            message : ' failed to create Delivery Type '+JSON.stringify(err.message)
                                                        };
                                                        wlogger.error(errorInfo);

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {

                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createDeliveryType',
                                                            responseCode:200,
                                                            message : ' create Delivery Type successfully'
                                                        };
                                                        wlogger.info(info);

                                                        cnt = cnt + 1;
                                                        if (cnt == storelength) {
                                                            AddContent(Groupid);
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

                            var errorInfo = {
                                userName: req.session.icon_UserName,
                                action : 'AddDeliveryType',
                                responseCode:500,
                                message : ' failed to Add Delivery Type '+JSON.stringify(err.message)
                            };
                            wlogger.error(errorInfo);

                            AddContent(null);
                        }
                    }

                    function AddContent(Groupid) {
                        countryManager.getLastInsertedCatalogueId( connection_ikon_cms, function (err, row) {
                            if (err) {

                               var errorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'getLastInsertedCatalogueId',
                                    responseCode:500,
                                    message : 'failed to get Last Inserted CatalogueId '+JSON.stringify(err.message)
                                };
                                wlogger.error(errorInfo);

                                connection_ikon_cms.release(); ;
                                res.status(500).json(err.message);
                            } else {
                                var info = {
                                    userName: req.session.icon_UserName,
                                    action : 'getLastInsertedCatalogueId',
                                    responseCode:200,
                                    message : 'get Last Inserted CatalogueId successfully'
                                };
                                wlogger.info(info);

                                var cd_id = row[0].id != null ? (parseInt(row[0].id) + 1) : 1;
                                var contentType = {
                                    cd_id: cd_id,
                                    cd_cm_id: null,
                                    cd_name: req.body.content_name,
                                    cd_display_name: req.body.content_name,
                                    cd_desc: null,
                                    cd_desc1: null
                                }
                                contentManager.createContentType( connection_ikon_cms, contentType, function (err, result) {
                                    if (err) {
                                        var errorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'createContentType',
                                            responseCode:500,
                                            message : 'failed to create ContentType-'+req.body.content_name+' ' +JSON.stringify(err.message)
                                        };
                                        wlogger.error(errorInfo);

                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'createContentType',
                                            responseCode:200,
                                            message : 'create ContentType-'+req.body.content_name+' '+ 'successfully'
                                        };
                                        wlogger.info(info);

                                        contentManager.getLastInsertedIcnManageContentType( connection_ikon_cms, function( err, row ) {
                                            if (err) {
                                                var errorInfo = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedIcnManageContentType',
                                                    responseCode:500,
                                                    message : 'failed to get Last Inserted Icon Manage ContentType '+JSON.stringify(err.message)
                                                };
                                                wlogger.error(errorInfo);

                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var info = {
                                                    userName: req.session.icon_UserName,
                                                    action : 'getLastInsertedIcnManageContentType',
                                                    responseCode:200,
                                                    message : 'get Last Inserted Icon Manage ContentType-'+req.body.parent_content_type +' ' +' successfully'
                                                };
                                                wlogger.info(info);

                                                var mct_id = row[0].id != null ? (parseInt(row[0].id) + 1) : 1;
                                                var manageContent = {
                                                    mct_id: mct_id,
                                                    mct_parent_cnt_type_id: req.body.parent_content_type,
                                                    mct_cnt_type_id: cd_id,
                                                    mct_delivery_type_id: Groupid
                                                }
                                                contentManager.createIcnManageContentType( connection_ikon_cms, manageContent, function(err, result) {
                                                    if (err) {
                                                        var errorInfo = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createIcnManageContentType',
                                                            responseCode:500,
                                                            message : 'failed to create Icon Manage ContentType '+JSON.stringify(err.message)
                                                        };
                                                        wlogger.error(errorInfo);

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        var info = {
                                                            userName: req.session.icon_UserName,
                                                            action : 'createIcnManageContentType',
                                                            responseCode:200,
                                                            message : 'create Icon Manage ContentType-'+req.body.parent_content_type+' successfully'
                                                        };
                                                        wlogger.info(info);

                                                        contentManager.getContentListByIcnManageContentId( connection_ikon_cms, mct_id, function( err, ContentList ) {
                                                            if (err) {
                                                                var errorInfo = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'getContentListByIcnManageContentId',
                                                                    responseCode:500,
                                                                    message : 'failed to get ContentList By Icon Manage ContentId '+JSON.stringify(err.message)
                                                                };
                                                                wlogger.error(errorInfo);

                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                var info = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'getContentListByIcnManageContentId',
                                                                    responseCode:200,
                                                                    message : 'get ContentList By Icon Manage ContentId successfully'
                                                                };
                                                                wlogger.info(info);

                                                                connection_ikon_cms.release();

                                                                var info = {
                                                                    userName: req.session.icon_UserName,
                                                                    action : 'AddContent',
                                                                    responseCode:200,
                                                                    message : 'added Content Type-'+req.body.content_name+' '+' successfully.'
                                                                };
                                                                wlogger.info(info);

                                                                res.send({
                                                                    success: true,
                                                                    message: "Content Type added successfully.",
                                                                    ContentList: ContentList,
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
                });
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

