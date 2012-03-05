/*!
 * top - lib/client.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var urllib = require('urllib');
var crypto = require('crypto');
var moment = require('moment');

exports.Client = Client;

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
}

/**
 * Get taobao user by nick.
 * 
 * @param  {Object} params, `nick` or `session` must set one.
 *  - {String} fields, (required)fields of user. 
 *  - {String} nick, (optional)user nick name.
 *  - {String} session, (optional)session id.
 * @param  {Function(err, user)} callback
 * @public
 */
Client.prototype.taobao_user_get = function(params, callback) {
  var keys = [ 'fields' ];
  if (!params.session) {
    keys.push('nick');
  }
  checkRequired(params, keys);
  params.method = 'taobao.user.get';
  var that = this;
  that.request(params, function(err, result) {
    if (err) return callback(err);
    var user_get_response = result.user_get_response;
    callback(null, user_get_response && user_get_response.user);
  });
};

/**
 * Get taobao users by nick list.
 * 
 * @param  {Object} params
 *  - {String} fields, (required)fields of user. 
 *  - {String} nicks, (required)user nick name list, separate by (,), e.g.: mk2,aerdeng
 * @param  {Function(err, users)} callback
 * @public
 */
Client.prototype.taobao_users_get = function(params, callback) {
  checkRequired(params, [ 'fields', 'nicks' ]);
  params.method = 'taobao.users.get';
  var that = this;
  that.request(params, function(err, result) {
    if (err) return callback(err);
    var users_get_response = result.users_get_response;
    var users = [];
    if (users_get_response && users_get_response.users) {
      users = users_get_response.users.user || [];
    }
    callback(null, users);
  });
};

/**
 * Request API.
 * 
 * @param  {Object}   params
 * @param  {String}   [type='GET']
 * @param  {Function(err, result)} callback
 * @public
 */
Client.prototype.request = function(params, type, callback) {
  checkRequired(params, 'method');
  if (typeof type === 'function') {
    callback = type;
    type = null;
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
  urllib.request(this.REST_URL, { type: type, data: args }, function(err, buffer) {
    var data;
    if (buffer) {
      try {
        data = JSON.parse(buffer);
      } catch(e) {
        err = e;
        e.data = buffer.toString();
        data = null;
      }
    }
    if (data && data.error_response && !data.error_response.sub_msg) {
      // sub_msg error, let caller handle it.
      // request() only handle root error, like code 40, 41 error.
      var msg = data.error_response.msg;
      err = new Error(data.error_response.code + ': ' + msg);
      err.code = data.error_response.code;
      err.data = buffer.toString();
      data = null;
    }
    callback(err, data);
  }, this);
};

/**
 * Get now timestamp with 'yyyy-MM-dd HH:mm:ss' format.
 * @return {String}
 */
Client.prototype.timestamp = function() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Sign API request.
 * see http://open.taobao.com/doc/detail.htm?id=111#s6
 * 
 * @param  {Object} params
 * @return {String} sign string
 */
Client.prototype.sign = function(params) {
  var sorted = Object.keys(params).sort();
  var basestring = this.appsecret;
  // (md5(secretkey1value1key2value2...secret))
  for (var i = 0, l = sorted.length; i < l; i++) {
    var k = sorted[i];
    basestring += k + params[k];
  }
  basestring += this.appsecret;
  return md5(basestring);
};

function checkRequired(params, keys) {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }
  for (var i = 0, l = keys.length; i < l; i++) {
    var k = keys[i];
    if (params[k] === undefined) {
      throw new Error('`' + k + '` required');
    }
  }
}

/**
 * MD5 hex upper case string.
 * 
 * @param  {String|Buffer} s
 * @return {String}
 */
function md5(s) {
  var hash = crypto.createHash('md5');
  hash.update(Buffer.isBuffer(s) ? s : new Buffer(s));
  return hash.digest('hex').toUpperCase();
}