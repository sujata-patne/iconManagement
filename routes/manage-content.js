var managecontent = require('../controller/manage-content.controller');
module.exports = function (app) {
    app.route('/getTypes')
      .post(managecontent.getTypes)
    app.route('/addContentType')
      .post(managecontent.addContentType)
     app.route('/updateContentType')
      .post(managecontent.updateContentType);
}