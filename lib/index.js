/*!
 * top - index.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Client = exports.Client = require('./client').Client;

exports.createClient = function(options) {
  return new Client(options);
};