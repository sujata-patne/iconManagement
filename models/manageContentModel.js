/**
 * Created by darhamid on 27/10/15.
 */
exports.getContentMasterList = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
                        'inner join(select * from catalogue_master ' +
                        'where cm_name in("Content Type","Delivery Type") )cm on(cm.cm_id = cd.cd_cm_id)',
        function (err, contentMasterList) {
            callback( err, contentMasterList );
        }
    );
}

exports.getContentList = function( dbConnection, state, contentId, callback ) {
    var storeQuery = state == "edit-content" ? "where mct_id = " + contentId : "";
    dbConnection.query('select * from (SELECT * FROM icn_manage_content_type ' + storeQuery + ')cnt ' +
                        'inner join (select cd_id as parentid,cd_name as parentname from catalogue_detail)parent on(parent.parentid  = cnt.mct_parent_cnt_type_id) ' +
                        'inner join (select cd_id as contentid,cd_name as contentname from catalogue_detail)cd on(cd.contentid  = cnt.mct_cnt_type_id)',
        function (err, contentList ) {
            callback( err, contentList );
        }
    );
}

exports.getContentRights = function( dbConnection, contentId, callback ) {
    dbConnection.query('select * from (select * from icn_manage_content_type where mct_id = ? )cnt ' +
                        'inner join (select * from multiselect_metadata_detail ) mmd on (cnt.mct_delivery_type_id=mmd.cmd_group_id) ' +
                        'inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail)', [contentId],
        function (err, contentRights) {
            callback(err, contentRights);
        }
    );
}

exports.getContentTypeByNameByParentContentId = function( dbConnection, parentContentType, contentName, callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_manage_content_type where  mct_parent_cnt_type_id = ?)cnt ' +
        'inner join (select cd_id as contentid,cd_name as contentname from catalogue_detail)cd on(cd.contentid  = cnt.mct_cnt_type_id and cd.contentname =?)',
        [parentContentType, contentName],
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.updateContent = function( dbConnection, contentName, contentId, callback ) {
    dbConnection.query('UPDATE catalogue_detail SET cd_name=?,cd_display_name=? WHERE cd_id = ?',
            [contentName, contentName, contentId],
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.getLastInsertedContentId = function( dbConnection, callback ) {
    dbConnection.query('select max(cmd_id) as id from multiselect_metadata_detail',
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.createContentTypeMultiSelectMetaDataDetail = function( dbConnection, contentTypeMetaData, callback ) {
    dbConnection.query('INSERT INTO multiselect_metadata_detail SET ?', contentTypeMetaData,
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.deleteDeliverType = function( dbConnection, contentDeliveryType, deliveryDetail, callback ) {
    dbConnection.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [contentDeliveryType, deliveryDetail ],
        function (err, row, fields) {
            callback(err, row, fields);
        }
    );
}

exports.getLastInsertedContentGroupId = function( dbConnection, callback ) {
    dbConnection.query('select max(cmd_group_id) as id from multiselect_metadata_detail',
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.createDeliveryType = function( dbConnection, deliveryType, callback ) {
    dbConnection.query('INSERT INTO multiselect_metadata_detail SET ?', deliveryType,
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.createContentType = function( dbConnection, contentType, callback ) {
    dbConnection.query('INSERT INTO catalogue_detail SET ?', contentType,
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.getLastInsertedIcnManageContentType = function( dbConnection, callback ) {
    dbConnection.query('select max(mct_id) as id from icn_manage_content_type',
        function (err, result) {
            callback(err, result);
        }
    );
}


exports.createIcnManageContentType = function( dbConnection, manageContent, callback ) {
    dbConnection.query('INSERT INTO icn_manage_content_type SET ?', manageContent,
        function (err, result) {
            callback(err, result);
        }
    );
}

exports.getContentListByIcnManageContentId = function( dbConnection, manageContentId , callback ) {
    dbConnection.query('select * from (SELECT * FROM icn_manage_content_type where mct_id = ?)cnt ' +
                        'inner join (select cd_id as parentid,cd_name as parentname from catalogue_detail)parent on(parent.parentid  = cnt.mct_parent_cnt_type_id) ' +
                        'inner join (select cd_id as contentid,cd_name as contentname from catalogue_detail)cd on(cd.contentid  = cnt.mct_cnt_type_id)',
                    [manageContentId],
        function (err, contentList ) {
            callback(err, contentList);
        }
    );
}