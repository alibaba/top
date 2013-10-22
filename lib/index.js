/*!
 * top - lib/index.js
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

exports.Client = require('./client').Client;

exports.createClient = function (options) {
  return new exports.Client(options);
};
