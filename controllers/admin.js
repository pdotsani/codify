angular.module('myApp.admin', ['ngRoute','ui.bootstrap'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/admin', {
    templateUrl: 'views/admin.html',
    controller: 'AdminCtrl'
  });
}])

.controller('AdminCtrl', ['$scope','$filter', '$http', '$window','filterFilter', '$timeout', function($scope, $filter, $http, $window, filterFilter, $timeout) {

	//get current user to determine if admin
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    console.log(user.email)
	  } else {
	    console.log("nope")
	  }
	$timeout(function(){
  	//if user email is mine then you're the admin
	  if(user.email === 'brianjenney83@gmail.com' || user.email === 'mattbrody@codify.com' || user.email === 'isaac@codfiyacademy.com' || user.email === 'Philipp.schulte@ymail.com'){
	  		$scope.isAdmin = true;
	  	}else{
	  		$scope.isAdmin = false;
  		}
  		console.log(user.email)
	  	console.log($scope.isAdmin);
	  })
	})

	//initialize search object
	$scope.search = {};
	//initialize array for dropdown of mentors
	$scope.mentors = ['Isaac','Brian','Chris','Phillip']
	//initialize array to store student object
	$scope.studentArray = [];
	//retrieve firebase data for students
	firebase.database().ref('student/').once('value').then(function(snapshot){
			//console.log(snapshot.val())
			$scope.students = snapshot.val();
			//get object from id key of student
			angular.forEach($scope.students, function(value, key){
			$scope.student = value;
			$scope.$apply(function(){
			$scope.studentArray.push(value);

			//function to get week completion rate
			function getCompleteRate(week){
				if(week == null || week == 'undefined'){
					return 0
				}else{
					var count = 0;
					for(var key in week){
						//don't count bonus projects in the overall percentage 
						if(week[key]==true && key.toUpperCase().indexOf('BONUS') < 0){
							count++
						}
					}
					return count/Object.keys(week).length
				}
			}

			//get week assignment info
			for(x=0; x<$scope.studentArray.length; x++){

				//get percentage of week for each student
				$scope.studentArray[x].week1CompleteRate = getCompleteRate($scope.studentArray[x].chapter1)
					
				$scope.studentArray[x].week2CompleteRate = getCompleteRate($scope.studentArray[x].chapter2)

				$scope.studentArray[x].week3CompleteRate = getCompleteRate($scope.studentArray[x].week3)
				
				$scope.studentArray[x].week4CompleteRate = getCompleteRate($scope.studentArray[x].week4)

				$scope.studentArray[x].week5CompleteRate = getCompleteRate($scope.studentArray[x].week5)	
				}
			})
		})
	})

	$scope.showWeek = function(week){
		console.log(week);
		$scope.weekDetails = week;
	}

	//retrieve student info
	$scope.getStudentInfo = function(student){
		console.log(student);
		$scope.phoneNbr = parseInt(student.phone);
		$scope.email = student.email;
		$scope.studentName = student.name;	
		$scope.mentorEmail = student.mentorEmail;
	}

	//send text message to student
	$scope.sendText = function(message){
		$http.get('http://localhost:3000/sendtext?to=' + $scope.phoneNbr + '&message=' + message)
		 $("[data-dismiss=modal]").trigger({ type: "click" });
		 $scope.message = "";

	}

	//send email to student
	$scope.sendMail = function(message){
		$http.get('http://localhost:3000/sendmail?to=' + $scope.email + '&message=' + message + '&from=' + $scope.mentorEmail)
		$("[data-dismiss=modal]").trigger({ type: "click" });
		$scope.message = "";
	}


	//send all students in class an email
	$scope.sendClassEmail = function(message){
		console.log($scope.filteredStudents);
		for(x=0; x<$scope.filteredStudents.length; x++){
			//check if email exists
			if(typeof $scope.filteredStudents[x].email !== 'undefined'){
				$http.get('http://localhost:3000/sendmail?to=' + $scope.filteredStudents[x].email + '&message=' + message + '&from=' + $scope.filteredStudents[x].mentorEmail)
				$("[data-dismiss=modal]").trigger({ type: "click" });
			}
		}
		//set message back to null
		$scope.message = "";
	}

	//send all students in class a twilio text message
	$scope.sendClassSMS = function(message){

		for(x=0; x<$scope.filteredStudents.length; x++){
			//check if email exists
			if(typeof $scope.filteredStudents[x].phone !== 'undefined'){
				$http.get('http://localhost:3000/sendtext?to=' + $scope.filteredStudents[x].phone + '&message=' + message)
				 $("[data-dismiss=modal]").trigger({ type: "click" });
				 $scope.message = "";
			}
		}
		//set message back to null
		$scope.message = "";

	}

	//return to home page
	$scope.exit = function(){
		$window.location.href=("/#/home")
	}

 }])

.filter("removeDups", function(){
  return function(data) {
    if(angular.isArray(data)) {
      var result = [];
      var key = {};
      for(var i=0; i<data.length; i++) {
        var val = data[i];
        if(angular.isUndefined(key[val])) {
          key[val] = val;
          result.push(val);
        }
      }
      if(result.length > 0) {
        return result;
      }
    }
    return data;
  }  

})

.filter('convertbool', ['$filter', function ($filter) {
  return function (bool) {
  	if(bool==true){
  		bool = "Done";
  	}else if(typeof bool == 'undefined' || bool == null || bool == ""){
  		bool = "Not done";
  	}else{
  		bool = bool;
  	}
    return bool;
  };
}])


.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
  	if(input==null){
  		input=0;
  	}
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);






