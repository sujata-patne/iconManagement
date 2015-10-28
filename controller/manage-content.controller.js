var mysql = require('../config/db').pool;
var async = require("async");
var contentManager = require( "../models/manageContentModel");
var countryManager = require("../models/countryModel");

exports.getmanagecontentdata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                        ContentMasterList: function (callback) {
                            contentManager.getContentMasterList( connection_ikon_cms, function (err, ContentMasterList) {
                                callback( err, ContentMasterList );
                            });
                        },
                        ContentList: function (callback) {
                            contentManager.getContentList( connection_ikon_cms, req.body.state, req.body.Id, function( err, ContentList ) {
                                callback(err, ContentList);
                            });
                        },
                        ContentRights: function (callback) {
                            if (req.body.state == "edit-content") {
                                contentManager.getContentRights( connection_ikon_cms, [req.body.Id], function (err, ContentRights) {
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
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
                });
            } else {
                res.redirect('/accountlogin');
            }
        } else {
            res.redirect('/accountlogin');
        }
    } catch (error) {
        connection_ikon_cms.release();
        res.status(500).json(error.message);
    }
}

exports.addeditcontenttype = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    contentManager.getContentTypeByNameByParentContentId( connection_ikon_cms, req.body.parent_content_type, req.body.content_name, function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
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
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                var storelength = req.body.AddDeliveryType.length;
                                if (req.body.AddDeliveryType.length > 0) {
                                    loop(0);
                                    function loop(cnt) {
                                        var i = cnt;
                                        contentManager.getLastInsertedContentId( connection_ikon_cms,  function (err, row) {
                                            if (err) {
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var metadata = {
                                                    cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                    cmd_group_id: req.body.content_delivery_type,
                                                    cmd_entity_type: req.body.parent_content_type,
                                                    cmd_entity_detail: req.body.AddDeliveryType[i]
                                                }
                                                contentManager.createContentTypeMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function( err, result ) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        cnt = cnt + 1;
                                                        if (cnt == storelength) {
                                                            connection_ikon_cms.release();
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
                                    connection_ikon_cms.release(); ;
                                    res.status(500).json(err.message);
                                }else {
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
                            contentManager.getLastInsertedContentGroupId( connection_ikon_cms, function( err, result ) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                    loop(0);
                                    function loop(cnt) {
                                        var i = cnt;
                                        contentManager.getLastInsertedContentId( connection_ikon_cms, function( err, row ) {
                                            if (err) {
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var deliveryType = {
                                                    cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                    cmd_group_id: Groupid,
                                                    cmd_entity_type: req.body.parent_content_type,
                                                    cmd_entity_detail: req.body.AddDeliveryType[i]
                                                }
                                                contentManager.createDeliveryType( connection_ikon_cms, deliveryType , function( err, result ) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
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
                            AddContent(null);
                        }
                    }

                    function AddContent(Groupid) {
                        countryManager.getLastInsertedCatalogueId( connection_ikon_cms, function (err, row) {
                            if (err) {
                                connection_ikon_cms.release(); ;
                                res.status(500).json(err.message);
                            } else {
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
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        contentManager.getLastInsertedIcnManageContentType( connection_ikon_cms, function( err, row ) {
                                            if (err) {
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var mct_id = row[0].id != null ? (parseInt(row[0].id) + 1) : 1;
                                                var manageContent = {
                                                    mct_id: mct_id,
                                                    mct_parent_cnt_type_id: req.body.parent_content_type,
                                                    mct_cnt_type_id: cd_id,
                                                    mct_delivery_type_id: Groupid
                                                }
                                                contentManager.createIcnManageContentType( connection_ikon_cms, manageContent, function(err, result) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        contentManager.getContentListByIcnManageContentId( connection_ikon_cms, mct_id, function( err, ContentList ) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                connection_ikon_cms.release();
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

