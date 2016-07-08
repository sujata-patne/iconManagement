/**
 * Created by Sujata.Halwai on 01-07-2016.
 */
var crypto = require('crypto');

var self = module.exports = {
    /**
     * @desc Padding String
     * @param padString
     * @param value
     * @param length
     */
    Pad : function(padString, value, length) {
        var str = value.toString();
        while (str.length < length)
            str = padString + str;
        return str;
    },
    /**
     * @desc Get Date in YYYY-mm-dd format
     * @param val
     */
    getDate: function () {
        var d = new Date();
        var dt = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        var selectdate = year + '-' + self.Pad("0", month, 2) + '-' + self.Pad("0", dt, 2);
        return selectdate;
    },
    /**
     * @desc Get Time in h:i:s format
     * @param val
     */
    getTime: function () {
        var d = new Date();
        var minite = d.getMinutes();
        var hour = d.getHours();
        var second = d.getSeconds();
        var selectdate = self.Pad("0", hour, 2) + ':' + self.Pad("0", minite, 2) + ':' + self.Pad("0", second, 2);
        return selectdate;
    },
    /**
     * @desc Set given date in Format dd-mm-yyyy
     */
    setDate: function (val) {
        if (val) {
            var d = new Date(val);
            var dt = d.getDate();
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            var selectdate = self.Pad("0", dt, 2) + '-' + self.Pad("0", month, 2) + '-' + year;
            return selectdate;
        }else{
            var d = new Date();
            var dt = d.getDate();
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            var selectdate = self.Pad("0", dt, 2)+ '-' + self.Pad("0", month, 2) + '-' + year  ;
            return selectdate;
        }
    },
    /**
     * @desc Set given date in Format yyyy-mm-dd according to Mysql date
     */
    setDBDate: function (val) {
        if (val) {
            var d = new Date(val);
            var dt = d.getDate();
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            var selectdate = year + '-' + self.Pad("0", month, 2)  + '-' + self.Pad("0", dt, 2) ;
            return selectdate;
        } else {
            return '';
        }
    },
    /**
     * @desc Set User Account Expiration date one month later of creation in Format yyyy-mm-dd according to Mysql date
     */
    setAccountValidity: function () {
            var d = new Date();
        console.log(d);
        var dt = d.getDate();
            var month = (d.getMonth() + 1)%12 + 1;
            var year = d.getFullYear();
            var selectdate = year + '-' + self.Pad("0", month, 2)  + '-' + self.Pad("0", dt, 2) ;
            return selectdate;

    },
    /**
     * @desc Set given date in Format h:i:s
     */
    setTime: function (val) {
        if (val) {
            var d = new Date(val);
            var minite = d.getMinutes();
            var hour = d.getHours();
            var second = d.getSeconds();
            var selectdate = self.Pad("0", hour, 2) + ':' + self.Pad("0", minite, 2) + ':' + self.Pad("0", second, 2);
            return selectdate;
        }else{
            var d = new Date();
            var minite = d.getMinutes();
            var hour = d.getHours();
            var second = d.getSeconds();
            var selectdate = self.Pad("0", hour, 2) + ':' + self.Pad("0", minite, 2) + ':' + self.Pad("0", second, 2);
            return selectdate;
        }
    },
    /**
     * @desc Format Date as datetime
     */
    formatter: function () {
        var d = new Date();
        var date = self.setDate(d);
        var time = self.setTime(d);
        var logMessage = date +" "+ time ;
        return logMessage;
    },
    /**
     * @desc Encrypt String from UTF8 To Hex
     * @param text
     * @returns {String}
     */
    encrypt: function (text){
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    },
    /**
     * @desc Decrypt String from hex To UTF8
     * @param text
     * @returns {String}
     */
    decrypt: function (text){
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}