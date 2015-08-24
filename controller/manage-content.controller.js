var mysql = require('../config/db').pool;

//Fetching all types and content details :
exports.getTypes = function (req, res, next) {
   try {
    var parentTypes;
    var deliveryTypes;
    var contentTypes;
        if (req.session) {
            if (req.session.UserName) {
              mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query("SELECT cd.cd_id,cd.cd_name FROM `catalogue_master` cm,`catalogue_detail` cd where cd.cd_cm_id = cm.cm_id and cm.cm_name = 'content type'", function (err, result) {
                       if(err){
                          connection_ikon_cms.release();
                          res.status(500).json(err.message);
                        }else{
                          parentTypes = result;
                          // connection_ikon_cms.release();
                          var query = connection_ikon_cms.query("SELECT cd.cd_id,cd.cd_name FROM `catalogue_master` cm,`catalogue_detail` cd where cd.cd_cm_id = cm.cm_id and cm.cm_name = 'Delivery Type'", function (err, result) {
                            if(err){
                              connection_ikon_cms.release();
                              res.status(500).json(err.message);
                            }else{
                               deliveryTypes = result;
                               // connection_ikon_cms.release();
                               var query = connection_ikon_cms.query("select mct_id,(SELECT cd.cd_name FROM `catalogue_detail` cd where cd.cd_id = m.mct_parent_cnt_type_id) as parent ,(SELECT cd.cd_name FROM `catalogue_detail` cd where cd.cd_id = m.mct_cnt_type_id) as child from icn_manage_content_type as m", function (err, result) {
                                if(err){
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                  }else{
                                    contentTypes = result;
                                    // connection_ikon_cms.release();
                                    
                                    if(req.body.ID != undefined){
                                         var query = connection_ikon_cms.query("SELECT mct_id,mct_cnt_type_id as child_id,mct_parent_cnt_type_id as parent_id ,(SELECT cd.cd_name FROM `catalogue_detail` cd where cd.cd_id = m.mct_parent_cnt_type_id) as parent_name, (SELECT cd.cd_name FROM `catalogue_detail` cd where cd.cd_id = m.mct_cnt_type_id ) as child_name from `icn_manage_content_type` as m where m.mct_id=?",[req.body.ID], function (err, result) {
                                          if(!err){
                                            if(result.length > 0){
                                                  //query to fetch delivery types for that content type:
                                                   var query = connection_ikon_cms.query("SELECT Group_concat(ms.cmd_entity_detail) as delivery_types FROM `multiselect_metadata_detail` ms, `icn_manage_content_type`  m where m.mct_delivery_type_id = ms.cmd_group_id and  m.mct_cnt_type_id = ms.cmd_entity_type and m.mct_id=?",[req.body.ID], function (err, res_delivery_type) {
                                                        if(err){
                                                          connection_ikon_cms.release();
                                                          res.status(500).json(err.message);
                                                        }else{
                                                           connection_ikon_cms.release();
                                                           res.send({parentType:parentTypes,deliveryType:deliveryTypes,contentType:contentTypes,c:result,d:res_delivery_type});
                                                        }
                                                   });
                                            }
                                          }else{
                                               connection_ikon_cms.release();
                                               res.render('account-login', { error: 'Error in database connection.' });
                                          }
                                      }); //query
                                    }else{
                                      connection_ikon_cms.release();
                                      res.send({parentType:parentTypes,deliveryType:deliveryTypes,contentType:contentTypes});
                                    } 
                            }
                          });
                        }
                    }); //query
                }
              });
             });
            }else{
              res.redirect('/accountlogin');
            }
          }else{
            res.redirect('/accountlogin');
          }
        }catch (error) {
          connection_ikon_cms.release();
          res.status(500).json(error.message);
    }
} // getTypes function.



