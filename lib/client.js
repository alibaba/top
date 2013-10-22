/*!
 * top - lib/client.js
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utility = require('utility');
var urllib = require('urllib');
var util = require('./util');
var Agent = require('agentkeepalive');
var HttpsAgent = Agent.HttpsAgent;

/**
 * API Client.
 * 
 * @param {Object} options, must set `appkey` and `appsecret`.
 * @constructor
 */
function Client(options) {
  if (!(this instanceof Client)) {
    return new Client(options);
  }
  options = options || {};
  if (!options.appkey || !options.appsecret) {
    throw new Error('appkey or appsecret need!');
  }
  this.REST_URL = options.REST_URL || 'http://gw.api.taobao.com/router/rest';
  this.appkey = options.appkey;
  this.appsecret = options.appsecret;
  this.isHttps = this.REST_URL.indexOf('https://') === 0;
  if (this.isHttps) {
    this.agent = new HttpsAgent();
  } else {
    this.agent = new Agent();
  }
  this.agent.maxSockets = 100;
}

/**
 * Invoke an api by method name.
 * 
 * @param {String} method, method name
 * @param {Object} params
 * @param {Array} reponseNames, e.g. ['tmall_selected_items_search_response', 'tem_list', 'selected_item']
 * @param {Object} defaultResponse
 * @param {String} type
 * @param {Function(err, response)} callback
 */
Client.prototype.invoke = function (method, params, reponseNames, defaultResponse, type, callback) {
  params.method = method;
  this.request(params, type, function (err, result) {
    if (err) {
      return callback(err);
    }
    var response = result;
    if (reponseNames && reponseNames.length > 0) {
      for (var i = 0; i < reponseNames.length; i++) {
        var name = reponseNames[i];
        response = response[name];
        if (response === undefined) {
          break;
        }
      }
    }
    if (response === undefined) {
      response = defaultResponse;
    }
    callback(null, response);
  });
};

Client.prototype._wrapJSON = function (s) {
  // warp fix #8: https://github.com/fengmk2/top/issues/8
  var matchs = s.match(/\"id\"\:\s?\d{16,}/g);
  if (matchs) {
    for (var i = 0; i < matchs.length; i++) {
      var m = matchs[i];
      s = s.replace(m, '"id":"' + m.split(':')[1].trim() + '"');
    }
  }
  return s;
};

var IGNORE_ERROR_CODES = {
  'isv.user-not-exist:invalid-nick': 1,
  // 'isv.user-not-exist:invalid-nick': 1,
};

/**
 * Request API.
 * 
 * @param {Object} params
 * @param {String} [type='GET']
 * @param {Function(err, result)} callback
 * @public
 */
Client.prototype.request = function (params, type, callback) {
  if (typeof type === 'function') {
    callback = type;
    type = null;
  }
  var err = util.checkRequired(params, 'method');
  if (err) {
    return callback(err);
  }
  var args = {
    timestamp: this.timestamp(),
    format: 'json',
    app_key: this.appkey,
    v: '2.0',
    sign_method: 'md5'
  };
  for (var k in params) {
    args[k] = params[k];
  }
  args.sign = this.sign(args);
  type = type || 'GET';
  var options = {type: type, data: args, agent: this.agent};
  var that = this;
  urllib.request(that.REST_URL, options, function (err, buffer) {
    var data;
    if (buffer) {
      buffer = that._wrapJSON(buffer.toString());
      try {
        data = JSON.parse(buffer);
      } catch (e) {
        err = e;
        e.data = buffer.toString();
        data = null;
      }
    }
    var errRes = data && data.error_response;
    if (errRes) {
      if (!errRes.sub_msg || !IGNORE_ERROR_CODES[errRes.sub_code]) {
        // no sub_msg error, let caller handle it.
        // request() only handle root error, like code 40, 41 error.
        var msg = errRes.msg + ', code ' + errRes.code;
        if (errRes.sub_msg) {
          msg += '; ' + errRes.sub_code + ': ' + errRes.sub_msg;
        }
        err = new Error(msg);
        err.name = 'TOPClientError';
        err.code = errRes.code;
        err.sub_code = errRes.sub_code;
        err.data = buffer.toString();
        data = null;
      }
    }

    callback(err, data);
  });
};

/**
 * Get now timestamp with 'yyyy-MM-dd HH:mm:ss' format.
 * @return {String}
 */
Client.prototype.timestamp = function () {
  return utility.YYYYMMDDHHmmss();
};

/**
 * Sign API request.
 * see http://open.taobao.com/doc/detail.htm?id=111#s6
 * 
 * @param  {Object} params
 * @return {String} sign string
 */
Client.prototype.sign = function (params) {
  var sorted = Object.keys(params).sort();
  var basestring = this.appsecret;
  // (md5(secretkey1value1key2value2...secret))
  for (var i = 0, l = sorted.length; i < l; i++) {
    var k = sorted[i];
    basestring += k + params[k];
  }
  basestring += this.appsecret;
  return utility.md5(basestring).toUpperCase();
};

var api = require('./api');
// 扩展原型方法
Object.keys(api).forEach(function (key) {
  Client.prototype[key] = api[key];
});

exports.Client = Client;
