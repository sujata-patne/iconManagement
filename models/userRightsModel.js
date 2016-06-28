
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

exports.getStores = function( dbConnection, callback ) {
    dbConnection.query('select * from icn_store',
        function (err, stores) {
            callback(err, stores );
        }
    );
}

/* User Rights Management function */
exports.getLastInsertedIdFromUserRoleMapping = function( dbConnection, callback ) {
    dbConnection.query('select max(id) as id from user_role_mapping',
        function ( err, result) {
            if(result.length > 0 && result[0].id != null)
                callback(err, result[0].id);
            else
                callback(err, 0);         
        }
    );
}
exports.getExistingMappingforUser = function( dbConnection,userId, callback ) {
    dbConnection.query(' select * from user_role_mapping where isnull(crud_isactive) and user_id='+  userId,
        function ( err, result) {
            callback(err, result);
        }
    );
}
exports.updateExistingMappingforUser = function( dbConnection, data, callback ) {
    console.log(data);
    if(data.icn_vendor_detail_id != null) {
        //var query = 'UPDATE user_role_mapping SET modified_by = "' + data.modified_by + '" , modified_at = "' + data.modified_at + '" , crud_isactive = ' + data.id + ' where user_id = ' + data.user_id + ' and role_master_id = ' + data.role_master_id + ' and icn_vendor_detail_id = ' + data.icn_vendor_detail_id;
        var query = 'UPDATE user_role_mapping SET modified_by = ? , ' +
            'modified_at = ? , ' +
            'crud_isactive = ? where ' +
            'user_id = ? and ' +
            'role_master_id = ? and ' +
            'icn_vendor_detail_id = ' + data.icn_vendor_detail_id;
    }else  {
        //var query = 'UPDATE user_role_mapping SET modified_by = "' + data.modified_by + '" , modified_at = "' + data.modified_at + '" , crud_isactive = '+ data.id+' where user_id = '+  data.user_id +' and role_master_id = '+  data.role_master_id +' and icn_store_id = '+  data.icn_store_id;
        var query = 'UPDATE user_role_mapping SET modified_by = ? , ' +
            'modified_at = ? , ' +
            'crud_isactive = ? where ' +
            'user_id = ? and ' +
            'role_master_id = ? and ' +
            'icn_store_id = '+  data.icn_store_id;
    }
    dbConnection.query(query, [data.modified_by, data.modified_at, data.id, data.user_id, data.role_master_id],function ( err, result) {
            callback(err, result);
        }
    );
}
exports.getExistingMapping = function( dbConnection,userId, callback ) {
    dbConnection.query('select * from user_role_mapping where user_id='+  userId,
        function ( err, result) {           
            callback(err, result);
        }
    );
}

exports.getExistingUserRoleMapping = function( dbConnection,userId, callback ) {
    var query = 'select * from user_role_mapping as ur ' +
    'join role_module_mapping as rm on ur.role_master_id = rm.role_master_id ' +
    'join module_master as m on m.id = rm.module_master_id where isnull(ur.crud_isactive) and ur.user_id ='+  userId;
    dbConnection.query(query, function ( err, result) {
                callback(err, result);
        }
    );
}

exports.isUserRoleExist= function(dbConnection, userRoleStore, callback) {
    if(userRoleStore.icn_vendor_detail_id != null) {
        var query = 'Select id as mappingid from user_role_mapping where user_id = '+  userRoleStore.user_id+' and role_master_id = ' +userRoleStore.role_master_id+' and icn_vendor_detail_id = '+userRoleStore.icn_vendor_detail_id + ' and isnull(crud_isactive) ';
    }else  {
        var query = 'Select id as mappingid from user_role_mapping where user_id = '+  userRoleStore.user_id+' and role_master_id = ' +userRoleStore.role_master_id+' and icn_store_id = '+userRoleStore.icn_store_id +' and isnull(crud_isactive) ';
    }
          //dbConnection.query('select id as mappingid from user_role_mapping where user_id = '+  userRoleStore.user_id+' and role_master_id = ' +userRoleStore.role_master_id+' and icn_store_id = '+userRoleStore.icn_store_id ,           /* +' and isnull(crud_isactive)'*/
    dbConnection.query(query, function ( err, result) {
        if (err){
            console.log(err)
        }else {
            if(result.length > 0)
                callback(err, result[0].mappingid);
            else
                callback(err, 0);
        }
    });
   /* else if(userRoleStore.icn_vendor_detail_id !=null)
    {
        //console.log('select  id as mappingid  from user_role_mapping where user_id='+  userRoleStore.user_id+' and role_master_id=' +userRoleStore.role_master_id +' and icn_vendor_detail_id='+userRoleStore.icn_vendor_detail_id);
        dbConnection.query('select  id as mappingid  from user_role_mapping where user_id='+  userRoleStore.user_id+' and role_master_id=' +userRoleStore.role_master_id +' and icn_vendor_detail_id='+userRoleStore.icn_vendor_detail_id +' and isnull(crud_isactive)',  /!*select id as mappingid from user_role_mapping where user_id= ? and role_master_id=?',[ userRole.user_id, userRole.role_master_id ]*!/
            function ( err, result) {
                if (err){
                    console.log(err)
                }else {

                    if(result.length > 0)
                        callback(err, result[0].mappingid);
                    else
                        callback(err, 0);
                }
            }
        );
    }*/

}

exports.updateUserRightMapping= function(dbConnection, userRightData, callback){
    dbConnection.query('UPDATE user_role_mapping SET crud_isactive = null  where id='+userRightData.id,
        function ( err, result) {
            callback( err, result );
        }
    );
}

exports.insertUserRightMapping= function(dbConnection, userRightData, callback){
    dbConnection.query('INSERT INTO user_role_mapping SET ?', userRightData,
        function ( err, result) {
            callback( err, result );
        }
    );
}

exports.getUserIds=function( dbConnection, data, callback ) {
    var orderBy = '';
    if(data.orderBy){
        var orderBy = 'ORDER BY '+data.orderBy;
    } 
    var query =  'select *, group_concat(distinct(s.st_id)) as stores from icn_login_detail as u '+
    'left join icn_store_user as su on u.ld_id = su.su_ld_id '+
    'left join icn_store as s on s.st_id = su.su_st_id ' +
    'where isnull(su.su_crud_isactive) '+
    'group by u.ld_id ' + orderBy ;
     dbConnection.query(query, function (err, userIds) {
        callback(err, userIds );
    });
}

exports.getVendors = function( dbConnection, callback ) {
    dbConnection.query('SELECT * FROM icn_vendor_detail',
        function ( err, vendors ) {
            callback( err, vendors );
        }
    );
}

exports.getModules = function( dbConnection, callback ) {
    dbConnection.query('SELECT * FROM module_master',
        function ( err, modules ) {
            callback( err, modules );
        }
    );
}

exports.getRoles = function( dbConnection, callback ) {
    dbConnection.query('SELECT * FROM role_master;',
        function ( err, roles ) {
            callback( err, roles );
        }
    );
}
exports.getRoleModuleMappings = function( dbConnection, callback ) {
    dbConnection.query('SELECT rmm.id,role_master_id,role_name, module_master_id, module_name, parent_id  FROM role_module_mapping rmm inner join module_master mm on rmm.module_master_id=mm.id inner join role_master rm on rmm.role_master_id=rm.id;',
        function ( err, roleModuleMappings ) {
            callback( err, roleModuleMappings );
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


