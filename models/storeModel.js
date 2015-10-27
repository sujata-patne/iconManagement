var noop = function(){};
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
        var query = dbconnection.query('select * from (select * from icn_store where st_id= ? )st '+
        								'inner join (select * from multiselect_metadata_detail ) mmd on (st.st_front_type=mmd.cmd_group_id) '+
        								'inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail) '+
        								'inner join(select * from catalogue_master where cm_name = "Channel Distribution")cm on(cm.cm_id = cd_cm_id and mmd.cmd_entity_type = cm.cm_id)', 
        			[channelId], 
        	function (err, ChannelRights) {
            	callback(err, ChannelRights);
        	}
        );
    }
    else {
        callback(null, []);
    }
}
