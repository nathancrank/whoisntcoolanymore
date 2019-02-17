# AutoDetweeter

AutoDetweeter automatically deletes tweets after a set period of time.

## Config
Use process env variables to set the following values:

- `process.env.CONSUMER_KEY`
- `process.env.CONSUMER_SECRET`
- `process.env.ACCESS_TOKEN_KEY`
- `process.env.ACCESS_TOKEN_SECRET`
- `process.env.SCREEN_NAME`
- `process.env.TWITTER_DATE_FORMAT`
- `process.env.DELETE_AFTER`
- `process.env.TIME_UNIT`

## Time Unit and Delete After

`process.env.TIME_UNIT` and `process.env.DELETE_AFTER` are parsed by the moment.js library. [Learn more about valid formats here.](https://momentjs.com/docs/#/parsing/string-format/).

- `process.env.TIME_UNIT` is a string
- `process.env.DELETE_AFTER` is an integer represented as a string.

ex: 60days would have `TIME_UNIT` of `'d'` and `DELETE_AFTER` would be `'60'`

## Twitter Date Format

Currently: `ddd MMM DD hh:mm:ss ZZ YYYY`

Not sure if that will change, but didn't want to push the code again if it does.

## Deploy on Heroku

Best to deploy on [Heroku with a scheduler](https://devcenter.heroku.com/articles/scheduler).

## License

AutoDetweeter is Public Domain

## Support

There is no support. This serves my purpose. If it helps you as well, awesome.