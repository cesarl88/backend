var mysql = require("mysql");
var dateFormat = require('dateformat');
var Guid = require('guid');
var models = require('./Model');
var User = models.User;
var UserLogin = models.UserLogin;
var UserContact = models.UserContact;
var Course = models.Course;
var Section = models.Section;
var Semester = models.Semester;
var Task = models.Task;
var TaskActivity= models.TaskActivity;
var Assignment= models.Assignment;
var Workflow= models.Workflow;
var WorkflowActivity= models.WorkflowActivity;
var ResetPasswordRequest = models.ResetPasswordRequest;


//var server = require('./Server.js');

//var User = server.app.get('models').User;



function REST_ROUTER(router,connection,md5) {
	var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    router.get("/",function(req,res){
        res.json({"Message" : "Hello, World!"});
   });

	//Christian Alexander - Issue 6
	//Get User's Courses
	router.get("/ModelTest/:userID",function(req, res){


		Workflow.findById(req.params.userID).then(function(Workflow){
			console.log("Workflow Found");

			Workflow.getWorkflowActivity().then(function(workflowActivity){
				console.log("WorkflowActivity Found "+ workflowActivity.Name);
			});

			Workflow.getAssignment().then(function(assignment){
				console.log("Assignment Found : "+ assignment.Title);
			});
		});

		WorkflowActivity.findById(req.params.userID).then(function(workflowActivity){
			console.log("WorkflowActivity Found "+ workflowActivity.Name);

			workflowActivity.getWorkflows().then(function(workflows){
				console.log("workflows Found ");
			});

		});

		Assignment.findById(req.params.userID).then(function(assignment){
			console.log("Assignment Found : "+ assignment.Title);

			assignment.getWorkflows().then(function(workflows){
				console.log("workflows Found ");
			});

		});

		Task.findById(req.params.userID).then(function(Task) {
			console.log("Semester name : "+ Task.TaskID);

			Task.getUser().then(function(User){
				console.log("Task User Name "+ User.FirstName);
			});
			Task.getTaskActivity().then(function(TaskActivity){
				console.log("TaskActivity Name "+ TaskActivity.Name);
			});

		});

		TaskActivity.findById(2).then(function(TaskActiviy) {
			console.log("TaskActiviy name : "+ TaskActiviy.Name);

			TaskActiviy.getTasks().then(function(Tasks){
				console.log("Found");
			});

		});

		Semester.findById(req.params.userID).then(function(Semester) {
			console.log("Semester name : "+ Semester.Name);

			Semester.getSections().then(function(Sections){
				console.log("Found");
			});

		});

		Section.findById(req.params.userID).then(function(Section) {
			console.log("Section name : "+ Section.Name);

			Section.getSemester().then(function(Semester){
				console.log("Semester Name : "+ Semester.Name);
				//res.status(200).end();
			});

			Section.getCourse().then(function(Course){
				console.log("Course Title : "+ Course.Title);
				//res.status(200).end();
			});
			Section.getSectionUsers().then(function(Users){
				console.log("Found");
				//res.status(200).end();
			});

		});

		UserLogin.findById(req.params.userID).then(function(user) {
			console.log("User Email : "+ user.Email);

		});

		Course.findById(req.params.userID).then(function(course) {
			console.log("User Course : "+ course.Title);

			course.getUser().then(function(Creator){
				console.log("Creator Name : "+ Creator.FirstName);
				//res.status(200).end();
			});

			course.getSections().then(function(sections){
				console.log('Sections Found');
			});
		});
		//Course.find
		User.findById(req.params.userID).then(function(user) {
			console.log("User name : "+ user.FirstName);
			var UserLog = user.getUserLogin().then(function(USerLogin){
				console.log("User Email : "+ USerLogin.Email);

			});
			user.getUserContact().then(function(USerLogin){
				console.log("User Email : "+ USerLogin.Email);
				res.status(200).end();			});
			//console.Log("Email " + UserLog.Email);
		});
	});

	//Hira - Issue 1
	//Login Function
    router.post("/login",function(req,res){
		var query = "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?";
		var table = ["UserID","UserLobin", "Email",req.body.emailaddress,"Password",md5(req.body.password)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				res.status(401).end();
			}else{
				if(rows.length > 0){
					res.json({"Error": false, "Message": "Success", 
						"UserID": rows[0].UserID});
				}else{
					res.status(401).end();
				}
			}
    	});
    });

	//Issue 2 - User Management
	//Updates Password
    router.put("/update/password",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
		var table = ["UserLogin","Password",md5(req.body.password),"UserID",req.body.userid,"Password",md5(req.body.oldpassword)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				console.log("/update/password : "+ err.message);
				res.status(401).end();
			}else{
				res.status(200).end();
			}
    	});
    });
    
    //Updates Email
    router.put("/update/email",function(req,res){
		var query = "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
		var table = ["UserLogin","Email",req.body.email,"UserID",req.body.userid,"Password",md5(req.body.password)];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				console.log("/update/email : "+ err.message);
				res.status(401).end();
			}else{
				res.json({"Error": false, "Message": "Success", 
					"EmailAddress": req.body.email});
			}
    	});
    });

    //Updates Name
    router.put("/update/name",function(req,res){
		var query = "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?";
		var table = ["User","FirstName",req.body.firstname,"LastName",req.body.lastname,"UserID",req.body.userid];
		query = mysql.format(query, table);
		connection.query(query,function(err,rows){
			if(err){
				console.log("/update/name : "+ err.message);

				res.status(401).end();
			}else{
				res.json({"Error": false, "Message": "Success", 
					"FirstName": req.body.firstname, "LastName": req.body.lastname});
			}
    	});
    });

	//Issue 3 - General User Endpoint
	router.get("/generalUser/:userid",function(req,res){
		//select u.FirstName, u.LastName, u.UserType, uc.Email from User as u inner join UserContact as uc on u.UserContactID = uc.UserContactID where UserID = 1;
		var query = "SELECT ??, ??, ??, ?? FROM ?? as ?? inner join ?? as ?? on ??=?? WHERE ?? = ?";
		var table = ["u.FirstName","u.LastName","u.UserType","uc.Email", "User","u","UserContact","uc","uc.UserContactID","u.UserContactID","UserID", req.params.userid];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				console.log("/generalUser : "+ err.message);
				res.status(401).end();
			} else {
					res.json({"Error" : false, "Message" : "Success", "User" : rows});
			}
		});
	});
	
	//Issue 4
	/**
	 * Create Semester
	 * Issue #4.1
	 * Cesar Salazar
	 */
	router.post("/CreateSemester",function(req,res){
		var query = "insert into Semester (Name, StartDate,EndDate) values(?,?,?)";

		//Formating Dates
		var startDate =  dateFormat(req.body.startDate, "yyyy-mm-dd");
		var endDate =  dateFormat(req.body.endDate, "yyyy-mm-dd");

		if(req.body.endDate == null	|| req.body.startDate == null)
		{
			console.log("/CreateSemester : Dates must be defined");
			res.status(400).end();
		}
		else if(startDate > endDate )
		{
			console.log("/CreateSemester : StartDate canot be grater than EndDate");
			res.status(400).end();
		}
		else
		{
			var table = [req.body.Name,startDate,endDate,req.body.OrganizationID];
			query = mysql.format(query, table);
			connection.query(query,function(err,response){
				if(err){
					console.log("/CreateSemester : "+ err.message);
					res.status(400).end();
				}else{
					console.log("/CreateSemester Succesfully");
					res.json({"SemesterID": response.insertId});
				}
			});

		}

	});

	//Christian Alexander - Issue 4.2
	//Get Semester Information
	router.get("/semester/:semesterid", function(req, res){
		var query = "select ??, ??, ??, ?? from ?? where ??=?";
		var table = ["SemesterID", "Name","StartDate", "EndDate","Semester",
					"SemesterID", req.params.semesterid];

		query = mysql.format(query, table);

		connection.query(query,function(err,rows){
			if(err){
				console.log("/semester/email : "+ err.message);

				res.status(400).end();	
			}else{
				res.json({"Error" : false, "Message" : "Success", "Course" : rows});
			}
		});
	});
	
	//Christian Alexander - Issue 4.3
	//Get All Semester Information
	router.get("/semester", function(req, res){
		var query = "select *  from ??";
		var table = ["Semester"];

		query = mysql.format(query, table);

		connection.query(query,function(err,rows){
			if(err){
				console.log("/semester : "+ err.message);

				res.status(400).end();	
			}else{
				res.json({"Error" : false, "Message" : "Success", "Semesters" : rows});
			}
		});
	});
	
	//Issue 5
	/**
	 * Spring 3
	 * Issue # 5.1
	 * Create Course
	 * Cesar Salazar
	 */
	router.post("/course/create",function(req,res){
		var query = "insert into ??(??,??,??) values(?,?,?)";
		var table = ["Course", "CreatorID", "Number","Title", 
					req.body.userid,req.body.number,req.body.title];

		if(req.body.userid == null)
		{
			console.log("course/create : UserID cannot be null");
			res.status(400).end();
			return;
		}
		if(req.body.title == null)
		{
			console.log("course/create : Title cannot be null");
			res.status(400).end();
			return;
		}

		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err){
				console.log("/course/create : "+ err.message);

				res.status(400).end();
			}else{
				getCreatedCourseID(function(result){
					res.json({"result":result});
				});	
			}
		});
	});

	function getCreatedCourseID(callback){
		var query = "SELECT LAST_INSERT_ID()";
		var table = [];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				res.status(400).end();
			} else {
				callback(rows);
			}
		});	
	}

	//Christian Alexander - Issue 5.2
	//Create Course Section
	router.post("/course/createsection",function(req,res){


		var query = "insert into ??(??,??,??,??) values(?,?,?,?)";
		var table = ["Section", "CourseID", "SemesterID","Name",
			"Description", req.body.courseid,req.body.semesterid,req.body.name,
			req.body.description];


		if(req.body.semesterid == null)
		{
			console.log("course/createsection : SemesterID cannot be null");
			res.status(400).end();
			return;
		}
		if(req.body.courseid == null)
		{
			console.log("course/createsection : CourseID cannot be null");
			res.status(400).end();
			return;
		}
		if(req.body.description == null)
		{
			console.log("course/createsection : Description cannot be null");
			res.status(400).end();
			return;
		}

		query = mysql.format(query, table);

		connection.query(query,function(err,response){
			if(err){
				console.log("/course/createsection : "+ err.message);

				res.status(401).end();
			}else{
				getCreatedCourseID(function(result){
					res.json({"result":result});
				});
			}
		});
	});
	
	//Christian Alexander - 5.3
	//Add Student to Section
	/*TO DO = GET CourseID, ADD IT TO TABLE */
	router.put("/course/adduser",function(req,res){

		if(req.body.email == null)
		{
			console.log("course/adduser : Email cannot be null");
			res.status(400).end();
			return;
		}

		if(req.body.sectionid == null || req.body.sectionid.length == 0)
		{
			console.log("course/adduser : SectionID cannot be empty");
			res.status(400).end();
			return;
		}



		var query = "select ??,??  from ??  as ul inner join ?? as u on ul.UserID = u.UserID where ??=?";
		var table = ["u.UserID","u.UserType", "UserLogin","User", "ul.Email", req.body.email];
		query = mysql.format(query, table);
		connection.query(query,function(err,response){
			if(err)
			{
				console.log("/course/adduser : "+ err.message);
				res.status(401).end();
			}
			else
			{
				if(response.length > 0)
				{
					addUserToSection(response[0].UserID,response[0].UserType,"Active",
						req.body.sectionid, function(result) {
							res.json({"Error": false, "Message": "Success", "UserID": response[0].UserID});
						});
				}else
				{
					res.json({"Error" : true, "Message" : "UserID Not Found"});
				}
			}
		});
	});

	/**
	 * Check because User is being added multiple times to the section
	 * @param UserID
	 * @param UserRole
	 * @param UserStatus
	 * @param SectionID
     * @param callback
     */
	function addUserToSection(UserID, UserRole , UserStatus, SectionID, callback)
	{
		var query = "INSERT INTO ??(??,??,??,??) Values(?,?,?,?)";
		var table = ["SectionUser","UserID","UserRole","UserStatus","SectionID",
			UserID, UserRole, UserStatus, SectionID];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				console.log("Method addUserToSection : "+ err.message);

				res.status(401).end();
			} else {
				callback(UserID);
			}
		});
	}
	/**
	 * getCourse
	 * Issue # 5.4
	 * Cesar Salazar
	 */
	router.get("/course/:courseId",function(req,res){
		var query = "SELECT ??, ?? FROM ?? Where ??=?";
		var table = ["Number","Title","Course","CourseID",req.params.courseId];
		query = mysql.format(query,table);
		connection.query(query,function(err,result){
			if(err) {
				console.log("/course : "+ err.message);
				res.status(400).end();
			} else {
				res.json({"Error" : false, "Message" : "Success", "Course" : result});
			}
		});

	});


	/**
	 * getCourseSection
	 * Issue # 5.5
	 * Cesar Salazar
	 */
	router.get("/course/getsection/:sectionId",function(req,res){
		var query = "SELECT ??, ?? FROM ?? where ?? = ?";
		var table = ["Name","Description","Section","SectionID",req.params.sectionId];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				console.log("/course/getsection/ : "+ err.message);
				res.status(400).end();
			} else {
				getSectionUsers(req.params.sectionId,function(result){
					res.json({"result":rows,"Section" : result});
				});
			}
		});

	});

	/**
	 * Get list of users for the given section.
	 * @param SectionID
	 * @param callback
     */
	function getSectionUsers(SectionID,callback)
	{
		var query = "SELECT ??, ?? FROM ?? where ?? = ?";
		var table = ["UserID","UserRole","SectionUser","SectionID",SectionID];
		query = mysql.format(query,table);

		connection.query(query,function(err,rows){
			if(err) {
				console.log("Method getSectionUsers : "+ err.message);

				res.status(401).end();
			} else {
				callback(rows);
			}
		});
	}

	/**
	 * UpdateCourse
	 * Issue # 5.6
	 * Cesar Salazar

	 course ID
	 course name
	 course number
	 course creator id
	 */
	router.put("/course/update",function(req,res){
		var query = "update ?? set ??=?, ??=? where ?? = ?";
		var table = ["Course","Title",req.body.Title,"Number",req.body.Number,"CourseID",req.body.CourseID];

		if(req.body.title == null)
		{
			console.log("course/create : Title cannot be null");
			res.status(400).end();
			return;
		}

		if(req.body.CourseID == null)
		{
			console.log("course/create : CourseID cannot be null");
			res.status(400).end();
			return;
		}


		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				console.log("/course/update : "+ err.message);

				res.status(400).end();
			} else {
				res.status(200).end();
			}
		});

	});
	
	//Christian Alexander - Issue 5.7
	//Update a Course Section
	router.put("/course/updatesection",function(req,res){
		var query = "update ?? set ??=?, ??=? where ??=? and ?? = ?";
		var table = ["Section", "Name", req.body.name, "Description",
			req.body.description, "SectionID", req.body.sectionid,
			"SemesterID", req.body.semesterid];

		if(req.body.semesterid == null)
		{
			console.log("course/updatesection : SemesterID cannot be null");
			res.status(400).end();
			return;
		}
		if(req.body.courseid == null)
		{
			console.log("course/updatesection : CourseID cannot be null");
			res.status(400).end();
			return;
		}
		if(req.body.description == null)
		{
			console.log("course/updatesection : Description cannot be null");
			res.status(400).end();
			return;
		}

		if(req.body.sectionid == null)
		{
			console.log("course/updatesection : sectionid cannot be null");
			res.status(400).end();
			return;
		}

		query = mysql.format(query, table);
		connection.query(query, function(err,rows){
			if(err){
				console.log("/course/updatesection : "+ err.message);

				res.status(401).end();
			}else{
				res.status(200).end();
			}
		});
	});
	/**
	 * Delete User from Section
	 * Issue # 5.8
	 * Cesar Salazar

	 UserID
	 SectionID
	 */
	router.delete("/course/deleteuser",function(req,res){
		var query = "delete from ?? where ?? = ? and ?? = ?";
		var table = ["SectionUser","UserID",req.body.userID, "SectionID",req.body.SectionID];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows){
			if(err) {
				console.log("/course/deleteuser : "+ err.message);

				res.status(400).end()
			} else {
				res.status(200).end()
			}
		});

	});

	//Christian Alexander - Issue 6
	//Get User's Courses
	router.get("/course/getCourses/:userid",function(req, res){

		var query = "select ??, ?? from ?? as su inner join Section as s on s.SectionID = su.SectionID where ??=?";
		var table = ["s.CourseID", "s.SectionID", "SectionUser", "su.UserID", req.params.userid];
		query = mysql.format(query, table);
		connection.query(query, function(err,rows){
			if(err){ 
				res.status(401).end();
			}else{
				if(rows.length > 0){
					res.json({"Error" : false, "Message" : "Success", "Result" : rows});
				}else{
					res.json({"Error" : true, "Message" : "User Has No Courses"});
				}
			}
		});
	});


	/**
	 * Create reset password hash
	 * Issue # 8.1
	 * Cesar Salazar

	 */

	router.post("/resetPassword",function(req,res){

		if(req.body.email == null)
		{
			console.log("/resetPassword : Email not sent");
			req.status(401).end();
			return;
		}

		var guid = Guid.create();

		UserLogin.find({ where: { Email : req.body.email}}).then(function(userlogin){
			if(userlogin == null)
			{
				console.log("/resetPassword : Email does not exist");
				res.status(401).end();
			}
			else
			{
				User.find( { where : {UserID : userlogin.UserID }}).then(function(user){


					user.getResetPasswordRequest().then(function(PasswordRequest){

						Guid.isGuid(guid);
						var value = guid.value;
						if(PasswordRequest != null)
						{
							ResetPasswordRequest.update( { RequestHash : value }, { where : { UserID : PasswordRequest.UserID }} ).then(function(){
								console.log("/resetPassword : Record updated ");
								res.status(200).end();
							});
						}
						else
						{
							var newRequest = ResetPasswordRequest.build({ UserID :  user.UserID, RequestHash : value});

							newRequest.save().then(function()
							{
								console.log("/resetPassword : Record created ");
								res.status(200).end();
							}).catch(function(error) {
								// Ooops, do some error-handling
								console.log("/resetPassword : Error while inserting " + error.message);
								res.status(401).end();
							});

						}
					});
				});
			}
		});

	});

	/**
	 * Create reset password hash
	 * Issue # 8.3
	 * Cesar Salazar

	 */
	router.get("/getPasswordResetRequest",function(req, res){
		var query = "select ?? from ?? where ??=?";
		var table = ["UserID", "ResetPasswordRequest", "RequestHash", req.query.PasswordHash];
		query = mysql.format(query, table);
		connection.query(query, function(err,result){
			if(err){
				console.log("/getPasswordResetRequest : " + err.message);
				res.status(404).end();
			}else{
				if(result.length > 0){
					console.log("/getPasswordResetRequest : Request found");
					res.json({"Error" : false, "Message" : "Success", "UserID" : result});
				}else{
					console.log("/getPasswordReset : Request not found");
					res.json({"Error" : true, "Message" : "Request Password not found"});
				}
			}
		});
	});

	router.post("/resetUserPassword",function(req,res){

		if(req.body.HashRequest == null)
		{
			console.log("/resetPassword : HashRequest not sent");
			req.status(401).end();
			return;
		}

		if(req.body.newPassword == null)
		{
			console.log("/resetPassword : newPassword not sent");
			req.status(401).end();
			return;
		}

		//User.find( { where : {UserID : userlogin.UserID }}).then(function(user)
		ResetPasswordRequest.find( { where : { RequestHash :  req.body.HashRequest}}).then(function(request){

			if(request == null)
			{
				console.log("/resetPassword : HashRequest does not exist");
				res.status(401).end();
			}
			else{
				UserLogin.update( { Password : md5(req.body.newPassword) }, { where : { UserID : request.UserID }} ).then(function(){
					request.destroy();
					console.log("/resetPassword : Password updated");
					res.status(200).end();
				});
			}
		});
	});
		/*var query = "CALL ??(?,?)"
		var table = ["sp_Reset_Password",req.body.HashRequest,req.body.newPassword];
		query = mysql.format(query, table);
		connection.query(query, function(err,result){
			if(err){
				console.log("/resetPassword : "+ err.message);
				res.status(401).end();
			}else {

				var response = result[0][0].result;
				if (response == -1) {
					console.log("/resetPassword : HashRequest does not exist");
					res.status(401).end();

				}
				else if (response == 1) {
					console.log("/resetPassword : Password updated");
					res.status(200).end();

				}
			}
		});
	});*/

	/**
	 * Get List of courses created by the given instructor ID
	 * Issue # 15
	 * Cesar Salazar

	 */
	router.get("/getCourseCreated/:instructorID",function(req, res){



		Course.findAll({where: {CreatorID: req.params.instructorID}}).then(function (Courses) {

			console.log("/getCourseCreated/ Courses found");
			res.json({"Error": true, "Courses": Courses});


		});
	});

}

module.exports = REST_ROUTER;
