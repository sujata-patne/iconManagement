
var mysql = require('../config/db').pool;
var async = require("async");
var nodemailer = require('nodemailer');
var assingRightsManager = require( "../models/assignRightsModel");
var config = require('../config')();
var SitePath = config.site_path+":"+config.port;

exports.getassignrights = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    //mysql.getConnection('GATEWAY', function (err, connection_billing_gateway) {
                    	//console.log( connection_billing_gateway );
                        async.parallel({
                            MasterList: function (callback) {
                                assingRightsManager.getMasterList( connection_ikon_cms, function( err, MasterList  ) {
                                    callback(err, MasterList);
                                });
                            },
                            ContentTypes: function (callback) {
                                assingRightsManager.getContentTypes( connection_ikon_cms, function( err, ContentTypes  ) {
                                    callback(err, ContentTypes);
                                });
                            },
                            IconCountry: function (callback) {
                                assingRightsManager.getIconCountry( connection_ikon_cms, function( err, IconCountry  ) {
                                    callback(err, IconCountry);
                                });
                            },
                            IconGroupCountry: function (callback) {
                                assingRightsManager.getIconCountryGroup( connection_ikon_cms, function( err, IconCountryGroup  ) {
                                    callback(err, IconCountryGroup);
                                });
                            },
                            VendorCountry: function (callback) {
                                assingRightsManager.getVendorCountry( connection_ikon_cms, function( err, VendorCountry  ) {
                                    callback( err, VendorCountry );
                                });
                            },
                            Countrys: function (callback) {
                                assingRightsManager.getCountries(connection_ikon_cms, function (err, Countrys) {
                                    callback(err, Countrys);
                                });
                            },
                            Stores: function (callback) {
                                assingRightsManager.getStores( connection_ikon_cms, function( err, Stores  ) {
                                    callback( err, Stores );
                                });
                            },
                            StoresUserDetails: function (callback) {
                                assingRightsManager.getStoresUserDetails( connection_ikon_cms, function( err, storeUsers  ) {
                                    callback( err, storeUsers );
                                });
                            },
                            StoreChannels: function (callback) {
                                assingRightsManager.getStoreChannels( connection_ikon_cms, function( err, StoreChannels  ) {
                                    callback( err, StoreChannels );
                                });
                            },
                            AssignCountrys: function (callback) {
                                assingRightsManager.getAssignedCountries( connection_ikon_cms, function( err, AssignCountrys  ) {
                                    callback( err, AssignCountrys );
                                });
                            },
                            AssignPaymentTypes: function (callback) {
                                assingRightsManager.getAssignedPaymentTypes( connection_ikon_cms, function( err, AssignPaymentTypes  ) {
                                    callback( err, AssignPaymentTypes );
                                });
                            },
                            AssignPaymentChannels: function (callback) {
                                assingRightsManager.getAssignedPaymentChannels( connection_ikon_cms, function( err, AssignPaymentChannels  ) {
                                    callback( err, AssignPaymentChannels );
                                });
                            },
                            AssignContentTypes: function (callback) {
                                assingRightsManager.getAssignedContentTypes( connection_ikon_cms, function( err, AssignContentTypes  ) {
                                    callback( err, AssignContentTypes );
                                });
                            },
                            AssignVendors: function (callback) {
                                assingRightsManager.getAssignedVendors( connection_ikon_cms, function( err, AssignVendors  ) {
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
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            } else {
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
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    assingRightsManager.getLastInsertedMultiSelectMetaDataGroupId( connection_ikon_cms, function( err, result ){
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                            SetGroupId(req.body.AddAssignRights[i].Type, Groupid);

                                            assingRightsManager.getLastInsertedMultiSelectMetaDataDetail(connection_ikon_cms, function (err, row) {
                                                if (err) {
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
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                        }
                                                        else {
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
                                                                                console.log(error);
                                                                                res.end("error");
                                                                            } else {
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
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
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
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
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
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}