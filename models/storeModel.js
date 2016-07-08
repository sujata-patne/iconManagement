/**
 * @desc Get Channel Distribution Details for All Stores
 * @param dbconnection
 * @param callback
 */
exports.getStoreDetails = function( dbconnection, callback ) {
	dbconnection.query(
			'select * from catalogue_detail as cd inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) where cm_name in("Channel Distribution") ', 
            function (err, Channels) {	
				callback(err, Channels);
			}
	);
}
/**
 * @desc Get Store Details with Associated Users Details
 * @param dbconnection
 * @param state
 * @param callback
 */
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
/**
 * @desc Get Channel Distribution Details for Given Store
 * @param dbconnection
 * @param state
 * @param channelId
 * @param callback
 */
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
/**
 * @desc Get Master Channel Distribution List
 * @param dbconnection
 * @param callback
 */
exports.getDistributionChannelList = function( dbconnection, callback ) {
	dbconnection.query('select * from catalogue_detail as cd ' +
						'inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) where cm_name in("Channel Distribution") ',
		function (err,channels) {
			callback(err, channels);
		}
	);
}
/**
 * @desc Get Store with associated users details
 * @param dbconnection
 * @param data
 * @param callback
 */
exports.getStoreList = function( dbconnection, data, callback ) {
 	var orderBy = '';
	if(data.orderBy){
		var orderBy = 'ORDER BY '+data.orderBy;
	} 
 	//var storequery = data.state == "edit-store" ? "where st_id = " + data.Id : "";
	var query = 'select * FROM icn_store as st ' + //' + storequery + '
		'inner join icn_store_user as su on(su.su_st_id  = st.st_id) ' +
		'inner join icn_login_detail as ld on(su.su_ld_id  = ld.ld_id) ' +
		'group by st.st_id ' + orderBy;
 	dbconnection.query(query,
		function ( err,storeList ) {
			callback( err, storeList );
		}
	);
}
/**
 * Validate Store URL
 * @param dbconnection
 * @param storeSiteUrl
 * @param callback
 */
exports.getStoreDetailsByStoreSiteUrl = function( dbconnection, storeSiteUrl, callback ) {
	dbconnection.query('select * from icn_store where lower(st_url) = ?', [ storeSiteUrl ],
		function ( err, storeDetails ) {
			callback( err, storeDetails );
		}
	);
}
/**
 * Get Store Details by it's name
 * @param dbconnection
 * @param storeName
 * @param callback
 */
exports.getStoreByName = function( dbconnection, storeName, callback ) {
	dbconnection.query('select * from icn_store where lower(st_name) = ?', [ storeName ],
		function ( err, storeDetails ) {
			callback( err, storeDetails );
		}
	);
}
/**
 * @desc Update Store Details
 * @param dbconnection
 * @param updateQuery
 * @param storeId
 * @param callback
 */
exports.updateIcnStoreURL = function( dbconnection, updateQuery, storeId, callback ) {
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
/**
 * @desc Update User Details
 * @param dbConnection
 * @param updateIcnLoginDetailsQuery
 * @param storeUserId
 * @param callback
 */
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

/**
 * Get Last insertion Id of Store Table
 * @param dbConnection
 * @param callback
 */
exports.getLastInsertedStoreIdFromIcnStore = function( dbConnection, callback ) {
	dbConnection.query('select max(st_id) as id from icn_store',
		function ( err, result) {
			callback( err, result );
		}
	);
}
/**
 * @desc Insert records into Store Table
 * @param dbConnection
 * @param storeData
 * @param callback
 */
exports.createIcnStore = function( dbConnection, storeData, callback ) {
	var util = require('util');
	dbConnection.query('INSERT INTO icn_store SET ?', storeData,
		function ( err, result) {

			callback( err, result );
		}
	);
}
/**
 * @desc Get Last in wertion Id of User Table
 * @param dbConnection
 * @param callback
 */
exports.getLastInsertedIdFromIcnLoginDetail = function( dbConnection, callback ) {
	dbConnection.query('select max(ld_id) as id from icn_login_detail',
		function ( err, result) {
			callback( err, result );
		}
	);
}
/**
 * @desc Insert Records into User Table
 * @param dbConnection
 * @param icnLoginDetail
 * @param callback
 */
exports.createIcnLoginDetail = function( dbConnection, icnLoginDetail, callback ) {
	dbConnection.query('INSERT INTO icn_login_detail SET ?', icnLoginDetail,
		function ( err, result) {
			callback( err, result );
		}
	);
}
/**
 * Insert Record into Store User Table
 * @param dbConnection
 * @param icnStoreUser
 * @param callback
 */
exports.createIcnStoreUser = function( dbConnection, icnStoreUser, callback ) {
	dbConnection.query('INSERT INTO icn_store_user SET ?', icnStoreUser,
		function ( err, result) {
			callback( err, result );
		}
	);
}
/**
 * @desc Get Store and Store User Details by Store Id
 * @param dbConnection
 * @param storeId
 * @param callback
 */
exports.getStoreListByStoreId = function( dbConnection, storeId, callback ) {
	dbConnection.query('select * from (SELECT * FROM icn_store where st_id = ?)st ' +
							'inner join (select * from icn_store_user)su on(su.su_st_id  = st.st_id) ' +
							'inner join(select * from icn_login_detail)ld on(su.su_ld_id  = ld.ld_id)', [storeId],
		function ( err, storeList ) {
			callback( err, storeList );
		}
	);
}