exports.addContentType = function (req, res, next) {
  var new_content_type_id;
  var group_id;
	 try {
        if (req.session) {
            if (req.session.UserName) {
            	mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                                  
              var query = connection_ikon_cms.query("select max(cmd_group_id) as id from `multiselect_metadata_detail`", function (err, result) {
                                      if(!err){
                                        if(result.length > 0){
                                            group_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                        }
                                      }else{
                                        connection_ikon_cms.release();
                                        res.render('account-login', { error: 'Error in database connection.' });
                                      }
                                  }); //query

                    
                    var query = connection_ikon_cms.query("select max(cd_id) as id from `catalogue_detail`", function (err, result) {
                    	  if (err) {
                    	   connection_ikon_cms.release();
                 			   res.render('account-login', { error: 'Error in database connection.' });
               			  }else{
               			  	if(result.length > 0){
                          new_content_type_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                          var data = {
                            cd_id: new_content_type_id,
                            cd_cm_id: null,
                            cd_name: req.body.NewContentType,
                            cd_desc: null,
                            cd_desc1:null
                          }

                            //------------------------------------------------------------------------
                            //------------------------------------------------------------------------
                            //1. Inserting into catalogue detail :
                           var query = connection_ikon_cms.query('INSERT INTO `catalogue_detail` SET ?', data, function (err, result) {
                            if(err){
                                connection_ikon_cms.release();
                                res.render('account-login', { error: 'Error in database connection.' });
                             }else{
                                  //If successfully inserted into catalogue detail :
                                  connection_ikon_cms.release();
                                  console.log("inserted into catalogue_detail"); 

                                  //2. Inserting delivery type , multiselect
                                      //a) First selecting Max id from multiselect 
                                      // b) inserting into multiselect
                                  
                                   if (req.body.DeliveryTypes.length > 0) {
                                        var count = req.body.DeliveryTypes.length;
                                        var cnt = 0;
                                        loop(0);
                                        function loop(cnt) {
                                          var i = cnt;
                                          var query = connection_ikon_cms.query("select max(cmd_id) as id from `multiselect_metadata_detail`", function (err, row) {
                                                  if(err){ } else{
                                                            var data = {
                                                                 cmd_id: row[0].id != null ? parseInt(row[0].id + 1) : 1,
                                                                 cmd_group_id: group_id, // MAX + 1 group id from multselect selected above.
                                                                 cmd_entity_type: new_content_type_id, 
                                                                 cmd_entity_detail: req.body.DeliveryTypes[i]
                                                            }
                                                            var query = connection_ikon_cms.query('INSERT INTO `multiselect_metadata_detail` SET ?', data, function (err, result) {
                                                                if(err){ 
                                                                  connection_ikon_cms.release();
                                                                  res.render('account-login', { error: 'Error in database connection.' }); 
                                                                } else{
                                                                    cnt = cnt + 1;
                                                                    if (cnt == count) {
                                                                          //Insert into manage content type : 
                                                                          var query = connection_ikon_cms.query("select max(mct_id) as id from `icn_manage_content_type`", function (err, result) {
                                                                          if(err){}else{
                                                                          var data = {
                                                                                      mct_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                                                                      mct_parent_cnt_type_id: req.body.ParentContentTypeId,
                                                                                      mct_cnt_type_id: new_content_type_id,
                                                                                      mct_delivery_type_id: group_id
                                                                                     }
                                                                            var query = connection_ikon_cms.query('INSERT INTO `icn_manage_content_type` SET ?', data, function (err, result) {
                                                                            if(err){}else{
                                                                                          res.send({ success: true, message: 'New Content Type added successfully.' });
                                                                                      }
                                                                                    });
                                                                                                            
                                                                              }
                                                                          });
                                                                    }else{
                                                                      loop(cnt);
                                                                    }
                                                                }
                                                              });
                                                  } // If
                                            }); //Query

                                        }; // LOOP
                                    } //IF FOR
                                }
                             });//query
               			  		// connection_ikon_cms.release();
               			  		// res.send(result);
               			  	} //If
               			  }//else
                    }); //query 
                });
            }else {
           		 res.redirect('/accountlogin');
       		}
         }else {
                 res.redirect('/accountlogin');
        }
}catch (error) {
        console.log("ERROR");
  }
}


exports.updateContentType = function (req, res, next) {
   try {
        if (req.session) {
            if (req.session.UserName) {
              mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    //query to update new content type: 
                var query = connection_ikon_cms.query("UPDATE `catalogue_detail` SET cd_name = ? , cd_display_name = ? WHERE cd_id = (SELECT mct_cnt_type_id FROM `icn_manage_content_type` WHERE mct_id = ?)",[req.body.new_name, req.body.new_name,req.body.mct_id] ,function (err, result) {
                      if (err) {
                         connection_ikon_cms.release();
                         res.render('account-login', { error: 'Error in database connection.' });
                      }else{
                          res.send({ success: true, message: 'Content Type Updated!' });
                      }
                    }); //query 
                });
            }else {
               res.redirect('/accountlogin');
          }
         }else {
                 res.redirect('/accountlogin');
        }
  }catch (error) {
        console.log("ERROR");
  }
}