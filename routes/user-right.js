
var userright = require('../controller/user-right.controller');
module.exports = function (app) {
    app.route('/*')
        .all(userright.allAction);
    app.route('/getuserright')
      .post(userright.getuserrights);
    app.route('/existingMappingList')
      .post(userright.existingMappingList);
    app.route('/updateuserright')
      .post(userright.updateuserright);
    app.route('/saveUsers')
        .post(userright.addedituser);
    app.route('/blockunblockuser')
        .post(userright.blockunblockuser);
}