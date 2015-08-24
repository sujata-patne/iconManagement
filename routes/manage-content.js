var managecontent = require('../controller/manage-content.controller');
module.exports = function (app) {
    app.route('/getTypes')
      .get(managecontent.getTypes)
    app.route('/addContentType')
      .post(managecontent.addContentType)
     app.route('/getContentDetails')
      .get(managecontent.getContentDetails)
     app.route('/updateContentType')
      .post(managecontent.updateContentType);
}