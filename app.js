var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./server/routes/index');
var express = require('express');
var log = require(path.join(__dirname, 'log'));
var config = require(path.join(__dirname, 'config'));
var app = express();

log.error('---- APP RESTART ----');


// view engine setup
app.set('views', path.join(__dirname, './client','public','views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/client/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './client', 'public')));

app.set('json spaces', 40);
app.use('/', routes);
log.error('LISTENING ON '+config.port)
app.listen(config.port);
// app.on('error', onError);
// app.on('listening', onListening);

// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }

//   var bind = typeof port === 'string'
//     ? 'Pipe ' + port
//     : 'Port ' + port;

//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       log.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       log.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }

// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//   log.debug('Listening on ' + bind);
// }

module.exports = app;



// app.use(express.static(path.join(__dirname, './client', 'public')));

// var favicon = require('serve-favicon');

// view engine setup
// app.set('views', path.join(__dirname, './client','public','views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/client/public/favicon.ico'));
// app.use(logger('dev'));

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   console.log(err);
//   res.render('error', {
//     message: err.message,
//     error: err
//   });
// });


