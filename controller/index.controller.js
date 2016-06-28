
var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');
var userManager = require("../models/userModel");
//var�logger�=�require("../controller/logger.controller");

var fs = require("fs");
var wlogger= require('../config/logger');
var reload = require('require-reload')(require);
var config = require('../config')();

var crypto = require('crypto');
var algorithm = 'aes-256-ctr'; //Algorithm used for encrytion
var password = 'd6F3Efeq'; //Encryption password

function encrypt(text){
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

function getDate() {
    var d = new Date();
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var selectdate = year + '-' + Pad("0", month, 2) + '-' + Pad("0", dt, 2);
    return selectdate;
}
function getTime(val) {
    var d = new Date(val);
    var minite = d.getMinutes();
    var hour = d.getHours();
    var second = d.getSeconds();
    var selectdate = Pad("0", hour, 2) + ':' + Pad("0", minite, 2) + ':' + Pad("0", second, 2);
    return selectdate;
}

function Pad(padString, value, length) {
    var str = value.toString();
    while (str.length < length)
        str = padString + str;

    return str;
}

exports.allAction = function (req, res, next) {
    var currDate = Pad("0",parseInt(new Date().getDate()), 2)+'_'+Pad("0",parseInt(new Date().getMonth() + 1), 2)+'_'+new Date().getFullYear();
    if (wlogger.logDate == currDate) {
        var logDir = config.log_path;
        var filePath = logDir + 'logs_'+currDate+'.log';
        fs.stat(filePath, function(err, stat) {
            if(err != null&& err.code == 'ENOENT') {
                wlogger = reload('../config/logger');
            }
        });
        next();
    } else {
        wlogger = reload('../config/logger');
        next();
    }
}

exports.pages = function (req, res, next) {
    var role;

    var pagesjson = [
        { 'pagename': 'Store', 'href': 'store', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
    ];
    if (req.session) {
        if (req.session.icon_UserName) {
            role = req.session.icon_UserRole;
            var pageData = getPages(role);



            var info = {
                userName: req.session.icon_UserName,
                action : 'pages',
                responseCode:200,
                message :' login successfully with existing session'
            };
            wlogger.info(info);

            res.render('index', { title: 'Express', username: req.session.icon_FullName, Pages: pageData, userrole: req.session.icon_UserType, lastlogin: " " + getDate(req.session.icon_lastlogin) + " " + getTime(req.session.icon_lastlogin) });

        }
        else {

            res.redirect('/accountlogin');
        }
    }
    else {
        res.redirect('/accountlogin');
    }
}

//exports.login = function (req, res, next) {
//    if (req.session) {
//        if (req.session.icon_UserName) {
//            res.redirect("/#/plan-list");
//        }
//        else {
//            res.render('account-login', { error: '' });
//        }
//    }
//    else {
//        res.render('account-login', { error: '' });
//    }
//}
exports.login = function (req, res, next) {
    if(req.cookies.icon_remember == 1 && req.cookies.icon_username != '' ){

        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            userManager.getIcnLoginDetails( connection_ikon_cms, decrypt(req.cookies.icon_username), decrypt(req.cookies.icon_password), function( err, row ){

                if (err) {

                    var errorInfo = {

                        userName: req.cookies.icon_username,
                        action : 'getIcnLoginDetails',
                        responseCode:500,
                        message : req.cookies.icon_username +' failed to get login details '+JSON.stringify(err.message)
                    };
                    wlogger.error(errorInfo);

                  // logger.writeLog('getIcnLoginDetails : '�+�JSON.stringify(err));
                    res.render('account-login', { error: 'Error in database connection' });
                } else {
                    if (row.length > 0) {
                        if (row[0].ld_active == 1) {
                            if(row[0].ld_user_type == 'Store Admin') {
                                connection_ikon_cms.release();

                                var session = req.session;
                                session.icon_UserId = row[0].ld_id;
                                session.icon_UserRole = row[0].ld_role;
                                session.icon_UserName =row[0].ld_user_name;
                                session.icon_Password = row[0].ld_user_pwd;
                                session.icon_FullName = row[0].ld_display_name;
                                session.icon_lastlogin = row[0].ld_last_login;
                                session.icon_UserType = row[0].ld_user_type;
                                session.icon_Email = row[0].ld_email_id;

                                 var info = {
                                    userName: row[0].ld_user_name,
                                    action : 'getIcnLoginDetails',
                                    responseCode:200,
                                    message : 'get successfully login details'
                                };
                                wlogger.info(info);

                                if (req.session) {
                                    if (req.session.icon_UserName) {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'getIcnLoginDetails',
                                            responseCode:200,
                                            message : 'User successfully redirect to index page'
                                        };
                                        wlogger.info(info);

                                        res.redirect("/");
                                    }
                                    else {

                                        var errorInfo = {
                                            userName: row[0].ld_user_name,
                                            action : 'getIcnLoginDetails',
                                            responseCode:500,
                                            message : 'User session not exist'
                                        };
                                        wlogger.error(errorInfo);

                                        res.render('account-login', { error: '' });
                                    }
                                }
                                else {

                                    var errorInfo = {
                                        userName: row[0].ld_user_name,
                                        action : 'getIcnLoginDetails',
                                        responseCode:500,
                                        message : 'Session not exist'
                                    };
                                    wlogger.error(errorInfo);
                                    res.render('account-login', { error: '' });
                                }
                            }
                        }
                    }
                }
            });
        });
    }else if (req.session) {
        if (req.session.icon_UserName) {

            var info = {
                userName: req.session.icon_UserName,
                action : 'login',
                responseCode:200,
                message : ' login successfully with existing session'
            };
            wlogger.info(info);

            res.redirect("/#/plan-list");
        }
        else {
            var errorInfo = {
                userName: 'Unknown User',
                action : 'login',
                responseCode:500,
                message : 'User session is null'
            };
            wlogger.error(errorInfo);

            res.render('account-login', { error: '' });
        }
    }
    else {

        var errorInfo = {
            userName: 'Unknown User',
            action : 'login',
            responseCode:500,
            message : 'Session is null'
        };
        wlogger.error(errorInfo);

        res.render('account-login', { error: '' });
    }
}
exports.logout = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                //req.session = null;
                var userName= req.session.icon_UserName;
               req.session.icon_UserId = null;
                req.session.icon_UserRole = null;
                req.session.icon_UserName = null;
                req.session.icon_Password = null;
                req.session.icon_FullName = null;
                req.session.icon_lastlogin = null;
                req.session.icon_UserType = null;
                res.clearCookie('icon_remember');
                res.clearCookie('icon_username');
                res.clearCookie('icon_password');
                res.redirect('/accountlogin');

                var info = {
                    userName: userName,
                    action : 'logout',
                    responseCode:200,
                    message : userName +' user clear session successfully'
                };
                wlogger.info(info);
            }
            else {

                var errorInfo = {
                    userName: 'Unknown User',
                    action : 'logout',
                    responseCode:500,
                    message : 'User session is null'
                };
                wlogger.error(errorInfo);

                res.redirect('/accountlogin');
            }
        }
        else {

            var errorInfo = {
                userName: 'Unknown User',
                action : 'logout',
                responseCode:500,
                message : 'Session is null'
            };
            wlogger.error(errorInfo);

            res.redirect('/accountlogin');
        }
    }
    catch (error) {

        var errorInfo = {
            userName: 'Unknown User',
            action : 'logout',
            responseCode:500,
            message : 'User logout error - '+JSON.stringify(error.message)
        };
        wlogger.error(errorInfo);

        res.render('account-login', { error: error.message });
    }
}
exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            if(req.body.rememberMe){
                var minute = 10080 * 60 * 1000;
                res.cookie('icon_remember', 1, { maxAge: minute });
                res.cookie('icon_username', encrypt(req.body.username), { maxAge: minute });
                res.cookie('icon_password', encrypt(req.body.password), { maxAge: minute });

                var info = {
                    userName: req.body.username,
                    action : 'authenticate',
                    responseCode:200,
                    message :req.body.username+' authenticate and set login information in cookie successfully'
                };
                wlogger.info(info);
            }
            userAuthDetails(connection_ikon_cms,req.body.username,req.body.password,req,res);
        });
    }
    catch (error) {

       var errorInfo = {
            userName: req.body.username,
            action : 'authenticate',
            responseCode:500,
            message : 'Error in database connection -'+JSON.stringify(error.message)
        };
        wlogger.error(errorInfo);

        res.render('account-login', { error: 'Error in database connection' });
    }
}


