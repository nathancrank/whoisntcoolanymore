const Twitter = require('twitter');
const moment = require('moment');


const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const config = {
	screen_name: process.env.SCREEN_NAME
};



getUsers();




// get followers
// store followers in db
// trim older than 20 records
// get last follower list
// if previous followers db record
	// compare
	// send changes



function getFollowers() {
	console.log( 'Getting current followers list' );
	client.get(
		'followers/ids',
		{ screen_name: config.screen_name },
		( error, followers, response ) => {
			console.log(followers)
		  if ( !error ) {
		    
		  }
		}
	);
}

function storeFollowersList() {

}

function trimFollowersDB() {

}

function compareLastTwoFollowersList() {

}

function sendMail() {

}
