/*!
 * top - test/client.test.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var libpath = process.env.JSCOV ? '../lib-cov' : '../lib';
var top = require(libpath);
var should = require('should');

var config = require('../config');

describe('client.test.js', function() {
  var client = top.createClient({
    appkey: config.appkey,
    appsecret: config.appsecret
  });

  describe('#new Client()', function() {
    it('should throw error when miss appkey or appsecret', function() {
      (function() {
        top.createClient();
      }).should.throw('appkey or appsecret need!');
      (function() {
        top.createClient({ appkey: 'test' });
      }).should.throw('appkey or appsecret need!');
      (function() {
        top.createClient({ appsecret: 'test' });
      }).should.throw('appkey or appsecret need!');
    });
  });

  describe('#sign() http://open.taobao.com/doc/detail.htm?id=111#s6', function() {

    it('should equal 990FD28323F67A1EEC29336EDF373C0E', function() {
      var c = top.createClient({
        appkey: 'test',
        appsecret: 'test'
      });
      var params = {
        method: 'taobao.user.get',
        timestamp: '2011-07-01 13: 52:03',
        format: 'xml',
        app_key: 'test',
        v: '2.0',
        fields: 'nick,location.state,location.city',
        nick: '商家测试帐号17',
        sign_method: 'md5',
      };
      c.sign(params).should.equal('990FD28323F67A1EEC29336EDF373C0E');
    });
  });

  describe('#timestamp()', function() {
    it('should return yyyy-MM-dd HH:mm:ss format', function() {
      var s = client.timestamp();
      s.should.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('#request()', function() {
    it('should request success', function(done) {
      client.request({
        method: 'taobao.user.get',
        fields: 'user_id,nick,seller_credit',
        nick: '苏千'
      }, function(err, result) {
        should.not.exist(err);
        var user = result.user_get_response.user;
        user.should.have.keys(['user_id', 'nick', 'seller_credit']);
        user.nick.should.equal('苏千');
        user.user_id.should.equal(665377421);
        done();
      });
    });

    it('should throw error when method miss', function() {
      (function() {
        client.request({});
      }).should.throw('`method` required');
    });

    it('should return error when method wrong', function(done) {
      client.request({ method: 'not_exists' }, function(err, data) {
        should.exist(err);
        err.message.should.equal('22: Invalid method');
        err.code.should.equal(22);
        err.data.should.equal('{"error_response":{"code":22,"msg":"Invalid method"}}');
        done();
      });
    });
  });

  describe('#taobao_user_get()', function() {
    it('should return user', function(done) {
      client.taobao_user_get({ fields: 'user_id,nick', nick: '苏千' }, function(err, user) {
        should.not.exist(err);
        user.should.have.keys(['user_id', 'nick']);
        user.nick.should.equal('苏千');
        user.user_id.should.equal(665377421);
        done();
      });
    });

    it('should return null when nick not exists', function(done) {
      client.taobao_user_get({ fields: 'user_id,nick', nick: '苏千notexists' }, function(err, user) {
        should.not.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should throw error when nick miss', function() {
      (function() {
        client.taobao_user_get({ fields: 'user_id,nick' }, function(err, user) {});
      }).should.throw('`nick` required');
    });

  });

  describe('#taobao_users_get()', function() {
    it('should return users list', function(done) {
      client.taobao_users_get({ fields: 'user_id,nick', nicks: '苏千,玄澄' }, function(err, users) {
        should.not.exist(err);
        users.should.length(2);
        for (var i = users.length; i--; ) {
          var user = users[i];
          user.should.have.keys(['user_id', 'nick']);
          user.nick.should.equal(i === 0 ? '苏千' : '玄澄');
          user.user_id.should.equal(i === 0 ? 665377421 : 143267823);
        }
        done();
      });
    });

    it('#should return 4 length list when nicks are all same', function(done) {
      client.taobao_users_get({ fields: 'user_id,nick', nicks: '苏千,苏千,苏千,苏千' }, function(err, users) {
        should.not.exist(err);
        users.should.length(4);
        for (var i = users.length; i--; ) {
          var user = users[i];
          user.should.have.keys(['user_id', 'nick']);
          user.nick.should.equal('苏千');
          user.user_id.should.equal(665377421);
        }
        done();
      });
    });

    it('#should return 1 length list when one nick not exists', function(done) {
      client.taobao_users_get({ fields: 'user_id,nick', nicks: '苏千,苏千notexists' }, function(err, users) {
        should.not.exist(err);
        users.should.length(1);
        for (var i = users.length; i--; ) {
          var user = users[i];
          user.should.have.keys(['user_id', 'nick']);
          user.nick.should.equal('苏千');
          user.user_id.should.equal(665377421);
        }
        done();
      });
    });

    it('#should return [] no nick exists', function(done) {
      client.taobao_users_get({ fields: 'user_id,nick', nicks: '苏千苏千notexists2,苏千notexists' }, function(err, users) {
        should.not.exist(err);
        users.should.length(0);
        done();
      });
    });

    it('#should throw error when nicks miss', function() {
      (function() {
        client.taobao_users_get({ fields: 'user_id,nick' }, function(err, user) {});
      }).should.throw('`nicks` required');
    });

  });
});