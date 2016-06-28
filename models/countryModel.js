exports.getCountryList = function( dbConnection, callback ){
    /*dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
                        'inner join(select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id)  ' +
                        'order by cd.cd_name', //"global_country_list",*/
    dbConnection.query('select *, cd_name, cd_id from (SELECT * FROM catalogue_detail)cd '+ // as icc_country_name  as icc_country_id
    'inner join(select * from catalogue_master where cm_name in("country_group","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id) ',
        function (err, countryList) {
            callback(err, countryList);
        }
    );
}

exports.getCountryCurrency = function( dbConnection, callback ){
    dbConnection.query('select icc_country_id as cd_id, icc_country_name as cd_name from icn_country_currency',
        function (err, countryCurrencyList ) {
            callback(err, countryCurrencyList );
        }
    );
}

exports.getMasterCountryList = function( dbConnection, callback ){
    dbConnection.query('select * from catalogue_master where cm_name in("country_group","icon_geo_location")',
        function (err, masterCountryList ) { //"global_country_list",
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
    console.log('select * from catalogue_detail WHERE cd_id= '+cd_id+' and  cd_cm_id =' +groupId)
    dbConnection.query('DELETE FROM catalogue_detail WHERE cd_id= ? and  cd_cm_id =?',
        [cd_id, groupId],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}

exports.getCountries = function( dbConnection, callback ) {
    dbConnection.query('select * from catalogue_detail as cd inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) '+
            'where cm_name in("country_group","icon_geo_location") ', function (err, countrys) {
            callback( err, countrys );
        }
    );
}
exports.getCountryGroups = function( dbConnection, callback ) {
    dbConnection.query('select cm_group.cm_id,cm_group.cm_name, cd_group.cd_id, cd_group.cd_name '+
    'from (SELECT * FROM catalogue_detail)cd '+
    'inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id) '+
    'inner join(select * from catalogue_master  )cm_group on(cm_group.cm_name = cd.cd_name) '+
    'inner join(select * from catalogue_detail )cd_group on(cd_group.cd_cm_id = cm_group.cm_id) ',
   /* dbConnection.query('select cm_group.cm_id,cm_group.cm_name, g_cd.cd_id, cd_group.cd_name ' +
            'from catalogue_detail as cd ' +
            'inner join catalogue_master as cm on(cm.cm_id = cd.cd_cm_id) ' +
            'inner join catalogue_master as cm_group on(cm_group.cm_name = cd.cd_name) ' +
            'inner join catalogue_detail as cd_group on(cd_group.cd_cm_id = cm_group.cm_id)' +
            'left join catalogue_detail AS g_cd on(g_cd.cd_name =cd_group.cd_name) ' +
            //'left join (select icc_country_name as country_name, icc_country_id as cd_id from icn_country_currency) AS g_cd on(g_cd.country_name =cd_group.cd_name) ' +
            'where cm.cm_name in("country_group") group by g_cd.cd_id ',*/
        function (err, countryGroups ) {
            callback( err, countryGroups );
        }
    );
}

exports.countryGroups = function( dbConnection, callback ){
    /*dbConnection.query('select * from (SELECT * FROM catalogue_detail)cd ' +
     'inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id) ' +
     'inner join(select * from catalogue_master  )cm_group on(cm_group.cm_name = cd.cd_name) ' +
     'inner join(select * from catalogue_detail )cd_group on(cd_group.cd_cm_id = cm_group.cm_id)',*/
    var query = dbConnection.query('select cm_id,cm_name,cd_id,cd_name from (select cd_name as group_name from catalogue_master as a , catalogue_detail as b where a.cm_name in("country_group") and a.cm_id = b.cd_cm_id )cm  inner join(select cm_id,cm_name,cd_id as icn_country_id,cd_name from catalogue_master as a,catalogue_detail as b where a.cm_id = b.cd_cm_id)cd on(cm.group_name = cd.cm_name) left join (select icc_country_name as country_name, icc_country_id as cd_id from icn_country_currency) AS g_cd on(g_cd.country_name =cd.cd_name)',
        function (err, countryGroups) {
            callback(err, countryGroups );
        }
    );
}
