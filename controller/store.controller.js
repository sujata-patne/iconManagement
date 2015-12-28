
var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');
var async = require("async");
var storeManager = require("../models/storeModel");
var userManager = require("../models/userModel");
var config = require('../config')();
var SitePath = config.site_path+":"+config.port;

//console.log("site_path "+config.site_path+":"+config.port)

exports.getstoredata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                        Channels: function( callback ) {
                            storeManager.getDistributionChannelList(connection_ikon_cms,function (err, Channels) {
                                callback(err, Channels);
                            });
                        },
                        StoreList: function (callback) {
                            storeManager.getStoreList(connection_ikon_cms, req.body.state, req.body.Id, function (err, StoreList) {
                                callback(err, StoreList);
                            });
                        },
                        ChannelRights: function (callback) {
                            storeManager.getChannelRights(connection_ikon_cms, req.body.state, req.body.Id, function (err, ChannelRights) {
                                callback(err, ChannelRights);
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

exports.AddEditStore = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    userManager.getIcnUserByEmailId( connection_ikon_cms, req.body.store_email.toLowerCase(), function( err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].ld_id == req.body.store_ld_id && req.body.state == "edit-store") {
                                    storeManager.getStoreDetailsByStoreSiteUrl( connection_ikon_cms, req.body.store_site_url.toLowerCase(), function( err, result ) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
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
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
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
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
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
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
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
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                } else {
                                                    var storelength = req.body.AddStoreChannels.length;
                                                    if (req.body.AddStoreChannels.length > 0) {
                                                        loop(0);
                                                        function loop(cnt) {
                                                            var i = cnt;
                                                            storeManager.getLastInsertedMultiSelectMetaDataDetail( connection_ikon_cms, function( err, row ) {
                                                                if (err) {
                                                                    connection_ikon_cms.release(); ;
                                                                    res.status(500).json(err.message);
                                                                } else {
                                                                    var metadata = {
                                                                        cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                        cmd_group_id: req.body.store_front_type,
                                                                        cmd_entity_type: req.body.store_cmd_entity_type,
                                                                        cmd_entity_detail: req.body.AddStoreChannels[i]
                                                                    }
                                                                    storeManager.createMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function( err, result ){
                                                                        if (err) {
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        }
                                                                        else {
                                                                            cnt = cnt + 1;
                                                                            if (cnt == storelength) {
                                                                                res.send({
                                                                                    StoreList: [],
                                                                                    success: true,
                                                                                    message: 'Store Updated successfully.'
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
                                                            StoreList: [],
                                                            success: true,
                                                            message: 'Store Updated successfully.'
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
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            }
                                            else {
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
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                                loop(0);
                                                function loop(cnt) {
                                                    var i = cnt;
                                                    storeManager.getLastInsertedMultiSelectMetaDataDetail( connection_ikon_cms, function( err, row ) {
                                                        if (err) {
                                                            connection_ikon_cms.release(); ;
                                                            res.status(500).json(err.message);
                                                        } else {
                                                            var metadata = {
                                                                cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                cmd_group_id: Groupid,
                                                                cmd_entity_type: req.body.store_cmd_entity_type,
                                                                cmd_entity_detail: req.body.AddStoreChannels[i]
                                                            }
                                                            storeManager.createMultiSelectMetaDataDetail( connection_ikon_cms, metadata, function( err, result ){
                                                                if (err) {
                                                                    connection_ikon_cms.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    cnt = cnt + 1;
                                                                    if (cnt == storelength) {
                                                                        // add store
                                                                        storeManager.getLastInsertedStoreIdFromIcnStore( connection_ikon_cms, function (err, result) {
                                                                            if (err) {
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            } else {
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
                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    } else {
                                                                                        // add store user
                                                                                        storeManager.getLastInsertedIdFromIcnLoginDetail( connection_ikon_cms, function( err, result ) {
                                                                                            if (err) {
                                                                                                connection_ikon_cms.release();
                                                                                                res.status(500).json(err.message);
                                                                                            } else {
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
                                                                                                        connection_ikon_cms.release();
                                                                                                        res.status(500).json(err.message);
                                                                                                    } else {
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
                                                                                                                console.log(err.message, 3)
                                                                                                                connection_ikon_cms.release();
                                                                                                                res.status(500).json(err.message);
                                                                                                            } else {
                                                                                                                storeManager.getStoreListByStoreId( connection_ikon_cms, store_id, function( err, StoreList ) {
                                                                                                                    if (err) {
                                                                                                                        connection_ikon_cms.release();
                                                                                                                        res.status(500).json(err.message);
                                                                                                                    } else {
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
                                                                                                                                console.log(error);
                                                                                                                                res.end("error");
                                                                                                                            } else {
                                                                                                                                connection_ikon_cms.release();
                                                                                                                                res.send({
                                                                                                                                    StoreList: StoreList,
                                                                                                                                    success: true,
                                                                                                                                    message: 'Store added successfully. Temprory Password sent to register store user email.'
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
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
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
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    } else {
                                                        // add store user
                                                        storeManager.getLastInsertedIdFromIcnLoginDetail( connection_ikon_cms, function (err, result) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            } else {
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
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {
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
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            } else {
                                                                                storeManager.getStoreListByStoreId( connection_ikon_cms, storeId, function( err, StoreList ) {
                                                                                    if (err) {
                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    } else {
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
                                                                                                console.log(error);
                                                                                                res.end("error");
                                                                                            } else {
                                                                                                connection_ikon_cms.release();
                                                                                                res.send({
                                                                                                    StoreList: StoreList,
                                                                                                    success: true,
                                                                                                    message: 'Store added successfully. Temprory Password sent to register store user email.'
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