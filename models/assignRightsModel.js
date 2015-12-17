exports.getMasterList = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd '+
                        'inner join(select * from catalogue_master where cm_name in("Store") )cm on(cm.cm_id = cd.cd_cm_id)',
            function (err, masterList) {
                callback( err, masterList );
            }
    );
}

exports.getPaymentTypes = function( dbConnection, callback ) {
    dbConnection.query('SELECT * FROM billing_enum_data WHERE en_type in ("payment_type")',
        function ( err, paymentTypes ) {
            callback( err, paymentTypes );
        }
    );
}

exports.getpartnerDistibutionChannels = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM billing_partner)bp '+
            'inner join(select * from billing_entity_group)beg on(beg.eg_group_id =bp.partner_store_fronts) '+
            'inner join(select * from billing_enum_data)enum on(enum.en_id =beg.eg_enum_id)',
            function (err, partnerDistibutionChannels ) {
                callback(err, partnerDistibutionChannels);
            }
    );
}

exports.getContentTypes = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd '+
        'inner join(select * from catalogue_master where cm_name in("Content Type") )cm on(cm.cm_id = cd.cd_cm_id) '+
        'inner join (select * from icn_manage_content_type)mc on (  mc.mct_parent_cnt_type_id = cd.cd_id) '+
        'inner join (SELECT cd_id as contentid,cd_name as contentname FROM catalogue_detail)content on(mc.mct_cnt_type_id = content.contentid)',
        function (err, contentTypes) {
            callback(err, contentTypes);
        }
    );
}

exports.getVendorCountry = function( dbConnection, callback ) {
    dbConnection.query('SELECT distinct vd_id,vd_name,r_country_distribution_rights FROM'+
                       '(select * from icn_vendor_detail)vd '+
                       'inner join (SELECT * FROM vendor_profile)vp on(vp.vp_vendor_id = vd.vd_id) '+
                       'inner join (select * from multiselect_metadata_detail)mlm on(vp.vp_r_group_id = mlm.cmd_group_id) '+
                       'inner join(select * from rights)r on(r.r_group_id = mlm.cmd_entity_detail)',
        function (err, vendorCountry) {
            callback(err, vendorCountry );
        }
    );
}

exports.getCountries = function( dbConnection, callback ) {
    dbConnection.query('select distinct cd_id,cd_name from '+
                        '(select CASE  WHEN groupid is null THEN icn_cnt_name ELSE country_name  END AS country_name, ' +
                        'CASE  WHEN groupid is null THEN icn_cnt ELSE countryid  END AS country_id,groupid from '+
                        '(SELECT cd_id as icn_cnt,cd_name as icn_cnt_name ,cd_cm_id as icn_cd_cm_id FROM catalogue_detail)cd '+
                        'inner join(select cm_id as icn_cm_id,cm_name as icn_cm_name from catalogue_master '+
                        'where cm_name in("icon_geo_location") )cm on(cm.icn_cm_id = cd.icn_cd_cm_id) '+
                        'left outer join (select cm_id as groupid,cm_name as groupname from catalogue_master )master on(master.groupname = cd.icn_cnt_name) ' +
                        'left outer join (select cd_id as countryid,cd_name as country_name,cd_cm_id as m_groupid from catalogue_detail)mastercnt on(master.groupid =mastercnt.m_groupid))country ' +
                        'inner join (select cd_id ,cd_name ,cd_cm_id,cm_id,cm_name  from catalogue_detail,catalogue_master where cm_id =cd_cm_id and cm_name in("global_country_list"))g_cd on(g_cd.cd_name =country.country_name)',
        function ( err, countries ) {
            callback( err, countries );
        }
    );
}

exports.getStores = function( dbConnection, callback ) {
    dbConnection.query('select * from icn_store',
        function (err, stores) {
            callback(err, stores );
        }
    );
}

exports.getStoresUserDetails = function( dbConnection, callback ) {
    dbConnection.query('select u.*,su.* from icn_store as s ' +
            'inner join icn_store_user as su on s.st_id = su.su_st_id ' +
            'inner join icn_login_detail as u on u.ld_id = su.su_ld_id ',
        function (err, storeUsers) {
            callback(err, storeUsers );
        }
    );
}

