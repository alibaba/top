exports.checkRequired = function (params, keys) {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }
  for (var i = 0, l = keys.length; i < l; i++) {
    var k = keys[i];
    if (!params.hasOwnProperty(k)) {
      var err = new Error('`' + k + '` required');
      err.name = "ParameterMissingError";
      return err;
    }
  }
};
