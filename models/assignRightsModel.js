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

exports.getIconCountryGroup = function( dbConnection, callback ) {
    /*dbConnection.query('select * from catalogue_master as cm '+
        'left join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id '+
        'where cm.cm_name in("country_group")  ',*/
    //dbConnection.query('select cm_id,cm_name,cd_id,cd_name from (select cd_name as group_name from catalogue_master as a , catalogue_detail as b where a.cm_name in("country_group") and a.cm_id = b.cd_cm_id )cm inner join(select cm_id,cm_name,cd_id  as icn_country_id,cd_name from catalogue_master as a,catalogue_detail as b where a.cm_id = b.cd_cm_id)cd on(cm.group_name = cd.cm_name) inner join(select cd_id,cd_name as country_name from catalogue_master as a , catalogue_detail as b where a.cm_name in("global_country_list") and a.cm_id = b.cd_cm_id)globalcountry on(cd.cd_name = globalcountry.country_name)',
    //var query = dbConnection.query('select cm_id,cm_name,cd_id,cd_name from (select cd_name as group_name from catalogue_master as a , catalogue_detail as b where a.cm_name in("country_group") and a.cm_id = b.cd_cm_id )cm  inner join(select cm_id,cm_name,cd_id as icn_country_id,cd_name from catalogue_master as a,catalogue_detail as b where a.cm_id = b.cd_cm_id)cd on(cm.group_name = cd.cm_name) left join (select icc_country_name as country_name, icc_country_id as cd_id from icn_country_currency) AS g_cd on(g_cd.country_name =cd.cd_name)',
    dbConnection.query('select cm_group.cm_id,cm_group.cm_name, g_cd.cd_id, cd_group.cd_name ' +
            'from catalogue_detail as cd ' +
            'inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) ' +
            'inner join catalogue_master as cm_group on(cm_group.cm_name = cd.cd_name) ' +
            'inner join catalogue_detail as cd_group on(cd_group.cd_cm_id = cm_group.cm_id)' +
            'left join (select icc_country_name as country_name, icc_country_id as cd_id from icn_country_currency) AS g_cd on(g_cd.country_name =cd_group.cd_name) ' +
            'where cm.cm_name in("country_group") ',
        function (err, IconGroupCountry) {
            callback(err, IconGroupCountry );
        }
    );
}
exports.getIconCountry = function( dbConnection, callback ) {
    dbConnection.query('select DISTINCT cd_id,cd_name from '+
        '(select CASE  WHEN groupid is null THEN icn_cnt_name ELSE country_name  END AS country_name, '+
        'CASE  WHEN groupid is null THEN icn_cnt ELSE countryid  END AS country_id, '+
        'groupid  from  (SELECT cd_id as icn_cnt,cd_name as icn_cnt_name ,cd_cm_id as icn_cd_cm_id FROM catalogue_detail)cd '+
        'inner join(select cm_id as icn_cm_id,cm_name as icn_cm_name from catalogue_master where cm_name in("icon_geo_location") )cm on(cm.icn_cm_id = cd.icn_cd_cm_id) '+
        'left outer join (select cm_id as groupid,cm_name as groupname from catalogue_master )master on(master.groupname = cd.icn_cnt_name) '+
        'left outer join (select cd_id as countryid,cd_name as country_name,cd_cm_id as m_groupid from catalogue_detail)mastercnt on(master.groupid =mastercnt.m_groupid))country '+
        'inner join(select icc_country_name as cd_name, icc_country_id as cd_id from icn_country_currency) AS g_cd on(g_cd.cd_name = country.country_name) '+
        'join multiselect_metadata_detail AS m ON cd_id = m.cmd_entity_detail '+
        'LEFT JOIN `icn_store` AS s ON m.cmd_group_id = s.st_country_distribution_rights ',
        function (err, IconCountry) {
            callback(err, IconCountry );
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
    dbConnection.query('select case when groupname is null then icc_country_name ELSE cd.cd_name END AS cd_name, '+
            'case when groupname is null then icc_country_id ELSE cd.cd_id END AS cd_id, '+
            'case when groupname is null  then  null ELSE "group"  END AS group_status '+
            'from catalogue_master as cm '+
            'right join catalogue_detail as cd ON cm.cm_id = cd.cd_cm_id '+
            'left join icn_country_currency AS g_cd on(g_cd.icc_country_name =cd.cd_name) '+
            'left join (select cm_name as groupname from catalogue_master)cm_group on(cm_group.groupname =  cd.cd_name) '+
            'WHERE cm.cm_name in("icon_geo_location") ',
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
    dbConnection.query('select * from icn_store as s ' +
        'left join icn_store_user as su on s.st_id = su.su_st_id ' +
        'left join icn_login_detail as u on u.ld_id = su.su_ld_id ' +
        'group by s.st_id',
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
    var query = 'UPDATE icn_store ' +
        'SET ' +
        'st_modified_on=?,' +
        'st_modified_by=? ' +
        'WHERE ' +
        'st_id = ?';
     dbConnection.query(query, [ updateQuery.st_modified_on, updateQuery.st_modified_by, storeId ],
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


