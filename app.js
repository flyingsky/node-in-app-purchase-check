var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var IAPVerifier = require('iap_verifier');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send('hello');
});

var ERROR_CODES_BASE = 6777e3;
var ERR_SETUP = ERROR_CODES_BASE + 1;
var ERR_LOAD = ERROR_CODES_BASE + 2;
var ERR_PURCHASE = ERROR_CODES_BASE + 3;
var ERR_LOAD_RECEIPTS = ERROR_CODES_BASE + 4;
var ERR_CLIENT_INVALID = ERROR_CODES_BASE + 5;
var ERR_PAYMENT_CANCELLED = ERROR_CODES_BASE + 6;
var ERR_PAYMENT_INVALID = ERROR_CODES_BASE + 7;
var ERR_PAYMENT_NOT_ALLOWED = ERROR_CODES_BASE + 8;
var ERR_UNKNOWN = ERROR_CODES_BASE + 10;
var ERR_REFRESH_RECEIPTS = ERROR_CODES_BASE + 11;
var ERR_INVALID_PRODUCT_ID = ERROR_CODES_BASE + 12;
var ERR_FINISH = ERROR_CODES_BASE + 13;
var ERR_COMMUNICATION = ERROR_CODES_BASE + 14;
var ERR_SUBSCRIPTIONS_NOT_AVAILABLE = ERROR_CODES_BASE + 15;
var ERR_MISSING_TOKEN = ERROR_CODES_BASE + 16;
var ERR_VERIFICATION_FAILED = ERROR_CODES_BASE + 17;
var ERR_BAD_RESPONSE = ERROR_CODES_BASE + 18;
var ERR_REFRESH = ERROR_CODES_BASE + 19;
var ERR_PAYMENT_EXPIRED = ERROR_CODES_BASE + 20;
var INVALID_PAYLOAD = 6778001;
var CONNECTION_FAILED = 6778002;
var PURCHASE_EXPIRED = 6778003;

function formatError(iosErrorCode) {
  var err = {
    code: ERR_VERIFICATION_FAILED,
    msg: 'Unknow reason'
  };

  switch(iosErrorCode) {
  case 21000:
    err.msg = 'The App Store could not read the JSON object you provided';
    break;

  case 21002:
    err.msg = 'The data in the transaction receipt property was malformed or missing';
    break;

  case 21003:
    err.msg = 'The receipt could not be authenticated';
    break;

  case 21004:
    err.msg = 'The shared secret you provided does not match the shared secret on file for your account';
    break;

  case 21005:
    err.msg = 'The receipt server is not currently available';
    break;

  case 21006:
    err.code = PURCHASE_EXPIRED;
    err.msg = 'This receipt is valid but the subscription has expired';
    break;

  case 21007:
    err.msg = 'This receipt is from the test environment, but it was sent to the production environment for verification. Send it to the test environment instead';
    break;

  case 21008:
    err.msg = 'This receipt is from the production environment, but it was sent to the test environment for verification. Send it to the production environment instead';
    break;
  }

  return err;
}

/**
 * transaction {Object} contains base64 receipt
 * isSandBox {String} 'true'|'false'
 * password {String}
 */
app.all('/verify', function(req, res) {
  console.log(req.body);

  var transaction = req.param('transaction');
  var password = req.param('password');
  var isAutoRenew = req.param('isAutoRenew') === 'true';
  var isSandBox = req.param('isSandBox') === 'true';
  var receipt = transaction.transactionReceipt;
  var result = {};
  var client = new IAPVerifier(password, !isSandBox);
  var method = isAutoRenew ? client.verifyAutoRenewReceipt : client.verifyReceipt;

  method.call(client, receipt, true, function(valid, msg, data) {
    result.ok = valid;

    if (valid) {
      console.log("Valid receipt");

      result.data = data;
    } else {
      console.log("Invalid receipt");

      var err = formatError(data.status);
      result.data = {
        code: err.code,
        error: {
          message: err.msg || msg
        }
      };

      var latestReceipt = data.latest_receipt_info || receipt;
      if (latestReceipt) {
        if (latestReceipt.cancellation_date) {
          result.data.code = ERR_PAYMENT_CANCELLED;
          result.data.error = {message: msg || 'Subscription is cancelled'};
        }
      }
    }

    console.log(valid, msg, 'result valid, msg');
    console.log(data, '=====result data');
    console.log(data.receipt, '====result receipt');
    console.log(data.receipt, data.latest_receipt_info, '====result receipt, lastest_receipt_info');

    res.send(result);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('checkpurchase');

app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

var callback = function() {
  debug('Express server listening on port ' + app.get('port'));
};

if (process.env.OPENSHIFT_NODEJS_IP) {
  app.listen(app.get('port'), app.get('host'), callback);
} else {
  app.listen(app.get('port'), callback);
}
