 
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
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join(select * from icn_login_detail)ld on(st.st_ld_id  = ld.ld_id)', [req.body.Id], function (err, StoreList) {
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
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store )st inner join(select * from icn_login_detail)ld on(st.st_ld_id  = ld.ld_id)', function (err, StoreList) {
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
                    var query = connection_ikon_cms.query('select * from icn_store where lower(st_name) = ?', [req.body.store_name.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].st_id == req.body.storeId && req.body.state == "edit-store") {
                                    if (req.body.DeleteStore.length > 0) {
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
                                    if (req.body.DeleteStore.length > 0) {
                                        DeleteChannelsforStore();
                                    }
                                    else {
                                        EditStore();
                                    }
                                }
                                else {
                                    AddStore();
                                }
                            }
                            function EditStore() {
                                var query = connection_ikon_cms.query('UPDATE icn_store SET st_name=?,st_url=?,st_modified_on=?,st_modified_by=? WHERE st_id = ?', [req.body.store_name, req.body.td_site_url, new Date(), req.session.UserName, req.body.storeId], function (err, result) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var storelength = req.body.AddStore.length;
                                        if (req.body.AddStore.length > 0) {
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
                                                            cmd_entity_detail: req.body.AddStore[i]
                                                        }
                                                        var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                cnt = cnt + 1;
                                                                if (cnt == storelength) {
                                                                    var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join(select * from icn_login_detail)ld on(st.st_ld_id  = ld.ld_id)', [req.body.storeId], function (err, StoreList) {
                                                                        if (err) {
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        } else {
                                                                            connection_ikon_cms.release();
                                                                            res.send({
                                                                                StoreList: StoreList,
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

                            function DeleteChannelsforStore() {
                                var storelength = req.body.DeleteStore.length;
                                var count = 0;
                                deleteloop(count);
                                function deleteloop(count) {
                                    var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [req.body.store_front_type, req.body.DeleteStore[count]], function (err, row, fields) {
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

                            function AddStore() {
                                var Groupid = 0;
                                var storelength = req.body.AddStore.length;
                                if (req.body.AddStore.length > 0) {
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
                                                            cmd_entity_detail: req.body.AddStore[i]
                                                        }
                                                        var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                cnt = cnt + 1;
                                                                if (cnt == storelength) {
                                                                    var query = connection_ikon_cms.query('select max(st_id) as id from icn_store', function (err, result) {
                                                                        if (err) {
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        } else {
                                                                            var storeId = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                                                            var data = {
                                                                                st_id: storeId,
                                                                                st_name: req.body.store_name,
                                                                                st_url: req.body.td_site_url,
                                                                                st_ld_id: req.session.UserId,
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
                                                                            var query = connection_ikon_cms.query('INSERT INTO icn_store SET ?', data, function (err, result) {
                                                                                if (err) {
                                                                                    connection_ikon_cms.release();
                                                                                    res.status(500).json(err.message);
                                                                                } else {
                                                                                    var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join(select * from icn_login_detail)ld on(st.st_ld_id  = ld.ld_id)', [storeId], function (err, StoreList) {
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
                                            var storeId = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                            var data = {
                                                st_id: storeId,
                                                st_name: req.body.store_name,
                                                st_url: req.body.td_site_url,
                                                st_ld_id: req.session.UserId,
                                                st_country_distribution_rights: null,
                                                st_front_type: null,
                                                st_payment_type: null,
                                                st_payment_channel: null,
                                                st_vendor: null,
                                                st_content_type: null,
                                                st_created_on: new Date(),
                                                st_modified_on: new Date(),
                                                st_created_by: req.session.UserName,
                                                st_modified_by: req.session.UserName
                                            }
                                            var query = connection_ikon_cms.query('INSERT INTO icn_store SET ?', data, function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                } else {
                                                    //return data query for store page
                                                    var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store where st_id = ?)st inner join(select * from icn_login_detail)ld on(st.st_ld_id  = ld.ld_id)', [storeId], function (err, StoreList) {
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