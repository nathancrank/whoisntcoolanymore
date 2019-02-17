const Twitter = require( 'twitter' );
const mongoose = require( 'mongoose' );
const sgMail = require( '@sendgrid/mail' );

sgMail.setApiKey( process.env.SENDGRID_API_KEY );

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
} );

const config = {
	screen_name: process.env.SCREEN_NAME,
	email: process.env.EMAIL,
	mongodb_uri: process.env.MONGODB_URI,
	local_string: process.env.LOCAL_STRING
};

const followerListSchema = new mongoose.Schema({
  dateAdded: Date,
  followers: [ String ]
} );
const FollowerList = mongoose.model( 'FollowerLists', followerListSchema );



init();



// https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript/12518666#12518666
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

function init() {
	connectToMongo();
}

function connectToMongo() {
	console.log( 'Connecting to MongoDB' );
	mongoose.connect( config.mongodb_uri, { useNewUrlParser: true }, ( error, response ) => {
		if ( error ) {
			console.error( 'ERROR connecting to: ' + config.mongodb_uri + '. ' + error );
		} else {
			console.log( 'Succeeded connecting to: ' + config.mongodb_uri );
			getFollowers();
		}
	} );
}

function getFollowers() {
	console.log( 'Getting current followers list ...' );
	client.get(
		'followers/ids',
		{
			screen_name: config.screen_name,
			stringify_ids: true
		},
		( error, followers, response ) => {
		  if ( !error ) {
				storeFollowers( followers );
		  } else {
		  	console.error( 'Failed to get current followers list:', error );
		  	endProcess();
		  }
		}
	);
}

function storeFollowers( followers ) {
	console.log( 'Saving latest followers list ...' );
	let newestList = new FollowerList({
		dateAdded: Date.now(),
		followers: followers.ids
	});
	newestList.save( ( error ) => {
		if ( error ) {
			console.error( 'Error saving followers list to Mongo.', error );
			endProcess();
		} else {
			console.log( 'Follower list saved.' );
			compareLastTwoFollowersLists( followers.ids );
		}
	} );
}

function compareLastTwoFollowersLists( currentFollowers ) {
	console.log( 'Getting last followers list ...' );
	let previousFollowers = [];
	FollowerList.find().exec( ( error, results ) => {
		results.sort( compareDates );
		if ( results[1] ) {
			previousFollowers = results[1].followers;
		} else {
			console.log( 'No previous records to compare ...' );
			process.exit();
		}
		console.log( 'Comparing lists ...' );
		let unfollowers = previousFollowers.diff( currentFollowers );
		let newFollowers = currentFollowers.diff( previousFollowers );
		console.log( 'Unfollowed by ' + unfollowers.length + ' uncool accounts.' );
		console.log( 'Followed by ' + newFollowers.length + ' new cool accounts.' );
		buildSummary( unfollowers, newFollowers );
	} );
}

function compareDates(a,b) {
  if (a.dateAdded > b.dateAdded)
    return -1;
  if (a.dateAdded < b.dateAdded)
    return 1;
  return 0;
}

function buildSummary( unfollowers, newFollowers ) {
	console.log( 'Building Summary Email ...' );
	console.log( 'Getting full profiles ...' );
	let combinedList = unfollowers.concat( newFollowers );
	if ( combinedList.length > 0 ) {
		let profiles = [];
		client.get(
			'users/lookup',
			{ user_id: combinedList.join(',') },
			( error, profiles, response ) => {
			  if ( !error ) {
					sendMail( profiles, unfollowers, newFollowers ); 	
			  } else {
			  	console.error( 'Error looking up user profiles: ', error );
			  	endProcess();
			  }
			}
		);
	} else {
		console.log( 'No changes today, not sending summary email.' );
		endProcess();
	}
}

function sendMail( profiles, unfollowers, newFollowers ) {
	let options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};
	let today  = new Date().toLocaleDateString( config.local_string, options );

	let htmlMessage =
		'<h1>Follower Update</h1>'
		+ '<h2>' + today + '</h2>'
		+ '<h3>No Longer Cool</h3>'
		+ '<ul>';
	let textMessage =
		'# Follower Update\n'
		+ '## ' + today + '\n'
		+ '### No Longer Cool\n'

	if ( unfollowers > 0 ) {
		for ( let unfollower of unfollowers ) {
			let profile = profiles.find( o => o.id_str == unfollower );
			console.log(profile)
			htmlMessage = htmlMessage
				+ '<li>'
				+ profile.name
				+ ' (' + profile.screen_name + ')'
				+ '</li>';
			textMessage = textMessage
				+ '- ' + profile.name
				+ ' (' + profile.screen_name + ')\n';
		}
	} else {
		htmlMessage = htmlMessage
			+ '<li>No uncool folks today!</li>';
		textMessage = textMessage
			+ '- No uncool folks today!\n';
	}

	htmlMessage = htmlMessage
		+ '</ul>'
		+ '<h3>New Cool Folks</h3>'
		+ '<ul>';
	textMessage = textMessage
		+ '### New Cool Folks\n'

	if ( newFollowers > 0 ) {
		for ( let follower of newFollowers ) {
			let profile = profiles.find( o => o.id_str == follower );
			htmlMessage = htmlMessage
				+ '<li>'
				+ profile.name
				+ ' (' + profile.screen_name + ')'
				+ '</li>';
			textMessage = textMessage
				+ '- ' + profile.name
				+ ' (' + profile.screen_name + ')\n';
		}
	} else {
		htmlMessage = htmlMessage
			+ '<li>No new cool folks today.</li>';
		textMessage = textMessage
			+ '- No new cool folks today.\n';
	}

	htmlMessage = htmlMessage
		+ '</ul>'
		+ '<p>Email sent by whoisntcoolanymore. To unsubscribe, turn off your server, you set this up.</p>';

	textMessage = textMessage
		+ 'Email sent by whoisntcoolanymore. To unsubscribe, turn off your server, you set this up.'

	const message = {
	  to: config.email,
	  from: config.email,
	  subject: 'Your follower update for ' + today,
	  text: textMessage,
	  html: htmlMessage
	};
	console.log( 'Sending Message!' );
	sgMail.send( message );
	setTimeout( () => {
		endProcess();
	}, 10000 );
}

function endProcess() {
	mongoose.disconnect()
	process.exit();
}