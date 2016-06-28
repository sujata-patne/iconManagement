exports.getStoreDetails = function( dbconnection, callback ) {
	dbconnection.query(
			'select * from catalogue_detail as cd inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) where cm_name in("Channel Distribution") ', 
            function (err, Channels) {	
				callback(err, Channels);
			}
	);
}
exports.getAllStores = function( dbconnection, state, callback ) {
	var storequery = state == "edit-store" ? "where st_id = " + state : "";
    var query = dbconnection.query('select * from (SELECT * FROM icn_store ' + storequery + ') st '+ 
    									'inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) '+ 
    									'inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', 
	    	function (err, StoreList) {
	        	callback(err, StoreList);
	    	}
    );
}
exports.getChannelRights = function( dbconnection, state, channelId, callback ) {
	if (state == "edit-store") {
        dbconnection.query('select * from (select * from icn_store where st_id= ? )st '+
        								'inner join (select * from multiselect_metadata_detail ) mmd on (st.st_front_type=mmd.cmd_group_id) '+
        								'inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail) '+
        								'inner join(select * from catalogue_master where cm_name = "Channel Distribution")cm on(cm.cm_id = cd_cm_id and mmd.cmd_entity_type = cm.cm_id)', 
        			[channelId], 
        	function (err, ChannelRights) {
            	callback(err, ChannelRights);
        	}
        );
    }else {
        callback(null, []);
    }
}

exports.getDistributionChannelList = function( dbconnection, callback ) {
	dbconnection.query('select * from catalogue_detail as cd ' +
						'inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) where cm_name in("Channel Distribution") ',
		function (err,channels) {
			callback(err, channels);
		}
	);
}

exports.getStoreList = function( dbconnection, data, callback ) {
	console.log(data);
	var orderBy = '';
	if(data.orderBy){
		var orderBy = 'ORDER BY '+data.orderBy;
	} 
 	//var storequery = data.state == "edit-store" ? "where st_id = " + data.Id : "";
	var query = 'select * from (SELECT * FROM icn_store )st ' + //' + storequery + '
		'inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) ' +
		'inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id) ' + orderBy;
	console.log(query);
	dbconnection.query(query,
		function ( err,storeList ) {
			callback( err, storeList );
		}
	);
}

exports.getStoreDetailsByStoreSiteUrl = function( dbconnection, storeSiteUrl, callback ) {
	dbconnection.query('select * from icn_store where lower(st_url) = ?', [ storeSiteUrl ],
		function ( err, storeDetails ) {
			callback( err, storeDetails );
		}
	);
}

exports.getStoreByName = function( dbconnection, storeName, callback ) {
	dbconnection.query('select * from icn_store where lower(st_name) = ?', [ storeName ],
		function ( err, storeDetails ) {
			callback( err, storeDetails );
		}
	);
}

exports.updateIcnStore = function( dbconnection, updateQuery, storeId, callback ) {
	dbconnection.query('UPDATE icn_store ' +
							'SET st_name=?,' +
							'st_url=?,' +
							'st_modified_on=?,' +
							'st_modified_by=? ' +
						' WHERE ' +
							'st_id = ?',
					[ updateQuery.st_name,
					  updateQuery.st_url,
					  updateQuery.st_modified_on,
					  updateQuery.st_modified_by,
					  storeId
					],
		function (err, result) {
			callback( err, result );
		}
	);
}

exports.updateIcnLoginDetails = function( dbConnection, updateIcnLoginDetailsQuery, storeUserId, callback ) {
	dbConnection.query( 'UPDATE icn_login_detail ' +
		                'SET ?' +
						'WHERE ld_id = ?',
					[ updateIcnLoginDetailsQuery,storeUserId ],
		function (err, result) {
			callback( err, result );
		}
	);
}

exports.getLastInsertedMultiSelectMetaDataDetail = function( dbConnection, callback ) {
	dbConnection.query('select max(cmd_id) as id from multiselect_metadata_detail',
		function ( err, multiSelectMetaDataRow ) {
			callback( err, multiSelectMetaDataRow );
		}
	);
}

exports.createMultiSelectMetaDataDetail = function( dbConnection, multiSelectMetaData, callback ) {
	dbConnection.query('INSERT INTO multiselect_metadata_detail SET ?', multiSelectMetaData,
		function ( err, result ) {
			callback( err, result );
		}
	);
}

exports.deleteMultiSelectMetaDataDetail = function( dbConnection, storeFrontType, channelId, callback ) {
	dbConnection.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?',
		[ storeFrontType, channelId ],
		function (err, row, fields) {
			callback( err, row, fields );
		}
	);
}

exports.getLastInsertedMultiSelectMetaDataDetailByCmdGroupId = function( dbConnection, callback ) {
	dbConnection.query('select max(cmd_group_id) as id from multiselect_metadata_detail',
		function ( err, result) {
			callback( err, result );
		}
	);
}

exports.getLastInsertedStoreIdFromIcnStore = function( dbConnection, callback ) {
	dbConnection.query('select max(st_id) as id from icn_store',
		function ( err, result) {
			callback( err, result );
		}
	);
}

exports.createIcnStore = function( dbConnection, storeData, callback ) {
	var util = require('util');
	console.log(util.inspect(storeData, false, null));

	dbConnection.query('INSERT INTO icn_store SET ?', storeData,
		function ( err, result) {

			callback( err, result );
		}
	);
}

exports.getLastInsertedIdFromIcnLoginDetail = function( dbConnection, callback ) {
	dbConnection.query('select max(ld_id) as id from icn_login_detail',
		function ( err, result) {
			callback( err, result );
		}
	);
}



exports.createIcnLoginDetail = function( dbConnection, icnLoginDetail, callback ) {
	dbConnection.query('INSERT INTO icn_login_detail SET ?', icnLoginDetail,
		function ( err, result) {
			callback( err, result );
		}
	);
}

exports.createIcnStoreUser = function( dbConnection, icnStoreUser, callback ) {
	dbConnection.query('INSERT INTO icn_store_user SET ?', icnStoreUser,
		function ( err, result) {
			callback( err, result );
		}
	);
}

exports.getStoreListByStoreId = function( dbConnection, storeId, callback ) {
	dbConnection.query('select * from (SELECT * FROM icn_store where st_id = ?)st ' +
							'inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) ' +
							'inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', [storeId],
		function ( err, storeList ) {
			callback( err, storeList );
		}
	);
}