var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');

exports.pages = function (req, res, next) {
    var role;

    var pagesjson = [
        { 'pagename': 'Store', 'href': 'store', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
    ];

    if (req.session) {
        if (req.session.UserName) {
            role = req.session.UserRole;
            var pageData = getPages(role);
            res.render('index', { title: 'Express', username: req.session.UserName, Pages: pageData, userrole: req.session.UserRole });
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    else {
        res.redirect('/accountlogin');
    }
}

exports.login = function (req, res, next) {
    if (req.session) {
        if (req.session.UserName) {
            res.redirect("/#/plan-list");
        }
        else {
            res.render('account-login', { error: '' });
        }
    }
    else {
        res.render('account-login', { error: '' });
    }
}

exports.logout = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                req.session = null;
                res.redirect('/accountlogin');
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (error) {
        connection_central.end();
        res.render('account-login', { error: error.message });
    }
}

exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            var query = connection_central.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_user_pwd = ? ', [req.body.username, req.body.password], function (err, row, fields) {
                if (err) {
                    res.render('account-login', { error: 'Error in database connection.' });
                } else {
                    if (row.length > 0) {
                        if (row[0].ld_active == 1) {
                            var session = req.session;
                            session.UserId = row[0].ld_id;
                            session.UserRole = row[0].ld_role;
                            session.UserName = req.body.username;
                            session.Password = req.body.password;
                            connection_central.release();
                            res.redirect('/');
                        }
                        else {
                            connection_central.release();
                            res.render('account-login', { error: 'Your account has been disable.' });
                        }
                    } else {
                        connection_central.release();
                        res.render('account-login', { error: 'Invalid Username / Password.' });
                    }
                }
            });
        })
    }
    catch (error) {
        res.render('account-login', { error: 'Error in database connection.' });
    }
}

function getPages(role) {

    if (role == "Super Admin") {
        var pagesjson = [
        { 'pagename': 'Add Store', 'href': 'add-store', 'id': 'store', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'assign-right', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Content', 'href': 'manage-content', 'id': 'manage-content', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Country List', 'href': 'manage-country-list', 'id': 'manage-country-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];

        return pagesjson;
    }
}

exports.viewForgotPassword = function (req, res, next) {
    req.session = null;
    res.render('account-forgot', { error: '', msg: '' });
}

exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            var query = connection_central.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_email_id = ? ', [req.body.userid, req.body.emailid], function (err, row, fields) {
                if (err) {
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
                            to: 'sujata.patne@jetsynthesys.com',
                            subject: 'Forgot Password',
                            html: "<p>Hi, " + row[0].ld_user_id + " <br />This is your password: " + row[0].ld_user_pwd + "</p>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.end("error");
                            } else {
                                connection_central.release();
                                res.render('account-forgot', { error: '', msg: 'Please check your mail. Password successfully sent to your email' });
                                res.end("sent");
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.render('account-forgot', { error: 'Invalid UserId / EmailId.', msg: '' });
                    }
                }
            });
        });
    }
    catch (err) {
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
            if (req.session.UserName) {
                var session = req.session;
                mysql.getConnection('CMS', function (err, connection_central) {
                    if (req.body.oldpassword == session.Password) {
                        var query = connection_central.query('UPDATE icn_login_detail SET ld_user_pwd=?, ld_modified_on=? WHERE ld_id=?', [req.body.newpassword, new Date(), session.UserId], function (err, result) {
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_central.release();
                                session.Password = req.body.newpassword;
                                res.send({ success: true, message: 'Password updated successfully.' });
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.send({ success: false, message: 'Old Password does not match.' });
                    }
                })
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_central.end();
        res.status(500).json(err.message);
    }
};
