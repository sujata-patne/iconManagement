/**
 * @desc Authenticate User for Login
 * @param dbConnection
 * @param userName
 * @param password
 * @param callback
 */
exports.getIcnLoginDetails = function( dbConnection, userName, password, callback ) {
    dbConnection.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_user_pwd = ? ',[userName, password],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}
/**
 * @desc Update Last Login date
 * @param dbConnection
 * @param lastLoginDate
 * @param loginId
 * @param callback
 */
exports.updateIcnLoginDetails = function( dbConnection, lastLoginDate, loginId , callback ) {
    dbConnection.query('update  icn_login_detail set  ld_last_login = ? where ld_id =?', [lastLoginDate, loginId ],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}
/**
 * @desc Get Authenticated User Details
 * @param dbConnection
 * @param userId
 * @param emailId
 * @param callback
 */
exports.getUserDetailsByIdByEmailId = function( dbConnection, userId, emailId, callback ) {
    dbConnection.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_email_id = ? ', [userId, emailId],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}
/**
 * @desc Update User Details into DB
 * @param dbConnection
 * @param newPassword
 * @param modifiedOn
 * @param userId
 * @param callback
 */
exports.updateUserDetails = function( dbConnection, newPassword, modifiedOn, userId, callback ) {
    dbConnection.query('UPDATE icn_login_detail SET ld_user_pwd=?, ld_modified_on=? WHERE ld_id=?', [newPassword, modifiedOn, userId],
        function (err, result) {
            callback( err, result );
        }
    );
}
/**
 * @desc Get User details by Username
 * @param dbConnection
 * @param emailId
 * @param callback
 */
exports.getIcnUserByEmailId = function( dbConnection, emailId, callback ) {
    dbConnection.query('select * from icn_login_detail where lower(ld_user_name) = ?', [emailId],
        function (err, result) {
            callback( err, result );
        }
    );
}
//exports.updateLastLoggedIn = function( dbConnection,  userId, callback ) {
//    var query = dbConnection.query('UPDATE icn_login_detail '+
//        '				SET ld_last_login=NOW() WHERE ld_id=?',
//        [userId], function ( err, response ) {
//            callback( err, response );
//        });
//}