function userAuthDetails(dbConnection, username,password,req,res){

    userManager.getIcnLoginDetails( dbConnection, username, password, function( err, row ){
        if (err) {

            var errorInfo = {
                userName: username,
                action : 'getIcnLoginDetails',
                responseCode:500,
                message : 'Error in database connection -'+JSON.stringify(err.message)
            };
            wlogger.error(errorInfo);

            dbConnection.release();
            res.render('account-login', { error: 'Error in database connection' });
        } else {
            if (row.length > 0) {
                if (row[0].ld_active == 1) {
                    if(row[0].ld_user_type == 'Store Admin') {
                        var session = req.session;
                        session.icon_UserId = row[0].ld_id;
                        session.icon_UserRole = row[0].ld_role;
                        session.icon_UserName = req.body.username;
                        session.icon_Password = req.body.password;
                        session.icon_FullName = row[0].ld_display_name;
                        session.icon_lastlogin = row[0].ld_last_login;
                        session.icon_UserType = row[0].ld_user_type;//coming from new store's user table.
						session.icon_Email = row[0].ld_email_id;

                        var info = {
                            userName: username,
                            action : 'getIcnLoginDetails',
                            responseCode:200,
                            message :username+' login information get successfully'
                        };
                        wlogger.info(info);

                        userManager.updateIcnLoginDetails( dbConnection, new Date, row[0].ld_id ,function(err,response){
                            if(err){                                

                                var ErrorInfo = {
                                    userName: username,
                                    action : 'ErrorInfo',
                                    responseCode:500,
                                    message :'Failed to update login details'
                                };
                                wlogger.error(ErrorInfo);

                                dbConnection.release();
                            }else{

                                var info = {
                                    userName: username,
                                    action : 'updateIcnLoginDetails',
                                    responseCode:200,
                                    message :'Updated login information successfully'
                                };
                                wlogger.info(info);

                                dbConnection.release();
								if(req.body.password){
									res.redirect('/#/changepassword');
								}else{
									res.redirect('/');
								} 
                            }
                        });
                    } else {

                        var ErrorInfo = {
                            userName: username,
                            action : 'getIcnLoginDetails',
                            responseCode:500,
                            message :'Only Store Admin/Manager are allowed to login'
                        };
                        wlogger.error(ErrorInfo);

                        dbConnection.release();
                        res.render('account-login', { error: 'Only Store Admin/Manager are allowed to login' });
                    }
                }
                else {

                    var ErrorInfo = {
                        userName: username,
                        action : 'getIcnLoginDetails',
                        responseCode:500,
                        message :username +' account has been disable'
                    };
                    wlogger.error(ErrorInfo);

                    dbConnection.release();
                    res.render('account-login', { error: 'Your account has been disable' });
                }
            } else {

                var ErrorInfo = {
                    userName: username,
                    action : 'getIcnLoginDetails',
                    responseCode:500,
                    message :'Failed to get login information'
                };
                wlogger.error(ErrorInfo);

                dbConnection.release();
                if( req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length == 0 ) {
                    res.render('account-login', {error: 'Please enter username and password'});
                }else if(req.body.username != undefined && req.body.username.length != 0  &&  req.body.password.length == 0 ){
                    res.render('account-login', {error: 'Please enter password'});
                }
                else if(req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length != 0){
                    res.render('account-login', {error: 'Please enter username'});
                }
                else {
                    res.render('account-login', {error: 'Invalid Username / Password'});
                }
            }
        }
    });
}
function getPages(role) {
    //{ 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'assign-right', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
    //{ 'pagename': 'Add/Edit Store', 'href': 'add-store', 'id': 'store', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },

    var pagesjson = [
        {'pagename': 'User Rights Management', 'href': 'user-right-management', 'id': 'user-right-management', 'class': 'fa fa-hdd-o', 'submenuflag': '2', 'sub': [
            { 'subpagename': 'Add User', 'subhref': 'add-user', 'id': 'add-user', 'subclass': 'fa fa-align-left' },
            { 'subpagename': 'Assign User Rights', 'subhref': 'user-right', 'id': 'user-right', 'subclass': 'fa fa-align-left' }
        ]
        },
        {'pagename': 'Store Rights Management', 'href': 'store-right', 'id': 'store-right', 'class': 'fa fa-hdd-o', 'submenuflag': '2', 'sub': [
               { 'subpagename': 'Add Store', 'subhref': 'add-store', 'id': 'store', 'subclass': 'fa fa-align-left' },
               { 'subpagename': 'Assign Store Rights', 'subhref': 'assign-right', 'id': 'assign-right', 'subclass': 'fa fa-align-left' }
           ]
        },
        { 'pagename': 'Manage Content', 'href': 'manage-content', 'id': 'manage-content', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Country List', 'href': 'manage-country-list', 'id': 'manage-country-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];

    return pagesjson;
}

exports.viewForgotPassword = function (req, res, next) {
    req.session = null;
    res.render('account-forgot', { error: '', msg: '' });
}

exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            userManager.getUserDetailsByIdByEmailId( connection_central, req.body.userid, req.body.emailid, function( err, row, fields ) {
                if (err) {

                    var ErrorInfo = {
                        userName: req.body.userid,
                        action : 'getUserDetailsByIdByEmailId',
                        responseCode:500,
                        message :'Error in database connection. '+JSON.stringify(err.message)
                    };
                    wlogger.error(ErrorInfo);
                    res.render('account-forgot', { error: 'Error in database connection.', msg: '' });
                }
                else {
                    if (row.length > 0) {

                        var smtpTransport = nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: "jetsynthesis@gmail.com",
                                pass: "j3tsynthes1s"
                            }
                        });
                        var mailOptions = {
                            to: row[0].ld_email_id,
                            subject: 'Forgot Password',
                            html: "<p>Hi, " + row[0].ld_user_id + " <br />This is your password: " + row[0].ld_user_pwd + "</p>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {

                                var ErrorInfo = {
                                    userName: req.body.userid,
                                    action : 'sendMail',
                                    responseCode:500,
                                    message :'Failed to send mail. '+JSON.stringify(error.message)
                                };
                                wlogger.error(ErrorInfo);

                                console.log(error);
                                res.end("error");
                            } else {

                                var info = {
                                    userName: req.body.userid,
                                    action : 'sendMail',
                                    responseCode:200,
                                    message :'EMail send successfully'
                                };
                                wlogger.info(info);

                                connection_central.release();
                                res.render('account-forgot', { error: '', msg: 'Please check your mail. Password successfully sent to your email' });
                                res.end("sent");
                            }
                        });

                        var info = {
                            userName: req.body.userid,
                            action : 'getUserDetailsByIdByEmailId',
                            responseCode:200,
                            message :'Get user details by UserId and EmailId successfully'
                        };
                        wlogger.info(info);
                    }
                    else {
                        var ErrorInfo = {
                            userName: req.body.userid,
                            action : 'getUserDetailsByIdByEmailId',
                            responseCode:500,
                            message :'Failed get user details by UserId and EmailId'
                        };
                        wlogger.error(ErrorInfo);

                        connection_central.release();
                        res.render('account-forgot', { error: 'Invalid UserId / EmailId.', msg: '' });
                    }
                }
            });
        });
    }
    catch (err) {

        var ErrorInfo = {
            userName: req.body.userid,
            action : 'getUserDetailsByIdByEmailId',
            responseCode:500,
            message :'Error in database connection. '+JSON.stringify(err.message)
        };
        wlogger.error(ErrorInfo);

        connection_central.end();
        res.render('account-forgot', { error: 'Error in database connection.' });
    }
}

