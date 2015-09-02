
var mysql = require('../config/db').pool;

exports.getstoredata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Channel Distribution") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, Channels) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (req.body.state == "edit-store") {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', [req.body.Id], function (err, StoreList) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_cms.query('select * from (select * from icn_store where st_id= ? )st inner join (select * from multiselect_metadata_detail ) mmd on (st.st_front_type=mmd.cmd_group_id) inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail) inner join(select * from catalogue_master where cm_name = "Channel Distribution")cm on(cm.cm_id = cd_cm_id and mmd.cmd_entity_type = cm.cm_id)', [req.body.Id], function (err, ChannelRights) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                connection_ikon_cms.release();
                                                res.send({
                                                    Channels: Channels,
                                                    StoreList: StoreList,
                                                    ChannelRights: ChannelRights,
                                                    RoleUser: req.session.UserRole
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', function (err, StoreList) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        connection_ikon_cms.release();
                                        res.send({
                                            Channels: Channels,
                                            StoreList: StoreList,
                                            ChannelRights: [],
                                            RoleUser: req.session.UserRole
                                        });
                                    }
                                });
                            }
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
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                                          var query = connection_ikon_cms.query('select * from icn_login_detail where lower(ld_user_name) = ?', [req.body.store_email.toLowerCase()], function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                        if (result.length > 0) {
                                                            if (result[0].ld_id == req.body.store_ld_id && req.body.state == "edit-store") {
                                                                  //Site url must be unique check :
                                                                  var query = connection_ikon_cms.query('select * from icn_store where lower(st_url) = ? AND st_id != ?', [req.body.store_site_url.toLowerCase(),req.body.store_id], function (err, result) {
                                                                  if(err){
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                    }
                                                                    if(result.length > 0){
                                                                        connection_ikon_cms.release();
                                                                        res.send({ success: false, message: 'Site Url Must be Unique' });
                                                                    }else{

                                                                            StoreCrud();
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                connection_ikon_cms.release();
                                                                res.send({ success: false, message: 'User Id Must be Unique' });
                                                            }
                                                        }
                                                        else {
                                                            //Site url must be unique :
                                                            var query = connection_ikon_cms.query('select * from icn_store where lower(st_url) = ?', [req.body.store_site_url.toLowerCase()], function (err, result) {
                                                                    if(err){
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                    }
                                                                    if(result.length > 0){
                                                                        connection_ikon_cms.release();
                                                                        res.send({ success: false, message: 'Site Url Must be Unique' });
                                                                    }else{
                                                                        //If all checks done ..
                                                                         StoreCrud();
                                                                    }
                                                            });
                                                        }
                                            }//else
                                        
                                    // }
                    });

                  
                    function StoreCrud() {
                        var query = connection_ikon_cms.query('select * from icn_store where lower(st_name) = ?', [req.body.store_name.toLowerCase()], function (err, result) {
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
                                    }
                                    else {
                                        AddStoreChannels();
                                    }
                                }
                                function EditStore() {
                                    var query = connection_ikon_cms.query('UPDATE icn_store SET st_name=?,st_url=?,st_modified_on=?,st_modified_by=? WHERE st_id = ?', [req.body.store_name, req.body.store_site_url, new Date(), req.session.UserName, req.body.store_id], function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            var query = connection_ikon_cms.query('UPDATE icn_login_detail SET ld_user_id=?,ld_user_name=?,ld_email_id=?,ld_display_name=?,ld_mobile_no=?,ld_modified_on=?,ld_modified_by =? WHERE ld_id = ?', [req.body.store_email, req.body.store_email, req.body.store_email, req.body.store_contact_person, req.body.store_user_no, new Date(), req.session.UserName, req.body.store_ld_id], function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                } else {
                                                    var storelength = req.body.AddStoreChannels.length;
                                                    if (req.body.AddStoreChannels.length > 0) {
                                                        loop(0);
                                                        function loop(cnt) {
                                                            var i = cnt;
                                                            var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                                                if (err) {
                                                                    connection_ikon_cms.release(); ;
                                                                    res.status(500).json(err.message);
                                                                } else {
                                                                    var metadata = {
                                                                        cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                                        cmd_group_id: req.body.store_front_type,
                                                                        cmd_entity_type: req.body.store_cmd_entity_type,
                                                                        cmd_entity_detail: req.body.AddStoreChannels[i]
                                                                    }
                                                                    var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
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
                                        var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [req.body.store_front_type, req.body.DeleteStoreChannels[count]], function (err, row, fields) {
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
                                        var query = connection_ikon_cms.query('select max(cmd_group_id) as id from multiselect_metadata_detail', function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                Groupid = result[0].id != null ? parseInt(result[0].id + 1) : 1
                                                loop(0);
                                                function loop(cnt) {
                                                    var i = cnt;
                                                    var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                                        if (err) {
                                                            connection_ikon_cms.release(); ;
                                                            res.status(500).json(err.message);
                                                        } else {
                                                            var metadata = {
                                                                cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                                cmd_group_id: Groupid,
                                                                cmd_entity_type: req.body.store_cmd_entity_type,
                                                                cmd_entity_detail: req.body.AddStoreChannels[i]
                                                            }
                                                            var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                                if (err) {
                                                                    connection_ikon_cms.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    cnt = cnt + 1;
                                                                    if (cnt == storelength) {
                                                                        // add store
                                                                        var query = connection_ikon_cms.query('select max(st_id) as id from icn_store', function (err, result) {
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
                                                                                    st_created_by: req.session.UserName,
                                                                                    st_modified_by: req.session.UserName
                                                                                }
                                                                                var query = connection_ikon_cms.query('INSERT INTO icn_store SET ?', store, function (err, result) {
                                                                                    if (err) {
                                                                                        console.log(err.message, 1)
                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    } else {
                                                                                        // add store user
                                                                                        var query = connection_ikon_cms.query('select max(ld_id) as id from icn_login_detail', function (err, result) {
                                                                                            if (err) {
                                                                                                connection_ikon_cms.release();
                                                                                                res.status(500).json(err.message);
                                                                                            } else {
                                                                                                var ld_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                                                                                var storeuser = {
                                                                                                    ld_id: ld_id,
                                                                                                    ld_vd_id: 1,
                                                                                                    ld_active: 1,
                                                                                                    ld_user_id: req.body.store_email,
                                                                                                    ld_user_pwd: 'icon',
                                                                                                    ld_user_name: req.body.store_email,
                                                                                                    ld_display_name: req.body.store_contact_person,
                                                                                                    ld_email_id: req.body.store_email,
                                                                                                    ld_mobile_no: req.body.store_user_no,
                                                                                                    ld_role: "Store Manager",
                                                                                                    ld_user_type: 'Store User',
                                                                                                    ld_last_login: new Date(),
                                                                                                    ld_created_on: new Date(),
                                                                                                    ld_created_by: req.session.UserName,
                                                                                                    ld_modified_on: new Date(),
                                                                                                    ld_modified_by: req.session.UserName
                                                                                                };
                                                                                                var query = connection_ikon_cms.query('INSERT INTO icn_login_detail SET ?', storeuser, function (err, result) {
                                                                                                    if (err) {
                                                                                                        console.log(err.message, 2)
                                                                                                        connection_ikon_cms.release();
                                                                                                        res.status(500).json(err.message);
                                                                                                    } else {
                                                                                                        var storeusermapping = {
                                                                                                            su_st_id: store_id,
                                                                                                            su_ld_id: ld_id,
                                                                                                            su_created_on: new Date(),
                                                                                                            su_created_by: req.session.UserName,
                                                                                                            su_modified_on: new Date(),
                                                                                                            su_modified_by: req.session.UserName
                                                                                                        };
                                                                                                        var query = connection_ikon_cms.query('INSERT INTO icn_store_user SET ?', storeusermapping, function (err, result) {
                                                                                                            if (err) {
                                                                                                                console.log(err.message, 3)
                                                                                                                connection_ikon_cms.release();
                                                                                                                res.status(500).json(err.message);
                                                                                                            } else {
                                                                                                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', [store_id], function (err, StoreList) {
                                                                                                                    if (err) {
                                                                                                                        connection_ikon_cms.release();
                                                                                                                        res.status(500).json(err.message);
                                                                                                                    } else {
                                                                                                                        connection_ikon_cms.release();
                                                                                                                        res.send({
                                                                                                                            StoreList: StoreList,
                                                                                                                            success: true,
                                                                                                                            message: 'Store added successfully.'
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
                                        var query = connection_ikon_cms.query('select max(st_id) as id from icn_store', function (err, result) {
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
                                                    st_created_by: req.session.UserName,
                                                    st_modified_by: req.session.UserName
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO icn_store SET ?', store, function (err, result) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    } else {
                                                        // add store user
                                                        var query = connection_ikon_cms.query('select max(ld_id) as id from icn_login_detail', function (err, result) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            } else {
                                                                var ld_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                                                var storeuser = {
                                                                    ld_id: ld_id,
                                                                    ld_vd_id: 1,
                                                                    ld_active: 1,
                                                                    ld_user_id: req.body.store_email,
                                                                    ld_user_pwd: 'icon',
                                                                    ld_user_name: req.body.store_email,
                                                                    ld_display_name: req.body.store_contact_person,
                                                                    ld_email_id: req.body.store_email,
                                                                    ld_mobile_no: req.body.store_user_no,
                                                                    ld_role: "Store Manager",
                                                                    ld_user_type: 'Store User',
                                                                    ld_last_login: new Date(),
                                                                    ld_created_on: new Date(),
                                                                    ld_created_by: req.session.UserName,
                                                                    ld_modified_on: new Date(),
                                                                    ld_modified_by: req.session.UserName
                                                                };
                                                                var query = connection_ikon_cms.query('INSERT INTO icn_login_detail SET ?', storeuser, function (err, result) {
                                                                    if (err) {
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {
                                                                        var storeusermapping = {
                                                                            su_st_id: store_id,
                                                                            su_ld_id: ld_id,
                                                                            su_created_on: new Date(),
                                                                            su_created_by: req.session.UserName,
                                                                            su_modified_on: new Date(),
                                                                            su_modified_by: req.session.UserName
                                                                        };
                                                                        var query = connection_ikon_cms.query('INSERT INTO icn_store_user SET ?', storeusermapping, function (err, result) {
                                                                            if (err) {
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            } else {
                                                                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', [storeId], function (err, StoreList) {
                                                                                    if (err) {
                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    } else {
                                                                                        connection_ikon_cms.release();
                                                                                        res.send({
                                                                                            StoreList: StoreList,
                                                                                            success: true,
                                                                                            message: 'Store added successfully.'
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