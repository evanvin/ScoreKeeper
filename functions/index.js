'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');


var teams = new Map();
var limit = 0;



// a. the action name from the make_name API.AI intent
const ADD_TEAM_ACTION = 'add_team';
const REMOVE_TEAM_ACTION = 'remove_team';
const ADD_POINTS_ACTION = 'add_points';
const SUBTRACT_POINTS_ACTION = 'subtract_points';
const CURRENT_SCORE_ACTION = 'current_score';
const RESET_SCORE_ACTION = 'reset_score';
const RESET_ALL_ACTION = 'reset_all';
const SET_SCORE_LIMIT_ACTION = 'set_score_limit';
// b. the parameters that are parsed from the make_name intent 
const ADD_TEAM_ARGUMENT = 'team-name';
const POINTS_ARGUMENT = 'points';
const TEAM_NAME_ARGUMENT = 'team-name';
const SCORE_LIMIT_ARGUMENT = 'limit';


exports.sillyNameMaker = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


  function addTeam (app) {
    let teamName = app.getArgument(TEAM_NAME_ARGUMENT);
    teams.set(teamName, 0);
    app.tell('Alright, I have added ' + teamName + ' to the competition.');
  }

  function removeTeam (app) {
    let teamName = app.getArgument(TEAM_NAME_ARGUMENT);
    teams.delete(teamName);
    app.tell('Alright, I have removed ' +
      teamName + ' from the competition.');
  }

  function addPoints (app) {
    let points = app.getArgument(POINTS_ARGUMENT);
    let teamName = app.getArgument(TEAM_NAME_ARGUMENT);
    teams.set(teamName, teams.get(teamName)+points);

    if(teams.get(teamName) >= limit){
    	//Add an mp3 file hear
    	app.tell('Yay, ' + teamName + ' won!');
    }
    else{
    	app.tell('Alright, ' + points + ' points have been added to ' + teamName + '!');
    }
  }

  function subtractPoints (app) {
    let points = app.getArgument(POINTS_ARGUMENT);
    let teamName = app.getArgument(TEAM_NAME_ARGUMENT);
    teams.set(teamName, teams.get(teamName)-points);
    app.tell('Alright, ' +
      points + ' points have been subtracted from ' + teamName +
      '!');
  }

  function currentScore (app) {
    var output = "";

    teams.forEach(function(item, key, mapObj){
    	output += key + " has " + item + " points.";
    });


    app.tell('Here\'s the score. ' + output);
  }

  function resetScore (app) {
    teams.forEach(function(item, key, mapObj){
    	teams.set(key, 0);
    });
    app.tell('The score for each team has been reset.');
  }

  function resetAll (app) {
  	teams = new Map();
  	limit = 0;
    app.tell('The game has been reset.');
  }

  function setScoreLimit (app) {
  	limit = app.getArgument(SCORE_LIMIT_ARGUMENT);
    app.tell('The score limit has been set to ' + limit);
  }


  let actionMap = new Map();
  actionMap.set(ADD_TEAM_ACTION, addTeam);
  actionMap.set(REMOVE_TEAM_ACTION, removeTeam);
  actionMap.set(ADD_POINTS_ACTION, addPoints);
  actionMap.set(SUBTRACT_POINTS_ACTION, subtractPoints);
  actionMap.set(CURRENT_SCORE_ACTION, currentScore);
  actionMap.set(RESET_SCORE_ACTION, resetScore);
  actionMap.set(RESET_ALL_ACTION, resetAll);
  actionMap.set(SET_SCORE_LIMIT_ACTION, setScoreLimit);


app.handleRequest(actionMap);
});