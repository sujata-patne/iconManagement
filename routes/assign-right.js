/**
* Created by sujata.patne on 17-07-2015.
*/

var assignright = require('../controller/assign-right.controller');
module.exports = function (app) {
    app.route('/getassignright')
      .post(assignright.getassignrights)
    app.route('/updateassignright')
      .post(assignright.updateassignright);
}