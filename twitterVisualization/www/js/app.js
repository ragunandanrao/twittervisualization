// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

//.run(function($ionicPlatform) {
//  $ionicPlatform.ready(function() {
//    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
//    // for form inputs)
//    if(window.cordova && window.cordova.plugins.Keyboard) {
//      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//    }
//    if(window.StatusBar) {
//      StatusBar.styleDefault();
//    }
//  })
//  
//})

app.config(function($stateProvider,$urlRouterProvider)
        {
    $stateProvider
    .state('home',{
      url :'/home',
        cache:false,
        templateUrl:'templates/visualization.html',
        controller:'visualizationCntrl'
    })
    $urlRouterProvider.otherwise('/home');
})

app.controller('visualizationCntrl',function($scope,$http,$ionicLoading,$state){
    $scope.selectedQuery ={
        value:''
    }
    $scope.init = function()
    {
  document.getElementById('map').classList.add('hide') ;
        document.getElementById('div_plot').classList.add('hide');
        document.getElementById('div_imageAnalysis').innerHTML ='';
         document.getElementById('div_imageAnalysis').classList.add('hide');
    }
    $scope.showPlot = function()
    {
     $scope.init();
        var query = getQueryValueForSelectedOption($scope.selectedQuery.value);
        if(query!=undefined && query!=null && query!=""){

            var url ="https://api.mongolab.com/api/1/databases/twitteranalytics/collections/";
        $ionicLoading.show({
      template: 'Please wait while we analyze your data...'
    });
        var handle = $http.get(url+query + "?apiKey=1iwTCrjgXRLz-tbL9nznRtZRB5K9p_Zs");
        handle.success(function(result){
            generatePlot(result,query);
          //   $ionicLoading.hide();
        })
        handle.error(function(result)
        {
        alert("There was some error");
            $ionicLoading.hide();
        })
        }
    }
 function generatePlot(sample,query)
{
 if(query=='sourceAnalysis') 
     {
         
         showPlotForSource(sample);
     }
    if(query=='geoAnalysis')
        {
            showPlotForGeoAnalysis(sample);
        }
    if(query=='imageAnalysis')
        {
            showPlotForUserImage(sample);
        }
    if(query == 'timeZoneAnalysis')
        {
            showPlotForTimeZoneAnalysis(sample);
        }
    }
    
    function getQueryValueForSelectedOption(selectedOption)
    {
        var queryToBeSent ="";
    if(selectedOption == "Primary sources of Twitter data")
        {
            queryToBeSent = "sourceAnalysis";
        }
        else if(selectedOption == "Origin of Tweets")
        {
            queryToBeSent = "geoAnalysis";
        }   
        else if(selectedOption == "Most followed user")
        {
            queryToBeSent = "imageAnalysis";
        }
        else if(selectedOption =='Most active time zone')
            {
                queryToBeSent = "timeZoneAnalysis";
            }
        return queryToBeSent;

    }
    function showPlotForSource(data)
    {
        var sourceArray = new Array();
var countArray =new Array();
for(var i=0;i<data.length;i++)
{
    sourceArray[i]=data[i].source.split('>')[1].split('<')[0];
    countArray [i]= parseInt(data[i].total_count);
}
var plotData =[ {
    title:'Sources for twitter data',  
    labels: sourceArray,//['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00'],
    values: countArray, //[1, 3, 6],
    hoverinfo: 'label'+"tweets",
    hole: .4,
type: 'pie'
  }];
        var layout = {
  title:'Primary generators of Tweets in English.',
            height:500,
            width:500
  
};
  document.getElementById('div_plot').classList.remove('hide') ;
Plotly.newPlot('div_plot', plotData,layout);
         $ionicLoading.hide();

    }
    function showPlotForGeoAnalysis(data)
    {
        var mapOptions = {
            zoom: 3,
            center:new google.maps.LatLng(20,-10),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
       document.getElementById('map').classList.remove('hide') ;
        
        if(data!=null && data.length>0)
            {
                for(var i=0;i<data.length;i++)
                    {
                        var tweet = {};
                        tweet.title = data[i].name;
                        tweet.lat = data[i].coordinates.coordinates[1];
                        tweet.long = data[i].coordinates.coordinates[0];
                        tweet.text =data[i].text.toString().substr(0,50);
                        tweet.image = data[i].userimage;
                        createMarker(tweet);
                    }
            }
        $ionicLoading.hide();
    }

      $scope.markers = [];
    var infoWindow = new google.maps.InfoWindow();
    var image = 'img/twitter_icon.png';
      function createMarker(tweetInfo){

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(tweetInfo.lat, tweetInfo.long),
            title: tweetInfo.title,
            icon:image

        });
       marker.content = tweetInfo.text;

        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h6>' + marker.title + '</h6><img src="'+ tweetInfo.image+'"/> <p>'+marker.content + '<p><br />');
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);
    }  
    function showPlotForUserImage(data)
    {
        var followedUserDetails;
        if(data!=null && data.length>0){
            if(data[0]!=null)
                {
                    followedUserDetails = data[0];
                }
        }
        if(followedUserDetails!=null){
        var imageAnalysisUrl ="https://gateway-a.watsonplatform.net/calls/url/URLGetRankedImageFaceTags?apikey=fa32175cfac22d812887f2db9ab547bf16528e64&url=";
            
        var handle = $http.get(imageAnalysisUrl+followedUserDetails.userimage+'&outputMode=json');
        
        handle.success(function(result){
            showDetails(result,followedUserDetails);
             $ionicLoading.hide();
        })
        handle.error(function(result)
        {
        alert("There was some error");
            $ionicLoading.hide();
        })  
        }
    }
    function showDetails(data, userDetails)
    {
        var imageAnalysisDetails ={};
        if(data!=null && data.imageFaces!=null && data.imageFaces.length>0)
            {
               imageAnalysisDetails.userAgeRange =  data.imageFaces[0].age.ageRange;
                imageAnalysisDetails.userGender = data.imageFaces[0].gender.gender;
                
                if(data.imageFaces[0].identity!=undefined && data.imageFaces[0].identity!=null)
                    {
                        if(data.imageFaces[0].identity.disambiguated!=undefined && data.imageFaces[0].identity.disambiguated!=null && data.imageFaces[0].identity.disambiguated.subType!=undefined && data.imageFaces[0].identity.disambiguated.subType!=null)
                            {
                                imageAnalysisDetails.userRoles = data.imageFaces[0].identity.disambiguated.subType;
                            }
                        imageAnalysisDetails.userName = data.imageFaces[0].identity.name;
                    }
                else{
                   imageAnalysisDetails.userName = userDetails.username;
                }
                imageAnalysisDetails.userImageURL = userDetails.userimage;
                
            }
        if(imageAnalysisDetails!=null)
            {
                var htmlStringToBeCreated = '<div class="row"><div class="col"><h3>User name : '+imageAnalysisDetails.userName+'</h3><p>Gender : ' + imageAnalysisDetails.userGender + '</p><p> Age range : ' + imageAnalysisDetails.userAgeRange + '</p>';
                if(imageAnalysisDetails.userRoles!=undefined && imageAnalysisDetails.userRoles!=null)
                    {
                        htmlStringToBeCreated+='<p> The user has the following characteristics :</p>'
                        var rolesCnt =1;
                        for(var ind =0;ind<imageAnalysisDetails.userRoles.length;ind++)
                            {
                                htmlStringToBeCreated+='<p>' + rolesCnt++ + ') ' +imageAnalysisDetails.userRoles[ind] + '</p>'; 
                            }
                    }
                
                  htmlStringToBeCreated+='</div><div class="col"><iframe style="height:400px" src='+  imageAnalysisDetails.userImageURL   +'></iframe></div></div>';
               
                document.getElementById('div_imageAnalysis').innerHTML=htmlStringToBeCreated;
                document.getElementById('div_imageAnalysis').classList.remove('hide');
                
            }
    }
    function showPlotForTimeZoneAnalysis(data)
    {
        var timeZoneArray = new Array();
        var tweetCountArray = new Array();
        if(data!=null && data.length>0)
            {
               for(var ind=0;ind<data.length;ind++){
                timeZoneArray[timeZoneArray.length] = data[ind].timezone;
                tweetCountArray[tweetCountArray.length]=data[ind].total_count;   
               }
            }
        var trace1 = {
  x: timeZoneArray,
  y: tweetCountArray,
  mode: 'markers',
  marker: {
    color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)',  'rgb(44, 160, 101)', 'rgb(255, 65, 54)', 'rgb(63, 17, 69)'],
    opacity: [1, 0.8, 0.6, 0.4,0.3],
    size: [100, 80, 60, 40,20]
  }
};
        var plotInfo = [trace1];

var plotLayout = {
  title: 'Most active time zones for '+ data[0].postedtime,
  showlegend: false,
  height: 500,
  width: 700
};

Plotly.newPlot('div_plot', plotInfo, plotLayout);
        document.getElementById('div_plot').classList.remove('hide');
 $ionicLoading.hide();
    }
})

