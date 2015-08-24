 
var mysql = require('../config/db').pool;

exports.getcountrydata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Country","Country Distribution") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, Countrys) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_cms.query('select * from ( SELECT * FROM icn_country)cty left join (select * from catalogue_detail)cd on(cty.cty_id = cd.cd_id)', function (err, ManagedCountry) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var query = connection_ikon_cms.query('select * from ( SELECT * FROM icn_country WHERE isgroup =1)cty inner join(select * from multiselect_metadata_detail	)mlm on(mlm.cmd_group_id = cty.cty_id) inner join (select * from catalogue_detail)cd on(mlm.cmd_entity_detail = cd.cd_id)', function (err, ManagedGroupCountry) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            connection_ikon_cms.release();
                                            res.send({
                                                ManagedGroupCountry: ManagedGroupCountry,
                                                ManagedCountrys: ManagedCountry,
                                                CountryList: Countrys,
                                                RoleUser: req.session.UserRole
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

exports.submitcountry = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {

                    if (req.body.status == "NewGroup") {
                        var query = connection_ikon_cms.query('select * from icn_country where lower(cty_name) = ?', [req.body.group_name.toLowerCase()], function (err, row) {
                            if (err) {
                                connection_ikon_cms.release(); ;
                                res.status(500).json(err.message);
                            } else {
                                if (row.length > 0) {
                                    res.send({
                                        success: false,
                                        message: 'Group Name must be Unique.',
                                        ManagedGroupCountry: [],
                                        ManagedCountrys: [],
                                        CountryList: [],
                                        RoleUser: req.session.UserRole
                                    });
                                }
                                else {
                                    ChangedCountry();
                                }
                            }
                        });
                    }
                    else {
                        ChangedCountry();
                    }

                    function ChangedCountry() {
                        var storelength = req.body.ChangedCountry.length;
                        if (req.body.ChangedCountry.length > 0) {
                            changeloop(0);
                            function changeloop(cnt) {
                                var i = cnt;
                                var query = connection_ikon_cms.query('select max(cnt_id) as id from icn_country', function (err, row) {
                                    if (err) {
                                        connection_ikon_cms.release(); ;
                                        res.status(500).json(err.message);
                                    } else {
                                        var country = {
                                            cty_name: req.body.ChangedCountry[i].icn_ct_name,
                                            cnt_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                            isgroup: 0,
                                            cty_created_on: new Date(),
                                            cty_modified_on: new Date(),
                                            cty_created_by: req.session.UserName,
                                            cty_modified_by: req.session.UserName,
                                            cty_id: req.body.ChangedCountry[i].icn_ct_id
                                        }
                                        var query = connection_ikon_cms.query('INSERT INTO icn_country SET ?', country, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                cnt = cnt + 1;
                                                if (cnt == storelength) {
                                                    AddUpdateGroupCountry();
                                                } else {
                                                    changeloop(cnt);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            AddUpdateGroupCountry();
                        }
                    }
                    function AddUpdateGroupCountry() {
                        if (req.body.status == "NewGroup") {
                            var storelength = req.body.AddCountryForGroup.length;
                            if (req.body.AddCountryForGroup.length > 0) {
                                var query = connection_ikon_cms.query('select max(cmd_group_id) as id from multiselect_metadata_detail', function (err, result) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        Groupid = result[0].id != null ? parseInt(result[0].id + 1) : 1
                                        addloop(0);
                                        function addloop(cnt) {
                                            var i = cnt;
                                            var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                                if (err) {
                                                    connection_ikon_cms.release(); ;
                                                    res.status(500).json(err.message);
                                                } else {
                                                    var metadata = {
                                                        cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                        cmd_group_id: Groupid,
                                                        cmd_entity_type: req.body.AddCountryForGroup[i].cmd_entity_type,
                                                        cmd_entity_detail: req.body.AddCountryForGroup[i].cmd_entity_detail
                                                    }
                                                    var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                        if (err) {
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                        }
                                                        else {
                                                            cnt = cnt + 1;
                                                            if (cnt == storelength) {
                                                                var query = connection_ikon_cms.query('select max(cnt_id) as id from icn_country', function (err, row) {
                                                                    if (err) {
                                                                        connection_ikon_cms.release(); ;
                                                                        res.status(500).json(err.message);
                                                                    } else {
                                                                        var country = {
                                                                            cty_name: req.body.group_name,
                                                                            cnt_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                                            isgroup: 1,
                                                                            cty_created_on: new Date(),
                                                                            cty_modified_on: new Date(),
                                                                            cty_created_by: req.session.UserName,
                                                                            cty_modified_by: req.session.UserName,
                                                                            cty_id: Groupid
                                                                        }
                                                                        var query = connection_ikon_cms.query('INSERT INTO icn_country SET ?', country, function (err, result) {
                                                                            if (err) {
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                GetAllReturnData();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                addloop(cnt);
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
                                GetAllReturnData();
                            }
                        }
                        else if (req.body.status == "UpdateGroup") {
                            var storelength = req.body.AddCountryForGroup.length;
                            if (req.body.AddCountryForGroup.length > 0) {
                                updateloop(0);
                                function updateloop(cnt) {
                                    var i = cnt;
                                    var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                        if (err) {
                                            connection_ikon_cms.release(); ;
                                            res.status(500).json(err.message);
                                        } else {
                                            var metadata = {
                                                cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                cmd_group_id: req.body.AddCountryForGroup[i].cmd_group_id,
                                                cmd_entity_type: req.body.AddCountryForGroup[i].cmd_entity_type,
                                                cmd_entity_detail: req.body.AddCountryForGroup[i].cmd_entity_detail
                                            }
                                            var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    cnt = cnt + 1;
                                                    if (cnt == storelength) {
                                                        DeleteGroupCountry();
                                                    } else {
                                                        updateloop(cnt);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                DeleteGroupCountry();
                            }
                        }
                        else {
                            GetAllReturnData();
                        }
                    }
                    function DeleteGroupCountry() {
                        var storelength = req.body.DeleteCountryForGroup.length;
                        if (storelength > 0) {
                            var count = 0;
                            deleteloop(count);
                            function deleteloop(i) {
                                var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [req.body.DeleteCountryForGroup[i].cmd_group_id, req.body.DeleteCountryForGroup[i].cmd_entity_detail], function (err, row, fields) {
                                    if (err) {
                                        connection_ikon_cms.release(); ;
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        count++;
                                        if (count == storelength) {
                                            GetAllReturnData();
                                        }
                                        else {
                                            deleteloop(count);
                                        }
                                    }
                                });
                            };
                        }
                        else {
                            GetAllReturnData();
                        }
                    }
                    function GetAllReturnData() {
                        var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Country","Country Distribution") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, Countrys) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                var query = connection_ikon_cms.query('select * from ( SELECT * FROM icn_country)cty left join (select * from catalogue_detail)cd on(cty.cty_id = cd.cd_id)', function (err, ManagedCountry) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_cms.query('select * from ( SELECT * FROM icn_country WHERE isgroup =1)cty inner join(select * from multiselect_metadata_detail	)mlm on(mlm.cmd_group_id = cty.cty_id) inner join (select * from catalogue_detail)cd on(mlm.cmd_entity_detail = cd.cd_id)', function (err, ManagedGroupCountry) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                connection_ikon_cms.release();
                                                res.send({
                                                    success: true,
                                                    message: 'Country Data updated successfully.',
                                                    ManagedGroupCountry: ManagedGroupCountry,
                                                    ManagedCountrys: ManagedCountry,
                                                    CountryList: Countrys,
                                                    RoleUser: req.session.UserRole
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