exports.viewChangePassword = function (req, res, next) {
    req.session = null;
    res.render('account-changepassword', { error: '' });
}

exports.changePassword = function (req, res) {
    try {
		if (req.session) {
            if (req.session.icon_UserName) {
                var session = req.session;
                mysql.getConnection('CMS', function (err, connection_central) {
                    if (req.body.oldpassword == session.icon_Password) {
						
                        userManager.updateUserDetails( connection_central, req.body.newpassword, new Date(), session.icon_UserId, function (err, result) {
                            if (err) {

                                var ErrorInfo = {
                                    userName: req.session.icon_UserName,
                                    action : 'updateUserDetails',
                                    responseCode:500,
                                    message :'Failed to update user details. '+JSON.stringify(err.message)
                                };
                                wlogger.error(ErrorInfo);

                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
								
								session.icon_Password = req.body.newpassword;
								
								
                                var smtpTransport = nodemailer.createTransport({
                                    service: "Gmail",
                                    auth: {
                                        user: "jetsynthesis@gmail.com",
                                        pass: "j3tsynthes1s"
                                    }
                                });

                                var mailOptions = {
                                    to: session.icon_Email,
                                    subject: 'Change Password',
                                    html: "<p>Hi, " + session.icon_UserName + " <br />This is your password: " + req.body.newpassword + "</p>"
                                }
								
                                smtpTransport.sendMail(mailOptions, function (error, response) {
                                    if (error) {

                                        var ErrorInfo = {
                                            userName: req.session.icon_UserName,
                                            action : 'sendMail',
                                            responseCode:500,
                                            message :'Failed to send mail. '+JSON.stringify(error.message)
                                        };
                                        wlogger.error(ErrorInfo);

                                        connection_central.release();
                                        res.end("error");
                                    } else {

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'sendMail',
                                            responseCode:200,
                                            message :'EMail send successfully'
                                        };
                                        wlogger.info(info);

										connection_central.release();
                                        res.send({ success: true, message: 'Password updated successfully. Please check your mail' });

                                        var info = {
                                            userName: req.session.icon_UserName,
                                            action : 'updateUserDetails',
                                            responseCode:200,
                                            message :'Password updated successfully.'
                                        };
                                        wlogger.info(info);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        var ErrorInfo = {
                            userName: req.session.icon_UserName,
                            action : 'changePassword',
                            responseCode:500,
                            message :'Old Password does not match.'
                        };
                        wlogger.error(ErrorInfo);

                        connection_central.release();
                        res.send({ success: false, message: 'Old Password does not match.' });
                    }
                })
            }
            else {

                var ErrorInfo = {
                    userName: 'Unknown User',
                    action : 'changePassword',
                    responseCode:500,
                    message :'User session is null.'
                };
                wlogger.error(ErrorInfo);

                res.redirect('/accountlogin');
            }
        }
        else {

            var ErrorInfo = {
                userName: 'Unknown User',
                action : 'changePassword',
                responseCode:500,
                message :'Session is null.'
            };
            wlogger.error(ErrorInfo);

            res.redirect('/accountlogin');
        }
    }
    catch (err) {

        var ErrorInfo = {
            userName: 'Unknown User',
            action : 'changePassword',
            responseCode:500,
            message :'Failed to change password. '+JSON.stringify(err.message)
        };
        wlogger.error(ErrorInfo);

        connection_central.end();
        res.status(500).json(err.message);
    }
};





