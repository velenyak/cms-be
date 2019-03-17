const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
// const session = require('express-session');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const { logs, publicDir } = require('./vars');
const { jwt } = require('./passport');
const restify = require('./restify');
const routes = require('../api/routes');

/**
* Express instance
* @public
*/
const app = express();
const router = express.Router();

app.use(express.static(publicDir));

// request logging. dev: console | production: file
app.use(morgan(logs));

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// app.use(session({
//   secret: 'VERY_SECRET',
//   resave: true,
//   saveUninitialized: true,
//   cookie: { secure: true, maxAge: 1000 * 60 * 60 * 24 }
// }));

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

passport.use(jwt);
// enable authentication
app.use(passport.initialize());
// app.use(passport.session());

// Register routes to restify
restify.addRoutes(app, router);


// mount api v1 routes
app.use(router);
// mount our own routes
app.use(routes);

module.exports = app;
