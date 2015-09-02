
var mysql = require('../config/db').pool;

exports.getassignrights = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Payment Channel","Payment Type","Country","Store","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, MasterList) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Content Type") )cm on(cm.cm_id = cd.cd_cm_id) inner join (select * from icn_manage_content_type)mc on (  mc.mct_parent_cnt_type_id = cd.cd_id) inner join (SELECT cd_id as contentid,cd_name as contentname FROM catalogue_detail)content on(mc.mct_cnt_type_id = content.contentid)', function (err, ContentTypes) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var query = connection_ikon_cms.query('select distinct cd_id,cd_name from (select CASE  WHEN groupid is null THEN icn_cnt_name ELSE country_name  END AS country_name, CASE  WHEN groupid is null THEN icn_cnt ELSE countryid  END AS country_id,groupid from (SELECT cd_id as icn_cnt,cd_name as icn_cnt_name ,cd_cm_id as icn_cd_cm_id FROM catalogue_detail)cd inner join(select cm_id as icn_cm_id,cm_name as icn_cm_name from catalogue_master where cm_name in("icon_geo_location") )cm on(cm.icn_cm_id = cd.icn_cd_cm_id) left outer join (select cm_id as groupid,cm_name as groupname from catalogue_master )master on(master.groupname = cd.icn_cnt_name) left outer join (select cd_id as countryid,cd_name as country_name,cd_cm_id as m_groupid from catalogue_detail)mastercnt on(master.groupid =mastercnt.m_groupid))country inner join (select cd_id ,cd_name ,cd_cm_id,cm_id,cm_name  from catalogue_detail,catalogue_master where cm_id =cd_cm_id and cm_name in("global_country_list"))g_cd on(g_cd.cd_name =country.country_name)', function (err, Countrys) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {

                                            var query = connection_ikon_cms.query('select * from icn_vendor_detail', function (err, VendorList) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    var query = connection_ikon_cms.query('select * from icn_store', function (err, Stores) {
                                                        if (err) {
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                        }
                                                        else {
                                                            var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_country_distribution_rights)', function (err, AssignCountrys) {
                                                                if (err) {
                                                                    connection_ikon_cms.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_payment_type)', function (err, AssignPaymentTypes) {
                                                                        if (err) {
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        }
                                                                        else {
                                                                            var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_payment_channel)', function (err, AssignPaymentChannels) {
                                                                                if (err) {
                                                                                    connection_ikon_cms.release();
                                                                                    res.status(500).json(err.message);
                                                                                }
                                                                                else {
                                                                                    var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_vendor)', function (err, AssignVendors) {
                                                                                        if (err) {
                                                                                            connection_ikon_cms.release();
                                                                                            res.status(500).json(err.message);
                                                                                        }
                                                                                        else {
                                                                                            var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_content_type)', function (err, AssignContentTypes) {
                                                                                                if (err) {
                                                                                                    connection_ikon_cms.release();
                                                                                                    res.status(500).json(err.message);
                                                                                                }
                                                                                                else {
                                                                                                    connection_ikon_cms.release();
                                                                                                    res.send({
                                                                                                        MasterList: MasterList,
                                                                                                        VendorList: VendorList,
                                                                                                        Countrys: Countrys,
                                                                                                        Stores: Stores,
                                                                                                        ContentTypes: ContentTypes,
                                                                                                        AssignCountrys: AssignCountrys,
                                                                                                        AssignPaymentTypes: AssignPaymentTypes,
                                                                                                        AssignPaymentChannels: AssignPaymentChannels,
                                                                                                        AssignContentTypes: AssignContentTypes,
                                                                                                        AssignVendors: AssignVendors,
                                                                                                        UserRole: req.session.UserRole
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
                                    });

                                }
                            });
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

exports.updateassignright = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
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
                                    var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                        if (err) {
                                            connection_ikon_cms.release(); ;
                                            res.status(500).json(err.message);
                                        } else {
                                            var metadata = {
                                                cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                cmd_group_id: groupid,
                                                cmd_entity_type: req.body.store_content_type,
                                                cmd_entity_detail: req.body.AddAssignRights[i].cmd_entity_detail
                                            }
                                            var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    cnt = cnt + 1;
                                                    if (cnt == storelength) {
                                                        var query = connection_ikon_cms.query('UPDATE icn_store SET st_country_distribution_rights =?,st_payment_type=?,st_payment_channel=?,st_vendor=?,st_content_type=?, st_modified_on=?,st_modified_by=? WHERE st_id = ?', [country_group_id, payment_type_group_id, payment_channel_group_id, vendor_group_id, content_type_group_id, new Date(), req.session.UserName, req.body.storeId], function (err, result) {
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
                                    var query = connection_ikon_cms.query('select max(cmd_group_id) as id from multiselect_metadata_detail', function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            Groupid = result[0].id != null ? parseInt(result[0].id + 1) : 1
                                            SetGroupId(req.body.AddAssignRights[i].Type, Groupid);

                                            var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                                if (err) {
                                                    connection_ikon_cms.release(); ;
                                                    res.status(500).json(err.message);
                                                } else {
                                                    var metadata = {
                                                        cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                        cmd_group_id: Groupid,
                                                        cmd_entity_type: req.body.store_content_type,
                                                        cmd_entity_detail: req.body.AddAssignRights[i].cmd_entity_detail
                                                    }
                                                    var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                        if (err) {
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                        }
                                                        else {
                                                            cnt = cnt + 1;
                                                            if (cnt == storelength) {
                                                                var query = connection_ikon_cms.query('UPDATE icn_store SET st_country_distribution_rights =?,st_payment_type=?,st_payment_channel=?,st_vendor=?,st_content_type=?, st_modified_on=?,st_modified_by=? WHERE st_id = ?', [country_group_id, payment_type_group_id, payment_channel_group_id, vendor_group_id, content_type_group_id, new Date(), req.session.UserName, req.body.storeId], function (err, result) {
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
                                    });
                                }
                            }
                        }
                        else {
                            var query = connection_ikon_cms.query('UPDATE icn_store SET st_modified_on=?,st_modified_by=? WHERE st_id = ?', [new Date(), req.session.UserName, req.body.storeId], function (err, result) {
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
                            var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [req.body.DeleteAssignRights[count].cmd_group_id, req.body.DeleteAssignRights[count].cmd_entity_detail], function (err, row, fields) {
                                if (err) {
                                    connection_ikon_cms.release(); ;
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