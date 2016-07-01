/**
 * Created by Sujata.Halwai on 01-07-2016.
 */
var self = module.exports = {
    Pad : function(padString, value, length) {
        var str = value.toString();
        while (str.length < length)
            str = padString + str;
        return str;
    },
    getDate: function () {
        var d = new Date();
        var dt = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        var selectdate = year + '-' + self.Pad("0", month, 2) + '-' + self.Pad("0", dt, 2);
        return selectdate;
    },
    getTime: function () {
        var d = new Date();
        var minite = d.getMinutes();
        var hour = d.getHours();
        var second = d.getSeconds();
        var selectdate = self.Pad("0", hour, 2) + ':' + self.Pad("0", minite, 2) + ':' + self.Pad("0", second, 2);
        return selectdate;
    },
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
    formatter: function () {
        var d = new Date();
        var date = self.setDate(d);
        var time = self.setTime(d);
        var logMessage = date +" "+ time ;
        return logMessage;
    },
    encrypt: function (text){
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    },
    decrypt: function (text){
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}