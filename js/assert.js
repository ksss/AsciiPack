this.assert = this.assert || (function(){
  Object.eql = function (a, b) {
    var k, ka, kb, key, keysa, keysb, i, len;
    if (a === b) {
      return true;
    } else if (a === null || a === undefined || b === null || b === undefined) {
      return false;
    } else if (a.prototype !== b.prototype) {
      return false;
    } else if (a.valueOf() === b.valueOf()) {
      return true;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    } else if (typeof a != 'object' && typeof b != 'object') {
      return a === b;
    }

    try {
      keysa = [], keysb = [];
      // Object.keys
      for (k in a) if (a.hasOwnProperty(k)) {
        keysa.push(k);
      }
      for (k in b) if (b.hasOwnProperty(k)) {
        keysb.push(k);
      }
    } catch (ex) {
      return false;
    }
    if (keysa.length !== keysb.length) return false;
    keysa.sort();
    keysb.sort();
    for (i = 0, len = keysa.length; i < len; i += 1) {
      if (keysa[i] !== keysb[i]) return false;
    }
    for (i = keysa.length - 1; 0 <= i; i--) {
      key = keysa[i];
      if (!Object.eql(a[key], b[key])) return false;
    }
    return true;
  };

  var assert = {};
  assert.ok = function (value, message) {
    if (!value) throw new Error(message);
  };
  assert.equal = function (actual, expected, message) {
    assert.ok(actual == expected, actual + ' != ' + expected);
  };
  assert.strictEqual = function (actual, expected, message) {
    assert.ok(actual === expected, actual + ' !== ' + expected);
  };
  assert.deepEqual = function (actual, expected, message) {
    if (!Object.eql(actual, expected)) {
      throw new Error (actual + '!==' + expected + ' ' + (message || ''));
    }
  };
  assert.throws = function(callback, message) {
    var actual; 
    try {
      callback();
    } catch (ex) {
      actual = ex;
    }
    assert.ok(actual !== undefined, message);
  };
  return assert;
})();
