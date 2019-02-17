# whoisntcoolanymore

whoisntcoolanymore emails you a daily summary of your follower changes.

## Twitter Dev Account

You will need to sign up for a Twitter Dev account and create an app. After creating the app, you will need to generate keys for the app in order to use whoisntcoolanymore.

## Config
Use process env variables to set the following values:

- `process.env.CONSUMER_KEY`
- `process.env.CONSUMER_SECRET`
- `process.env.ACCESS_TOKEN_KEY`
- `process.env.ACCESS_TOKEN_SECRET`
- `process.env.SCREEN_NAME`
- `process.env.MONGODB_URI`
- `process.env.SENDGRID_API_KEY` // generate in SendGrid
- `process.env.EMAIL` // your email
- `process.env.LOCAL_STRING` // 'en-US'

## Email depends on SendGrid

You can install [SendGrid via Heroku](https://elements.heroku.com/addons/sendgrid) add-ons easily or sign up on [SendGrid's site](https://sendgrid.com).

## Deploy on Heroku for Free

Best to deploy on [Heroku with a scheduler](https://devcenter.heroku.com/articles/scheduler) and [mLab](https://devcenter.heroku.com/articles/mongolab) and [SendGrid](https://elements.heroku.com/addons/sendgrid).

I set the schedule to weekly, but daily or hourly or whatever would work.

If you are trying to run it for free, remember to periodically check your mLab storage and clear out the collection.

## First Run

whoisntcoolanymore will not have enough history on first run to send an email. No email will be sent until the second run. No email will be sent if no changes have occured.

## License

whoisntcoolanymore is Public Domain

## Developer Warning

This is not the best javascript you'll ever see.

## Accounts with above ~5000 followers

This script will probably not handle accounts with follower list above ~5000 accounts due to how Twitters API works at scale, and my not needing to solve for that.