exports.getStoreChannels = function( dbConnection, callback ) {
    dbConnection.query('select * from (select * from icn_store)st '+
                        'inner join (select * from multiselect_metadata_detail ) mmd on (st.st_front_type=mmd.cmd_group_id) ' +
                        'inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail) ' +
                        'inner join(select * from catalogue_master where cm_name = "Channel Distribution")cm on(cm.cm_id = cd_cm_id and mmd.cmd_entity_type = cm.cm_id)',
        function (err, StoreChannels) {
            callback(err, StoreChannels);
        }
    );
}

exports.getAssignedCountries = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_store)st ' +
                        'inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_country_distribution_rights)',
        function ( err, assignCountries ) {
            callback(err, assignCountries );
        }
    );
}

exports.getAssignedPaymentTypes = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_store)st ' +
                        'inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_payment_type)',
        function (err, assingedCountries ) {
            callback(err, assingedCountries );
        }
    );
}

exports.getAssignedPaymentChannels = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_store)st ' +
                        'inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_payment_channel)',
        function ( err, assignedPaymentChannels ) {
            callback( err, assignedPaymentChannels );
        }
    );
}

exports.getAssignedContentTypes = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_store)st ' +
                        'inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_content_type)',
        function (err, assignedContentTypes ) {
            callback( err, assignedContentTypes );
        }
    );
}

exports.getAssignedVendors = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_store)st ' +
                        'inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_vendor)',
        function (err, assignedVendors ) {
            callback(err, assignedVendors );
        }
    );
}

exports.getLastInsertedMultiSelectMetaDataDetail = function( dbConnection, callback ) {
    dbConnection.query('select max(cmd_id) as id from multiselect_metadata_detail',
        function (err, multiSelectMetadataRow ) {
            callback(err, multiSelectMetadataRow );
        }
    );
}

exports.getLastInsertedMultiSelectMetaDataGroupId = function( dbConnection, callback ) {
    dbConnection.query('select max(cmd_group_id) as id from multiselect_metadata_detail',
        function (err, result) {
            callback( err, result );
        }
    );
}

exports.createMultiSelectMetaDataDetail = function( dbConnection, multiSelecMetaDataInfo, callback ) {
    dbConnection.query('INSERT INTO multiselect_metadata_detail SET ?', multiSelecMetaDataInfo,
        function (err, result) {
            callback( err, result )
        }
    );
}

exports.updateIcnStore = function( dbConnection, updateQueryData, storeId, callback ) {
    dbConnection.query('UPDATE icn_store ' +
                        'SET ' +
                            'st_country_distribution_rights =?,' +
                            'st_payment_type=?,' +
                            'st_payment_channel=?,' +
                            'st_vendor=?,' +
                            'st_content_type=?, ' +
                            'st_modified_on=?,' +
                            'st_modified_by=? ' +
                        'WHERE st_id = ?',
                [ updateQueryData.country_group_id,
                  updateQueryData.payment_type_group_id,
                  updateQueryData.payment_channel_group_id,
                  updateQueryData.vendor_group_id,
                  updateQueryData.content_type_group_id,
                  updateQueryData.st_modified_on,
                  updateQueryData.st_modified_by,
                  storeId
                ],
        function (err, result) {
            callback( err, result );
        }
    );
}

exports.updateIcnStoreByStoreUser = function( dbConnection, updateQuery, storeId, callback ) {
    dbConnection.query('UPDATE icn_store ' +
                        'SET ' +
                            'st_modified_on=?,' +
                            'st_modified_by=? ' +
                        'WHERE ' +
                            'st_id = ?', [ updateQuery.st_modified_on, updateQuery.st_modified_by, storeId ],
        function (err, result) {
            callback( err, result );
        }
    );
}

exports.deleteMultiSelectMetaDataDetail = function( dbConnection, cmd_group_id, cmd_entity_detail, callback ){
    dbConnection.query('DELETE FROM multiselect_metadata_detail ' +
                        'WHERE cmd_group_id= ? and  cmd_entity_detail =?', [cmd_group_id, cmd_entity_detail],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}


