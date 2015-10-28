exports.getCountryList = function( dbConnection, callback ){
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
                        'inner join(select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id)  ' +
                        'order by cd.cd_name',
        function (err, countryList) {
            callback(err, countryList);
        }
    );
}

exports.countryGroups = function( dbConnection, callback ){
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
                        'inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id) ' +
                        'inner join(select * from catalogue_master  )cm_group on(cm_group.cm_name = cd.cd_name) ' +
                        'inner join(select * from catalogue_detail )cd_group on(cd_group.cd_cm_id = cm_group.cm_id)',
        function (err, countryGroups) {
            callback(err, countryGroups );
        }
    );
}

exports.getMasterCountryList = function( dbConnection, callback ){
    dbConnection.query('select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location")',
        function (err, masterCountryList ) {
            callback(err, masterCountryList );
        }
    );
}

exports.getCountryGroupByGroupName = function( dbConnection, groupName, callback ) {
    dbConnection.query('select * from (SELECT * FROM catalogue_detail  where lower(cd_name) =?)cd ' +
                        'inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id)',
                [groupName],
        function (err, row) {
            callback( err, row );
        }
    );
}

exports.getLastInsertedCatalogueId = function( dbConnection, callback ) {
    dbConnection.query('select max(cd_id) as id from catalogue_detail',
        function (err, row) {
            callback( err, row );
        }
    );
}

exports.getLastInsertedIdFromCatalogMaster = function( dbConnection, callback ) {
    dbConnection.query('select max(cm_id) as id from catalogue_master',
        function (err, row) {
            callback( err, row );
        }
    );
}

exports.createCatalogDetailForCountry = function( dbConnection, icon_country, callback ) {
    dbConnection.query('INSERT INTO catalogue_detail SET ?', icon_country,
        function (err, result) {
            callback( err, result );
        }
    );
}

exports.createCountryMasterGroup = function( dbConnection, country_master_group, callback ) {
    dbConnection.query('INSERT INTO catalogue_master SET ?', country_master_group,
        function (err, result) {
            callback( err, result );
        }
    );
}

exports.deleteCountryByGroupId = function( dbConnection, cd_id, groupId, callback ) {
    dbConnection.query('DELETE FROM catalogue_detail WHERE cd_id= ? and  cd_cm_id =?',
        [cd_id, groupId],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}

exports.getCountries = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
                        'inner join(select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id)',
        function (err, countrys) {
            callback( err, countrys );
        }
    );
}

exports.getCountryGroups = function( dbConnection, callback ) {
    dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
                        'inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id) ' +
                        'inner join(select * from catalogue_master  )cm_group on(cm_group.cm_name = cd.cd_name) ' +
                        'inner join(select * from catalogue_detail )cd_group on(cd_group.cd_cm_id = cm_group.cm_id)',
        function (err, countryGroups ) {
            callback( err, countryGroups );
        }
    );
}