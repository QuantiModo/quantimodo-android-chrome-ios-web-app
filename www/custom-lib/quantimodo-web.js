(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Quantimodo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":4}],4:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],7:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":5,"./encode":6}],8:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],9:[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('component-emitter');
var RequestBase = require('./request-base');
var isObject = require('./is-object');
var isFunction = require('./is-function');
var ResponseBase = require('./response-base');
var shouldRetry = require('./should-retry');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

exports.Request = Request;

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status;
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
      status = 204;
  }
  this._setStatusProperties(status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);

  if (null === this.text && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method != 'HEAD'
      ? this._parseBody(this.text ? this.text : this.xhr.response)
      : null;
  }
}

ResponseBase(Response.prototype);

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if(this.req._parser) {
    return this.req._parser(this, str);
  }
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
        // issue #876: return the http status code if the response parsing fails
        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `RequestBase`.
 */

Emitter(Request.prototype);
RequestBase(Request.prototype);

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (typeof pass === 'object' && pass !== null) { // pass is optional and can substitute for options
    options = pass;
  }
  if (!options) {
    options = {
      type: 'function' === typeof btoa ? 'basic' : 'auto',
    }
  }

  switch (options.type) {
    case 'basic':
      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
      
    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', 'Bearer ' + user);
    break;  
  }
  return this;
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (file) {
    if (this._data) {
      throw Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  // console.log(this._retries, this._maxRetries)
  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

// This only warns, because the request is still likely to work
Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
  console.warn("This is not supported in browser version of superagent");
  return this;
};

// This throws, because it can't send/receive data as expected
Request.prototype.pipe = Request.prototype.write = function(){
  throw Error("Streaming is not supported in browser version of superagent");
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
  }

  if (this._sort) {
    var index = this.url.indexOf('?');
    if (index >= 0) {
      var queryArr = this.url.substring(index + 1).split('&');
      if (isFunction(this._sort)) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
}

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  // querystring
  this._appendQueryString();

  return this._end();
};

Request.prototype._end = function() {
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var data = this._formData || this._data;

  this._setTimeouts();

  // state change
  xhr.onreadystatechange = function(){
    var readyState = xhr.readyState;
    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }
    if (4 != readyState) {
      return;
    }

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // initiate request
  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;

    if (this.header.hasOwnProperty(field))
      xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, data, fn){
  var req = request('DELETE', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-function":10,"./is-object":11,"./request-base":12,"./response-base":13,"./should-retry":14,"component-emitter":8}],10:[function(require,module,exports){
/**
 * Check if `fn` is a function.
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api private
 */
var isObject = require('./is-object');

function isFunction(fn) {
  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
  return tag === '[object Function]';
}

module.exports = isFunction;

},{"./is-object":11}],11:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],12:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;

/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in RequestBase.prototype) {
    obj[key] = RequestBase.prototype[key];
  }
  return obj;
}

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function _clearTimeout(){
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, read, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function timeout(options){
  if (!options || 'object' !== typeof options) {
    this._timeout = options;
    this._responseTimeout = 0;
    return this;
  }

  for(var option in options) {
    switch(option) {
      case 'deadline':
        this._timeout = options.deadline;
        break;
      case 'response':
        this._responseTimeout = options.response;
        break;
      default:
        console.warn("Unknown timeout option", option);
    }
  }
  return this;
};

/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.retry = function retry(count){
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  return this;
};

/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */

RequestBase.prototype._retry = function() {
  this.clearTimeout();

  // node
  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;

  return this._end();
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    if (this._endCalled) {
      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
    }
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

RequestBase.prototype.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

RequestBase.prototype.use = function use(fn) {
  fn(this);
  return this;
}

RequestBase.prototype.ok = function(cb) {
  if ('function' !== typeof cb) throw Error("Callback required");
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function(res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
RequestBase.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
RequestBase.prototype.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      this.field(name, val[i]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  if ('boolean' === typeof val) {
    val = '' + val;
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
RequestBase.prototype.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function(on){
  // This is browser-only functionality. Node side is no-op.
  if(on==undefined) on = true;
  this._withCredentials = on;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};


/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.send = function(data){
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw Error("Can't merge these send calls");
  }

  // merge
  if (isObj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  }

  // default to json
  if (!type) this.type('json');
  return this;
};


/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function(sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function(reason, timeout, errno){
  if (this._aborted) {
    return;
  }
  var err = new Error(reason + timeout + 'ms exceeded');
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function() {
  var self = this;

  // deadline
  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  }
  // response timeout
  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function(){
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
}

},{"./is-object":11}],13:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;

/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    obj[key] = ResponseBase.prototype[key];
  }
  return obj;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function(field){
    return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function(header){
    // TODO: moar!
    // TODO: make this a util

    // content-type
    var ct = header['content-type'] || '';
    this.type = utils.type(ct);

    // params
    var params = utils.params(ct);
    for (var key in params) this[key] = params[key];

    this.links = {};

    // links
    try {
        if (header.link) {
            this.links = utils.parseLinks(header.link);
        }
    } catch (err) {
        // ignore
    }
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function(status){
    var type = status / 100 | 0;

    // status / class
    this.status = this.statusCode = status;
    this.statusType = type;

    // basics
    this.info = 1 == type;
    this.ok = 2 == type;
    this.redirect = 3 == type;
    this.clientError = 4 == type;
    this.serverError = 5 == type;
    this.error = (4 == type || 5 == type)
        ? this.toError()
        : false;

    // sugar
    this.accepted = 202 == status;
    this.noContent = 204 == status;
    this.badRequest = 400 == status;
    this.unauthorized = 401 == status;
    this.notAcceptable = 406 == status;
    this.forbidden = 403 == status;
    this.notFound = 404 == status;
};

},{"./utils":15}],14:[function(require,module,exports){
var ERROR_CODES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'EADDRINFO',
  'ESOCKETTIMEDOUT'
];

/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err
 * @param {Response} [res]
 * @returns {Boolean}
 */
module.exports = function shouldRetry(err, res) {
  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) return true;
  if (res && res.status && res.status >= 500) return true;
  // Superagent timeout
  if (err && 'timeout' in err && err.code == 'ECONNABORTED') return true;
  if (err && 'crossDomain' in err) return true;
  return false;
};

},{}],15:[function(require,module,exports){

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.type = function(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function(str){
  return str.split(/ *, */).reduce(function(obj, str){
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};

/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function(header, shouldStripCookie){
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header['host'];
  if (shouldStripCookie) {
    delete header['cookie'];
  }
  return header;
};
},{}],16:[function(require,module,exports){
(function (Buffer){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['superagent', 'querystring'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('superagent'), require('querystring'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ApiClient = factory(root.superagent, root.querystring);
  }
}(this, function(superagent, querystring) {
  'use strict';

  /**
   * @module ApiClient
   * @version 5.8.806
   */

  /**
   * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
   * application to use this class directly - the *Api and model classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:ApiClient
   * @class
   */
  var exports = function() {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default https://app.quantimo.do/api
     */
    this.basePath = 'https://app.quantimo.do/api'.replace(/\/+$/, '');

    /**
     * The authentication methods to be included for all API calls.
     * @type {Array.<String>}
     */
    this.authentications = {
      'access_token': {type: 'apiKey', 'in': 'query', name: 'access_token'},
      'client_id': {type: 'apiKey', 'in': 'query', name: 'clientId'},
      'quantimodo_oauth2': {type: 'oauth2'}
    };
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};

    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = 60000;

    /**
     * If set to false an additional timestamp parameter is added to all API GET calls to
     * prevent browser caching
     * @type {Boolean}
     * @default true
     */
    this.cache = true;

    /**
     * If set to true, the client will save the cookies from each server
     * response, and return them in the next request.
     * @default false
     */
    this.enableCookies = false;

    /*
     * Used to save and return cookies in a node.js (non-browser) setting,
     * if this.enableCookies is set to true.
     */
    if (typeof window === 'undefined') {
      this.agent = new superagent.agent();
    }

  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function(param) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function(path, pathParams) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }
    var url = this.basePath + path;
    var _this = this;
    url = url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function(contentType) {
    return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function(contentTypes) {
    for (var i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function(param) {
    // fs.ReadStream in Node.js and Electron (but not in runtime like browserify)
    if (typeof require === 'function') {
      var fs;
      try {
        fs = require('fs');
      } catch (err) {}
      if (fs && fs.ReadStream && param instanceof fs.ReadStream) {
        return true;
      }
    }
    // Buffer in Node.js
    if (typeof Buffer === 'function' && param instanceof Buffer) {
      return true;
    }
    // Blob in browser
    if (typeof Blob === 'function' && param instanceof Blob) {
      return true;
    }
    // File in browser (it seems File object is also instance of Blob, but keep this for safe)
    if (typeof File === 'function' && param instanceof File) {
      return true;
    }
    return false;
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function(params) {
    var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enumeration of collection format separator strategies.
   * @enum {String}
   * @readonly
   */
  exports.CollectionFormatEnum = {
    /**
     * Comma-separated values. Value: <code>csv</code>
     * @const
     */
    CSV: ',',
    /**
     * Space-separated values. Value: <code>ssv</code>
     * @const
     */
    SSV: ' ',
    /**
     * Tab-separated values. Value: <code>tsv</code>
     * @const
     */
    TSV: '\t',
    /**
     * Pipe(|)-separated values. Value: <code>pipes</code>
     * @const
     */
    PIPES: '|',
    /**
     * Native array. Value: <code>multi</code>
     * @const
     */
    MULTI: 'multi'
  };

  /**
   * Builds a string representation of an array-type actual parameter, according to the given collection format.
   * @param {Array} param An array parameter.
   * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
   * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
   * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
   */
  exports.prototype.buildCollectionParam = function buildCollectionParam(param, collectionFormat) {
    if (param == null) {
      return null;
    }
    switch (collectionFormat) {
      case 'csv':
        return param.map(this.paramToString).join(',');
      case 'ssv':
        return param.map(this.paramToString).join(' ');
      case 'tsv':
        return param.map(this.paramToString).join('\t');
      case 'pipes':
        return param.map(this.paramToString).join('|');
      case 'multi':
        // return the array directly as SuperAgent will handle it as expected
        return param.map(this.paramToString);
      default:
        throw new Error('Unknown collection format: ' + collectionFormat);
    }
  };

  /**
   * Applies authentication headers to the request.
   * @param {Object} request The request object created by a <code>superagent()</code> call.
   * @param {Array.<String>} authNames An array of authentication method names.
   */
  exports.prototype.applyAuthToRequest = function(request, authNames) {
    var _this = this;
    authNames.forEach(function(authName) {
      var auth = _this.authentications[authName];
      switch (auth.type) {
        case 'basic':
          if (auth.username || auth.password) {
            request.auth(auth.username || '', auth.password || '');
          }
          break;
        case 'apiKey':
          if (auth.apiKey) {
            var data = {};
            if (auth.apiKeyPrefix) {
              data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
            } else {
              data[auth.name] = auth.apiKey;
            }
            if (auth['in'] === 'header') {
              request.set(data);
            } else {
              request.query(data);
            }
          }
          break;
        case 'oauth2':
          if (auth.accessToken) {
            request.set({'Authorization': 'Bearer ' + auth.accessToken});
          }
          break;
        default:
          throw new Error('Unknown authentication type: ' + auth.type);
      }
    });
  };

  /**
   * Deserializes an HTTP response body into a value of the specified type.
   * @param {Object} response A SuperAgent response object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns A value of the specified type.
   */
  exports.prototype.deserialize = function deserialize(response, returnType) {
    if (response == null || returnType == null || response.status == 204) {
      return null;
    }
    // Rely on SuperAgent for parsing response body.
    // See http://visionmedia.github.io/superagent/#parsing-response-bodies
    var data = response.body;
    if (data == null || (typeof data === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length)) {
      // SuperAgent does not always produce a body; use the unparsed response as a fallback
      data = response.text;
    }
    return exports.convertToType(data, returnType);
  };

  /**
   * Callback function to receive the result of the operation.
   * @callback module:ApiClient~callApiCallback
   * @param {String} error Error message, if any.
   * @param data The data returned by the service call.
   * @param {String} response The complete HTTP response.
   */

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, String>} pathParams A map of path parameters and their values.
   * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
   * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} bodyParam The value to pass as the request body.
   * @param {Array.<String>} authNames An array of authentication type names.
   * @param {Array.<String>} contentTypes An array of request MIME types.
   * @param {Array.<String>} accepts An array of acceptable response MIME types.
   * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
   * constructor for a complex type.
   * @param {module:ApiClient~callApiCallback} callback The callback function.
   * @returns {Object} The SuperAgent request object.
   */
  exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
      returnType, callback) {

    var _this = this;
    var url = this.buildUrl(path, pathParams);
    var request = superagent(httpMethod, url);

    // apply authentications
    this.applyAuthToRequest(request, authNames);

    // set query parameters
    if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
        queryParams['_'] = new Date().getTime();
    }
    request.query(this.normalizeParams(queryParams));

    // set header parameters
    request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

    // set request timeout
    request.timeout(this.timeout);

    var contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
      if(contentType != 'multipart/form-data') {
        request.type(contentType);
      }
    } else if (!request.header['Content-Type']) {
      request.type('application/json');
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      request.send(querystring.stringify(this.normalizeParams(formParams)));
    } else if (contentType == 'multipart/form-data') {
      var _formParams = this.normalizeParams(formParams);
      for (var key in _formParams) {
        if (_formParams.hasOwnProperty(key)) {
          if (this.isFileParam(_formParams[key])) {
            // file field
            request.attach(key, _formParams[key]);
          } else {
            request.field(key, _formParams[key]);
          }
        }
      }
    } else if (bodyParam) {
      request.send(bodyParam);
    }

    var accept = this.jsonPreferredMime(accepts);
    if (accept) {
      request.accept(accept);
    }

    if (returnType === 'Blob') {
      request.responseType('blob');
    } else if (returnType === 'String') {
      request.responseType('string');
    }

    // Attach previously saved cookies, if enabled
    if (this.enableCookies){
      if (typeof window === 'undefined') {
        this.agent.attachCookies(request);
      }
      else {
        request.withCredentials();
      }
    }


    request.end(function(error, response) {
      if (callback) {
        var data = null;
        if (!error) {
          try {
            data = _this.deserialize(response, returnType);
            if (_this.enableCookies && typeof window === 'undefined'){
              _this.agent.saveCookies(response);
            }
          } catch (err) {
            error = err;
          }
        }
        callback(error, data, response);
      }
    });

    return request;
  };

  /**
   * Parses an ISO-8601 string representation of a date value.
   * @param {String} str The date value as a string.
   * @returns {Date} The parsed date object.
   */
  exports.parseDate = function(str) {
    return new Date(str.replace(/T/i, ' '));
  };

  /**
   * Converts a value to the specified type.
   * @param {(String|Object)} data The data to convert, as a string or object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns An instance of the specified type or null or undefined if data is null or undefined.
   */
  exports.convertToType = function(data, type) {
    if (data === null || data === undefined)
      return data

    switch (type) {
      case 'Boolean':
        return Boolean(data);
      case 'Integer':
        return parseInt(data, 10);
      case 'Number':
        return parseFloat(data);
      case 'String':
        return String(data);
      case 'Date':
        return this.parseDate(String(data));
      case 'Blob':
      	return data;
      default:
        if (type === Object) {
          // generic object, return directly
          return data;
        } else if (typeof type === 'function') {
          // for model type like: User
          return type.constructFromObject(data);
        } else if (Array.isArray(type)) {
          // for array type like: ['String']
          var itemType = type[0];
          return data.map(function(item) {
            return exports.convertToType(item, itemType);
          });
        } else if (typeof type === 'object') {
          // for plain object type like: {'String': 'Integer'}
          var keyType, valueType;
          for (var k in type) {
            if (type.hasOwnProperty(k)) {
              keyType = k;
              valueType = type[k];
              break;
            }
          }
          var result = {};
          for (var k in data) {
            if (data.hasOwnProperty(k)) {
              var key = exports.convertToType(k, keyType);
              var value = exports.convertToType(data[k], valueType);
              result[key] = value;
            }
          }
          return result;
        } else {
          // for unknown type, return the data directly
          return data;
        }
    }
  };

  /**
   * Constructs a new map or array model from REST data.
   * @param data {Object|Array} The REST data.
   * @param obj {Object|Array} The target object or array.
   */
  exports.constructFromObject = function(data, obj, itemType) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data.hasOwnProperty(i))
          obj[i] = exports.convertToType(data[i], itemType);
      }
    } else {
      for (var k in data) {
        if (data.hasOwnProperty(k))
          obj[k] = exports.convertToType(data[k], itemType);
      }
    }
  };

  /**
   * The default API client implementation.
   * @type {module:ApiClient}
   */
  exports.instance = new exports();

  return exports;
}));

}).call(this,require("buffer").Buffer)
},{"buffer":3,"fs":2,"querystring":7,"superagent":9}],17:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/AggregatedCorrelation', 'model/CommonResponse', 'model/GetCorrelationsResponse', 'model/JsonErrorResponse', 'model/PostCorrelation', 'model/Study', 'model/UserCorrelation', 'model/Vote', 'model/VoteDelete'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/AggregatedCorrelation'), require('../model/CommonResponse'), require('../model/GetCorrelationsResponse'), require('../model/JsonErrorResponse'), require('../model/PostCorrelation'), require('../model/Study'), require('../model/UserCorrelation'), require('../model/Vote'), require('../model/VoteDelete'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.AnalyticsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.AggregatedCorrelation, root.Quantimodo.CommonResponse, root.Quantimodo.GetCorrelationsResponse, root.Quantimodo.JsonErrorResponse, root.Quantimodo.PostCorrelation, root.Quantimodo.Study, root.Quantimodo.UserCorrelation, root.Quantimodo.Vote, root.Quantimodo.VoteDelete);
  }
}(this, function(ApiClient, AggregatedCorrelation, CommonResponse, GetCorrelationsResponse, JsonErrorResponse, PostCorrelation, Study, UserCorrelation, Vote, VoteDelete) {
  'use strict';

  /**
   * Analytics service.
   * @module api/AnalyticsApi
   * @version 5.8.806
   */

  /**
   * Constructs a new AnalyticsApi. 
   * @alias module:api/AnalyticsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteVote operation.
     * @callback module:api/AnalyticsApi~deleteVoteCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete vote
     * Delete previously posted vote
     * @param {module:model/VoteDelete} body The cause and effect variable names for the predictor vote to be deleted.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/AnalyticsApi~deleteVoteCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteVote = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling deleteVote");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/votes/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getAggregatedCorrelations operation.
     * @callback module:api/AnalyticsApi~getAggregatedCorrelationsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/AggregatedCorrelation>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get aggregated correlations
     * Get correlations based on the anonymized aggregate data from all QuantiModo users.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param {String} opts.onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param {String} opts.durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {Boolean} opts.outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param {module:api/AnalyticsApi~getAggregatedCorrelationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/AggregatedCorrelation>}
     */
    this.getAggregatedCorrelations = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName'],
        'correlationCoefficient': opts['correlationCoefficient'],
        'onsetDelay': opts['onsetDelay'],
        'durationOfAction': opts['durationOfAction'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'outcomesOfInterest': opts['outcomesOfInterest']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [AggregatedCorrelation];

      return this.apiClient.callApi(
        '/v3/aggregatedCorrelations', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getStudy operation.
     * @callback module:api/AnalyticsApi~getStudyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Study} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Study
     * Get Study
     * @param {Object} opts Optional parameters
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {Boolean} opts.includeCharts Example: true
     * @param {module:api/AnalyticsApi~getStudyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Study}
     */
    this.getStudy = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'causeVariableName': opts['causeVariableName'],
        'effectVariableName': opts['effectVariableName'],
        'appName': opts['appName'],
        'clientId': opts['clientId'],
        'includeCharts': opts['includeCharts']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = Study;

      return this.apiClient.callApi(
        '/v4/study', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUserCorrelationExplantions operation.
     * @callback module:api/AnalyticsApi~getUserCorrelationExplantionsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/UserCorrelation>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get correlation explanations
     * Get explanations of  correlations based on data from a single user.
     * @param {Object} opts Optional parameters
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {module:api/AnalyticsApi~getUserCorrelationExplantionsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/UserCorrelation>}
     */
    this.getUserCorrelationExplantions = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [UserCorrelation];

      return this.apiClient.callApi(
        '/v3/correlations/explanations', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUserCorrelations operation.
     * @callback module:api/AnalyticsApi~getUserCorrelationsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/GetCorrelationsResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get correlations
     * Get correlations based on data from a single user.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param {String} opts.onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param {String} opts.durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {Boolean} opts.outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/AnalyticsApi~getUserCorrelationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/GetCorrelationsResponse}
     */
    this.getUserCorrelations = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName'],
        'correlationCoefficient': opts['correlationCoefficient'],
        'onsetDelay': opts['onsetDelay'],
        'durationOfAction': opts['durationOfAction'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'outcomesOfInterest': opts['outcomesOfInterest'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = GetCorrelationsResponse;

      return this.apiClient.callApi(
        '/v3/correlations', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postAggregatedCorrelations operation.
     * @callback module:api/AnalyticsApi~postAggregatedCorrelationsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Store or Update a Correlation
     * Add correlation
     * @param {module:model/PostCorrelation} body Provides correlation data
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/AnalyticsApi~postAggregatedCorrelationsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.postAggregatedCorrelations = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postAggregatedCorrelations");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/aggregatedCorrelations', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postVote operation.
     * @callback module:api/AnalyticsApi~postVoteCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post or update vote
     * This is to enable users to indicate their opinion on the plausibility of a causal relationship between a treatment and outcome. QuantiModo incorporates crowd-sourced plausibility estimations into their algorithm. This is done allowing user to indicate their view of the plausibility of each relationship with thumbs up/down buttons placed next to each prediction.
     * @param {module:model/Vote} body Contains the cause variable, effect variable, and vote value.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/AnalyticsApi~postVoteCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postVote = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postVote");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/votes', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/AggregatedCorrelation":26,"../model/CommonResponse":28,"../model/GetCorrelationsResponse":37,"../model/JsonErrorResponse":42,"../model/PostCorrelation":49,"../model/Study":50,"../model/UserCorrelation":59,"../model/Vote":70,"../model/VoteDelete":71}],18:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.AuthenticationApi = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';

  /**
   * Authentication service.
   * @module api/AuthenticationApi
   * @version 5.8.806
   */

  /**
   * Constructs a new AuthenticationApi. 
   * @alias module:api/AuthenticationApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getAccessToken operation.
     * @callback module:api/AuthenticationApi~getAccessTokenCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a user access token
     * Client provides authorization token obtained from /api/v3/oauth2/authorize to this endpoint and receives an access token. Access token can then be used to query different API endpoints of QuantiModo. ### Request Access Token After user approves your access to the given scope form the https:/app.quantimo.do/v2/oauth2/authorize endpoint, you&#39;ll receive an authorization code to request an access token. This time make a &#x60;POST&#x60; request to &#x60;/api/v2/oauth/access_token&#x60; with parameters including: * &#x60;grant_type&#x60; Can be &#x60;authorization_code&#x60; or &#x60;refresh_token&#x60; since we are getting the &#x60;access_token&#x60; for the first time we don&#39;t have a &#x60;refresh_token&#x60; so this must be &#x60;authorization_code&#x60;. * &#x60;code&#x60; Authorization code you received with the previous request. * &#x60;redirect_uri&#x60; Your application&#39;s redirect url. ### Refreshing Access Token Access tokens expire at some point, to continue using our api you need to refresh them with &#x60;refresh_token&#x60; you received along with the &#x60;access_token&#x60;. To do this make a &#x60;POST&#x60; request to &#x60;/api/v2/oauth/access_token&#x60; with correct parameters, which are: * &#x60;grant_type&#x60; This time grant type must be &#x60;refresh_token&#x60; since we have it. * &#x60;clientId&#x60; Your application&#39;s client id. * &#x60;client_secret&#x60; Your application&#39;s client secret. * &#x60;refresh_token&#x60; The refresh token you received with the &#x60;access_token&#x60;. Every request you make to this endpoint will give you a new refresh token and make the old one expired. So you can keep getting new access tokens with new refresh tokens. ### Using Access Token Currently we support 2 ways for this, you can&#39;t use both at the same time. * Adding access token to the request header as &#x60;Authorization: Bearer {access_token}&#x60; * Adding to the url as a query parameter &#x60;?access_token&#x3D;{access_token}&#x60; You can read more about OAuth2 from [here](http://oauth.net/2/)
     * @param {String} clientSecret This is the secret for your obtained clientId. QuantiModo uses this to validate that only your application uses the clientId.  Obtain this by creating a free application at [https://app.quantimo.do/api/v2/apps](https://app.quantimo.do/api/v2/apps).
     * @param {String} grantType Grant Type can be &#39;authorization_code&#39; or &#39;refresh_token&#39;
     * @param {String} code Authorization code you received with the previous request.
     * @param {String} responseType If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
     * @param {String} scope Scopes include basic, readmeasurements, and writemeasurements. The &#x60;basic&#x60; scope allows you to read user info (displayName, email, etc). The &#x60;readmeasurements&#x60; scope allows one to read a user&#39;s data. The &#x60;writemeasurements&#x60; scope allows you to write user data. Separate multiple scopes by a space.
     * @param {Object} opts Optional parameters
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {String} opts.redirectUri The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
     * @param {String} opts.state An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
     * @param {module:api/AuthenticationApi~getAccessTokenCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getAccessToken = function(clientSecret, grantType, code, responseType, scope, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'clientSecret' is set
      if (clientSecret === undefined || clientSecret === null) {
        throw new Error("Missing the required parameter 'clientSecret' when calling getAccessToken");
      }

      // verify the required parameter 'grantType' is set
      if (grantType === undefined || grantType === null) {
        throw new Error("Missing the required parameter 'grantType' when calling getAccessToken");
      }

      // verify the required parameter 'code' is set
      if (code === undefined || code === null) {
        throw new Error("Missing the required parameter 'code' when calling getAccessToken");
      }

      // verify the required parameter 'responseType' is set
      if (responseType === undefined || responseType === null) {
        throw new Error("Missing the required parameter 'responseType' when calling getAccessToken");
      }

      // verify the required parameter 'scope' is set
      if (scope === undefined || scope === null) {
        throw new Error("Missing the required parameter 'scope' when calling getAccessToken");
      }


      var pathParams = {
      };
      var queryParams = {
        'clientId': opts['clientId'],
        'client_secret': clientSecret,
        'grant_type': grantType,
        'code': code,
        'response_type': responseType,
        'scope': scope,
        'redirect_uri': opts['redirectUri'],
        'state': opts['state']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/oauth2/token', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getOauthAuthorizationCode operation.
     * @callback module:api/AuthenticationApi~getOauthAuthorizationCodeCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Request Authorization Code
     * You can implement OAuth2 authentication to your application using our **OAuth2** endpoints.  You need to redirect users to &#x60;/api/v3/oauth2/authorize&#x60; endpoint to get an authorization code and include the parameters below.   This page will ask the user if they want to allow a client&#39;s application to submit or obtain data from their QM account. It will redirect the user to the url provided by the client application with the code as a query parameter or error in case of an error. See the /api/v2/oauth/access_token endpoint for the next steps.
     * @param {String} clientSecret This is the secret for your obtained clientId. QuantiModo uses this to validate that only your application uses the clientId.  Obtain this by creating a free application at [https://app.quantimo.do/api/v2/apps](https://app.quantimo.do/api/v2/apps).
     * @param {String} responseType If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
     * @param {String} scope Scopes include basic, readmeasurements, and writemeasurements. The &#x60;basic&#x60; scope allows you to read user info (displayName, email, etc). The &#x60;readmeasurements&#x60; scope allows one to read a user&#39;s data. The &#x60;writemeasurements&#x60; scope allows you to write user data. Separate multiple scopes by a space.
     * @param {Object} opts Optional parameters
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {String} opts.redirectUri The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
     * @param {String} opts.state An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
     * @param {module:api/AuthenticationApi~getOauthAuthorizationCodeCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getOauthAuthorizationCode = function(clientSecret, responseType, scope, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'clientSecret' is set
      if (clientSecret === undefined || clientSecret === null) {
        throw new Error("Missing the required parameter 'clientSecret' when calling getOauthAuthorizationCode");
      }

      // verify the required parameter 'responseType' is set
      if (responseType === undefined || responseType === null) {
        throw new Error("Missing the required parameter 'responseType' when calling getOauthAuthorizationCode");
      }

      // verify the required parameter 'scope' is set
      if (scope === undefined || scope === null) {
        throw new Error("Missing the required parameter 'scope' when calling getOauthAuthorizationCode");
      }


      var pathParams = {
      };
      var queryParams = {
        'clientId': opts['clientId'],
        'client_secret': clientSecret,
        'response_type': responseType,
        'scope': scope,
        'redirect_uri': opts['redirectUri'],
        'state': opts['state']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/oauth2/authorize', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16}],19:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Connector'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Connector'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ConnectorsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.Connector);
  }
}(this, function(ApiClient, Connector) {
  'use strict';

  /**
   * Connectors service.
   * @module api/ConnectorsApi
   * @version 5.8.806
   */

  /**
   * Constructs a new ConnectorsApi. 
   * @alias module:api/ConnectorsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the connectConnector operation.
     * @callback module:api/ConnectorsApi~connectConnectorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Obtain a token from 3rd party data source
     * Attempt to obtain a token from the data provider, store it in the database. With this, the connector to continue to obtain new user data until the token is revoked.
     * @param {module:model/String} connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/ConnectorsApi~connectConnectorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.connectConnector = function(connectorName, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'connectorName' is set
      if (connectorName === undefined || connectorName === null) {
        throw new Error("Missing the required parameter 'connectorName' when calling connectConnector");
      }


      var pathParams = {
        'connectorName': connectorName
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connectors/{connectorName}/connect', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the disconnectConnector operation.
     * @callback module:api/ConnectorsApi~disconnectConnectorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete stored connection info
     * The disconnect method deletes any stored tokens or connection information from the connectors database.
     * @param {module:model/String} connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param {module:api/ConnectorsApi~disconnectConnectorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.disconnectConnector = function(connectorName, callback) {
      var postBody = null;

      // verify the required parameter 'connectorName' is set
      if (connectorName === undefined || connectorName === null) {
        throw new Error("Missing the required parameter 'connectorName' when calling disconnectConnector");
      }


      var pathParams = {
        'connectorName': connectorName
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connectors/{connectorName}/disconnect', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getConnectors operation.
     * @callback module:api/ConnectorsApi~getConnectorsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Connector>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * List of Connectors
     * A connector pulls data from other data providers using their API or a screenscraper. Returns a list of all available connectors and information about them such as their id, name, whether the user has provided access, logo url, connection instructions, and the update history.
     * @param {Object} opts Optional parameters
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/ConnectorsApi~getConnectorsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Connector>}
     */
    this.getConnectors = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Connector];

      return this.apiClient.callApi(
        '/v4/connectors/list', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getIntegrationJs operation.
     * @callback module:api/ConnectorsApi~getIntegrationJsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get embeddable connect javascript
     * Get embeddable connect javascript. Usage:   - Embedding in applications with popups for 3rd-party authentication windows.     Use &#x60;qmSetupInPopup&#x60; function after connecting &#x60;connect.js&#x60;.   - Embedding in applications with popups for 3rd-party authentication windows.     Requires a selector to block. It will be embedded in this block.     Use &#x60;qmSetupOnPage&#x60; function after connecting &#x60;connect.js&#x60;.   - Embedding in mobile applications without popups for 3rd-party authentication.     Use &#x60;qmSetupOnMobile&#x60; function after connecting &#x60;connect.js&#x60;.     If using in a Cordova application call  &#x60;qmSetupOnIonic&#x60; function after connecting &#x60;connect.js&#x60;.
     * @param {Object} opts Optional parameters
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/ConnectorsApi~getIntegrationJsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getIntegrationJs = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/x-javascript'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/integration.js', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getMobileConnectPage operation.
     * @callback module:api/ConnectorsApi~getMobileConnectPageCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Mobile connect page
     * This page is designed to be opened in a webview.  Instead of using popup authentication boxes, it uses redirection. You can include the user&#39;s access_token as a URL parameter like https://app.quantimo.do/api/v3/connect/mobile?access_token&#x3D;123
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/ConnectorsApi~getMobileConnectPageCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getMobileConnectPage = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['text/html'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connect/mobile', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the updateConnector operation.
     * @callback module:api/ConnectorsApi~updateConnectorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sync with data source
     * The update method tells the QM Connector Framework to check with the data provider (such as Fitbit or MyFitnessPal) and retrieve any new measurements available.
     * @param {module:model/String} connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/ConnectorsApi~updateConnectorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.updateConnector = function(connectorName, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'connectorName' is set
      if (connectorName === undefined || connectorName === null) {
        throw new Error("Missing the required parameter 'connectorName' when calling updateConnector");
      }


      var pathParams = {
        'connectorName': connectorName
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connectors/{connectorName}/update', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/Connector":29}],20:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CommonResponse', 'model/Measurement', 'model/MeasurementDelete', 'model/MeasurementSet', 'model/MeasurementUpdate', 'model/Pairs'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CommonResponse'), require('../model/Measurement'), require('../model/MeasurementDelete'), require('../model/MeasurementSet'), require('../model/MeasurementUpdate'), require('../model/Pairs'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.CommonResponse, root.Quantimodo.Measurement, root.Quantimodo.MeasurementDelete, root.Quantimodo.MeasurementSet, root.Quantimodo.MeasurementUpdate, root.Quantimodo.Pairs);
  }
}(this, function(ApiClient, CommonResponse, Measurement, MeasurementDelete, MeasurementSet, MeasurementUpdate, Pairs) {
  'use strict';

  /**
   * Measurements service.
   * @module api/MeasurementsApi
   * @version 5.8.806
   */

  /**
   * Constructs a new MeasurementsApi. 
   * @alias module:api/MeasurementsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteMeasurement operation.
     * @callback module:api/MeasurementsApi~deleteMeasurementCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete a measurement
     * Delete a previously submitted measurement
     * @param {module:model/MeasurementDelete} body The startTime and variableId of the measurement to be deleted.
     * @param {module:api/MeasurementsApi~deleteMeasurementCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteMeasurement = function(body, callback) {
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling deleteMeasurement");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/measurements/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getMeasurements operation.
     * @callback module:api/MeasurementsApi~getMeasurementsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Measurement>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get measurements for this user
     * Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {Number} opts.id Measurement id
     * @param {String} opts.variableName Name of the variable you want measurements for
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.sourceName ID of the source you want measurements for (supports exact name match only)
     * @param {String} opts.value Value of measurement
     * @param {module:model/String} opts.unitName Example: 86400
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.groupingWidth The time (in seconds) over which measurements are grouped together
     * @param {String} opts.groupingTimezone The time (in seconds) over which measurements are grouped together
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {Boolean} opts.doNotProcess Example: true
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/MeasurementsApi~getMeasurementsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Measurement>}
     */
    this.getMeasurements = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'id': opts['id'],
        'variableName': opts['variableName'],
        'variableCategoryName': opts['variableCategoryName'],
        'sourceName': opts['sourceName'],
        'value': opts['value'],
        'unitName': opts['unitName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'groupingWidth': opts['groupingWidth'],
        'groupingTimezone': opts['groupingTimezone'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'doNotProcess': opts['doNotProcess'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Measurement];

      return this.apiClient.callApi(
        '/v3/measurements', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getPairs operation.
     * @callback module:api/MeasurementsApi~getPairsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Pairs>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get pairs of measurements for correlational analysis
     * Pairs cause measurements with effect measurements grouped over the duration of action after the onset delay.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.causeUnitName Name for the unit cause measurements to be returned in
     * @param {String} opts.onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param {String} opts.durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
     * @param {String} opts.effectUnitName Name for the unit effect measurements to be returned in
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/MeasurementsApi~getPairsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Pairs>}
     */
    this.getPairs = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName'],
        'causeUnitName': opts['causeUnitName'],
        'onsetDelay': opts['onsetDelay'],
        'durationOfAction': opts['durationOfAction'],
        'effectUnitName': opts['effectUnitName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Pairs];

      return this.apiClient.callApi(
        '/v3/pairs', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the measurementExportRequest operation.
     * @callback module:api/MeasurementsApi~measurementExportRequestCallback
     * @param {String} error Error message, if any.
     * @param {'Number'} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post Request for Measurements CSV
     * Use this endpoint to schedule a CSV export containing all user measurements to be emailed to the user within 24 hours.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/MeasurementsApi~measurementExportRequestCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link 'Number'}
     */
    this.measurementExportRequest = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = 'Number';

      return this.apiClient.callApi(
        '/v2/measurements/exportRequest', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postMeasurements operation.
     * @callback module:api/MeasurementsApi~postMeasurementsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post a new set or update existing measurements to the database
     * You can submit or update multiple measurements in a \&quot;measurements\&quot; sub-array.  If the variable these measurements correspond to does not already exist in the database, it will be automatically added.
     * @param {Array.<module:model/MeasurementSet>} body An array of measurement sets containing measurement items you want to insert.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/MeasurementsApi~postMeasurementsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.postMeasurements = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postMeasurements");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/measurements', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the v3MeasurementsUpdatePost operation.
     * @callback module:api/MeasurementsApi~v3MeasurementsUpdatePostCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Update a measurement
     * Delete a previously submitted measurement
     * @param {module:model/MeasurementUpdate} body The id as well as the new startTime, note, and/or value of the measurement to be updated
     * @param {module:api/MeasurementsApi~v3MeasurementsUpdatePostCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.v3MeasurementsUpdatePost = function(body, callback) {
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling v3MeasurementsUpdatePost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/measurements/update', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/CommonResponse":28,"../model/Measurement":43,"../model/MeasurementDelete":44,"../model/MeasurementSet":46,"../model/MeasurementUpdate":47,"../model/Pairs":48}],21:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CommonResponse', 'model/InlineResponse201', 'model/TrackingReminder', 'model/TrackingReminderDelete', 'model/TrackingReminderNotification', 'model/TrackingReminderNotificationPost'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CommonResponse'), require('../model/InlineResponse201'), require('../model/TrackingReminder'), require('../model/TrackingReminderDelete'), require('../model/TrackingReminderNotification'), require('../model/TrackingReminderNotificationPost'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.RemindersApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.CommonResponse, root.Quantimodo.InlineResponse201, root.Quantimodo.TrackingReminder, root.Quantimodo.TrackingReminderDelete, root.Quantimodo.TrackingReminderNotification, root.Quantimodo.TrackingReminderNotificationPost);
  }
}(this, function(ApiClient, CommonResponse, InlineResponse201, TrackingReminder, TrackingReminderDelete, TrackingReminderNotification, TrackingReminderNotificationPost) {
  'use strict';

  /**
   * Reminders service.
   * @module api/RemindersApi
   * @version 5.8.806
   */

  /**
   * Constructs a new RemindersApi. 
   * @alias module:api/RemindersApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteTrackingReminder operation.
     * @callback module:api/RemindersApi~deleteTrackingReminderCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete tracking reminder
     * Delete previously created tracking reminder
     * @param {module:model/TrackingReminderDelete} body Id of reminder to be deleted
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/RemindersApi~deleteTrackingReminderCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteTrackingReminder = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling deleteTrackingReminder");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/trackingReminders/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTrackingReminderNotifications operation.
     * @callback module:api/RemindersApi~getTrackingReminderNotificationsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/TrackingReminderNotification>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get specific pending tracking reminders
     * Specfic pending reminder instances that still need to be tracked.  
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {String} opts.reminderTime Example: (lt)2017-07-31 21:43:26
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/RemindersApi~getTrackingReminderNotificationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/TrackingReminderNotification>}
     */
    this.getTrackingReminderNotifications = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'variableCategoryName': opts['variableCategoryName'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'reminderTime': opts['reminderTime'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [TrackingReminderNotification];

      return this.apiClient.callApi(
        '/v4/trackingReminderNotifications', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTrackingReminders operation.
     * @callback module:api/RemindersApi~getTrackingRemindersCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/TrackingReminder>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get repeating tracking reminder settings
     * Users can be reminded to track certain variables at a specified frequency with a default value.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/RemindersApi~getTrackingRemindersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/TrackingReminder>}
     */
    this.getTrackingReminders = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'variableCategoryName': opts['variableCategoryName'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [TrackingReminder];

      return this.apiClient.callApi(
        '/v3/trackingReminders', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postTrackingReminderNotifications operation.
     * @callback module:api/RemindersApi~postTrackingReminderNotificationsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Snooze, skip, or track a pending tracking reminder notification
     * Snooze, skip, or track a pending tracking reminder notification
     * @param {Array.<module:model/TrackingReminderNotificationPost>} body Id of the pending reminder to be snoozed
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/RemindersApi~postTrackingReminderNotificationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postTrackingReminderNotifications = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postTrackingReminderNotifications");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v4/trackingReminderNotifications', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postTrackingReminders operation.
     * @callback module:api/RemindersApi~postTrackingRemindersCallback
     * @param {String} error Error message, if any.
     * @param {module:model/InlineResponse201} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Store a Tracking Reminder
     * This is to enable users to create reminders to track a variable with a default value at a specified frequency
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:model/TrackingReminder} opts.body TrackingReminder that should be stored
     * @param {module:api/RemindersApi~postTrackingRemindersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/InlineResponse201}
     */
    this.postTrackingReminders = function(opts, callback) {
      opts = opts || {};
      var postBody = opts['body'];


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse201;

      return this.apiClient.callApi(
        '/v3/trackingReminders', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/CommonResponse":28,"../model/InlineResponse201":41,"../model/TrackingReminder":51,"../model/TrackingReminderDelete":52,"../model/TrackingReminderNotification":53,"../model/TrackingReminderNotificationPost":54}],22:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Unit', 'model/UnitCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Unit'), require('../model/UnitCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UnitsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.Unit, root.Quantimodo.UnitCategory);
  }
}(this, function(ApiClient, Unit, UnitCategory) {
  'use strict';

  /**
   * Units service.
   * @module api/UnitsApi
   * @version 5.8.806
   */

  /**
   * Constructs a new UnitsApi. 
   * @alias module:api/UnitsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getUnitCategories operation.
     * @callback module:api/UnitsApi~getUnitCategoriesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/UnitCategory>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get unit categories
     * Get a list of the categories of measurement units such as &#39;Distance&#39;, &#39;Duration&#39;, &#39;Energy&#39;, &#39;Frequency&#39;, &#39;Miscellany&#39;, &#39;Pressure&#39;, &#39;Proportion&#39;, &#39;Rating&#39;, &#39;Temperature&#39;, &#39;Volume&#39;, and &#39;Weight&#39;.
     * @param {module:api/UnitsApi~getUnitCategoriesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/UnitCategory>}
     */
    this.getUnitCategories = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [UnitCategory];

      return this.apiClient.callApi(
        '/v3/unitCategories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUnits operation.
     * @callback module:api/UnitsApi~getUnitsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Unit>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get units
     * Get a list of the available measurement units
     * @param {module:api/UnitsApi~getUnitsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Unit>}
     */
    this.getUnits = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Unit];

      return this.apiClient.callApi(
        '/v3/units', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/Unit":55,"../model/UnitCategory":56}],23:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/User'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/User'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.User);
  }
}(this, function(ApiClient, User) {
  'use strict';

  /**
   * User service.
   * @module api/UserApi
   * @version 5.8.806
   */

  /**
   * Constructs a new UserApi. 
   * @alias module:api/UserApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getUser operation.
     * @callback module:api/UserApi~getUserCallback
     * @param {String} error Error message, if any.
     * @param {module:model/User} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get user info
     * Returns user info.  If no userId is specified, returns info for currently authenticated user
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/UserApi~getUserCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/User}
     */
    this.getUser = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = User;

      return this.apiClient.callApi(
        '/v3/user', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postUserSettings operation.
     * @callback module:api/UserApi~postUserSettingsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post UserSettings
     * Post UserSettings
     * @param {Object} opts Optional parameters
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/UserApi~postUserSettingsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.postUserSettings = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/userSettings', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/User":58}],24:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CommonResponse', 'model/UserTag', 'model/UserVariable', 'model/UserVariableDelete', 'model/Variable', 'model/VariableCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CommonResponse'), require('../model/UserTag'), require('../model/UserVariable'), require('../model/UserVariableDelete'), require('../model/Variable'), require('../model/VariableCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.VariablesApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.CommonResponse, root.Quantimodo.UserTag, root.Quantimodo.UserVariable, root.Quantimodo.UserVariableDelete, root.Quantimodo.Variable, root.Quantimodo.VariableCategory);
  }
}(this, function(ApiClient, CommonResponse, UserTag, UserVariable, UserVariableDelete, Variable, VariableCategory) {
  'use strict';

  /**
   * Variables service.
   * @module api/VariablesApi
   * @version 5.8.806
   */

  /**
   * Constructs a new VariablesApi. 
   * @alias module:api/VariablesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteUserTag operation.
     * @callback module:api/VariablesApi~deleteUserTagCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete user tag or ingredient
     * Delete previously created user tags or ingredients.
     * @param {Number} taggedVariableId This is the id of the variable being tagged with an ingredient or something.
     * @param {Number} tagVariableId This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
     * @param {module:api/VariablesApi~deleteUserTagCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteUserTag = function(taggedVariableId, tagVariableId, callback) {
      var postBody = null;

      // verify the required parameter 'taggedVariableId' is set
      if (taggedVariableId === undefined || taggedVariableId === null) {
        throw new Error("Missing the required parameter 'taggedVariableId' when calling deleteUserTag");
      }

      // verify the required parameter 'tagVariableId' is set
      if (tagVariableId === undefined || tagVariableId === null) {
        throw new Error("Missing the required parameter 'tagVariableId' when calling deleteUserTag");
      }


      var pathParams = {
      };
      var queryParams = {
        'taggedVariableId': taggedVariableId,
        'tagVariableId': tagVariableId
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/userTags/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deleteUserVariable operation.
     * @callback module:api/VariablesApi~deleteUserVariableCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete All Measurements For Variable
     * Users can delete all of their measurements for a variable
     * @param {module:model/UserVariableDelete} variableId Id of the variable whose measurements should be deleted
     * @param {module:api/VariablesApi~deleteUserVariableCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deleteUserVariable = function(variableId, callback) {
      var postBody = variableId;

      // verify the required parameter 'variableId' is set
      if (variableId === undefined || variableId === null) {
        throw new Error("Missing the required parameter 'variableId' when calling deleteUserVariable");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/userVariables/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getPublicVariables operation.
     * @callback module:api/VariablesApi~getPublicVariablesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Variable>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get public variables
     * This endpoint retrieves an array of all public variables. Public variables are things like foods, medications, symptoms, conditions, and anything not unique to a particular user. For instance, a telephone number or name would not be a public variable.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {Number} opts.id Common variable id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.name Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain &#x60;Mood&#x60;, the following query should be used: ?variableName&#x3D;%Mood%
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.sourceName ID of the source you want measurements for (supports exact name match only)
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.numberOfRawMeasurements Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
     * @param {String} opts.lastSourceName Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/VariablesApi~getPublicVariablesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Variable>}
     */
    this.getPublicVariables = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'id': opts['id'],
        'variableCategoryName': opts['variableCategoryName'],
        'name': opts['name'],
        'updatedAt': opts['updatedAt'],
        'sourceName': opts['sourceName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'numberOfRawMeasurements': opts['numberOfRawMeasurements'],
        'lastSourceName': opts['lastSourceName'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Variable];

      return this.apiClient.callApi(
        '/v3/public/variables', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUserVariables operation.
     * @callback module:api/VariablesApi~getUserVariablesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/UserVariable>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get variables with user&#39;s settings
     * Get variables for which the user has measurements. If the user has specified variable settings, these are provided instead of the common variable defaults.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {Number} opts.id Common variable id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.name Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain &#x60;Mood&#x60;, the following query should be used: ?variableName&#x3D;%Mood%
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.sourceName ID of the source you want measurements for (supports exact name match only)
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.numberOfRawMeasurements Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
     * @param {String} opts.lastSourceName Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/VariablesApi~getUserVariablesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/UserVariable>}
     */
    this.getUserVariables = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'id': opts['id'],
        'variableCategoryName': opts['variableCategoryName'],
        'name': opts['name'],
        'updatedAt': opts['updatedAt'],
        'sourceName': opts['sourceName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'numberOfRawMeasurements': opts['numberOfRawMeasurements'],
        'lastSourceName': opts['lastSourceName'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [UserVariable];

      return this.apiClient.callApi(
        '/v3/userVariables', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getVariableCategories operation.
     * @callback module:api/VariablesApi~getVariableCategoriesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/VariableCategory>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Variable categories
     * The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Work.
     * @param {module:api/VariablesApi~getVariableCategoriesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/VariableCategory>}
     */
    this.getVariableCategories = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [VariableCategory];

      return this.apiClient.callApi(
        '/v3/variableCategories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postUserTags operation.
     * @callback module:api/VariablesApi~postUserTagsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post or update user tags or ingredients
     * This endpoint allows users to tag foods with their ingredients.  This information will then be used to infer the user intake of the different ingredients by just entering the foods. The inferred intake levels will then be used to determine the effects of different nutrients on the user during analysis.
     * @param {module:model/UserTag} body Contains the new user tag data
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/VariablesApi~postUserTagsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postUserTags = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postUserTags");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/userTags', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postUserVariables operation.
     * @callback module:api/VariablesApi~postUserVariablesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Update User Settings for a Variable
     * Users can change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.
     * @param {Array.<module:model/UserVariable>} userVariables Variable user settings data
     * @param {Object} opts Optional parameters
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/VariablesApi~postUserVariablesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postUserVariables = function(userVariables, opts, callback) {
      opts = opts || {};
      var postBody = userVariables;

      // verify the required parameter 'userVariables' is set
      if (userVariables === undefined || userVariables === null) {
        throw new Error("Missing the required parameter 'userVariables' when calling postUserVariables");
      }


      var pathParams = {
      };
      var queryParams = {
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/userVariables', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the resetUserVariableSettings operation.
     * @callback module:api/VariablesApi~resetUserVariableSettingsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Reset user settings for a variable to defaults
     * Reset user settings for a variable to defaults
     * @param {module:model/UserVariableDelete} variableId Id of the variable whose measurements should be deleted
     * @param {module:api/VariablesApi~resetUserVariableSettingsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.resetUserVariableSettings = function(variableId, callback) {
      var postBody = variableId;

      // verify the required parameter 'variableId' is set
      if (variableId === undefined || variableId === null) {
        throw new Error("Missing the required parameter 'variableId' when calling resetUserVariableSettings");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/userVariables/reset', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/CommonResponse":28,"../model/UserTag":60,"../model/UserVariable":66,"../model/UserVariableDelete":67,"../model/Variable":68,"../model/VariableCategory":69}],25:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/AggregatedCorrelation', 'model/Button', 'model/CommonResponse', 'model/Connector', 'model/ConnectorInstruction', 'model/ConversionStep', 'model/Correlation', 'model/DataSource', 'model/Explanation', 'model/ExplanationStartTracking', 'model/GetCorrelationsDataResponse', 'model/GetCorrelationsResponse', 'model/GetUserCorrelationsDataResponse', 'model/GetUserCorrelationsDataResponseData', 'model/Image', 'model/InlineResponse201', 'model/JsonErrorResponse', 'model/Measurement', 'model/MeasurementDelete', 'model/MeasurementItem', 'model/MeasurementSet', 'model/MeasurementUpdate', 'model/Pairs', 'model/PostCorrelation', 'model/Study', 'model/TrackingReminder', 'model/TrackingReminderDelete', 'model/TrackingReminderNotification', 'model/TrackingReminderNotificationPost', 'model/Unit', 'model/UnitCategory', 'model/Update', 'model/User', 'model/UserCorrelation', 'model/UserTag', 'model/UserTokenFailedResponse', 'model/UserTokenRequest', 'model/UserTokenRequestInnerUserField', 'model/UserTokenSuccessfulResponse', 'model/UserTokenSuccessfulResponseInnerUserField', 'model/UserVariable', 'model/UserVariableDelete', 'model/Variable', 'model/VariableCategory', 'model/Vote', 'model/VoteDelete', 'api/AnalyticsApi', 'api/AuthenticationApi', 'api/ConnectorsApi', 'api/MeasurementsApi', 'api/RemindersApi', 'api/UnitsApi', 'api/UserApi', 'api/VariablesApi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('./ApiClient'), require('./model/AggregatedCorrelation'), require('./model/Button'), require('./model/CommonResponse'), require('./model/Connector'), require('./model/ConnectorInstruction'), require('./model/ConversionStep'), require('./model/Correlation'), require('./model/DataSource'), require('./model/Explanation'), require('./model/ExplanationStartTracking'), require('./model/GetCorrelationsDataResponse'), require('./model/GetCorrelationsResponse'), require('./model/GetUserCorrelationsDataResponse'), require('./model/GetUserCorrelationsDataResponseData'), require('./model/Image'), require('./model/InlineResponse201'), require('./model/JsonErrorResponse'), require('./model/Measurement'), require('./model/MeasurementDelete'), require('./model/MeasurementItem'), require('./model/MeasurementSet'), require('./model/MeasurementUpdate'), require('./model/Pairs'), require('./model/PostCorrelation'), require('./model/Study'), require('./model/TrackingReminder'), require('./model/TrackingReminderDelete'), require('./model/TrackingReminderNotification'), require('./model/TrackingReminderNotificationPost'), require('./model/Unit'), require('./model/UnitCategory'), require('./model/Update'), require('./model/User'), require('./model/UserCorrelation'), require('./model/UserTag'), require('./model/UserTokenFailedResponse'), require('./model/UserTokenRequest'), require('./model/UserTokenRequestInnerUserField'), require('./model/UserTokenSuccessfulResponse'), require('./model/UserTokenSuccessfulResponseInnerUserField'), require('./model/UserVariable'), require('./model/UserVariableDelete'), require('./model/Variable'), require('./model/VariableCategory'), require('./model/Vote'), require('./model/VoteDelete'), require('./api/AnalyticsApi'), require('./api/AuthenticationApi'), require('./api/ConnectorsApi'), require('./api/MeasurementsApi'), require('./api/RemindersApi'), require('./api/UnitsApi'), require('./api/UserApi'), require('./api/VariablesApi'));
  }
}(function(ApiClient, AggregatedCorrelation, Button, CommonResponse, Connector, ConnectorInstruction, ConversionStep, Correlation, DataSource, Explanation, ExplanationStartTracking, GetCorrelationsDataResponse, GetCorrelationsResponse, GetUserCorrelationsDataResponse, GetUserCorrelationsDataResponseData, Image, InlineResponse201, JsonErrorResponse, Measurement, MeasurementDelete, MeasurementItem, MeasurementSet, MeasurementUpdate, Pairs, PostCorrelation, Study, TrackingReminder, TrackingReminderDelete, TrackingReminderNotification, TrackingReminderNotificationPost, Unit, UnitCategory, Update, User, UserCorrelation, UserTag, UserTokenFailedResponse, UserTokenRequest, UserTokenRequestInnerUserField, UserTokenSuccessfulResponse, UserTokenSuccessfulResponseInnerUserField, UserVariable, UserVariableDelete, Variable, VariableCategory, Vote, VoteDelete, AnalyticsApi, AuthenticationApi, ConnectorsApi, MeasurementsApi, RemindersApi, UnitsApi, UserApi, VariablesApi) {
  'use strict';

  /**
   * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do)..<br>
   * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
   * <p>
   * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
   * <pre>
   * var Quantimodo = require('index'); // See note below*.
   * var xxxSvc = new Quantimodo.XxxApi(); // Allocate the API class we're going to use.
   * var yyyModel = new Quantimodo.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
   * and put the application logic within the callback function.</em>
   * </p>
   * <p>
   * A non-AMD browser application (discouraged) might do something like this:
   * <pre>
   * var xxxSvc = new Quantimodo.XxxApi(); // Allocate the API class we're going to use.
   * var yyy = new Quantimodo.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * </p>
   * @module index
   * @version 5.8.806
   */
  var exports = {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient: ApiClient,
    /**
     * The AggregatedCorrelation model constructor.
     * @property {module:model/AggregatedCorrelation}
     */
    AggregatedCorrelation: AggregatedCorrelation,
    /**
     * The Button model constructor.
     * @property {module:model/Button}
     */
    Button: Button,
    /**
     * The CommonResponse model constructor.
     * @property {module:model/CommonResponse}
     */
    CommonResponse: CommonResponse,
    /**
     * The Connector model constructor.
     * @property {module:model/Connector}
     */
    Connector: Connector,
    /**
     * The ConnectorInstruction model constructor.
     * @property {module:model/ConnectorInstruction}
     */
    ConnectorInstruction: ConnectorInstruction,
    /**
     * The ConversionStep model constructor.
     * @property {module:model/ConversionStep}
     */
    ConversionStep: ConversionStep,
    /**
     * The Correlation model constructor.
     * @property {module:model/Correlation}
     */
    Correlation: Correlation,
    /**
     * The DataSource model constructor.
     * @property {module:model/DataSource}
     */
    DataSource: DataSource,
    /**
     * The Explanation model constructor.
     * @property {module:model/Explanation}
     */
    Explanation: Explanation,
    /**
     * The ExplanationStartTracking model constructor.
     * @property {module:model/ExplanationStartTracking}
     */
    ExplanationStartTracking: ExplanationStartTracking,
    /**
     * The GetCorrelationsDataResponse model constructor.
     * @property {module:model/GetCorrelationsDataResponse}
     */
    GetCorrelationsDataResponse: GetCorrelationsDataResponse,
    /**
     * The GetCorrelationsResponse model constructor.
     * @property {module:model/GetCorrelationsResponse}
     */
    GetCorrelationsResponse: GetCorrelationsResponse,
    /**
     * The GetUserCorrelationsDataResponse model constructor.
     * @property {module:model/GetUserCorrelationsDataResponse}
     */
    GetUserCorrelationsDataResponse: GetUserCorrelationsDataResponse,
    /**
     * The GetUserCorrelationsDataResponseData model constructor.
     * @property {module:model/GetUserCorrelationsDataResponseData}
     */
    GetUserCorrelationsDataResponseData: GetUserCorrelationsDataResponseData,
    /**
     * The Image model constructor.
     * @property {module:model/Image}
     */
    Image: Image,
    /**
     * The InlineResponse201 model constructor.
     * @property {module:model/InlineResponse201}
     */
    InlineResponse201: InlineResponse201,
    /**
     * The JsonErrorResponse model constructor.
     * @property {module:model/JsonErrorResponse}
     */
    JsonErrorResponse: JsonErrorResponse,
    /**
     * The Measurement model constructor.
     * @property {module:model/Measurement}
     */
    Measurement: Measurement,
    /**
     * The MeasurementDelete model constructor.
     * @property {module:model/MeasurementDelete}
     */
    MeasurementDelete: MeasurementDelete,
    /**
     * The MeasurementItem model constructor.
     * @property {module:model/MeasurementItem}
     */
    MeasurementItem: MeasurementItem,
    /**
     * The MeasurementSet model constructor.
     * @property {module:model/MeasurementSet}
     */
    MeasurementSet: MeasurementSet,
    /**
     * The MeasurementUpdate model constructor.
     * @property {module:model/MeasurementUpdate}
     */
    MeasurementUpdate: MeasurementUpdate,
    /**
     * The Pairs model constructor.
     * @property {module:model/Pairs}
     */
    Pairs: Pairs,
    /**
     * The PostCorrelation model constructor.
     * @property {module:model/PostCorrelation}
     */
    PostCorrelation: PostCorrelation,
    /**
     * The Study model constructor.
     * @property {module:model/Study}
     */
    Study: Study,
    /**
     * The TrackingReminder model constructor.
     * @property {module:model/TrackingReminder}
     */
    TrackingReminder: TrackingReminder,
    /**
     * The TrackingReminderDelete model constructor.
     * @property {module:model/TrackingReminderDelete}
     */
    TrackingReminderDelete: TrackingReminderDelete,
    /**
     * The TrackingReminderNotification model constructor.
     * @property {module:model/TrackingReminderNotification}
     */
    TrackingReminderNotification: TrackingReminderNotification,
    /**
     * The TrackingReminderNotificationPost model constructor.
     * @property {module:model/TrackingReminderNotificationPost}
     */
    TrackingReminderNotificationPost: TrackingReminderNotificationPost,
    /**
     * The Unit model constructor.
     * @property {module:model/Unit}
     */
    Unit: Unit,
    /**
     * The UnitCategory model constructor.
     * @property {module:model/UnitCategory}
     */
    UnitCategory: UnitCategory,
    /**
     * The Update model constructor.
     * @property {module:model/Update}
     */
    Update: Update,
    /**
     * The User model constructor.
     * @property {module:model/User}
     */
    User: User,
    /**
     * The UserCorrelation model constructor.
     * @property {module:model/UserCorrelation}
     */
    UserCorrelation: UserCorrelation,
    /**
     * The UserTag model constructor.
     * @property {module:model/UserTag}
     */
    UserTag: UserTag,
    /**
     * The UserTokenFailedResponse model constructor.
     * @property {module:model/UserTokenFailedResponse}
     */
    UserTokenFailedResponse: UserTokenFailedResponse,
    /**
     * The UserTokenRequest model constructor.
     * @property {module:model/UserTokenRequest}
     */
    UserTokenRequest: UserTokenRequest,
    /**
     * The UserTokenRequestInnerUserField model constructor.
     * @property {module:model/UserTokenRequestInnerUserField}
     */
    UserTokenRequestInnerUserField: UserTokenRequestInnerUserField,
    /**
     * The UserTokenSuccessfulResponse model constructor.
     * @property {module:model/UserTokenSuccessfulResponse}
     */
    UserTokenSuccessfulResponse: UserTokenSuccessfulResponse,
    /**
     * The UserTokenSuccessfulResponseInnerUserField model constructor.
     * @property {module:model/UserTokenSuccessfulResponseInnerUserField}
     */
    UserTokenSuccessfulResponseInnerUserField: UserTokenSuccessfulResponseInnerUserField,
    /**
     * The UserVariable model constructor.
     * @property {module:model/UserVariable}
     */
    UserVariable: UserVariable,
    /**
     * The UserVariableDelete model constructor.
     * @property {module:model/UserVariableDelete}
     */
    UserVariableDelete: UserVariableDelete,
    /**
     * The Variable model constructor.
     * @property {module:model/Variable}
     */
    Variable: Variable,
    /**
     * The VariableCategory model constructor.
     * @property {module:model/VariableCategory}
     */
    VariableCategory: VariableCategory,
    /**
     * The Vote model constructor.
     * @property {module:model/Vote}
     */
    Vote: Vote,
    /**
     * The VoteDelete model constructor.
     * @property {module:model/VoteDelete}
     */
    VoteDelete: VoteDelete,
    /**
     * The AnalyticsApi service constructor.
     * @property {module:api/AnalyticsApi}
     */
    AnalyticsApi: AnalyticsApi,
    /**
     * The AuthenticationApi service constructor.
     * @property {module:api/AuthenticationApi}
     */
    AuthenticationApi: AuthenticationApi,
    /**
     * The ConnectorsApi service constructor.
     * @property {module:api/ConnectorsApi}
     */
    ConnectorsApi: ConnectorsApi,
    /**
     * The MeasurementsApi service constructor.
     * @property {module:api/MeasurementsApi}
     */
    MeasurementsApi: MeasurementsApi,
    /**
     * The RemindersApi service constructor.
     * @property {module:api/RemindersApi}
     */
    RemindersApi: RemindersApi,
    /**
     * The UnitsApi service constructor.
     * @property {module:api/UnitsApi}
     */
    UnitsApi: UnitsApi,
    /**
     * The UserApi service constructor.
     * @property {module:api/UserApi}
     */
    UserApi: UserApi,
    /**
     * The VariablesApi service constructor.
     * @property {module:api/VariablesApi}
     */
    VariablesApi: VariablesApi
  };

  return exports;
}));

},{"./ApiClient":16,"./api/AnalyticsApi":17,"./api/AuthenticationApi":18,"./api/ConnectorsApi":19,"./api/MeasurementsApi":20,"./api/RemindersApi":21,"./api/UnitsApi":22,"./api/UserApi":23,"./api/VariablesApi":24,"./model/AggregatedCorrelation":26,"./model/Button":27,"./model/CommonResponse":28,"./model/Connector":29,"./model/ConnectorInstruction":30,"./model/ConversionStep":31,"./model/Correlation":32,"./model/DataSource":33,"./model/Explanation":34,"./model/ExplanationStartTracking":35,"./model/GetCorrelationsDataResponse":36,"./model/GetCorrelationsResponse":37,"./model/GetUserCorrelationsDataResponse":38,"./model/GetUserCorrelationsDataResponseData":39,"./model/Image":40,"./model/InlineResponse201":41,"./model/JsonErrorResponse":42,"./model/Measurement":43,"./model/MeasurementDelete":44,"./model/MeasurementItem":45,"./model/MeasurementSet":46,"./model/MeasurementUpdate":47,"./model/Pairs":48,"./model/PostCorrelation":49,"./model/Study":50,"./model/TrackingReminder":51,"./model/TrackingReminderDelete":52,"./model/TrackingReminderNotification":53,"./model/TrackingReminderNotificationPost":54,"./model/Unit":55,"./model/UnitCategory":56,"./model/Update":57,"./model/User":58,"./model/UserCorrelation":59,"./model/UserTag":60,"./model/UserTokenFailedResponse":61,"./model/UserTokenRequest":62,"./model/UserTokenRequestInnerUserField":63,"./model/UserTokenSuccessfulResponse":64,"./model/UserTokenSuccessfulResponseInnerUserField":65,"./model/UserVariable":66,"./model/UserVariableDelete":67,"./model/Variable":68,"./model/VariableCategory":69,"./model/Vote":70,"./model/VoteDelete":71}],26:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.AggregatedCorrelation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The AggregatedCorrelation model module.
   * @module model/AggregatedCorrelation
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>AggregatedCorrelation</code>.
   * @alias module:model/AggregatedCorrelation
   * @class
   * @param cause {String} Variable name of the cause variable for which the user desires correlations.
   * @param correlationCoefficient {Number} Pearson correlation coefficient between cause and effect measurements
   * @param durationOfAction {Number} The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @param effect {String} Variable name of the effect variable for which the user desires correlations.
   * @param numberOfPairs {Number} Number of points that went into the correlation calculation
   * @param onsetDelay {Number} The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @param timestamp {Number} Time at which correlation was calculated
   */
  var exports = function(cause, correlationCoefficient, durationOfAction, effect, numberOfPairs, onsetDelay, timestamp) {
    var _this = this;










    _this['cause'] = cause;









    _this['correlationCoefficient'] = correlationCoefficient;



    _this['durationOfAction'] = durationOfAction;
    _this['effect'] = effect;








    _this['numberOfPairs'] = numberOfPairs;
    _this['onsetDelay'] = onsetDelay;





















    _this['timestamp'] = timestamp;



































































  };

  /**
   * Constructs a <code>AggregatedCorrelation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/AggregatedCorrelation} obj Optional instance to populate.
   * @return {module:model/AggregatedCorrelation} The populated <code>AggregatedCorrelation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'Number');
      }
      if (data.hasOwnProperty('causalityFactor')) {
        obj['causalityFactor'] = ApiClient.convertToType(data['causalityFactor'], 'Number');
      }
      if (data.hasOwnProperty('cause')) {
        obj['cause'] = ApiClient.convertToType(data['cause'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('causeUnit')) {
        obj['causeUnit'] = ApiClient.convertToType(data['causeUnit'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('effect')) {
        obj['effect'] = ApiClient.convertToType(data['effect'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('outcomeDataSources')) {
        obj['outcomeDataSources'] = ApiClient.convertToType(data['outcomeDataSources'], 'String');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('principalInvestigator')) {
        obj['principalInvestigator'] = ApiClient.convertToType(data['principalInvestigator'], 'String');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'Number');
      }
      if (data.hasOwnProperty('reverseCorrelation')) {
        obj['reverseCorrelation'] = ApiClient.convertToType(data['reverseCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('studyBackground')) {
        obj['studyBackground'] = ApiClient.convertToType(data['studyBackground'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCombinationOperation')) {
        obj['effectVariableCombinationOperation'] = ApiClient.convertToType(data['effectVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCommonAlias')) {
        obj['effectVariableCommonAlias'] = ApiClient.convertToType(data['effectVariableCommonAlias'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('createdTime')) {
        obj['createdTime'] = ApiClient.convertToType(data['createdTime'], 'Date');
      }
      if (data.hasOwnProperty('updatedTime')) {
        obj['updatedTime'] = ApiClient.convertToType(data['updatedTime'], 'Date');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'Number');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('causeDataSource')) {
        obj['causeDataSource'] = ApiClient.convertToType(data['causeDataSource'], Object);
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('effectDataSource')) {
        obj['effectDataSource'] = ApiClient.convertToType(data['effectDataSource'], Object);
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('pValue')) {
        obj['pValue'] = ApiClient.convertToType(data['pValue'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorMinimumAllowedValue')) {
        obj['predictorMinimumAllowedValue'] = ApiClient.convertToType(data['predictorMinimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorDataSources')) {
        obj['predictorDataSources'] = ApiClient.convertToType(data['predictorDataSources'], 'String');
      }
      if (data.hasOwnProperty('aggregateQMScore')) {
        obj['aggregateQMScore'] = ApiClient.convertToType(data['aggregateQMScore'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCorrelations')) {
        obj['numberOfCorrelations'] = ApiClient.convertToType(data['numberOfCorrelations'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUsers')) {
        obj['numberOfUsers'] = ApiClient.convertToType(data['numberOfUsers'], 'Number');
      }
      if (data.hasOwnProperty('forwardPearsonCorrelationCoefficient')) {
        obj['forwardPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['forwardPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('correlationIsContradictoryToOptimalValues')) {
        obj['correlationIsContradictoryToOptimalValues'] = ApiClient.convertToType(data['correlationIsContradictoryToOptimalValues'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * 
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * 
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Average Vote
   * @member {Number} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * 
   * @member {Number} causalityFactor
   */
  exports.prototype['causalityFactor'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} cause
   */
  exports.prototype['cause'] = undefined;
  /**
   * Variable category of the cause variable.
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Number of changes in the predictor variable (a.k.a the number of experiments)
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * The way cause measurements are aggregated
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * 
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Unit of the predictor variable
   * @member {String} causeUnit
   */
  exports.prototype['causeUnit'] = undefined;
  /**
   * Unit Id of the predictor variable
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * 
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Pearson correlation coefficient between cause and effect measurements
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * How the data was analyzed
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * How the data was obtained
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effect
   */
  exports.prototype['effect'] = undefined;
  /**
   * Variable category of the effect variable.
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * 
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Illustrates the strength of the relationship
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Large image for Facebook
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Number of points that went into the correlation calculation
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Optimal Pearson Product
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * original name of the cause.
   * @member {String} outcomeDataSources
   */
  exports.prototype['outcomeDataSources'] = undefined;
  /**
   * HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Mike Sinn
   * @member {String} principalInvestigator
   */
  exports.prototype['principalInvestigator'] = undefined;
  /**
   * Value representing the significance of the relationship as a function of crowdsourced insights, predictive strength, data quantity, and data quality
   * @member {Number} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Correlation when cause and effect are reversed. For any causal relationship, the forward correlation should exceed the reverse correlation.
   * @member {Number} reverseCorrelation
   */
  exports.prototype['reverseCorrelation'] = undefined;
  /**
   * Using a two-tailed t-test with alpha = 0.05, it was determined that the change...
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * A function of the effect size and sample size
   * @member {String} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * weak, moderate, strong
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * These data suggest with a high degree of confidence...
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * In order to reduce suffering through the advancement of human knowledge...
   * @member {String} studyBackground
   */
  exports.prototype['studyBackground'] = undefined;
  /**
   * This study is based on data donated by one QuantiModo user...
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * As with any human experiment, it was impossible to control for all potentially confounding variables...
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Url for the interactive study within the web app
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Url for sharing the study on Facebook
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Url for sharing the study on Google+
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Url for sharing the study on Twitter
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Url for sharing the statically rendered study on social media
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * The objective of this study is to determine...
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * This analysis suggests that...
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * N1 Study HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Time at which correlation was calculated
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * User Vote
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * cause value that predicts an above average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Overall Mood, on average, 34% HIGHER after around 3.98mg Remeron
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * cause value that predicts a below average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Overall Mood, on average, 4% LOWER after around 0mg Remeron
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: 0.396
   * @member {Number} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.453667
   * @member {Number} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.14344467795996
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 193
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 2014-07-30 12:50:00
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 2012-05-06 21:15:00
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 0.528359
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: -86400
   * @member {Number} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 0.477
   * @member {Number} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: 17
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -11
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0.613
   * @member {Number} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 9.6986079652717
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: MEAN
   * @member {String} effectVariableCombinationOperation
   */
  exports.prototype['effectVariableCombinationOperation'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} effectVariableCommonAlias
   */
  exports.prototype['effectVariableCommonAlias'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 1
   * @member {Number} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: -1
   * @member {Number} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: -1
   * @member {Number} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 2016-12-28 20:47:30
   * @member {Date} createdTime
   */
  exports.prototype['createdTime'] = undefined;
  /**
   * Example: 2017-05-06 15:40:38
   * @member {Date} updatedTime
   */
  exports.prototype['updatedTime'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: -24
   * @member {Number} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: /5
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: /5
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: /5
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: , on average, 17% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 11% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: {\"id\":6,\"name\":\"up\",\"connectorClientId\":\"10RfjEgKr8U\",\"connectorClientSecret\":\"e17fd34e4bc4642f0c4c99d7acb6e661\",\"displayName\":\"Up by Jawbone\",\"image\":\"https://i.imgur.com/MXNQy3T.png\",\"getItUrl\":\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\",\"shortDescription\":\"Tracks sleep, exercise, and diet.\",\"longDescription\":\"UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"enabled\":1,\"affiliate\":true,\"defaultVariableCategoryName\":\"Physical Activity\",\"imageHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\"><img id=\\\"up_image\\\" title=\\\"Up by Jawbone\\\" src=\\\"https://i.imgur.com/MXNQy3T.png\\\" alt=\\\"Up by Jawbone\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>\"}
   * @member {Object} causeDataSource
   */
  exports.prototype['causeDataSource'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: {\"id\":72,\"name\":\"quantimodo\",\"displayName\":\"QuantiModo\",\"image\":\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\",\"getItUrl\":\"https://quantimo.do\",\"shortDescription\":\"Tracks anything\",\"longDescription\":\"QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"enabled\":0,\"affiliate\":true,\"defaultVariableCategoryName\":\"Foods\",\"imageHtml\":\"<a href=\\\"https://quantimo.do\\\"><img id=\\\"quantimodo_image\\\" title=\\\"QuantiModo\\\" src=\\\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\\\" alt=\\\"QuantiModo\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"https://quantimo.do\\\">QuantiModo</a>\"}
   * @member {Object} effectDataSource
   */
  exports.prototype['effectDataSource'] = undefined;
  /**
   * Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: 3.5306635529222E-5
   * @member {Number} pValue
   */
  exports.prototype['pValue'] = undefined;
  /**
   * Example: 0.63628232030415
   * @member {Number} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 10
   * @member {Number} predictorMinimumAllowedValue
   */
  exports.prototype['predictorMinimumAllowedValue'] = undefined;
  /**
   * Example: 160934
   * @member {Number} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: RescueTime
   * @member {String} predictorDataSources
   */
  exports.prototype['predictorDataSources'] = undefined;
  /**
   * Example: 0.011598441286655
   * @member {Number} aggregateQMScore
   */
  exports.prototype['aggregateQMScore'] = undefined;
  /**
   * Example: 6
   * @member {Number} numberOfCorrelations
   */
  exports.prototype['numberOfCorrelations'] = undefined;
  /**
   * Example: 6
   * @member {Number} numberOfUsers
   */
  exports.prototype['numberOfUsers'] = undefined;
  /**
   * Example: 0.0333
   * @member {Number} forwardPearsonCorrelationCoefficient
   */
  exports.prototype['forwardPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} correlationIsContradictoryToOptimalValues
   */
  exports.prototype['correlationIsContradictoryToOptimalValues'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],27:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Button = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Button model module.
   * @module model/Button
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Button</code>.
   * @alias module:model/Button
   * @class
   * @param text {String} Example: Start Tracking
   * @param link {String} Example: https://local.quantimo.do
   */
  var exports = function(text, link) {
    var _this = this;

    _this['text'] = text;
    _this['link'] = link;
  };

  /**
   * Constructs a <code>Button</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Button} obj Optional instance to populate.
   * @return {module:model/Button} The populated <code>Button</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
      if (data.hasOwnProperty('link')) {
        obj['link'] = ApiClient.convertToType(data['link'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: Start Tracking
   * @member {String} text
   */
  exports.prototype['text'] = undefined;
  /**
   * Example: https://local.quantimo.do
   * @member {String} link
   */
  exports.prototype['link'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],28:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GetCorrelationsDataResponse'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./GetCorrelationsDataResponse'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.CommonResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.GetCorrelationsDataResponse);
  }
}(this, function(ApiClient, GetCorrelationsDataResponse) {
  'use strict';




  /**
   * The CommonResponse model module.
   * @module model/CommonResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>CommonResponse</code>.
   * @alias module:model/CommonResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>CommonResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CommonResponse} obj Optional instance to populate.
   * @return {module:model/CommonResponse} The populated <code>CommonResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = GetCorrelationsDataResponse.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/GetCorrelationsDataResponse} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./GetCorrelationsDataResponse":36}],29:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Connector = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Connector model module.
   * @module model/Connector
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Connector</code>.
   * @alias module:model/Connector
   * @class
   * @param id {Number} Connector ID number
   * @param name {String} Connector lowercase system name
   * @param displayName {String} Connector pretty display name
   * @param image {String} URL to the image of the connector logo
   * @param getItUrl {String} URL to a site where one can get this device or application
   * @param connected {String} True if the authenticated user has this connector enabled
   * @param connectInstructions {String} URL and parameters used when connecting to a service
   * @param lastUpdate {Number} Epoch timestamp of last sync
   * @param totalMeasurementsInLastUpdate {Number} Number of measurements obtained during latest update
   */
  var exports = function(id, name, displayName, image, getItUrl, connected, connectInstructions, lastUpdate, totalMeasurementsInLastUpdate) {
    var _this = this;

    _this['id'] = id;
    _this['name'] = name;
    _this['displayName'] = displayName;
    _this['image'] = image;
    _this['getItUrl'] = getItUrl;
    _this['connected'] = connected;
    _this['connectInstructions'] = connectInstructions;
    _this['lastUpdate'] = lastUpdate;
    _this['totalMeasurementsInLastUpdate'] = totalMeasurementsInLastUpdate;


















  };

  /**
   * Constructs a <code>Connector</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Connector} obj Optional instance to populate.
   * @return {module:model/Connector} The populated <code>Connector</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = ApiClient.convertToType(data['image'], 'String');
      }
      if (data.hasOwnProperty('getItUrl')) {
        obj['getItUrl'] = ApiClient.convertToType(data['getItUrl'], 'String');
      }
      if (data.hasOwnProperty('connected')) {
        obj['connected'] = ApiClient.convertToType(data['connected'], 'String');
      }
      if (data.hasOwnProperty('connectInstructions')) {
        obj['connectInstructions'] = ApiClient.convertToType(data['connectInstructions'], 'String');
      }
      if (data.hasOwnProperty('lastUpdate')) {
        obj['lastUpdate'] = ApiClient.convertToType(data['lastUpdate'], 'Number');
      }
      if (data.hasOwnProperty('totalMeasurementsInLastUpdate')) {
        obj['totalMeasurementsInLastUpdate'] = ApiClient.convertToType(data['totalMeasurementsInLastUpdate'], 'Number');
      }
      if (data.hasOwnProperty('connectStatus')) {
        obj['connectStatus'] = ApiClient.convertToType(data['connectStatus'], 'String');
      }
      if (data.hasOwnProperty('updateRequestedAt')) {
        obj['updateRequestedAt'] = ApiClient.convertToType(data['updateRequestedAt'], 'Date');
      }
      if (data.hasOwnProperty('shortDescription')) {
        obj['shortDescription'] = ApiClient.convertToType(data['shortDescription'], 'String');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('lastSuccessfulUpdatedAt')) {
        obj['lastSuccessfulUpdatedAt'] = ApiClient.convertToType(data['lastSuccessfulUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('imageHtml')) {
        obj['imageHtml'] = ApiClient.convertToType(data['imageHtml'], 'String');
      }
      if (data.hasOwnProperty('updateStatus')) {
        obj['updateStatus'] = ApiClient.convertToType(data['updateStatus'], 'String');
      }
      if (data.hasOwnProperty('oauth')) {
        obj['oauth'] = ApiClient.convertToType(data['oauth'], Object);
      }
      if (data.hasOwnProperty('defaultVariableCategoryName')) {
        obj['defaultVariableCategoryName'] = ApiClient.convertToType(data['defaultVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('connectorClientId')) {
        obj['connectorClientId'] = ApiClient.convertToType(data['connectorClientId'], 'String');
      }
      if (data.hasOwnProperty('longDescription')) {
        obj['longDescription'] = ApiClient.convertToType(data['longDescription'], 'String');
      }
      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Number');
      }
      if (data.hasOwnProperty('linkedDisplayNameHtml')) {
        obj['linkedDisplayNameHtml'] = ApiClient.convertToType(data['linkedDisplayNameHtml'], 'String');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('connectorId')) {
        obj['connectorId'] = ApiClient.convertToType(data['connectorId'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
    }
    return obj;
  }

  /**
   * Connector ID number
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Connector lowercase system name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Connector pretty display name
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * URL to the image of the connector logo
   * @member {String} image
   */
  exports.prototype['image'] = undefined;
  /**
   * URL to a site where one can get this device or application
   * @member {String} getItUrl
   */
  exports.prototype['getItUrl'] = undefined;
  /**
   * True if the authenticated user has this connector enabled
   * @member {String} connected
   */
  exports.prototype['connected'] = undefined;
  /**
   * URL and parameters used when connecting to a service
   * @member {String} connectInstructions
   */
  exports.prototype['connectInstructions'] = undefined;
  /**
   * Epoch timestamp of last sync
   * @member {Number} lastUpdate
   */
  exports.prototype['lastUpdate'] = undefined;
  /**
   * Number of measurements obtained during latest update
   * @member {Number} totalMeasurementsInLastUpdate
   */
  exports.prototype['totalMeasurementsInLastUpdate'] = undefined;
  /**
   * Example: CONNECTED
   * @member {String} connectStatus
   */
  exports.prototype['connectStatus'] = undefined;
  /**
   * Example: 2017-07-18 05:16:31
   * @member {Date} updateRequestedAt
   */
  exports.prototype['updateRequestedAt'] = undefined;
  /**
   * Example: Tracks social interaction. QuantiModo requires permission to access your Facebook \"user likes\" and \"user posts\".
   * @member {String} shortDescription
   */
  exports.prototype['shortDescription'] = undefined;
  /**
   * Example: Got 412 new measurements on 2017-07-31 10:10:34
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * Example: 2017-07-31 10:10:34
   * @member {Date} lastSuccessfulUpdatedAt
   */
  exports.prototype['lastSuccessfulUpdatedAt'] = undefined;
  /**
   * Example: <a href=\"http://www.facebook.com\"><img id=\"facebook_image\" title=\"Facebook\" src=\"https://i.imgur.com/GhwqK4f.png\" alt=\"Facebook\"></a>
   * @member {String} imageHtml
   */
  exports.prototype['imageHtml'] = undefined;
  /**
   * Example: UPDATED
   * @member {String} updateStatus
   */
  exports.prototype['updateStatus'] = undefined;
  /**
   * Example: {}
   * @member {Object} oauth
   */
  exports.prototype['oauth'] = undefined;
  /**
   * Example: Social Interactions
   * @member {String} defaultVariableCategoryName
   */
  exports.prototype['defaultVariableCategoryName'] = undefined;
  /**
   * Example: 225078261031461
   * @member {String} connectorClientId
   */
  exports.prototype['connectorClientId'] = undefined;
  /**
   * Example: Facebook is a social networking website where users may create a personal profile, add other users as friends, and exchange messages.
   * @member {String} longDescription
   */
  exports.prototype['longDescription'] = undefined;
  /**
   * Example: 1
   * @member {Number} enabled
   */
  exports.prototype['enabled'] = undefined;
  /**
   * Example: <a href=\"http://www.facebook.com\">Facebook</a>
   * @member {String} linkedDisplayNameHtml
   */
  exports.prototype['linkedDisplayNameHtml'] = undefined;
  /**
   * Example: ghostInspector
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 8
   * @member {Number} connectorId
   */
  exports.prototype['connectorId'] = undefined;
  /**
   * Example: 2000-01-01 00:00:00
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 2017-07-31 10:10:34
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],30:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ConnectorInstruction = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ConnectorInstruction model module.
   * @module model/ConnectorInstruction
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>ConnectorInstruction</code>.
   * @alias module:model/ConnectorInstruction
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>ConnectorInstruction</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ConnectorInstruction} obj Optional instance to populate.
   * @return {module:model/ConnectorInstruction} The populated <code>ConnectorInstruction</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('parameters')) {
        obj['parameters'] = ApiClient.convertToType(data['parameters'], ['String']);
      }
      if (data.hasOwnProperty('usePopup')) {
        obj['usePopup'] = ApiClient.convertToType(data['usePopup'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * url
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * parameters array
   * @member {Array.<String>} parameters
   */
  exports.prototype['parameters'] = undefined;
  /**
   * usePopup
   * @member {Boolean} usePopup
   */
  exports.prototype['usePopup'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],31:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ConversionStep = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ConversionStep model module.
   * @module model/ConversionStep
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>ConversionStep</code>.
   * @alias module:model/ConversionStep
   * @class
   * @param operation {module:model/ConversionStep.OperationEnum} ADD or MULTIPLY
   * @param value {Number} This specifies the order of conversion steps starting with 0
   */
  var exports = function(operation, value) {
    var _this = this;

    _this['operation'] = operation;
    _this['value'] = value;
  };

  /**
   * Constructs a <code>ConversionStep</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ConversionStep} obj Optional instance to populate.
   * @return {module:model/ConversionStep} The populated <code>ConversionStep</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('operation')) {
        obj['operation'] = ApiClient.convertToType(data['operation'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
    }
    return obj;
  }

  /**
   * ADD or MULTIPLY
   * @member {module:model/ConversionStep.OperationEnum} operation
   */
  exports.prototype['operation'] = undefined;
  /**
   * This specifies the order of conversion steps starting with 0
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;


  /**
   * Allowed values for the <code>operation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.OperationEnum = {
    /**
     * value: "MULTIPLY"
     * @const
     */
    "MULTIPLY": "MULTIPLY",
    /**
     * value: "ADD"
     * @const
     */
    "ADD": "ADD"  };


  return exports;
}));



},{"../ApiClient":16}],32:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Correlation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Correlation model module.
   * @module model/Correlation
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Correlation</code>.
   * @alias module:model/Correlation
   * @class
   * @param causeVariableName {String} Example: Sleep Quality
   * @param effectVariableName {String} Example: Overall Mood
   * @param averageDailyHighCause {Number} Example: 4.19
   * @param averageDailyLowCause {Number} Example: 1.97
   * @param averageEffect {Number} Example: 3.0791054117396
   * @param averageEffectFollowingHighCause {Number} Example: 3.55
   * @param averageEffectFollowingLowCause {Number} Example: 2.65
   * @param averageForwardPearsonCorrelationOverOnsetDelays {Number} Example: 0.396
   * @param averageReversePearsonCorrelationOverOnsetDelays {Number} Example: 0.453667
   * @param causeChanges {Number} Example: 164
   * @param causeVariableId {Number} Example: 1448
   * @param confidenceInterval {Number} Example: 0.14344467795996
   * @param createdAt {Date} Example: 2016-12-28 20:47:30
   * @param criticalTValue {Number} Example: 1.646
   * @param durationOfAction {Number} Example: 604800
   * @param effectChanges {Number} Example: 193
   * @param effectVariableId {Number} Example: 1398
   * @param experimentEndTime {Date} Example: 2014-07-30 12:50:00
   * @param experimentStartTime {Date} Example: 2012-05-06 21:15:00
   * @param correlationCoefficient {Number} Example: 0.538
   * @param forwardSpearmanCorrelationCoefficient {Number} Example: 0.528359
   * @param numberOfPairs {Number} Example: 298
   * @param onsetDelayWithStrongestPearsonCorrelation {Number} Example: -86400
   * @param optimalPearsonProduct {Number} Example: 0.68582816186982
   * @param pearsonCorrelationWithNoOnsetDelay {Number} Example: 0.477
   * @param predictivePearsonCorrelation {Number} Example: 0.538
   * @param predictsHighEffectChange {Number} Example: 17
   * @param predictsLowEffectChange {Number} Example: -11
   * @param qmScore {Number} Example: 0.528
   * @param statisticalSignificance {Number} Example: 0.9813
   * @param strongestPearsonCorrelationCoefficient {Number} Example: 0.613
   * @param tValue {Number} Example: 9.6986079652717
   * @param updatedAt {Date} Example: 2017-05-06 15:40:38
   * @param userId {Number} Example: 230
   * @param valuePredictingHighOutcome {Number} Example: 4.14
   * @param valuePredictingLowOutcome {Number} Example: 3.03
   * @param causeVariableCombinationOperation {String} Example: MEAN
   * @param causeVariableDefaultUnitId {Number} Example: 10
   * @param causeVariableImageUrl {String} Example: https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png
   * @param causeVariableIonIcon {String} Example: ion-ios-cloudy-night-outline
   * @param causeVariableMostCommonConnectorId {Number} Example: 6
   * @param causeVariableCategoryId {Number} Example: 6
   * @param effectVariableCombinationOperation {String} Example: MEAN
   * @param effectVariableCommonAlias {String} Example: Mood_(psychology)
   * @param effectVariableDefaultUnitId {Number} Example: 10
   * @param effectVariableImageUrl {String} Example: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png
   * @param effectVariableIonIcon {String} Example: ion-happy-outline
   * @param effectVariableMostCommonConnectorId {Number} Example: 10
   * @param effectVariableCategoryId {Number} Example: 1
   * @param timestamp {Number} Example: 1494085127
   * @param userVote {Number} Example: 1
   * @param causeUserVariableShareUserMeasurements {Number} Example: 1
   * @param effectUserVariableShareUserMeasurements {Number} Example: 1
   * @param predictorFillingValue {Number} Example: -1
   * @param outcomeFillingValue {Number} Example: -1
   * @param averageVote {String} Example: 0.9855
   * @param durationOfActionInHours {Number} Example: 168
   * @param onsetDelayWithStrongestPearsonCorrelationInHours {Number} Example: -24
   * @param effectVariableCategoryName {String} Example: Emotions
   * @param causeVariableCategoryName {String} Example: Sleep
   * @param direction {String} Example: higher
   * @param causeVariableDefaultUnitAbbreviatedName {String} Example: /5
   * @param effectVariableDefaultUnitAbbreviatedName {String} Example: /5
   * @param causeVariableDefaultUnitName {String} Example: 1 to 5 Rating
   * @param effectVariableDefaultUnitName {String} Example: 1 to 5 Rating
   * @param shareUserMeasurements {Boolean} Example: 1
   * @param effectUnit {String} Example: /5
   * @param significanceExplanation {String} Example: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Overall Mood is statistically significant at 95% confidence interval. 
   * @param significantDifference {Boolean} Example: 1
   * @param effectSize {String} Example: moderately positive
   * @param predictsHighEffectChangeSentenceFragment {String} Example: , on average, 17% 
   * @param predictsLowEffectChangeSentenceFragment {String} Example: , on average, 11% 
   * @param valuePredictingHighOutcomeExplanation {String} Example: Overall Mood, on average, 17% higher after around 4.14/5 Sleep Quality 
   * @param averageEffectFollowingHighCauseExplanation {String} Example: Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality
   * @param averageEffectFollowingLowCauseExplanation {String} Example: Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @param valuePredictingLowOutcomeExplanation {String} Example: Overall Mood, on average, 11% lower after around 3.03/5 Sleep Quality 
   * @param strengthLevel {String} Example: moderate
   * @param confidenceLevel {String} Example: high
   * @param predictivePearsonCorrelationCoefficient {Number} Example: 0.538
   * @param predictorExplanation {String} Example: Sleep Quality Predicts Higher Overall Mood
   * @param studyTitle {String} Example: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @param studyAbstract {String} Example: Your data suggests with a high degree of confidence (p=0) that Sleep Quality (Sleep) has a moderately positive predictive relationship (R=0.538) with Overall Mood  (Emotions).  The highest quartile of Overall Mood  measurements were observed following an average 4.14/5 Sleep Quality.  The lowest quartile of Overall Mood  measurements were observed following an average 3.03/5 Sleep Quality.
   * @param studyLinkStatic {String} Example: https://local.quantimo.do/api/v2/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @param studyLinkDynamic {String} Example: https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @param studyLinkFacebook {String} Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @param studyLinkGoogle {String} Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @param studyLinkTwitter {String} Example: https://twitter.com/home?status=Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%20%40quantimodo
   * @param studyLinkEmail {String} Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @param gaugeImage {String} Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship.png
   * @param gaugeImageSquare {String} Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @param imageUrl {String} Example: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png
   * @param studyDesign {String} Example: This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. 
   * @param studyObjective {String} Example: The objective of this study is to determine the nature of the relationship (if any) between the Sleep Quality and the Overall Mood. Additionally, we attempt to determine the Sleep Quality values most likely to produce optimal Overall Mood values. 
   * @param dataSources {String} Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.<br>Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @param causeDataSource {Object} Example: {\"id\":6,\"name\":\"up\",\"connectorClientId\":\"10RfjEgKr8U\",\"connectorClientSecret\":\"e17fd34e4bc4642f0c4c99d7acb6e661\",\"displayName\":\"Up by Jawbone\",\"image\":\"https://i.imgur.com/MXNQy3T.png\",\"getItUrl\":\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\",\"shortDescription\":\"Tracks sleep, exercise, and diet.\",\"longDescription\":\"UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"enabled\":1,\"affiliate\":true,\"defaultVariableCategoryName\":\"Physical Activity\",\"imageHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\"><img id=\\\"up_image\\\" title=\\\"Up by Jawbone\\\" src=\\\"https://i.imgur.com/MXNQy3T.png\\\" alt=\\\"Up by Jawbone\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>\"}
   * @param dataSourcesParagraphForCause {String} Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @param instructionsForCause {String} Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @param effectDataSource {Object} Example: {\"id\":72,\"name\":\"quantimodo\",\"displayName\":\"QuantiModo\",\"image\":\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\",\"getItUrl\":\"https://quantimo.do\",\"shortDescription\":\"Tracks anything\",\"longDescription\":\"QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"enabled\":0,\"affiliate\":true,\"defaultVariableCategoryName\":\"Foods\",\"imageHtml\":\"<a href=\\\"https://quantimo.do\\\"><img id=\\\"quantimodo_image\\\" title=\\\"QuantiModo\\\" src=\\\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\\\" alt=\\\"QuantiModo\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"https://quantimo.do\\\">QuantiModo</a>\"}
   * @param dataSourcesParagraphForEffect {String} Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @param instructionsForEffect {String} Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @param dataAnalysis {String} Example: It was assumed that 0 hours would pass before a change in Sleep Quality would produce an observable change in Overall Mood.  It was assumed that Sleep Quality could produce an observable change in Overall Mood for as much as 7 days after the stimulus event.  
   * @param studyResults {String} Example: This analysis suggests that higher Sleep Quality (Sleep) generally predicts higher Overall Mood (p = 0).  Overall Mood is, on average, 17%  higher after around 4.14 Sleep Quality.  After an onset delay of 168 hours, Overall Mood is, on average, 11%  lower than its average over the 168 hours following around 3.03 Sleep Quality.  298 data points were used in this analysis.  The value for Sleep Quality changed 164 times, effectively running 82 separate natural experiments.  The top quartile outcome values are preceded by an average 4.14 /5 of Sleep Quality.  The bottom quartile outcome values are preceded by an average 3.03 /5 of Sleep Quality.  Forward Pearson Correlation Coefficient was 0.538 (p=0, 95% CI 0.395 to 0.681 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -0.143 to 0.143, onset delay = -0 hours, duration of action = -168 hours). When the Sleep Quality value is closer to 4.14 /5 than 3.03 /5, the Overall Mood value which follows is, on average, 17%  percent higher than its typical value.  When the Sleep Quality value is closer to 3.03 /5 than 4.14 /5, the Overall Mood value which follows is 0% lower than its typical value.  Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality  Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @param studyLimitations {String} Example: As with any human experiment, it was impossible to control for all potentially confounding variables.                           Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.               However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great              confidence rule out non-existent relationships. For instance, if we discover no relationship between mood             and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.              <br>             <br>                         We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.              The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.             The list of the criteria is as follows:             <br>             1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.             <br>             2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.             <br>             3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.             <br>             4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).             <br>             5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.             <br>             6. Plausibility: A plausible mechanism between cause and effect is helpful.             <br>             7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.             <br>             8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".             <br>             9. Analogy: The effect of similar factors may be considered.             <br>             <br>                            The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  298 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Sleep Quality values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,             one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely             that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will             naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.
   * @param onsetDelay {Number} Example: 0
   * @param onsetDelayInHours {Number} Example: 0
   * @param predictorMinimumAllowedValue {Number} Example: 30
   * @param predictorMaximumAllowedValue {Number} Example: 200
   * @param reversePearsonCorrelationCoefficient {Number} Example: 0.01377184270977
   * @param predictorDataSources {String} Example: RescueTime
   */
  var exports = function(causeVariableName, effectVariableName, averageDailyHighCause, averageDailyLowCause, averageEffect, averageEffectFollowingHighCause, averageEffectFollowingLowCause, averageForwardPearsonCorrelationOverOnsetDelays, averageReversePearsonCorrelationOverOnsetDelays, causeChanges, causeVariableId, confidenceInterval, createdAt, criticalTValue, durationOfAction, effectChanges, effectVariableId, experimentEndTime, experimentStartTime, correlationCoefficient, forwardSpearmanCorrelationCoefficient, numberOfPairs, onsetDelayWithStrongestPearsonCorrelation, optimalPearsonProduct, pearsonCorrelationWithNoOnsetDelay, predictivePearsonCorrelation, predictsHighEffectChange, predictsLowEffectChange, qmScore, statisticalSignificance, strongestPearsonCorrelationCoefficient, tValue, updatedAt, userId, valuePredictingHighOutcome, valuePredictingLowOutcome, causeVariableCombinationOperation, causeVariableDefaultUnitId, causeVariableImageUrl, causeVariableIonIcon, causeVariableMostCommonConnectorId, causeVariableCategoryId, effectVariableCombinationOperation, effectVariableCommonAlias, effectVariableDefaultUnitId, effectVariableImageUrl, effectVariableIonIcon, effectVariableMostCommonConnectorId, effectVariableCategoryId, timestamp, userVote, causeUserVariableShareUserMeasurements, effectUserVariableShareUserMeasurements, predictorFillingValue, outcomeFillingValue, averageVote, durationOfActionInHours, onsetDelayWithStrongestPearsonCorrelationInHours, effectVariableCategoryName, causeVariableCategoryName, direction, causeVariableDefaultUnitAbbreviatedName, effectVariableDefaultUnitAbbreviatedName, causeVariableDefaultUnitName, effectVariableDefaultUnitName, shareUserMeasurements, effectUnit, significanceExplanation, significantDifference, effectSize, predictsHighEffectChangeSentenceFragment, predictsLowEffectChangeSentenceFragment, valuePredictingHighOutcomeExplanation, averageEffectFollowingHighCauseExplanation, averageEffectFollowingLowCauseExplanation, valuePredictingLowOutcomeExplanation, strengthLevel, confidenceLevel, predictivePearsonCorrelationCoefficient, predictorExplanation, studyTitle, studyAbstract, studyLinkStatic, studyLinkDynamic, studyLinkFacebook, studyLinkGoogle, studyLinkTwitter, studyLinkEmail, gaugeImage, gaugeImageSquare, imageUrl, studyDesign, studyObjective, dataSources, causeDataSource, dataSourcesParagraphForCause, instructionsForCause, effectDataSource, dataSourcesParagraphForEffect, instructionsForEffect, dataAnalysis, studyResults, studyLimitations, onsetDelay, onsetDelayInHours, predictorMinimumAllowedValue, predictorMaximumAllowedValue, reversePearsonCorrelationCoefficient, predictorDataSources) {
    var _this = this;

    _this['causeVariableName'] = causeVariableName;
    _this['effectVariableName'] = effectVariableName;
    _this['averageDailyHighCause'] = averageDailyHighCause;
    _this['averageDailyLowCause'] = averageDailyLowCause;
    _this['averageEffect'] = averageEffect;
    _this['averageEffectFollowingHighCause'] = averageEffectFollowingHighCause;
    _this['averageEffectFollowingLowCause'] = averageEffectFollowingLowCause;
    _this['averageForwardPearsonCorrelationOverOnsetDelays'] = averageForwardPearsonCorrelationOverOnsetDelays;
    _this['averageReversePearsonCorrelationOverOnsetDelays'] = averageReversePearsonCorrelationOverOnsetDelays;
    _this['causeChanges'] = causeChanges;
    _this['causeVariableId'] = causeVariableId;
    _this['confidenceInterval'] = confidenceInterval;
    _this['createdAt'] = createdAt;
    _this['criticalTValue'] = criticalTValue;
    _this['durationOfAction'] = durationOfAction;
    _this['effectChanges'] = effectChanges;
    _this['effectVariableId'] = effectVariableId;
    _this['experimentEndTime'] = experimentEndTime;
    _this['experimentStartTime'] = experimentStartTime;
    _this['correlationCoefficient'] = correlationCoefficient;
    _this['forwardSpearmanCorrelationCoefficient'] = forwardSpearmanCorrelationCoefficient;
    _this['numberOfPairs'] = numberOfPairs;
    _this['onsetDelayWithStrongestPearsonCorrelation'] = onsetDelayWithStrongestPearsonCorrelation;
    _this['optimalPearsonProduct'] = optimalPearsonProduct;
    _this['pearsonCorrelationWithNoOnsetDelay'] = pearsonCorrelationWithNoOnsetDelay;
    _this['predictivePearsonCorrelation'] = predictivePearsonCorrelation;
    _this['predictsHighEffectChange'] = predictsHighEffectChange;
    _this['predictsLowEffectChange'] = predictsLowEffectChange;
    _this['qmScore'] = qmScore;
    _this['statisticalSignificance'] = statisticalSignificance;
    _this['strongestPearsonCorrelationCoefficient'] = strongestPearsonCorrelationCoefficient;
    _this['tValue'] = tValue;
    _this['updatedAt'] = updatedAt;
    _this['userId'] = userId;
    _this['valuePredictingHighOutcome'] = valuePredictingHighOutcome;
    _this['valuePredictingLowOutcome'] = valuePredictingLowOutcome;
    _this['causeVariableCombinationOperation'] = causeVariableCombinationOperation;
    _this['causeVariableDefaultUnitId'] = causeVariableDefaultUnitId;
    _this['causeVariableImageUrl'] = causeVariableImageUrl;
    _this['causeVariableIonIcon'] = causeVariableIonIcon;
    _this['causeVariableMostCommonConnectorId'] = causeVariableMostCommonConnectorId;
    _this['causeVariableCategoryId'] = causeVariableCategoryId;
    _this['effectVariableCombinationOperation'] = effectVariableCombinationOperation;
    _this['effectVariableCommonAlias'] = effectVariableCommonAlias;
    _this['effectVariableDefaultUnitId'] = effectVariableDefaultUnitId;
    _this['effectVariableImageUrl'] = effectVariableImageUrl;
    _this['effectVariableIonIcon'] = effectVariableIonIcon;
    _this['effectVariableMostCommonConnectorId'] = effectVariableMostCommonConnectorId;
    _this['effectVariableCategoryId'] = effectVariableCategoryId;
    _this['timestamp'] = timestamp;
    _this['userVote'] = userVote;
    _this['causeUserVariableShareUserMeasurements'] = causeUserVariableShareUserMeasurements;
    _this['effectUserVariableShareUserMeasurements'] = effectUserVariableShareUserMeasurements;
    _this['predictorFillingValue'] = predictorFillingValue;
    _this['outcomeFillingValue'] = outcomeFillingValue;
    _this['averageVote'] = averageVote;
    _this['durationOfActionInHours'] = durationOfActionInHours;
    _this['onsetDelayWithStrongestPearsonCorrelationInHours'] = onsetDelayWithStrongestPearsonCorrelationInHours;
    _this['effectVariableCategoryName'] = effectVariableCategoryName;
    _this['causeVariableCategoryName'] = causeVariableCategoryName;
    _this['direction'] = direction;
    _this['causeVariableDefaultUnitAbbreviatedName'] = causeVariableDefaultUnitAbbreviatedName;
    _this['effectVariableDefaultUnitAbbreviatedName'] = effectVariableDefaultUnitAbbreviatedName;
    _this['causeVariableDefaultUnitName'] = causeVariableDefaultUnitName;
    _this['effectVariableDefaultUnitName'] = effectVariableDefaultUnitName;
    _this['shareUserMeasurements'] = shareUserMeasurements;
    _this['effectUnit'] = effectUnit;
    _this['significanceExplanation'] = significanceExplanation;
    _this['significantDifference'] = significantDifference;
    _this['effectSize'] = effectSize;
    _this['predictsHighEffectChangeSentenceFragment'] = predictsHighEffectChangeSentenceFragment;
    _this['predictsLowEffectChangeSentenceFragment'] = predictsLowEffectChangeSentenceFragment;
    _this['valuePredictingHighOutcomeExplanation'] = valuePredictingHighOutcomeExplanation;
    _this['averageEffectFollowingHighCauseExplanation'] = averageEffectFollowingHighCauseExplanation;
    _this['averageEffectFollowingLowCauseExplanation'] = averageEffectFollowingLowCauseExplanation;
    _this['valuePredictingLowOutcomeExplanation'] = valuePredictingLowOutcomeExplanation;
    _this['strengthLevel'] = strengthLevel;
    _this['confidenceLevel'] = confidenceLevel;
    _this['predictivePearsonCorrelationCoefficient'] = predictivePearsonCorrelationCoefficient;
    _this['predictorExplanation'] = predictorExplanation;
    _this['studyTitle'] = studyTitle;
    _this['studyAbstract'] = studyAbstract;
    _this['studyLinkStatic'] = studyLinkStatic;
    _this['studyLinkDynamic'] = studyLinkDynamic;
    _this['studyLinkFacebook'] = studyLinkFacebook;
    _this['studyLinkGoogle'] = studyLinkGoogle;
    _this['studyLinkTwitter'] = studyLinkTwitter;
    _this['studyLinkEmail'] = studyLinkEmail;
    _this['gaugeImage'] = gaugeImage;
    _this['gaugeImageSquare'] = gaugeImageSquare;
    _this['imageUrl'] = imageUrl;
    _this['studyDesign'] = studyDesign;
    _this['studyObjective'] = studyObjective;
    _this['dataSources'] = dataSources;
    _this['causeDataSource'] = causeDataSource;
    _this['dataSourcesParagraphForCause'] = dataSourcesParagraphForCause;
    _this['instructionsForCause'] = instructionsForCause;
    _this['effectDataSource'] = effectDataSource;
    _this['dataSourcesParagraphForEffect'] = dataSourcesParagraphForEffect;
    _this['instructionsForEffect'] = instructionsForEffect;
    _this['dataAnalysis'] = dataAnalysis;
    _this['studyResults'] = studyResults;
    _this['studyLimitations'] = studyLimitations;
    _this['onsetDelay'] = onsetDelay;
    _this['onsetDelayInHours'] = onsetDelayInHours;
    _this['predictorMinimumAllowedValue'] = predictorMinimumAllowedValue;
    _this['predictorMaximumAllowedValue'] = predictorMaximumAllowedValue;
    _this['reversePearsonCorrelationCoefficient'] = reversePearsonCorrelationCoefficient;
    _this['predictorDataSources'] = predictorDataSources;
  };

  /**
   * Constructs a <code>Correlation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Correlation} obj Optional instance to populate.
   * @return {module:model/Correlation} The populated <code>Correlation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'Number');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCombinationOperation')) {
        obj['effectVariableCombinationOperation'] = ApiClient.convertToType(data['effectVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCommonAlias')) {
        obj['effectVariableCommonAlias'] = ApiClient.convertToType(data['effectVariableCommonAlias'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'String');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('causeDataSource')) {
        obj['causeDataSource'] = ApiClient.convertToType(data['causeDataSource'], Object);
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('effectDataSource')) {
        obj['effectDataSource'] = ApiClient.convertToType(data['effectDataSource'], Object);
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayInHours')) {
        obj['onsetDelayInHours'] = ApiClient.convertToType(data['onsetDelayInHours'], 'Number');
      }
      if (data.hasOwnProperty('predictorMinimumAllowedValue')) {
        obj['predictorMinimumAllowedValue'] = ApiClient.convertToType(data['predictorMinimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorDataSources')) {
        obj['predictorDataSources'] = ApiClient.convertToType(data['predictorDataSources'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: Sleep Quality
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Example: Overall Mood
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Example: 4.19
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * Example: 1.97
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * Example: 3.0791054117396
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * Example: 3.55
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * Example: 2.65
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * Example: 0.396
   * @member {Number} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.453667
   * @member {Number} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 164
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * Example: 1448
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Example: 0.14344467795996
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 2016-12-28 20:47:30
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 604800
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Example: 193
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 1398
   * @member {Number} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Example: 2014-07-30 12:50:00
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 2012-05-06 21:15:00
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * Example: 0.528359
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: 298
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * Example: -86400
   * @member {Number} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 0.68582816186982
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * Example: 0.477
   * @member {Number} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: 17
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -11
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0.528
   * @member {Number} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Example: 0.9813
   * @member {Number} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * Example: 0.613
   * @member {Number} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 9.6986079652717
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 2017-05-06 15:40:38
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 4.14
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Example: 3.03
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Example: MEAN
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * Example: 10
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * Example: ion-ios-cloudy-night-outline
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: MEAN
   * @member {String} effectVariableCombinationOperation
   */
  exports.prototype['effectVariableCombinationOperation'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} effectVariableCommonAlias
   */
  exports.prototype['effectVariableCommonAlias'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * Example: ion-happy-outline
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 1494085127
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * Example: 1
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * Example: 1
   * @member {Number} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: -1
   * @member {Number} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: -1
   * @member {Number} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 0.9855
   * @member {String} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: -24
   * @member {Number} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: Emotions
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * Example: Sleep
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: /5
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: /5
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: /5
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Overall Mood is statistically significant at 95% confidence interval. 
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: moderately positive
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Example: , on average, 17% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 11% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: Overall Mood, on average, 17% higher after around 4.14/5 Sleep Quality 
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * Example: Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * Example: Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Example: Overall Mood, on average, 11% lower after around 3.03/5 Sleep Quality 
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: moderate
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: Sleep Quality Predicts Higher Overall Mood
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Example: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Example: Your data suggests with a high degree of confidence (p=0) that Sleep Quality (Sleep) has a moderately positive predictive relationship (R=0.538) with Overall Mood  (Emotions).  The highest quartile of Overall Mood  measurements were observed following an average 4.14/5 Sleep Quality.  The lowest quartile of Overall Mood  measurements were observed following an average 3.03/5 Sleep Quality.
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * Example: https://local.quantimo.do/api/v2/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * Example: https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Example: https://twitter.com/home?status=Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%20%40quantimodo
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship.png
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. 
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * Example: The objective of this study is to determine the nature of the relationship (if any) between the Sleep Quality and the Overall Mood. Additionally, we attempt to determine the Sleep Quality values most likely to produce optimal Overall Mood values. 
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.<br>Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * Example: {\"id\":6,\"name\":\"up\",\"connectorClientId\":\"10RfjEgKr8U\",\"connectorClientSecret\":\"e17fd34e4bc4642f0c4c99d7acb6e661\",\"displayName\":\"Up by Jawbone\",\"image\":\"https://i.imgur.com/MXNQy3T.png\",\"getItUrl\":\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\",\"shortDescription\":\"Tracks sleep, exercise, and diet.\",\"longDescription\":\"UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"enabled\":1,\"affiliate\":true,\"defaultVariableCategoryName\":\"Physical Activity\",\"imageHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\"><img id=\\\"up_image\\\" title=\\\"Up by Jawbone\\\" src=\\\"https://i.imgur.com/MXNQy3T.png\\\" alt=\\\"Up by Jawbone\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>\"}
   * @member {Object} causeDataSource
   */
  exports.prototype['causeDataSource'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: {\"id\":72,\"name\":\"quantimodo\",\"displayName\":\"QuantiModo\",\"image\":\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\",\"getItUrl\":\"https://quantimo.do\",\"shortDescription\":\"Tracks anything\",\"longDescription\":\"QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"enabled\":0,\"affiliate\":true,\"defaultVariableCategoryName\":\"Foods\",\"imageHtml\":\"<a href=\\\"https://quantimo.do\\\"><img id=\\\"quantimodo_image\\\" title=\\\"QuantiModo\\\" src=\\\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\\\" alt=\\\"QuantiModo\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"https://quantimo.do\\\">QuantiModo</a>\"}
   * @member {Object} effectDataSource
   */
  exports.prototype['effectDataSource'] = undefined;
  /**
   * Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: It was assumed that 0 hours would pass before a change in Sleep Quality would produce an observable change in Overall Mood.  It was assumed that Sleep Quality could produce an observable change in Overall Mood for as much as 7 days after the stimulus event.  
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * Example: This analysis suggests that higher Sleep Quality (Sleep) generally predicts higher Overall Mood (p = 0).  Overall Mood is, on average, 17%  higher after around 4.14 Sleep Quality.  After an onset delay of 168 hours, Overall Mood is, on average, 11%  lower than its average over the 168 hours following around 3.03 Sleep Quality.  298 data points were used in this analysis.  The value for Sleep Quality changed 164 times, effectively running 82 separate natural experiments.  The top quartile outcome values are preceded by an average 4.14 /5 of Sleep Quality.  The bottom quartile outcome values are preceded by an average 3.03 /5 of Sleep Quality.  Forward Pearson Correlation Coefficient was 0.538 (p=0, 95% CI 0.395 to 0.681 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -0.143 to 0.143, onset delay = -0 hours, duration of action = -168 hours). When the Sleep Quality value is closer to 4.14 /5 than 3.03 /5, the Overall Mood value which follows is, on average, 17%  percent higher than its typical value.  When the Sleep Quality value is closer to 3.03 /5 than 4.14 /5, the Overall Mood value which follows is 0% lower than its typical value.  Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality  Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * Example: As with any human experiment, it was impossible to control for all potentially confounding variables.                           Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.               However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great              confidence rule out non-existent relationships. For instance, if we discover no relationship between mood             and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.              <br>             <br>                         We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.              The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.             The list of the criteria is as follows:             <br>             1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.             <br>             2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.             <br>             3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.             <br>             4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).             <br>             5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.             <br>             6. Plausibility: A plausible mechanism between cause and effect is helpful.             <br>             7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.             <br>             8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".             <br>             9. Analogy: The effect of similar factors may be considered.             <br>             <br>                            The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  298 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Sleep Quality values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,             one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely             that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will             naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelayInHours
   */
  exports.prototype['onsetDelayInHours'] = undefined;
  /**
   * Example: 30
   * @member {Number} predictorMinimumAllowedValue
   */
  exports.prototype['predictorMinimumAllowedValue'] = undefined;
  /**
   * Example: 200
   * @member {Number} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: 0.01377184270977
   * @member {Number} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: RescueTime
   * @member {String} predictorDataSources
   */
  exports.prototype['predictorDataSources'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],33:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.DataSource = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DataSource model module.
   * @module model/DataSource
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>DataSource</code>.
   * @alias module:model/DataSource
   * @class
   * @param id {Number} Example: 6
   * @param name {String} Example: up
   * @param connectorClientId {String} Example: 10RfjEgKr8U
   * @param connectorClientSecret {String} Example: e17fd34e4bc4642f0c4c99d7acb6e661
   * @param displayName {String} Example: Up by Jawbone
   * @param image {String} Example: https://i.imgur.com/MXNQy3T.png
   * @param getItUrl {String} Example: http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20
   * @param shortDescription {String} Example: Tracks sleep, exercise, and diet.
   * @param longDescription {String} Example: UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @param enabled {Number} Example: 1
   * @param affiliate {Boolean} Example: 1
   * @param defaultVariableCategoryName {String} Example: Physical Activity
   * @param imageHtml {String} Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\"><img id=\"up_image\" title=\"Up by Jawbone\" src=\"https://i.imgur.com/MXNQy3T.png\" alt=\"Up by Jawbone\"></a>
   * @param linkedDisplayNameHtml {String} Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>
   */
  var exports = function(id, name, connectorClientId, connectorClientSecret, displayName, image, getItUrl, shortDescription, longDescription, enabled, affiliate, defaultVariableCategoryName, imageHtml, linkedDisplayNameHtml) {
    var _this = this;

    _this['id'] = id;
    _this['name'] = name;
    _this['connectorClientId'] = connectorClientId;
    _this['connectorClientSecret'] = connectorClientSecret;
    _this['displayName'] = displayName;
    _this['image'] = image;
    _this['getItUrl'] = getItUrl;
    _this['shortDescription'] = shortDescription;
    _this['longDescription'] = longDescription;
    _this['enabled'] = enabled;
    _this['affiliate'] = affiliate;
    _this['defaultVariableCategoryName'] = defaultVariableCategoryName;
    _this['imageHtml'] = imageHtml;
    _this['linkedDisplayNameHtml'] = linkedDisplayNameHtml;
  };

  /**
   * Constructs a <code>DataSource</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DataSource} obj Optional instance to populate.
   * @return {module:model/DataSource} The populated <code>DataSource</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('connectorClientId')) {
        obj['connectorClientId'] = ApiClient.convertToType(data['connectorClientId'], 'String');
      }
      if (data.hasOwnProperty('connectorClientSecret')) {
        obj['connectorClientSecret'] = ApiClient.convertToType(data['connectorClientSecret'], 'String');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = ApiClient.convertToType(data['image'], 'String');
      }
      if (data.hasOwnProperty('getItUrl')) {
        obj['getItUrl'] = ApiClient.convertToType(data['getItUrl'], 'String');
      }
      if (data.hasOwnProperty('shortDescription')) {
        obj['shortDescription'] = ApiClient.convertToType(data['shortDescription'], 'String');
      }
      if (data.hasOwnProperty('longDescription')) {
        obj['longDescription'] = ApiClient.convertToType(data['longDescription'], 'String');
      }
      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Number');
      }
      if (data.hasOwnProperty('affiliate')) {
        obj['affiliate'] = ApiClient.convertToType(data['affiliate'], 'Boolean');
      }
      if (data.hasOwnProperty('defaultVariableCategoryName')) {
        obj['defaultVariableCategoryName'] = ApiClient.convertToType(data['defaultVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('imageHtml')) {
        obj['imageHtml'] = ApiClient.convertToType(data['imageHtml'], 'String');
      }
      if (data.hasOwnProperty('linkedDisplayNameHtml')) {
        obj['linkedDisplayNameHtml'] = ApiClient.convertToType(data['linkedDisplayNameHtml'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 6
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: up
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Example: 10RfjEgKr8U
   * @member {String} connectorClientId
   */
  exports.prototype['connectorClientId'] = undefined;
  /**
   * Example: e17fd34e4bc4642f0c4c99d7acb6e661
   * @member {String} connectorClientSecret
   */
  exports.prototype['connectorClientSecret'] = undefined;
  /**
   * Example: Up by Jawbone
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * Example: https://i.imgur.com/MXNQy3T.png
   * @member {String} image
   */
  exports.prototype['image'] = undefined;
  /**
   * Example: http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20
   * @member {String} getItUrl
   */
  exports.prototype['getItUrl'] = undefined;
  /**
   * Example: Tracks sleep, exercise, and diet.
   * @member {String} shortDescription
   */
  exports.prototype['shortDescription'] = undefined;
  /**
   * Example: UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} longDescription
   */
  exports.prototype['longDescription'] = undefined;
  /**
   * Example: 1
   * @member {Number} enabled
   */
  exports.prototype['enabled'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} affiliate
   */
  exports.prototype['affiliate'] = undefined;
  /**
   * Example: Physical Activity
   * @member {String} defaultVariableCategoryName
   */
  exports.prototype['defaultVariableCategoryName'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\"><img id=\"up_image\" title=\"Up by Jawbone\" src=\"https://i.imgur.com/MXNQy3T.png\" alt=\"Up by Jawbone\"></a>
   * @member {String} imageHtml
   */
  exports.prototype['imageHtml'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>
   * @member {String} linkedDisplayNameHtml
   */
  exports.prototype['linkedDisplayNameHtml'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],34:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ExplanationStartTracking', 'model/Image'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ExplanationStartTracking'), require('./Image'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Explanation = factory(root.Quantimodo.ApiClient, root.Quantimodo.ExplanationStartTracking, root.Quantimodo.Image);
  }
}(this, function(ApiClient, ExplanationStartTracking, Image) {
  'use strict';




  /**
   * The Explanation model module.
   * @module model/Explanation
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Explanation</code>.
   * @alias module:model/Explanation
   * @class
   * @param ionIcon {String} Example: ion-ios-person
   * @param description {String} Example: These factors are most predictive of Overall Mood based on your own data.
   * @param title {String} Example: Top Predictors of Overall Mood
   * @param image {module:model/Image} 
   * @param startTracking {module:model/ExplanationStartTracking} 
   */
  var exports = function(ionIcon, description, title, image, startTracking) {
    var _this = this;

    _this['ionIcon'] = ionIcon;
    _this['description'] = description;
    _this['title'] = title;
    _this['image'] = image;
    _this['startTracking'] = startTracking;
  };

  /**
   * Constructs a <code>Explanation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Explanation} obj Optional instance to populate.
   * @return {module:model/Explanation} The populated <code>Explanation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = Image.constructFromObject(data['image']);
      }
      if (data.hasOwnProperty('startTracking')) {
        obj['startTracking'] = ExplanationStartTracking.constructFromObject(data['startTracking']);
      }
    }
    return obj;
  }

  /**
   * Example: ion-ios-person
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: These factors are most predictive of Overall Mood based on your own data.
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: Top Predictors of Overall Mood
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * @member {module:model/Image} image
   */
  exports.prototype['image'] = undefined;
  /**
   * @member {module:model/ExplanationStartTracking} startTracking
   */
  exports.prototype['startTracking'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./ExplanationStartTracking":35,"./Image":40}],35:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Button'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Button'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ExplanationStartTracking = factory(root.Quantimodo.ApiClient, root.Quantimodo.Button);
  }
}(this, function(ApiClient, Button) {
  'use strict';




  /**
   * The ExplanationStartTracking model module.
   * @module model/ExplanationStartTracking
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>ExplanationStartTracking</code>.
   * @alias module:model/ExplanationStartTracking
   * @class
   * @param title {String} Example: Improve Accuracy
   * @param description {String} Example: The more data I have the more accurate your results will be so track regularly!
   * @param button {module:model/Button} 
   */
  var exports = function(title, description, button) {
    var _this = this;

    _this['title'] = title;
    _this['description'] = description;
    _this['button'] = button;
  };

  /**
   * Constructs a <code>ExplanationStartTracking</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ExplanationStartTracking} obj Optional instance to populate.
   * @return {module:model/ExplanationStartTracking} The populated <code>ExplanationStartTracking</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('button')) {
        obj['button'] = Button.constructFromObject(data['button']);
      }
    }
    return obj;
  }

  /**
   * Example: Improve Accuracy
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: The more data I have the more accurate your results will be so track regularly!
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * @member {module:model/Button} button
   */
  exports.prototype['button'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Button":27}],36:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Correlation', 'model/Explanation'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Correlation'), require('./Explanation'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetCorrelationsDataResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.Correlation, root.Quantimodo.Explanation);
  }
}(this, function(ApiClient, Correlation, Explanation) {
  'use strict';




  /**
   * The GetCorrelationsDataResponse model module.
   * @module model/GetCorrelationsDataResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>GetCorrelationsDataResponse</code>.
   * @alias module:model/GetCorrelationsDataResponse
   * @class
   * @param correlations {Array.<module:model/Correlation>} 
   * @param explanation {module:model/Explanation} 
   */
  var exports = function(correlations, explanation) {
    var _this = this;

    _this['correlations'] = correlations;
    _this['explanation'] = explanation;
  };

  /**
   * Constructs a <code>GetCorrelationsDataResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetCorrelationsDataResponse} obj Optional instance to populate.
   * @return {module:model/GetCorrelationsDataResponse} The populated <code>GetCorrelationsDataResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('correlations')) {
        obj['correlations'] = ApiClient.convertToType(data['correlations'], [Correlation]);
      }
      if (data.hasOwnProperty('explanation')) {
        obj['explanation'] = Explanation.constructFromObject(data['explanation']);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/Correlation>} correlations
   */
  exports.prototype['correlations'] = undefined;
  /**
   * @member {module:model/Explanation} explanation
   */
  exports.prototype['explanation'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Correlation":32,"./Explanation":34}],37:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GetCorrelationsDataResponse'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./GetCorrelationsDataResponse'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetCorrelationsResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.GetCorrelationsDataResponse);
  }
}(this, function(ApiClient, GetCorrelationsDataResponse) {
  'use strict';




  /**
   * The GetCorrelationsResponse model module.
   * @module model/GetCorrelationsResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>GetCorrelationsResponse</code>.
   * @alias module:model/GetCorrelationsResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>GetCorrelationsResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetCorrelationsResponse} obj Optional instance to populate.
   * @return {module:model/GetCorrelationsResponse} The populated <code>GetCorrelationsResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = GetCorrelationsDataResponse.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/GetCorrelationsDataResponse} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./GetCorrelationsDataResponse":36}],38:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GetUserCorrelationsDataResponseData'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./GetUserCorrelationsDataResponseData'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetUserCorrelationsDataResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.GetUserCorrelationsDataResponseData);
  }
}(this, function(ApiClient, GetUserCorrelationsDataResponseData) {
  'use strict';




  /**
   * The GetUserCorrelationsDataResponse model module.
   * @module model/GetUserCorrelationsDataResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>GetUserCorrelationsDataResponse</code>.
   * @alias module:model/GetUserCorrelationsDataResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>GetUserCorrelationsDataResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetUserCorrelationsDataResponse} obj Optional instance to populate.
   * @return {module:model/GetUserCorrelationsDataResponse} The populated <code>GetUserCorrelationsDataResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = GetUserCorrelationsDataResponseData.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/GetUserCorrelationsDataResponseData} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./GetUserCorrelationsDataResponseData":39}],39:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Correlation', 'model/Explanation'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Correlation'), require('./Explanation'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetUserCorrelationsDataResponseData = factory(root.Quantimodo.ApiClient, root.Quantimodo.Correlation, root.Quantimodo.Explanation);
  }
}(this, function(ApiClient, Correlation, Explanation) {
  'use strict';




  /**
   * The GetUserCorrelationsDataResponseData model module.
   * @module model/GetUserCorrelationsDataResponseData
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>GetUserCorrelationsDataResponseData</code>.
   * @alias module:model/GetUserCorrelationsDataResponseData
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>GetUserCorrelationsDataResponseData</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetUserCorrelationsDataResponseData} obj Optional instance to populate.
   * @return {module:model/GetUserCorrelationsDataResponseData} The populated <code>GetUserCorrelationsDataResponseData</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('correlations')) {
        obj['correlations'] = ApiClient.convertToType(data['correlations'], [Correlation]);
      }
      if (data.hasOwnProperty('explanation')) {
        obj['explanation'] = Explanation.constructFromObject(data['explanation']);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/Correlation>} correlations
   */
  exports.prototype['correlations'] = undefined;
  /**
   * @member {module:model/Explanation} explanation
   */
  exports.prototype['explanation'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Correlation":32,"./Explanation":34}],40:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Image = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Image model module.
   * @module model/Image
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Image</code>.
   * @alias module:model/Image
   * @class
   * @param imageUrl {String} Example: https://www.filepicker.io/api/file/TjmeNWS5Q2SFmtJlUGLf
   * @param height {String} Example: 240
   * @param width {String} Example: 224
   */
  var exports = function(imageUrl, height, width) {
    var _this = this;

    _this['imageUrl'] = imageUrl;
    _this['height'] = height;
    _this['width'] = width;
  };

  /**
   * Constructs a <code>Image</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Image} obj Optional instance to populate.
   * @return {module:model/Image} The populated <code>Image</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('height')) {
        obj['height'] = ApiClient.convertToType(data['height'], 'String');
      }
      if (data.hasOwnProperty('width')) {
        obj['width'] = ApiClient.convertToType(data['width'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: https://www.filepicker.io/api/file/TjmeNWS5Q2SFmtJlUGLf
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: 240
   * @member {String} height
   */
  exports.prototype['height'] = undefined;
  /**
   * Example: 224
   * @member {String} width
   */
  exports.prototype['width'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],41:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/TrackingReminder'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./TrackingReminder'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.InlineResponse201 = factory(root.Quantimodo.ApiClient, root.Quantimodo.TrackingReminder);
  }
}(this, function(ApiClient, TrackingReminder) {
  'use strict';




  /**
   * The InlineResponse201 model module.
   * @module model/InlineResponse201
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>InlineResponse201</code>.
   * @alias module:model/InlineResponse201
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse201</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/InlineResponse201} obj Optional instance to populate.
   * @return {module:model/InlineResponse201} The populated <code>InlineResponse201</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = TrackingReminder.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/TrackingReminder} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./TrackingReminder":51}],42:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.JsonErrorResponse = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The JsonErrorResponse model module.
   * @module model/JsonErrorResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>JsonErrorResponse</code>.
   * @alias module:model/JsonErrorResponse
   * @class
   * @param status {String} Status: \"ok\" or \"error\"
   */
  var exports = function(status) {
    var _this = this;

    _this['status'] = status;

  };

  /**
   * Constructs a <code>JsonErrorResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/JsonErrorResponse} obj Optional instance to populate.
   * @return {module:model/JsonErrorResponse} The populated <code>JsonErrorResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'String');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
    }
    return obj;
  }

  /**
   * Status: \"ok\" or \"error\"
   * @member {String} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Error message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],43:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Measurement = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Measurement model module.
   * @module model/Measurement
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Measurement</code>.
   * @alias module:model/Measurement
   * @class
   * @param variableName {String} Name of the variable for which we are creating the measurement records
   * @param sourceName {String} Application or device used to record the measurement values
   * @param startTimeString {String} Start Time for the measurement event in UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`
   * @param value {Number} Converted measurement value in requested unit
   * @param unitAbbreviatedName {String} Abbreviated name for the unit of measurement
   */
  var exports = function(variableName, sourceName, startTimeString, value, unitAbbreviatedName) {
    var _this = this;

    _this['variableName'] = variableName;
    _this['sourceName'] = sourceName;
    _this['startTimeString'] = startTimeString;

    _this['value'] = value;


    _this['unitAbbreviatedName'] = unitAbbreviatedName;








































  };

  /**
   * Constructs a <code>Measurement</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Measurement} obj Optional instance to populate.
   * @return {module:model/Measurement} The populated <code>Measurement</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('sourceName')) {
        obj['sourceName'] = ApiClient.convertToType(data['sourceName'], 'String');
      }
      if (data.hasOwnProperty('startTimeString')) {
        obj['startTimeString'] = ApiClient.convertToType(data['startTimeString'], 'String');
      }
      if (data.hasOwnProperty('startTimeEpoch')) {
        obj['startTimeEpoch'] = ApiClient.convertToType(data['startTimeEpoch'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('originalValue')) {
        obj['originalValue'] = ApiClient.convertToType(data['originalValue'], 'Number');
      }
      if (data.hasOwnProperty('originalunitAbbreviatedName')) {
        obj['originalunitAbbreviatedName'] = ApiClient.convertToType(data['originalunitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('originalUnitId')) {
        obj['originalUnitId'] = ApiClient.convertToType(data['originalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'String');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('humanTime')) {
        obj['humanTime'] = ApiClient.convertToType(data['humanTime'], Object);
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('originalUnitName')) {
        obj['originalUnitName'] = ApiClient.convertToType(data['originalUnitName'], 'String');
      }
      if (data.hasOwnProperty('originalUnitAbbreviatedName')) {
        obj['originalUnitAbbreviatedName'] = ApiClient.convertToType(data['originalUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('originalUnitCategoryId')) {
        obj['originalUnitCategoryId'] = ApiClient.convertToType(data['originalUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('originalUnitCategoryName')) {
        obj['originalUnitCategoryName'] = ApiClient.convertToType(data['originalUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('variableDescription')) {
        obj['variableDescription'] = ApiClient.convertToType(data['variableDescription'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('iconIcon')) {
        obj['iconIcon'] = ApiClient.convertToType(data['iconIcon'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('startDate')) {
        obj['startDate'] = ApiClient.convertToType(data['startDate'], 'String');
      }
      if (data.hasOwnProperty('connectorId')) {
        obj['connectorId'] = ApiClient.convertToType(data['connectorId'], 'Number');
      }
      if (data.hasOwnProperty('noteObject')) {
        obj['noteObject'] = ApiClient.convertToType(data['noteObject'], Object);
      }
    }
    return obj;
  }

  /**
   * Name of the variable for which we are creating the measurement records
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Application or device used to record the measurement values
   * @member {String} sourceName
   */
  exports.prototype['sourceName'] = undefined;
  /**
   * Start Time for the measurement event in UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`
   * @member {String} startTimeString
   */
  exports.prototype['startTimeString'] = undefined;
  /**
   * Seconds between the start of the event measured and 1970 (Unix timestamp)
   * @member {Number} startTimeEpoch
   */
  exports.prototype['startTimeEpoch'] = undefined;
  /**
   * Converted measurement value in requested unit
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * Original value as originally submitted
   * @member {Number} originalValue
   */
  exports.prototype['originalValue'] = undefined;
  /**
   * Original Unit of measurement as originally submitted
   * @member {String} originalunitAbbreviatedName
   */
  exports.prototype['originalunitAbbreviatedName'] = undefined;
  /**
   * Abbreviated name for the unit of measurement
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Note of measurement
   * @member {String} note
   */
  exports.prototype['note'] = undefined;
  /**
   * Example: 23
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 5956846
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Example: 13
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 23
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: 1051466127
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: 23
   * @member {Number} originalUnitId
   */
  exports.prototype['originalUnitId'] = undefined;
  /**
   * Example: quantimodo
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Example: 2017-07-30 21:08:36
   * @member {String} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 2017-07-30 21:08:36
   * @member {String} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: Treatments
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Example: 13
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: ion-ios-medkit-outline
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/treatments.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Healthcare/pill-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Treatments
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: {\"date\":\"2017-07-30 20:05:30.000000\",\"timezone_type\":1,\"timezone\":\"+00:00\"}
   * @member {Object} humanTime
   */
  exports.prototype['humanTime'] = undefined;
  /**
   * Example: Count
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: 6
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} originalUnitName
   */
  exports.prototype['originalUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} originalUnitAbbreviatedName
   */
  exports.prototype['originalUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} originalUnitCategoryId
   */
  exports.prototype['originalUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} originalUnitCategoryName
   */
  exports.prototype['originalUnitCategoryName'] = undefined;
  /**
   * Example: value
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: negative
   * @member {String} variableDescription
   */
  exports.prototype['variableDescription'] = undefined;
  /**
   * Example: negative
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} iconIcon
   */
  exports.prototype['iconIcon'] = undefined;
  /**
   * Example: 1
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Example: 5
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Example: 2014-08-27
   * @member {String} startDate
   */
  exports.prototype['startDate'] = undefined;
  /**
   * Example: 13
   * @member {Number} connectorId
   */
  exports.prototype['connectorId'] = undefined;
  /**
   * Example: {\"message\":null,\"commenter\":null,\"url\":null,\"image\":null,\"icon\":null,\"description\":null,\"name\":null,\"Description\":\"Transfer from MICHAEL P SINN\",\"Original Description\":\"Bank Account\",\"Transaction Type\":\"credit\",\"Account Name\":\"Mike's Personal PayPal\"}
   * @member {Object} noteObject
   */
  exports.prototype['noteObject'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],44:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MeasurementDelete model module.
   * @module model/MeasurementDelete
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>MeasurementDelete</code>.
   * @alias module:model/MeasurementDelete
   * @class
   * @param variableId {Number} Variable id of the measurement to be deleted
   * @param startTime {Number} Start time of the measurement to be deleted
   */
  var exports = function(variableId, startTime) {
    var _this = this;

    _this['variableId'] = variableId;
    _this['startTime'] = startTime;
  };

  /**
   * Constructs a <code>MeasurementDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementDelete} obj Optional instance to populate.
   * @return {module:model/MeasurementDelete} The populated <code>MeasurementDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('startTime')) {
        obj['startTime'] = ApiClient.convertToType(data['startTime'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Variable id of the measurement to be deleted
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Start time of the measurement to be deleted
   * @member {Number} startTime
   */
  exports.prototype['startTime'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],45:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementItem = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MeasurementItem model module.
   * @module model/MeasurementItem
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>MeasurementItem</code>.
   * @alias module:model/MeasurementItem
   * @class
   * @param timestamp {Number} Timestamp for the measurement event in epoch time (unixtime)
   * @param value {Number} Measurement value
   */
  var exports = function(timestamp, value) {
    var _this = this;

    _this['timestamp'] = timestamp;
    _this['value'] = value;

  };

  /**
   * Constructs a <code>MeasurementItem</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementItem} obj Optional instance to populate.
   * @return {module:model/MeasurementItem} The populated <code>MeasurementItem</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
    }
    return obj;
  }

  /**
   * Timestamp for the measurement event in epoch time (unixtime)
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * Measurement value
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * Optional note to include with the measurement
   * @member {String} note
   */
  exports.prototype['note'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],46:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/MeasurementItem'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./MeasurementItem'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementSet = factory(root.Quantimodo.ApiClient, root.Quantimodo.MeasurementItem);
  }
}(this, function(ApiClient, MeasurementItem) {
  'use strict';




  /**
   * The MeasurementSet model module.
   * @module model/MeasurementSet
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>MeasurementSet</code>.
   * @alias module:model/MeasurementSet
   * @class
   * @param measurementItems {Array.<module:model/MeasurementItem>} Array of timestamps, values, and optional notes
   * @param variableName {String} ORIGINAL name of the variable for which we are creating the measurement records
   * @param sourceName {String} Name of the application or device used to record the measurement values
   * @param unitAbbreviatedName {String} Unit of measurement
   */
  var exports = function(measurementItems, variableName, sourceName, unitAbbreviatedName) {
    var _this = this;

    _this['measurementItems'] = measurementItems;
    _this['variableName'] = variableName;
    _this['sourceName'] = sourceName;


    _this['unitAbbreviatedName'] = unitAbbreviatedName;
  };

  /**
   * Constructs a <code>MeasurementSet</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementSet} obj Optional instance to populate.
   * @return {module:model/MeasurementSet} The populated <code>MeasurementSet</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('measurementItems')) {
        obj['measurementItems'] = ApiClient.convertToType(data['measurementItems'], [MeasurementItem]);
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('sourceName')) {
        obj['sourceName'] = ApiClient.convertToType(data['sourceName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
    }
    return obj;
  }

  /**
   * Array of timestamps, values, and optional notes
   * @member {Array.<module:model/MeasurementItem>} measurementItems
   */
  exports.prototype['measurementItems'] = undefined;
  /**
   * ORIGINAL name of the variable for which we are creating the measurement records
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Name of the application or device used to record the measurement values
   * @member {String} sourceName
   */
  exports.prototype['sourceName'] = undefined;
  /**
   * Variable category name
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Way to aggregate measurements over time. Options are \"MEAN\" or \"SUM\". SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @member {module:model/MeasurementSet.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Unit of measurement
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16,"./MeasurementItem":45}],47:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementUpdate = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MeasurementUpdate model module.
   * @module model/MeasurementUpdate
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>MeasurementUpdate</code>.
   * @alias module:model/MeasurementUpdate
   * @class
   * @param id {Number} Variable id of the measurement to be updated
   */
  var exports = function(id) {
    var _this = this;

    _this['id'] = id;



  };

  /**
   * Constructs a <code>MeasurementUpdate</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementUpdate} obj Optional instance to populate.
   * @return {module:model/MeasurementUpdate} The populated <code>MeasurementUpdate</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('startTime')) {
        obj['startTime'] = ApiClient.convertToType(data['startTime'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
    }
    return obj;
  }

  /**
   * Variable id of the measurement to be updated
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The new timestamp for the the event in epoch seconds (optional)
   * @member {Number} startTime
   */
  exports.prototype['startTime'] = undefined;
  /**
   * The new value of for the measurement (optional)
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * The new note for the measurement (optional)
   * @member {String} note
   */
  exports.prototype['note'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],48:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Pairs = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Pairs model module.
   * @module model/Pairs
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Pairs</code>.
   * @alias module:model/Pairs
   * @class
   * @param name {String} Category name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>Pairs</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Pairs} obj Optional instance to populate.
   * @return {module:model/Pairs} The populated <code>Pairs</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * Category name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],49:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.PostCorrelation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The PostCorrelation model module.
   * @module model/PostCorrelation
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>PostCorrelation</code>.
   * @alias module:model/PostCorrelation
   * @class
   * @param causeVariableName {String} Cause variable name
   * @param effectVariableName {String} Effect variable name
   * @param correlation {Number} Correlation value
   */
  var exports = function(causeVariableName, effectVariableName, correlation) {
    var _this = this;

    _this['causeVariableName'] = causeVariableName;
    _this['effectVariableName'] = effectVariableName;
    _this['correlation'] = correlation;

  };

  /**
   * Constructs a <code>PostCorrelation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PostCorrelation} obj Optional instance to populate.
   * @return {module:model/PostCorrelation} The populated <code>PostCorrelation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('correlation')) {
        obj['correlation'] = ApiClient.convertToType(data['correlation'], 'Number');
      }
      if (data.hasOwnProperty('vote')) {
        obj['vote'] = ApiClient.convertToType(data['vote'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Cause variable name
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Effect variable name
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Correlation value
   * @member {Number} correlation
   */
  exports.prototype['correlation'] = undefined;
  /**
   * Vote: 0 or 1
   * @member {Number} vote
   */
  exports.prototype['vote'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],50:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Study = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Study model module.
   * @module model/Study
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Study</code>.
   * @alias module:model/Study
   * @class
   * @param causeVariable {Object} Example: {\"id\":1448,\"name\":\"Sleep Quality\",\"alias\":null,\"clientId\":\"oAuthDisabled\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1336338900,\"earliestMeasurementTime\":1336338900,\"earliestSourceTime\":1336338900,\"experimentEndTime\":\"2030-01-01 06:00:00\",\"experimentStartTime\":\"2010-03-23 01:31:42\",\"fillingType\":null,\"userVariableFillingValue\":null,\"kurtosis\":2.7220883827049,\"lastOriginalUnitId\":20,\"lastOriginalValue\":1,\"lastProcessedDailyValue\":3,\"lastSuccessfulUpdateTime\":\"2017-03-23 02:14:32\",\"lastUnitId\":10,\"lastValue\":3,\"latestFillingTime\":1406724600,\"latestMeasurementTime\":1406724600,\"latestUserMeasurementTime\":1406724600,\"latestSourceTime\":1483077300,\"maximumRecordedValue\":5,\"mean\":3.359,\"rawMeasurementsAtLastAnalysis\":0,\"measurementsAtLastAnalysis\":0,\"median\":3,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":6,\"numberOfChanges\":171,\"numberOfCorrelations\":1143,\"numberOfProcessedDailyMeasurements\":312,\"numberOfRawMeasurements\":614,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":null,\"numberOfUniqueDailyValues\":18,\"numberOfUserCorrelationsAsCause\":100,\"numberOfUserCorrelationsAsEffect\":1043,\"outcomeOfInterest\":null,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":0.4464285671711,\"shareUserMeasurements\":true,\"skewness\":0.10225665179767,\"sources\":null,\"standardDeviation\":0.8688301252527,\"status\":\"CORRELATING\",\"thirdToLastValue\":0.47916665673256,\"userId\":230,\"userVariableValence\":null,\"variance\":0.75486578654663,\"userVariableVariableCategoryId\":6,\"variableId\":1448,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":null,\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-happy-outline\",\"mostCommonOriginalUnitId\":21,\"commonVariableMostCommonConnectorId\":6,\"numberOfAggregateCorrelationsAsCause\":68,\"numberOfAggregateCorrelationsAsEffect\":336,\"numberOfUserVariables\":49,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":3,\"valence\":\"positive\",\"variableCategoryId\":6,\"wikipediaTitle\":null,\"mostCommonValue\":3,\"outcome\":true,\"updatedTime\":\"2017-07-31 15:06:57\",\"updatedAt\":\"2017-07-31 15:06:57\",\"commonVariableUpdatedAt\":\"2017-07-31 15:06:57\",\"userVariableUpdatedAt\":\"2017-04-18 20:54:49\",\"createdAt\":\"2014-08-01 01:30:16\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":604800,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":null,\"experimentStartTimeString\":\"2010-03-23 01:31:42\",\"experimentStartTimeSeconds\":1269307902,\"experimentEndTimeString\":\"2030-01-01 06:00:00\",\"experimentEndTimeSeconds\":1893477600,\"mostCommonConnectorId\":6,\"variableCategoryName\":\"Sleep\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.png\",\"pngPath\":\"img/variable_categories/sleep.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Sleep\",\"meanInUserVariableDefaultUnit\":3,\"lastValueInUserVariableDefaultUnit\":3,\"secondToLastValueInUserVariableDefaultUnit\":0,\"thirdToLastValueInUserVariableDefaultUnit\":0,\"mostCommonValueInUserVariableDefaultUnit\":3,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":3,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Sleep Quality\",\"inputType\":\"happiestFaceIsFive\",\"durationOfActionInHours\":168,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Sleep%20Quality&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsleep.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Sleep%20Quality?variableName=Sleep%20Quality&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsleep.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Sleep%20Quality%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Sleep%20Quality%20data%21&body=See%20my%20Sleep%20Quality%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png%0A%0AHave%20a%20great%20day!\",\"userTagVariables\":[],\"userTaggedVariables\":[],\"joinedUserTagVariables\":[],\"ingredientUserTagVariables\":[],\"ingredientOfUserTagVariables\":[],\"childUserTagVariables\":[],\"parentUserTagVariables\":[],\"commonTagVariables\":[],\"commonTaggedVariables\":[],\"dataSource\":{\"id\":6,\"name\":\"up\",\"connectorClientId\":\"10RfjEgKr8U\",\"connectorClientSecret\":\"e17fd34e4bc4642f0c4c99d7acb6e661\",\"displayName\":\"Up by Jawbone\",\"image\":\"https://i.imgur.com/MXNQy3T.png\",\"getItUrl\":\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\",\"shortDescription\":\"Tracks sleep, exercise, and diet.\",\"longDescription\":\"UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"enabled\":1,\"affiliate\":true,\"defaultVariableCategoryName\":\"Physical Activity\",\"imageHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\"><img id=\\\"up_image\\\" title=\\\"Up by Jawbone\\\" src=\\\"https://i.imgur.com/MXNQy3T.png\\\" alt=\\\"Up by Jawbone\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>\"}}
   * @param effectVariable {Object} Example: {\"id\":1398,\"name\":\"Overall Mood\",\"alias\":null,\"clientId\":\"quantimodo\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1336267020,\"earliestMeasurementTime\":1336267020,\"earliestSourceTime\":1334473200,\"experimentEndTime\":null,\"experimentStartTime\":null,\"fillingType\":null,\"userVariableFillingValue\":-1,\"kurtosis\":5.8376066475804,\"lastOriginalUnitId\":10,\"lastOriginalValue\":3,\"lastProcessedDailyValue\":3,\"lastSuccessfulUpdateTime\":\"2017-08-04 09:23:18\",\"lastUnitId\":10,\"lastValue\":3,\"latestFillingTime\":1501879724,\"latestMeasurementTime\":1501879724,\"latestUserMeasurementTime\":1501879724,\"latestSourceTime\":1501879724,\"maximumRecordedValue\":5,\"mean\":2.8654,\"rawMeasurementsAtLastAnalysis\":0,\"measurementsAtLastAnalysis\":0,\"median\":2.875,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":5,\"numberOfChanges\":1139,\"numberOfCorrelations\":2172,\"numberOfProcessedDailyMeasurements\":1492,\"numberOfRawMeasurements\":11829,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":5,\"numberOfUniqueDailyValues\":191,\"numberOfUserCorrelationsAsCause\":181,\"numberOfUserCorrelationsAsEffect\":1991,\"outcomeOfInterest\":1,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":1,\"shareUserMeasurements\":true,\"skewness\":0.9637141502222,\"sources\":null,\"standardDeviation\":0.58645820392122,\"status\":\"CORRELATING\",\"thirdToLastValue\":1,\"userId\":230,\"userVariableValence\":null,\"variance\":0.3439332249465,\"userVariableVariableCategoryId\":1,\"variableId\":1398,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":\"positive\",\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-happy-outline\",\"mostCommonOriginalUnitId\":10,\"commonVariableMostCommonConnectorId\":10,\"numberOfAggregateCorrelationsAsCause\":329,\"numberOfAggregateCorrelationsAsEffect\":890,\"numberOfUserVariables\":4003,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":2,\"valence\":\"positive\",\"variableCategoryId\":1,\"wikipediaTitle\":null,\"mostCommonValue\":3,\"outcome\":true,\"updatedTime\":\"2017-08-04 23:49:15\",\"updatedAt\":\"2017-08-04 23:49:15\",\"commonVariableUpdatedAt\":\"2017-07-31 19:55:38\",\"userVariableUpdatedAt\":\"2017-08-04 23:49:15\",\"createdAt\":\"2015-11-23 14:15:47\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":86400,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":\"Mood_(psychology)\",\"experimentStartTimeString\":null,\"experimentStartTimeSeconds\":null,\"experimentEndTimeString\":null,\"experimentEndTimeSeconds\":null,\"mostCommonConnectorId\":5,\"variableCategoryName\":\"Emotions\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.png\",\"pngPath\":\"img/variable_categories/emotions.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Emotions\",\"meanInUserVariableDefaultUnit\":3,\"lastValueInUserVariableDefaultUnit\":3,\"secondToLastValueInUserVariableDefaultUnit\":1,\"thirdToLastValueInUserVariableDefaultUnit\":1,\"mostCommonValueInUserVariableDefaultUnit\":3,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":2,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Overall Mood\",\"inputType\":\"happiestFaceIsFive\",\"durationOfActionInHours\":24,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Overall%20Mood&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Femotions.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Overall%20Mood?variableName=Overall%20Mood&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Femotions.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Overall%20Mood%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Overall%20Mood%20data%21&body=See%20my%20Overall%20Mood%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png%0A%0AHave%20a%20great%20day!\",\"userTagVariables\":[],\"userTaggedVariables\":[{\"id\":1919,\"name\":\"Back Pain\",\"alias\":null,\"clientId\":\"quantimodo\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1394385660,\"earliestMeasurementTime\":1394385660,\"earliestSourceTime\":1334473200,\"experimentEndTime\":null,\"experimentStartTime\":null,\"fillingType\":null,\"userVariableFillingValue\":-1,\"kurtosis\":10.590629984947,\"lastOriginalUnitId\":10,\"lastOriginalValue\":1,\"lastProcessedDailyValue\":1,\"lastSuccessfulUpdateTime\":\"2017-02-08 05:26:13\",\"lastUnitId\":10,\"lastValue\":1,\"latestFillingTime\":1501718400,\"latestMeasurementTime\":1501718400,\"latestUserMeasurementTime\":1501718400,\"latestSourceTime\":1501718400,\"maximumRecordedValue\":4,\"mean\":1.2363,\"rawMeasurementsAtLastAnalysis\":291,\"measurementsAtLastAnalysis\":291,\"median\":1,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":null,\"numberOfChanges\":61,\"numberOfCorrelations\":1088,\"numberOfProcessedDailyMeasurements\":225,\"numberOfRawMeasurements\":436,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":null,\"numberOfUniqueDailyValues\":7,\"numberOfUserCorrelationsAsCause\":124,\"numberOfUserCorrelationsAsEffect\":964,\"outcomeOfInterest\":1,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":2,\"shareUserMeasurements\":false,\"skewness\":2.7446737786856,\"sources\":null,\"standardDeviation\":0.55217922447658,\"status\":\"UPDATED\",\"thirdToLastValue\":2,\"userId\":230,\"userVariableValence\":null,\"variance\":0.30490189594356,\"userVariableVariableCategoryId\":10,\"variableId\":1919,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":\"negative\",\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-sad-outline\",\"mostCommonOriginalUnitId\":10,\"commonVariableMostCommonConnectorId\":null,\"numberOfAggregateCorrelationsAsCause\":46,\"numberOfAggregateCorrelationsAsEffect\":451,\"numberOfUserVariables\":146,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":3,\"valence\":\"negative\",\"variableCategoryId\":10,\"wikipediaTitle\":null,\"mostCommonValue\":1,\"outcome\":true,\"updatedTime\":\"2017-08-03 05:42:46\",\"updatedAt\":\"2017-08-03 05:42:46\",\"commonVariableUpdatedAt\":\"2017-07-14 02:55:23\",\"userVariableUpdatedAt\":\"2017-08-03 05:42:46\",\"createdAt\":\"2014-03-09 17:22:17\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":604800,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":null,\"experimentStartTimeString\":null,\"experimentStartTimeSeconds\":null,\"experimentEndTimeString\":null,\"experimentEndTimeSeconds\":null,\"mostCommonConnectorId\":null,\"variableCategoryName\":\"Symptoms\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.png\",\"pngPath\":\"img/variable_categories/symptoms.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Symptoms\",\"meanInUserVariableDefaultUnit\":1,\"lastValueInUserVariableDefaultUnit\":1,\"secondToLastValueInUserVariableDefaultUnit\":2,\"thirdToLastValueInUserVariableDefaultUnit\":2,\"mostCommonValueInUserVariableDefaultUnit\":1,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":3,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Back Pain\",\"inputType\":\"saddestFaceIsFive\",\"durationOfActionInHours\":168,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Back%20Pain?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Back%20Pain%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Back%20Pain%20data%21&body=See%20my%20Back%20Pain%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%0A%0AHave%20a%20great%20day!\",\"tagConversionFactor\":1,\"tagDisplayText\":\"Back Pain is tagged with Overall Mood\"}],\"joinedUserTagVariables\":[],\"ingredientUserTagVariables\":[],\"ingredientOfUserTagVariables\":[],\"childUserTagVariables\":[{\"id\":1919,\"name\":\"Back Pain\",\"alias\":null,\"clientId\":\"quantimodo\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1394385660,\"earliestMeasurementTime\":1394385660,\"earliestSourceTime\":1334473200,\"experimentEndTime\":null,\"experimentStartTime\":null,\"fillingType\":null,\"userVariableFillingValue\":-1,\"kurtosis\":10.590629984947,\"lastOriginalUnitId\":10,\"lastOriginalValue\":1,\"lastProcessedDailyValue\":1,\"lastSuccessfulUpdateTime\":\"2017-02-08 05:26:13\",\"lastUnitId\":10,\"lastValue\":1,\"latestFillingTime\":1501718400,\"latestMeasurementTime\":1501718400,\"latestUserMeasurementTime\":1501718400,\"latestSourceTime\":1501718400,\"maximumRecordedValue\":4,\"mean\":1.2363,\"rawMeasurementsAtLastAnalysis\":291,\"measurementsAtLastAnalysis\":291,\"median\":1,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":null,\"numberOfChanges\":61,\"numberOfCorrelations\":1088,\"numberOfProcessedDailyMeasurements\":225,\"numberOfRawMeasurements\":436,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":null,\"numberOfUniqueDailyValues\":7,\"numberOfUserCorrelationsAsCause\":124,\"numberOfUserCorrelationsAsEffect\":964,\"outcomeOfInterest\":1,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":2,\"shareUserMeasurements\":false,\"skewness\":2.7446737786856,\"sources\":null,\"standardDeviation\":0.55217922447658,\"status\":\"UPDATED\",\"thirdToLastValue\":2,\"userId\":230,\"userVariableValence\":null,\"variance\":0.30490189594356,\"userVariableVariableCategoryId\":10,\"variableId\":1919,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":\"negative\",\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-sad-outline\",\"mostCommonOriginalUnitId\":10,\"commonVariableMostCommonConnectorId\":null,\"numberOfAggregateCorrelationsAsCause\":46,\"numberOfAggregateCorrelationsAsEffect\":451,\"numberOfUserVariables\":146,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":3,\"valence\":\"negative\",\"variableCategoryId\":10,\"wikipediaTitle\":null,\"mostCommonValue\":1,\"outcome\":true,\"updatedTime\":\"2017-08-03 05:42:46\",\"updatedAt\":\"2017-08-03 05:42:46\",\"commonVariableUpdatedAt\":\"2017-07-14 02:55:23\",\"userVariableUpdatedAt\":\"2017-08-03 05:42:46\",\"createdAt\":\"2014-03-09 17:22:17\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":604800,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":null,\"experimentStartTimeString\":null,\"experimentStartTimeSeconds\":null,\"experimentEndTimeString\":null,\"experimentEndTimeSeconds\":null,\"mostCommonConnectorId\":null,\"variableCategoryName\":\"Symptoms\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.png\",\"pngPath\":\"img/variable_categories/symptoms.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Symptoms\",\"meanInUserVariableDefaultUnit\":1,\"lastValueInUserVariableDefaultUnit\":1,\"secondToLastValueInUserVariableDefaultUnit\":2,\"thirdToLastValueInUserVariableDefaultUnit\":2,\"mostCommonValueInUserVariableDefaultUnit\":1,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":3,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Back Pain\",\"inputType\":\"saddestFaceIsFive\",\"durationOfActionInHours\":168,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Back%20Pain?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Back%20Pain%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Back%20Pain%20data%21&body=See%20my%20Back%20Pain%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%0A%0AHave%20a%20great%20day!\",\"tagConversionFactor\":1,\"tagDisplayText\":\"Back Pain is tagged with Overall Mood\"}],\"parentUserTagVariables\":[],\"commonTagVariables\":[],\"commonTaggedVariables\":[],\"dataSource\":{\"id\":72,\"name\":\"quantimodo\",\"displayName\":\"QuantiModo\",\"image\":\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\",\"getItUrl\":\"https://quantimo.do\",\"shortDescription\":\"Tracks anything\",\"longDescription\":\"QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"enabled\":0,\"affiliate\":true,\"defaultVariableCategoryName\":\"Foods\",\"imageHtml\":\"<a href=\\\"https://quantimo.do\\\"><img id=\\\"quantimodo_image\\\" title=\\\"QuantiModo\\\" src=\\\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\\\" alt=\\\"QuantiModo\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"https://quantimo.do\\\">QuantiModo</a>\"}}
   */
  var exports = function(causeVariable, effectVariable) {
    var _this = this;

    _this['causeVariable'] = causeVariable;
    _this['effectVariable'] = effectVariable;


  };

  /**
   * Constructs a <code>Study</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Study} obj Optional instance to populate.
   * @return {module:model/Study} The populated <code>Study</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeVariable')) {
        obj['causeVariable'] = ApiClient.convertToType(data['causeVariable'], Object);
      }
      if (data.hasOwnProperty('effectVariable')) {
        obj['effectVariable'] = ApiClient.convertToType(data['effectVariable'], Object);
      }
      if (data.hasOwnProperty('statistics')) {
        obj['statistics'] = ApiClient.convertToType(data['statistics'], Object);
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Example: {\"id\":1448,\"name\":\"Sleep Quality\",\"alias\":null,\"clientId\":\"oAuthDisabled\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1336338900,\"earliestMeasurementTime\":1336338900,\"earliestSourceTime\":1336338900,\"experimentEndTime\":\"2030-01-01 06:00:00\",\"experimentStartTime\":\"2010-03-23 01:31:42\",\"fillingType\":null,\"userVariableFillingValue\":null,\"kurtosis\":2.7220883827049,\"lastOriginalUnitId\":20,\"lastOriginalValue\":1,\"lastProcessedDailyValue\":3,\"lastSuccessfulUpdateTime\":\"2017-03-23 02:14:32\",\"lastUnitId\":10,\"lastValue\":3,\"latestFillingTime\":1406724600,\"latestMeasurementTime\":1406724600,\"latestUserMeasurementTime\":1406724600,\"latestSourceTime\":1483077300,\"maximumRecordedValue\":5,\"mean\":3.359,\"rawMeasurementsAtLastAnalysis\":0,\"measurementsAtLastAnalysis\":0,\"median\":3,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":6,\"numberOfChanges\":171,\"numberOfCorrelations\":1143,\"numberOfProcessedDailyMeasurements\":312,\"numberOfRawMeasurements\":614,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":null,\"numberOfUniqueDailyValues\":18,\"numberOfUserCorrelationsAsCause\":100,\"numberOfUserCorrelationsAsEffect\":1043,\"outcomeOfInterest\":null,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":0.4464285671711,\"shareUserMeasurements\":true,\"skewness\":0.10225665179767,\"sources\":null,\"standardDeviation\":0.8688301252527,\"status\":\"CORRELATING\",\"thirdToLastValue\":0.47916665673256,\"userId\":230,\"userVariableValence\":null,\"variance\":0.75486578654663,\"userVariableVariableCategoryId\":6,\"variableId\":1448,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":null,\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-happy-outline\",\"mostCommonOriginalUnitId\":21,\"commonVariableMostCommonConnectorId\":6,\"numberOfAggregateCorrelationsAsCause\":68,\"numberOfAggregateCorrelationsAsEffect\":336,\"numberOfUserVariables\":49,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":3,\"valence\":\"positive\",\"variableCategoryId\":6,\"wikipediaTitle\":null,\"mostCommonValue\":3,\"outcome\":true,\"updatedTime\":\"2017-07-31 15:06:57\",\"updatedAt\":\"2017-07-31 15:06:57\",\"commonVariableUpdatedAt\":\"2017-07-31 15:06:57\",\"userVariableUpdatedAt\":\"2017-04-18 20:54:49\",\"createdAt\":\"2014-08-01 01:30:16\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":604800,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":null,\"experimentStartTimeString\":\"2010-03-23 01:31:42\",\"experimentStartTimeSeconds\":1269307902,\"experimentEndTimeString\":\"2030-01-01 06:00:00\",\"experimentEndTimeSeconds\":1893477600,\"mostCommonConnectorId\":6,\"variableCategoryName\":\"Sleep\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.png\",\"pngPath\":\"img/variable_categories/sleep.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Sleep\",\"meanInUserVariableDefaultUnit\":3,\"lastValueInUserVariableDefaultUnit\":3,\"secondToLastValueInUserVariableDefaultUnit\":0,\"thirdToLastValueInUserVariableDefaultUnit\":0,\"mostCommonValueInUserVariableDefaultUnit\":3,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":3,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Sleep Quality\",\"inputType\":\"happiestFaceIsFive\",\"durationOfActionInHours\":168,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Sleep%20Quality&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsleep.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Sleep%20Quality?variableName=Sleep%20Quality&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsleep.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Sleep%20Quality%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Sleep%20Quality%20data%21&body=See%20my%20Sleep%20Quality%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DSleep%2520Quality%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsleep.png%0A%0AHave%20a%20great%20day!\",\"userTagVariables\":[],\"userTaggedVariables\":[],\"joinedUserTagVariables\":[],\"ingredientUserTagVariables\":[],\"ingredientOfUserTagVariables\":[],\"childUserTagVariables\":[],\"parentUserTagVariables\":[],\"commonTagVariables\":[],\"commonTaggedVariables\":[],\"dataSource\":{\"id\":6,\"name\":\"up\",\"connectorClientId\":\"10RfjEgKr8U\",\"connectorClientSecret\":\"e17fd34e4bc4642f0c4c99d7acb6e661\",\"displayName\":\"Up by Jawbone\",\"image\":\"https://i.imgur.com/MXNQy3T.png\",\"getItUrl\":\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\",\"shortDescription\":\"Tracks sleep, exercise, and diet.\",\"longDescription\":\"UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"enabled\":1,\"affiliate\":true,\"defaultVariableCategoryName\":\"Physical Activity\",\"imageHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\"><img id=\\\"up_image\\\" title=\\\"Up by Jawbone\\\" src=\\\"https://i.imgur.com/MXNQy3T.png\\\" alt=\\\"Up by Jawbone\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>\"}}
   * @member {Object} causeVariable
   */
  exports.prototype['causeVariable'] = undefined;
  /**
   * Example: {\"id\":1398,\"name\":\"Overall Mood\",\"alias\":null,\"clientId\":\"quantimodo\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1336267020,\"earliestMeasurementTime\":1336267020,\"earliestSourceTime\":1334473200,\"experimentEndTime\":null,\"experimentStartTime\":null,\"fillingType\":null,\"userVariableFillingValue\":-1,\"kurtosis\":5.8376066475804,\"lastOriginalUnitId\":10,\"lastOriginalValue\":3,\"lastProcessedDailyValue\":3,\"lastSuccessfulUpdateTime\":\"2017-08-04 09:23:18\",\"lastUnitId\":10,\"lastValue\":3,\"latestFillingTime\":1501879724,\"latestMeasurementTime\":1501879724,\"latestUserMeasurementTime\":1501879724,\"latestSourceTime\":1501879724,\"maximumRecordedValue\":5,\"mean\":2.8654,\"rawMeasurementsAtLastAnalysis\":0,\"measurementsAtLastAnalysis\":0,\"median\":2.875,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":5,\"numberOfChanges\":1139,\"numberOfCorrelations\":2172,\"numberOfProcessedDailyMeasurements\":1492,\"numberOfRawMeasurements\":11829,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":5,\"numberOfUniqueDailyValues\":191,\"numberOfUserCorrelationsAsCause\":181,\"numberOfUserCorrelationsAsEffect\":1991,\"outcomeOfInterest\":1,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":1,\"shareUserMeasurements\":true,\"skewness\":0.9637141502222,\"sources\":null,\"standardDeviation\":0.58645820392122,\"status\":\"CORRELATING\",\"thirdToLastValue\":1,\"userId\":230,\"userVariableValence\":null,\"variance\":0.3439332249465,\"userVariableVariableCategoryId\":1,\"variableId\":1398,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":\"positive\",\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-happy-outline\",\"mostCommonOriginalUnitId\":10,\"commonVariableMostCommonConnectorId\":10,\"numberOfAggregateCorrelationsAsCause\":329,\"numberOfAggregateCorrelationsAsEffect\":890,\"numberOfUserVariables\":4003,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":2,\"valence\":\"positive\",\"variableCategoryId\":1,\"wikipediaTitle\":null,\"mostCommonValue\":3,\"outcome\":true,\"updatedTime\":\"2017-08-04 23:49:15\",\"updatedAt\":\"2017-08-04 23:49:15\",\"commonVariableUpdatedAt\":\"2017-07-31 19:55:38\",\"userVariableUpdatedAt\":\"2017-08-04 23:49:15\",\"createdAt\":\"2015-11-23 14:15:47\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":86400,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":\"Mood_(psychology)\",\"experimentStartTimeString\":null,\"experimentStartTimeSeconds\":null,\"experimentEndTimeString\":null,\"experimentEndTimeSeconds\":null,\"mostCommonConnectorId\":5,\"variableCategoryName\":\"Emotions\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.png\",\"pngPath\":\"img/variable_categories/emotions.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Emotions\",\"meanInUserVariableDefaultUnit\":3,\"lastValueInUserVariableDefaultUnit\":3,\"secondToLastValueInUserVariableDefaultUnit\":1,\"thirdToLastValueInUserVariableDefaultUnit\":1,\"mostCommonValueInUserVariableDefaultUnit\":3,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":2,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Overall Mood\",\"inputType\":\"happiestFaceIsFive\",\"durationOfActionInHours\":24,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Overall%20Mood&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Femotions.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Overall%20Mood?variableName=Overall%20Mood&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Femotions.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Overall%20Mood%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Overall%20Mood%20data%21&body=See%20my%20Overall%20Mood%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DOverall%2520Mood%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Femotions.png%0A%0AHave%20a%20great%20day!\",\"userTagVariables\":[],\"userTaggedVariables\":[{\"id\":1919,\"name\":\"Back Pain\",\"alias\":null,\"clientId\":\"quantimodo\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1394385660,\"earliestMeasurementTime\":1394385660,\"earliestSourceTime\":1334473200,\"experimentEndTime\":null,\"experimentStartTime\":null,\"fillingType\":null,\"userVariableFillingValue\":-1,\"kurtosis\":10.590629984947,\"lastOriginalUnitId\":10,\"lastOriginalValue\":1,\"lastProcessedDailyValue\":1,\"lastSuccessfulUpdateTime\":\"2017-02-08 05:26:13\",\"lastUnitId\":10,\"lastValue\":1,\"latestFillingTime\":1501718400,\"latestMeasurementTime\":1501718400,\"latestUserMeasurementTime\":1501718400,\"latestSourceTime\":1501718400,\"maximumRecordedValue\":4,\"mean\":1.2363,\"rawMeasurementsAtLastAnalysis\":291,\"measurementsAtLastAnalysis\":291,\"median\":1,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":null,\"numberOfChanges\":61,\"numberOfCorrelations\":1088,\"numberOfProcessedDailyMeasurements\":225,\"numberOfRawMeasurements\":436,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":null,\"numberOfUniqueDailyValues\":7,\"numberOfUserCorrelationsAsCause\":124,\"numberOfUserCorrelationsAsEffect\":964,\"outcomeOfInterest\":1,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":2,\"shareUserMeasurements\":false,\"skewness\":2.7446737786856,\"sources\":null,\"standardDeviation\":0.55217922447658,\"status\":\"UPDATED\",\"thirdToLastValue\":2,\"userId\":230,\"userVariableValence\":null,\"variance\":0.30490189594356,\"userVariableVariableCategoryId\":10,\"variableId\":1919,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":\"negative\",\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-sad-outline\",\"mostCommonOriginalUnitId\":10,\"commonVariableMostCommonConnectorId\":null,\"numberOfAggregateCorrelationsAsCause\":46,\"numberOfAggregateCorrelationsAsEffect\":451,\"numberOfUserVariables\":146,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":3,\"valence\":\"negative\",\"variableCategoryId\":10,\"wikipediaTitle\":null,\"mostCommonValue\":1,\"outcome\":true,\"updatedTime\":\"2017-08-03 05:42:46\",\"updatedAt\":\"2017-08-03 05:42:46\",\"commonVariableUpdatedAt\":\"2017-07-14 02:55:23\",\"userVariableUpdatedAt\":\"2017-08-03 05:42:46\",\"createdAt\":\"2014-03-09 17:22:17\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":604800,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":null,\"experimentStartTimeString\":null,\"experimentStartTimeSeconds\":null,\"experimentEndTimeString\":null,\"experimentEndTimeSeconds\":null,\"mostCommonConnectorId\":null,\"variableCategoryName\":\"Symptoms\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.png\",\"pngPath\":\"img/variable_categories/symptoms.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Symptoms\",\"meanInUserVariableDefaultUnit\":1,\"lastValueInUserVariableDefaultUnit\":1,\"secondToLastValueInUserVariableDefaultUnit\":2,\"thirdToLastValueInUserVariableDefaultUnit\":2,\"mostCommonValueInUserVariableDefaultUnit\":1,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":3,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Back Pain\",\"inputType\":\"saddestFaceIsFive\",\"durationOfActionInHours\":168,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Back%20Pain?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Back%20Pain%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Back%20Pain%20data%21&body=See%20my%20Back%20Pain%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%0A%0AHave%20a%20great%20day!\",\"tagConversionFactor\":1,\"tagDisplayText\":\"Back Pain is tagged with Overall Mood\"}],\"joinedUserTagVariables\":[],\"ingredientUserTagVariables\":[],\"ingredientOfUserTagVariables\":[],\"childUserTagVariables\":[{\"id\":1919,\"name\":\"Back Pain\",\"alias\":null,\"clientId\":\"quantimodo\",\"userVariableDefaultUnitId\":10,\"earliestFillingTime\":1394385660,\"earliestMeasurementTime\":1394385660,\"earliestSourceTime\":1334473200,\"experimentEndTime\":null,\"experimentStartTime\":null,\"fillingType\":null,\"userVariableFillingValue\":-1,\"kurtosis\":10.590629984947,\"lastOriginalUnitId\":10,\"lastOriginalValue\":1,\"lastProcessedDailyValue\":1,\"lastSuccessfulUpdateTime\":\"2017-02-08 05:26:13\",\"lastUnitId\":10,\"lastValue\":1,\"latestFillingTime\":1501718400,\"latestMeasurementTime\":1501718400,\"latestUserMeasurementTime\":1501718400,\"latestSourceTime\":1501718400,\"maximumRecordedValue\":4,\"mean\":1.2363,\"rawMeasurementsAtLastAnalysis\":291,\"measurementsAtLastAnalysis\":291,\"median\":1,\"minimumRecordedValue\":1,\"userVariableMostCommonConnectorId\":null,\"numberOfChanges\":61,\"numberOfCorrelations\":1088,\"numberOfProcessedDailyMeasurements\":225,\"numberOfRawMeasurements\":436,\"numberOfTrackingReminders\":0,\"numberOfUniqueValues\":null,\"numberOfUniqueDailyValues\":7,\"numberOfUserCorrelationsAsCause\":124,\"numberOfUserCorrelationsAsEffect\":964,\"outcomeOfInterest\":1,\"parentId\":null,\"predictorOfInterest\":0,\"secondToLastValue\":2,\"shareUserMeasurements\":false,\"skewness\":2.7446737786856,\"sources\":null,\"standardDeviation\":0.55217922447658,\"status\":\"UPDATED\",\"thirdToLastValue\":2,\"userId\":230,\"userVariableValence\":null,\"variance\":0.30490189594356,\"userVariableVariableCategoryId\":10,\"variableId\":1919,\"userVariableWikipediaTitle\":null,\"defaultUnitId\":10,\"description\":\"negative\",\"variableFillingValue\":-1,\"imageUrl\":null,\"informationalUrl\":null,\"ionIcon\":\"ion-sad-outline\",\"mostCommonOriginalUnitId\":10,\"commonVariableMostCommonConnectorId\":null,\"numberOfAggregateCorrelationsAsCause\":46,\"numberOfAggregateCorrelationsAsEffect\":451,\"numberOfUserVariables\":146,\"parent\":null,\"price\":null,\"productUrl\":null,\"secondMostCommonValue\":4,\"thirdMostCommonValue\":3,\"valence\":\"negative\",\"variableCategoryId\":10,\"wikipediaTitle\":null,\"mostCommonValue\":1,\"outcome\":true,\"updatedTime\":\"2017-08-03 05:42:46\",\"updatedAt\":\"2017-08-03 05:42:46\",\"commonVariableUpdatedAt\":\"2017-07-14 02:55:23\",\"userVariableUpdatedAt\":\"2017-08-03 05:42:46\",\"createdAt\":\"2014-03-09 17:22:17\",\"minimumAllowedValue\":1,\"maximumAllowedValue\":5,\"onsetDelay\":0,\"durationOfAction\":604800,\"combinationOperation\":\"MEAN\",\"joinWith\":null,\"causeOnly\":false,\"public\":true,\"commonAlias\":null,\"experimentStartTimeString\":null,\"experimentStartTimeSeconds\":null,\"experimentEndTimeString\":null,\"experimentEndTimeSeconds\":null,\"mostCommonConnectorId\":null,\"variableCategoryName\":\"Symptoms\",\"svgUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.svg\",\"pngUrl\":\"https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.png\",\"pngPath\":\"img/variable_categories/symptoms.png\",\"variableCategoryImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png\",\"fillingValue\":null,\"manualTracking\":true,\"userVariableVariableCategoryName\":\"Symptoms\",\"meanInUserVariableDefaultUnit\":1,\"lastValueInUserVariableDefaultUnit\":1,\"secondToLastValueInUserVariableDefaultUnit\":2,\"thirdToLastValueInUserVariableDefaultUnit\":2,\"mostCommonValueInUserVariableDefaultUnit\":1,\"secondMostCommonValueInUserVariableDefaultUnit\":4,\"thirdMostCommonValueInUserVariableDefaultUnit\":3,\"unitId\":10,\"unitName\":\"1 to 5 Rating\",\"unitAbbreviatedName\":\"/5\",\"unitCategoryId\":5,\"unitCategoryName\":\"Rating\",\"defaultUnitName\":\"1 to 5 Rating\",\"defaultUnitAbbreviatedName\":\"/5\",\"defaultUnitCategoryId\":5,\"defaultUnitCategoryName\":\"Rating\",\"availableDefaultUnits\":[{\"id\":25,\"name\":\"-4 to 4 Rating\",\"abbreviatedName\":\"-4 to 4\",\"categoryName\":\"Rating\",\"minimumValue\":-4,\"maximumValue\":4,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"ADD\",\"value\":4},{\"operation\":\"MULTIPLY\",\"value\":12.5}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":20,\"name\":\"0 to 1 Rating\",\"abbreviatedName\":\"/1\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":1,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":100}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":40,\"name\":\"0 to 5 Rating\",\"abbreviatedName\":\"/6\",\"categoryName\":\"Rating\",\"minimumValue\":0,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":20}],\"advanced\":1,\"manualTracking\":0,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":203,\"name\":\"1 to 10 Rating\",\"abbreviatedName\":\"/10\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":10,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":11.111111111111},{\"operation\":\"ADD\",\"value\":-11.111111111111}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":10,\"name\":\"1 to 5 Rating\",\"abbreviatedName\":\"/5\",\"categoryName\":\"Rating\",\"minimumValue\":1,\"maximumValue\":5,\"categoryId\":5,\"conversionSteps\":[{\"operation\":\"MULTIPLY\",\"value\":25},{\"operation\":\"ADD\",\"value\":-25}],\"advanced\":0,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}},{\"id\":21,\"name\":\"Percent\",\"abbreviatedName\":\"%\",\"categoryName\":\"Rating\",\"minimumValue\":null,\"maximumValue\":null,\"categoryId\":5,\"conversionSteps\":[],\"advanced\":1,\"manualTracking\":1,\"unitCategory\":{\"name\":\"Rating\",\"standardUnitAbbreviatedName\":\"%\"}}],\"userVariableDefaultUnitName\":\"1 to 5 Rating\",\"userVariableDefaultUnitAbbreviatedName\":\"/5\",\"userVariableDefaultUnitCategoryId\":5,\"userVariableDefaultUnitCategoryName\":\"Rating\",\"variableName\":\"Back Pain\",\"inputType\":\"saddestFaceIsFive\",\"durationOfActionInHours\":168,\"onsetDelayInHours\":0,\"chartsLinkStatic\":\"https://local.quantimo.do/api/v2/charts?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/#/app/charts/Back%20Pain?variableName=Back%20Pain&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fsymptoms.png\",\"chartsLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png\",\"chartsLinkTwitter\":\"https://twitter.com/home?status=Check%20out%20my%20Back%20Pain%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%20%40quantimodo\",\"chartsLinkEmail\":\"mailto:?subject=Check%20out%20my%20Back%20Pain%20data%21&body=See%20my%20Back%20Pain%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBack%2520Pain%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fsymptoms.png%0A%0AHave%20a%20great%20day!\",\"tagConversionFactor\":1,\"tagDisplayText\":\"Back Pain is tagged with Overall Mood\"}],\"parentUserTagVariables\":[],\"commonTagVariables\":[],\"commonTaggedVariables\":[],\"dataSource\":{\"id\":72,\"name\":\"quantimodo\",\"displayName\":\"QuantiModo\",\"image\":\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\",\"getItUrl\":\"https://quantimo.do\",\"shortDescription\":\"Tracks anything\",\"longDescription\":\"QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"enabled\":0,\"affiliate\":true,\"defaultVariableCategoryName\":\"Foods\",\"imageHtml\":\"<a href=\\\"https://quantimo.do\\\"><img id=\\\"quantimodo_image\\\" title=\\\"QuantiModo\\\" src=\\\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\\\" alt=\\\"QuantiModo\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"https://quantimo.do\\\">QuantiModo</a>\"}}
   * @member {Object} effectVariable
   */
  exports.prototype['effectVariable'] = undefined;
  /**
   * Example: {\"correlationCoefficient\":0.537,\"onsetDelay\":0,\"durationOfAction\":604800,\"numberOfPairs\":298,\"effectSize\":\"moderately positive\",\"statisticalSignificance\":0.98208629357249,\"timestamp\":1501905598,\"reversePearsonCorrelationCoefficient\":null,\"predictivePearsonCorrelationCoefficient\":0.537,\"causalityFactor\":0.537,\"causeVariableCategoryName\":\"Sleep\",\"effectVariableCategoryName\":\"Emotions\",\"valuePredictingHighOutcome\":4.21,\"valuePredictingLowOutcome\":3.06,\"optimalPearsonProduct\":0.71265032912368,\"userVote\":null,\"averageVote\":null,\"causeVariableDefaultUnitId\":10,\"createdAt\":null,\"updatedAt\":null,\"causeChanges\":164,\"effectChanges\":195,\"qmScore\":null,\"error\":\"optimalPearsonProduct is not defined\",\"predictsHighEffectChange\":17.13,\"predictsLowEffectChange\":-11.07,\"pValue\":0,\"tValue\":9.6961816920828,\"criticalTValue\":1.646,\"confidenceInterval\":0.14990034554268,\"experimentStartTime\":1336338900,\"experimentEndTime\":1406724600,\"userId\":230,\"studyResults\":\"This analysis suggests that higher Sleep Quality (Sleep) generally predicts higher Overall Mood (p = 0).  Overall Mood is, on average, 17.13% higher after around 4.21 Sleep Quality.  After an onset delay of 168 hours, Overall Mood is, on average, 11.07%  lower than its average over the 168 hours following around 3.06 Sleep Quality.  298 data points were used in this analysis.  The value for Sleep Quality changed 164 times, effectively running 82 separate natural experiments.  The top quartile outcome values are preceded by an average 4.21 /5 of Sleep Quality.  The bottom quartile outcome values are preceded by an average 3.06 /5 of Sleep Quality.  Forward Pearson Correlation Coefficient was 0.537 (p=0, 95% CI 0.387 to 0.687 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -0.15 to 0.15, onset delay = -0 hours, duration of action = -168 hours). When the Sleep Quality value is closer to 4.21 /5 than 3.06 /5, the Overall Mood value which follows is, on average, 17.13%  percent higher than its typical value.  When the Sleep Quality value is closer to 3.06 /5 than 4.21 /5, the Overall Mood value which follows is 0% lower than its typical value.  Overall Mood is 3.62/5 (16% higher) on average after days with around 4.19/5 Sleep Quality  Overall Mood is 2.72/5 (13% lower) on average after days with around 1.97/5 Sleep Quality\",\"dataAnalysis\":\"It was assumed that 0 hours would pass before a change in Sleep Quality would produce an observable change in Overall Mood.  It was assumed that Sleep Quality could produce an observable change in Overall Mood for as much as 7 days after the stimulus event. \",\"outcomeMaximumAllowedValue\":null,\"predictorMaximumAllowedValue\":null,\"studyLimitations\":\"As with any human experiment, it was impossible to control for all potentially confounding variables. \\n            \\n Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome. \\n            However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great \\n confidence rule out non-existent relationships. For instance, if we discover no relationship between mood\\n            and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship. \\n <br>\\n            <br>\\n           \\n            We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship. \\n            The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.\\n            The list of the criteria is as follows:\\n            <br>\\n            1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.\\n            <br>\\n            2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.\\n            <br>\\n            3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.\\n            <br>\\n            4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).\\n            <br>\\n            5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.\\n <br>\\n            6. Plausibility: A plausible mechanism between cause and effect is helpful.\\n            <br>\\n            7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.\\n            <br>\\n            8. Experiment: \\\"Occasionally it is possible to appeal to experimental evidence\\\".\\n            <br>\\n            9. Analogy: The effect of similar factors may be considered.\\n            <br>\\n <br>\\n             \\n             The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  298 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Sleep Quality values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,\\n            one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely\\n            that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will\\n            naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.\",\"significantDifference\":true,\"significanceExplanation\":\"Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Overall Mood is statistically significant at 95% confidence interval. \",\"strengthLevel\":\"moderate\",\"confidenceLevel\":\"high\",\"studyObjective\":\"The objective of this study is to determine the nature of the relationship (if any) between the Sleep Quality and the Overall Mood. Additionally, we attempt to determine the Sleep Quality values most likely to produce optimal Overall Mood values. \",\"studyTitle\":\"N1 Study: Sleep Quality Predicts Higher Overall Mood\",\"dataSources\":\"Sleep Quality data was primarily collected using <a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.<br>Overall Mood data was primarily collected using <a href=\\\"https://quantimo.do\\\">QuantiModo</a>.  <a href=\\\"https://quantimo.do\\\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\\\"https://quantimo.do\\\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"studyAbstract\":\"Your data suggests with a high degree of confidence (p=0) that Sleep Quality (Sleep) has a moderately positive predictive relationship (R=0.537) with Overall Mood  (Emotions).  The highest quartile of Overall Mood  measurements were observed following an average 4.21/5 Sleep Quality.  The lowest quartile of Overall Mood  measurements were observed following an average 3.06/5 Sleep Quality.\",\"direction\":\"higher\",\"predictivePearsonCorrelation\":null,\"predictorExplanation\":\"Sleep Quality Predicts Higher Overall Mood\",\"studyBackground\":null,\"studyDesign\":\"This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. \",\"dataPoints\":null,\"numberOfDays\":814,\"reversePairsCount\":null,\"causeChangesStatisticalSignificance\":0.99577470697973,\"causeVariableCategoryId\":6,\"effectVariableCategoryId\":1,\"predictorFillingValue\":null,\"outcomeFillingValue\":null,\"causeNumberOfRawMeasurements\":614,\"effectNumberOfRawMeasurements\":11829,\"causeNumberOfProcessedDailyMeasurements\":312,\"effectNumberOfProcessedDailyMeasurements\":1492,\"causeVariableMostCommonConnectorId\":6,\"effectVariableMostCommonConnectorId\":5,\"studyLinkFacebook\":\"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230\",\"studyLinkTwitter\":\"https://twitter.com/home?status=Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%20%40quantimodo\",\"studyLinkGoogle\":\"https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230\",\"causeVariableName\":\"Sleep Quality\",\"effectVariableName\":\"Overall Mood\",\"averageEffect\":3.1318379141366,\"numberOfLowEffectPairs\":126,\"numberOfHighEffectPairs\":46,\"degreesOfFreedom\":200,\"numberOfUniqueCauseValuesForOptimalValues\":18,\"numberOfUniqueEffectValuesForOptimalValues\":49,\"numberOfCauseChangesForOptimalValues\":164,\"medianOfUpperHalfOfEffectMeasurements\":null,\"medianOfLowerHalfOfEffectMeasurements\":null,\"numberOfEffectChangesForOptimalValues\":195,\"minimumEffectValue\":2,\"maximumEffectValue\":5,\"effectValueSpread\":3,\"minimumCauseValue\":1,\"maximumCauseValue\":5,\"causeValueSpread\":4,\"averageEffectFollowingHighCause\":3.62,\"averageEffectFollowingLowCause\":2.72,\"averageDailyLowCause\":1.97,\"averageDailyHighCause\":4.19,\"principalInvestigator\":null,\"causeVariableCombinationOperation\":null,\"valuePredictingHighOutcomeExplanation\":\"Overall Mood, on average, 17.13% higher after around 4.21/5 Sleep Quality \",\"averageEffectFollowingHighCauseExplanation\":\"Overall Mood is 3.62/5 (16% higher) on average after days with around 4.19/5 Sleep Quality\",\"averageEffectFollowingLowCauseExplanation\":\"Overall Mood is 2.72/5 (13% lower) on average after days with around 1.97/5 Sleep Quality\",\"valuePredictingLowOutcomeExplanation\":\"Overall Mood, on average, 11.07% lower after around 3.06/5 Sleep Quality \",\"numberOfUsers\":null,\"outcomeDataSources\":null,\"correlationIsContradictoryToOptimalValues\":false,\"forwardSpearmanCorrelationCoefficient\":0.52191019757404,\"minimumProbability\":0.05,\"strongestPearsonCorrelationCoefficient\":null,\"pairsOverTimeChartConfig\":null,\"correlationsOverOnsetDelaysChartConfig\":null,\"correlationsOverDurationsOfActionChartConfig\":null,\"onsetDelayWithStrongestPearsonCorrelation\":null,\"averageForwardPearsonCorrelationOverOnsetDelays\":null,\"averageReversePearsonCorrelationOverOnsetDelays\":null,\"pearsonCorrelationWithNoOnsetDelay\":null,\"voteStatisticalSignificance\":0.98630136986301,\"calculationStartTime\":null,\"shareUserMeasurements\":true,\"causeUserVariableShareUserMeasurements\":null,\"effectUserVariableShareUserMeasurements\":null,\"averagePearsonCorrelationCoefficientOverOnsetDelays\":null,\"onsetDelayWithStrongestPearsonCorrelationInHours\":null,\"causeVariableId\":1448,\"effectVariableId\":1398,\"studyLinkStatic\":\"https://local.quantimo.do/api/v2/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230\",\"studyLinkDynamic\":\"https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230\",\"gaugeImage\":\"https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship.png\",\"imageUrl\":\"https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png\",\"gaugeImageSquare\":\"https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png\",\"onsetDelayInHours\":0,\"durationOfActionInHours\":0,\"effectVariableDefaultUnitId\":10,\"causeVariableDefaultUnitName\":null,\"causeVariableDefaultUnitAbbreviatedName\":\"/5\",\"effectVariableDefaultUnitName\":null,\"effectVariableDefaultUnitAbbreviatedName\":\"/5\",\"rawCauseMeasurementSignificance\":0.99999999870747,\"allPairsSignificance\":0.99995147023968,\"numberOfDaysSignificance\":0.99999999999836,\"rawEffectMeasurementSignificance\":1,\"optimalChangeSpread\":28.2,\"optimalChangeSpreadSignificance\":0.99991727593444,\"correlationsOverDurationsOfAction\":null,\"dataSourcesParagraphForEffect\":\"Overall Mood data was primarily collected using <a href=\\\"https://quantimo.do\\\">QuantiModo</a>.  <a href=\\\"https://quantimo.do\\\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\\\"https://quantimo.do\\\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"dataSourcesParagraphForCause\":\"Sleep Quality data was primarily collected using <a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"instructionsForEffect\":\"<a href=\\\"https://quantimo.do\\\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\\\"https://quantimo.do\\\">QuantiModo</a> account, <a href=\\\"https://app.quantimo.do/ionic/Modo/www/#/app/import\\\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.\",\"instructionsForCause\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a> account, <a href=\\\"https://app.quantimo.do/ionic/Modo/www/#/app/import\\\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.\",\"perDaySentenceFragment\":\"\",\"predictsLowEffectChangeSentenceFragment\":\", on average, 11.07% \",\"predictsHighEffectChangeSentenceFragment\":\", on average, 17.13% \",\"studyLinkEmail\":\"mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!\",\"distanceFromMiddleToBeHightLowEffect\":25,\"numberOfSamples\":298,\"effectUnit\":\"/5\",\"causeVariableImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png\",\"causeVariableIonIcon\":\"ion-ios-cloudy-night-outline\",\"effectVariableImageUrl\":\"https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png\",\"effectVariableIonIcon\":\"ion-happy-outline\"}
   * @member {Object} statistics
   */
  exports.prototype['statistics'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],51:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminder = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminder model module.
   * @module model/TrackingReminder
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>TrackingReminder</code>.
   * @alias module:model/TrackingReminder
   * @class
   * @param variableId {Number} Id for the variable to be tracked
   * @param defaultValue {Number} Default value to use for the measurement when tracking
   * @param reminderFrequency {Number} Number of seconds between one reminder and the next
   */
  var exports = function(variableId, defaultValue, reminderFrequency) {
    var _this = this;




    _this['variableId'] = variableId;
    _this['defaultValue'] = defaultValue;



    _this['reminderFrequency'] = reminderFrequency;



























































  };

  /**
   * Constructs a <code>TrackingReminder</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminder} obj Optional instance to populate.
   * @return {module:model/TrackingReminder} The populated <code>TrackingReminder</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('defaultValue')) {
        obj['defaultValue'] = ApiClient.convertToType(data['defaultValue'], 'Number');
      }
      if (data.hasOwnProperty('reminderStartTime')) {
        obj['reminderStartTime'] = ApiClient.convertToType(data['reminderStartTime'], 'String');
      }
      if (data.hasOwnProperty('reminderEndTime')) {
        obj['reminderEndTime'] = ApiClient.convertToType(data['reminderEndTime'], 'String');
      }
      if (data.hasOwnProperty('reminderSound')) {
        obj['reminderSound'] = ApiClient.convertToType(data['reminderSound'], 'String');
      }
      if (data.hasOwnProperty('reminderFrequency')) {
        obj['reminderFrequency'] = ApiClient.convertToType(data['reminderFrequency'], 'Number');
      }
      if (data.hasOwnProperty('popUp')) {
        obj['popUp'] = ApiClient.convertToType(data['popUp'], 'Boolean');
      }
      if (data.hasOwnProperty('sms')) {
        obj['sms'] = ApiClient.convertToType(data['sms'], 'Boolean');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = ApiClient.convertToType(data['email'], 'Boolean');
      }
      if (data.hasOwnProperty('notificationBar')) {
        obj['notificationBar'] = ApiClient.convertToType(data['notificationBar'], 'Boolean');
      }
      if (data.hasOwnProperty('latestTrackingReminderNotificationReminderTime')) {
        obj['latestTrackingReminderNotificationReminderTime'] = ApiClient.convertToType(data['latestTrackingReminderNotificationReminderTime'], 'Date');
      }
      if (data.hasOwnProperty('lastTracked')) {
        obj['lastTracked'] = ApiClient.convertToType(data['lastTracked'], 'Date');
      }
      if (data.hasOwnProperty('startTrackingDate')) {
        obj['startTrackingDate'] = ApiClient.convertToType(data['startTrackingDate'], 'String');
      }
      if (data.hasOwnProperty('stopTrackingDate')) {
        obj['stopTrackingDate'] = ApiClient.convertToType(data['stopTrackingDate'], 'String');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('trackingReminderId')) {
        obj['trackingReminderId'] = ApiClient.convertToType(data['trackingReminderId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('variableDescription')) {
        obj['variableDescription'] = ApiClient.convertToType(data['variableDescription'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfRawMeasurements')) {
        obj['numberOfRawMeasurements'] = ApiClient.convertToType(data['numberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('reminderStartTimeLocal')) {
        obj['reminderStartTimeLocal'] = ApiClient.convertToType(data['reminderStartTimeLocal'], 'Date');
      }
      if (data.hasOwnProperty('reminderStartTimeLocalHumanFormatted')) {
        obj['reminderStartTimeLocalHumanFormatted'] = ApiClient.convertToType(data['reminderStartTimeLocalHumanFormatted'], 'Date');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('reminderStartEpochSeconds')) {
        obj['reminderStartEpochSeconds'] = ApiClient.convertToType(data['reminderStartEpochSeconds'], 'Number');
      }
      if (data.hasOwnProperty('nextReminderTimeEpochSeconds')) {
        obj['nextReminderTimeEpochSeconds'] = ApiClient.convertToType(data['nextReminderTimeEpochSeconds'], 'Number');
      }
      if (data.hasOwnProperty('firstDailyReminderTime')) {
        obj['firstDailyReminderTime'] = ApiClient.convertToType(data['firstDailyReminderTime'], 'Date');
      }
      if (data.hasOwnProperty('frequencyTextDescription')) {
        obj['frequencyTextDescription'] = ApiClient.convertToType(data['frequencyTextDescription'], 'String');
      }
      if (data.hasOwnProperty('frequencyTextDescriptionWithTime')) {
        obj['frequencyTextDescriptionWithTime'] = ApiClient.convertToType(data['frequencyTextDescriptionWithTime'], 'String');
      }
      if (data.hasOwnProperty('valueAndFrequencyTextDescription')) {
        obj['valueAndFrequencyTextDescription'] = ApiClient.convertToType(data['valueAndFrequencyTextDescription'], 'String');
      }
      if (data.hasOwnProperty('valueAndFrequencyTextDescriptionWithTime')) {
        obj['valueAndFrequencyTextDescriptionWithTime'] = ApiClient.convertToType(data['valueAndFrequencyTextDescriptionWithTime'], 'String');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of User
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Id for the variable to be tracked
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Default value to use for the measurement when tracking
   * @member {Number} defaultValue
   */
  exports.prototype['defaultValue'] = undefined;
  /**
   * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
   * @member {String} reminderStartTime
   */
  exports.prototype['reminderStartTime'] = undefined;
  /**
   * Latest time of day at which reminders should appear in UTC HH:MM:SS format
   * @member {String} reminderEndTime
   */
  exports.prototype['reminderEndTime'] = undefined;
  /**
   * String identifier for the sound to accompany the reminder
   * @member {String} reminderSound
   */
  exports.prototype['reminderSound'] = undefined;
  /**
   * Number of seconds between one reminder and the next
   * @member {Number} reminderFrequency
   */
  exports.prototype['reminderFrequency'] = undefined;
  /**
   * True if the reminders should appear as a popup notification
   * @member {Boolean} popUp
   */
  exports.prototype['popUp'] = undefined;
  /**
   * True if the reminders should be delivered via SMS
   * @member {Boolean} sms
   */
  exports.prototype['sms'] = undefined;
  /**
   * True if the reminders should be delivered via email
   * @member {Boolean} email
   */
  exports.prototype['email'] = undefined;
  /**
   * True if the reminders should appear in the notification bar
   * @member {Boolean} notificationBar
   */
  exports.prototype['notificationBar'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  timestamp for the reminder time of the latest tracking reminder notification that has been pre-emptively generated in the database
   * @member {Date} latestTrackingReminderNotificationReminderTime
   */
  exports.prototype['latestTrackingReminderNotificationReminderTime'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  timestamp for the last time a measurement was received for this user and variable
   * @member {Date} lastTracked
   */
  exports.prototype['lastTracked'] = undefined;
  /**
   * Earliest date on which the user should be reminded to track in YYYY-MM-DD format
   * @member {String} startTrackingDate
   */
  exports.prototype['startTrackingDate'] = undefined;
  /**
   * Latest date on which the user should be reminded to track in YYYY-MM-DD format
   * @member {String} stopTrackingDate
   */
  exports.prototype['stopTrackingDate'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Name of the variable to be used when sending measurements
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Name of the variable category to be used when sending measurements
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Abbreviated name of the unit to be used when sending measurements
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * The way multiple measurements are aggregated over time
   * @member {module:model/TrackingReminder.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Example: 2016-05-18 02:24:08
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 11841
   * @member {Number} trackingReminderId
   */
  exports.prototype['trackingReminderId'] = undefined;
  /**
   * Example: 10
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * Example: negative
   * @member {String} variableDescription
   */
  exports.prototype['variableDescription'] = undefined;
  /**
   * Example: negative
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: 10
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 2
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: 3
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 10
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: 10
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: 445
   * @member {Number} numberOfRawMeasurements
   */
  exports.prototype['numberOfRawMeasurements'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/symptoms.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Symptoms
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: 21:45:20
   * @member {Date} reminderStartTimeLocal
   */
  exports.prototype['reminderStartTimeLocal'] = undefined;
  /**
   * Example: 09:45 PM
   * @member {Date} reminderStartTimeLocalHumanFormatted
   */
  exports.prototype['reminderStartTimeLocalHumanFormatted'] = undefined;
  /**
   * Example: 2
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 3
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 10
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: 5
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: 1
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Example: 5
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Example: saddestFaceIsFive
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: 1469760320
   * @member {Number} reminderStartEpochSeconds
   */
  exports.prototype['reminderStartEpochSeconds'] = undefined;
  /**
   * Example: 1501555520
   * @member {Number} nextReminderTimeEpochSeconds
   */
  exports.prototype['nextReminderTimeEpochSeconds'] = undefined;
  /**
   * Example: 02:45:20
   * @member {Date} firstDailyReminderTime
   */
  exports.prototype['firstDailyReminderTime'] = undefined;
  /**
   * Example: Daily
   * @member {String} frequencyTextDescription
   */
  exports.prototype['frequencyTextDescription'] = undefined;
  /**
   * Example: Daily at 09:45 PM
   * @member {String} frequencyTextDescriptionWithTime
   */
  exports.prototype['frequencyTextDescriptionWithTime'] = undefined;
  /**
   * Example: Rate daily
   * @member {String} valueAndFrequencyTextDescription
   */
  exports.prototype['valueAndFrequencyTextDescription'] = undefined;
  /**
   * Example: Rate daily at 09:45 PM
   * @member {String} valueAndFrequencyTextDescriptionWithTime
   */
  exports.prototype['valueAndFrequencyTextDescriptionWithTime'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16}],52:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderDelete model module.
   * @module model/TrackingReminderDelete
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>TrackingReminderDelete</code>.
   * @alias module:model/TrackingReminderDelete
   * @class
   * @param id {Number} Id of the TrackingReminder to be deleted
   */
  var exports = function(id) {
    var _this = this;

    _this['id'] = id;
  };

  /**
   * Constructs a <code>TrackingReminderDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderDelete} obj Optional instance to populate.
   * @return {module:model/TrackingReminderDelete} The populated <code>TrackingReminderDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Id of the TrackingReminder to be deleted
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],53:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotification = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderNotification model module.
   * @module model/TrackingReminderNotification
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>TrackingReminderNotification</code>.
   * @alias module:model/TrackingReminderNotification
   * @class
   * @param id {Number} id for the specific PENDING tracking remidner
   */
  var exports = function(id) {
    var _this = this;

    _this['id'] = id;





































































  };

  /**
   * Constructs a <code>TrackingReminderNotification</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotification} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotification} The populated <code>TrackingReminderNotification</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('trackingReminderId')) {
        obj['trackingReminderId'] = ApiClient.convertToType(data['trackingReminderId'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('defaultValue')) {
        obj['defaultValue'] = ApiClient.convertToType(data['defaultValue'], 'Number');
      }
      if (data.hasOwnProperty('reminderSound')) {
        obj['reminderSound'] = ApiClient.convertToType(data['reminderSound'], 'String');
      }
      if (data.hasOwnProperty('popUp')) {
        obj['popUp'] = ApiClient.convertToType(data['popUp'], 'Boolean');
      }
      if (data.hasOwnProperty('sms')) {
        obj['sms'] = ApiClient.convertToType(data['sms'], 'Boolean');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = ApiClient.convertToType(data['email'], 'Boolean');
      }
      if (data.hasOwnProperty('notificationBar')) {
        obj['notificationBar'] = ApiClient.convertToType(data['notificationBar'], 'Boolean');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('reminderFrequency')) {
        obj['reminderFrequency'] = ApiClient.convertToType(data['reminderFrequency'], 'Number');
      }
      if (data.hasOwnProperty('reminderStartTime')) {
        obj['reminderStartTime'] = ApiClient.convertToType(data['reminderStartTime'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('trackingReminderNotificationId')) {
        obj['trackingReminderNotificationId'] = ApiClient.convertToType(data['trackingReminderNotificationId'], 'Number');
      }
      if (data.hasOwnProperty('reminderTime')) {
        obj['reminderTime'] = ApiClient.convertToType(data['reminderTime'], 'Date');
      }
      if (data.hasOwnProperty('trackingReminderNotificationTime')) {
        obj['trackingReminderNotificationTime'] = ApiClient.convertToType(data['trackingReminderNotificationTime'], 'Date');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('mostCommonValue')) {
        obj['mostCommonValue'] = ApiClient.convertToType(data['mostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValue')) {
        obj['secondMostCommonValue'] = ApiClient.convertToType(data['secondMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValue')) {
        obj['thirdMostCommonValue'] = ApiClient.convertToType(data['thirdMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueValues')) {
        obj['numberOfUniqueValues'] = ApiClient.convertToType(data['numberOfUniqueValues'], 'Number');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('trackingReminderNotificationTimeEpoch')) {
        obj['trackingReminderNotificationTimeEpoch'] = ApiClient.convertToType(data['trackingReminderNotificationTimeEpoch'], 'Number');
      }
      if (data.hasOwnProperty('trackingReminderNotificationTimeLocal')) {
        obj['trackingReminderNotificationTimeLocal'] = ApiClient.convertToType(data['trackingReminderNotificationTimeLocal'], 'String');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValueInUserVariableDefaultUnit')) {
        obj['mostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['mostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValueInUserVariableDefaultUnit')) {
        obj['secondMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValueInUserVariableDefaultUnit')) {
        obj['thirdMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('total')) {
        obj['total'] = ApiClient.convertToType(data['total'], 'Number');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('trackingReminderImageUrl')) {
        obj['trackingReminderImageUrl'] = ApiClient.convertToType(data['trackingReminderImageUrl'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('iconIcon')) {
        obj['iconIcon'] = ApiClient.convertToType(data['iconIcon'], 'String');
      }
    }
    return obj;
  }

  /**
   * id for the specific PENDING tracking remidner
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * id for the repeating tracking remidner
   * @member {Number} trackingReminderId
   */
  exports.prototype['trackingReminderId'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of User
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Id for the variable to be tracked
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Default value to use for the measurement when tracking
   * @member {Number} defaultValue
   */
  exports.prototype['defaultValue'] = undefined;
  /**
   * String identifier for the sound to accompany the reminder
   * @member {String} reminderSound
   */
  exports.prototype['reminderSound'] = undefined;
  /**
   * True if the reminders should appear as a popup notification
   * @member {Boolean} popUp
   */
  exports.prototype['popUp'] = undefined;
  /**
   * True if the reminders should be delivered via SMS
   * @member {Boolean} sms
   */
  exports.prototype['sms'] = undefined;
  /**
   * True if the reminders should be delivered via email
   * @member {Boolean} email
   */
  exports.prototype['email'] = undefined;
  /**
   * True if the reminders should appear in the notification bar
   * @member {Boolean} notificationBar
   */
  exports.prototype['notificationBar'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Name of the variable to be used when sending measurements
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Name of the variable category to be used when sending measurements
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Abbreviated name of the unit to be used when sending measurements
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * The way multiple measurements are aggregated over time
   * @member {module:model/TrackingReminderNotification.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * How often user should be reminded in seconds. Example: 86400
   * @member {Number} reminderFrequency
   */
  exports.prototype['reminderFrequency'] = undefined;
  /**
   * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
   * @member {String} reminderStartTime
   */
  exports.prototype['reminderStartTime'] = undefined;
  /**
   * Example: 2017-07-29 20:49:54
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 5072482
   * @member {Number} trackingReminderNotificationId
   */
  exports.prototype['trackingReminderNotificationId'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss` timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.
   * @member {Date} reminderTime
   */
  exports.prototype['reminderTime'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss` timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.
   * @member {Date} trackingReminderNotificationTime
   */
  exports.prototype['trackingReminderNotificationTime'] = undefined;
  /**
   * Example: 10
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * Example: positive
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: 1
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: positive
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: 3
   * @member {Number} mostCommonValue
   */
  exports.prototype['mostCommonValue'] = undefined;
  /**
   * Example: 4
   * @member {Number} secondMostCommonValue
   */
  exports.prototype['secondMostCommonValue'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdMostCommonValue
   */
  exports.prototype['thirdMostCommonValue'] = undefined;
  /**
   * Example: 3
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 10
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: 1
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: 5
   * @member {Number} numberOfUniqueValues
   */
  exports.prototype['numberOfUniqueValues'] = undefined;
  /**
   * Example: ion-happy-outline
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/emotions.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Emotions
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: 1501534124
   * @member {Number} trackingReminderNotificationTimeEpoch
   */
  exports.prototype['trackingReminderNotificationTimeEpoch'] = undefined;
  /**
   * Example: 15:48:44
   * @member {String} trackingReminderNotificationTimeLocal
   */
  exports.prototype['trackingReminderNotificationTimeLocal'] = undefined;
  /**
   * Example: 3
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 3
   * @member {Number} mostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['mostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 4
   * @member {Number} secondMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['secondMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 10
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: 5
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: 1
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Example: 5
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Example: happiestFaceIsFive
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: 3
   * @member {Number} total
   */
  exports.prototype['total'] = undefined;
  /**
   * Example: Rate Overall Mood
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg
   * @member {String} trackingReminderImageUrl
   */
  exports.prototype['trackingReminderImageUrl'] = undefined;
  /**
   * Example: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} iconIcon
   */
  exports.prototype['iconIcon'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16}],54:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotificationPost = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderNotificationPost model module.
   * @module model/TrackingReminderNotificationPost
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>TrackingReminderNotificationPost</code>.
   * @alias module:model/TrackingReminderNotificationPost
   * @class
   * @param id {Number} Id of the TrackingReminderNotification
   * @param action {module:model/TrackingReminderNotificationPost.ActionEnum} track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
   */
  var exports = function(id, action) {
    var _this = this;

    _this['id'] = id;

    _this['action'] = action;
  };

  /**
   * Constructs a <code>TrackingReminderNotificationPost</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotificationPost} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotificationPost} The populated <code>TrackingReminderNotificationPost</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('modifiedValue')) {
        obj['modifiedValue'] = ApiClient.convertToType(data['modifiedValue'], 'Number');
      }
      if (data.hasOwnProperty('action')) {
        obj['action'] = ApiClient.convertToType(data['action'], 'String');
      }
    }
    return obj;
  }

  /**
   * Id of the TrackingReminderNotification
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Optional value to be recorded instead of the tracking reminder default value
   * @member {Number} modifiedValue
   */
  exports.prototype['modifiedValue'] = undefined;
  /**
   * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
   * @member {module:model/TrackingReminderNotificationPost.ActionEnum} action
   */
  exports.prototype['action'] = undefined;


  /**
   * Allowed values for the <code>action</code> property.
   * @enum {String}
   * @readonly
   */
  exports.ActionEnum = {
    /**
     * value: "track"
     * @const
     */
    "track": "track",
    /**
     * value: "snooze"
     * @const
     */
    "snooze": "snooze",
    /**
     * value: "skip"
     * @const
     */
    "skip": "skip"  };


  return exports;
}));



},{"../ApiClient":16}],55:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ConversionStep', 'model/UnitCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ConversionStep'), require('./UnitCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Unit = factory(root.Quantimodo.ApiClient, root.Quantimodo.ConversionStep, root.Quantimodo.UnitCategory);
  }
}(this, function(ApiClient, ConversionStep, UnitCategory) {
  'use strict';




  /**
   * The Unit model module.
   * @module model/Unit
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Unit</code>.
   * @alias module:model/Unit
   * @class
   * @param name {String} Unit name
   * @param abbreviatedName {String} Unit abbreviation
   * @param category {module:model/Unit.CategoryEnum} Unit category
   * @param conversionSteps {Array.<module:model/ConversionStep>} Conversion steps list
   * @param unitCategory {module:model/UnitCategory} 
   * @param maximumValue {Number} Example: 4
   */
  var exports = function(name, abbreviatedName, category, conversionSteps, unitCategory, maximumValue) {
    var _this = this;

    _this['name'] = name;
    _this['abbreviatedName'] = abbreviatedName;
    _this['category'] = category;


    _this['conversionSteps'] = conversionSteps;






    _this['unitCategory'] = unitCategory;
    _this['maximumValue'] = maximumValue;
  };

  /**
   * Constructs a <code>Unit</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Unit} obj Optional instance to populate.
   * @return {module:model/Unit} The populated <code>Unit</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('abbreviatedName')) {
        obj['abbreviatedName'] = ApiClient.convertToType(data['abbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('category')) {
        obj['category'] = ApiClient.convertToType(data['category'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('conversionSteps')) {
        obj['conversionSteps'] = ApiClient.convertToType(data['conversionSteps'], [ConversionStep]);
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('categoryName')) {
        obj['categoryName'] = ApiClient.convertToType(data['categoryName'], 'String');
      }
      if (data.hasOwnProperty('categoryId')) {
        obj['categoryId'] = ApiClient.convertToType(data['categoryId'], 'Number');
      }
      if (data.hasOwnProperty('advanced')) {
        obj['advanced'] = ApiClient.convertToType(data['advanced'], 'Number');
      }
      if (data.hasOwnProperty('minimumValue')) {
        obj['minimumValue'] = ApiClient.convertToType(data['minimumValue'], 'Number');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Number');
      }
      if (data.hasOwnProperty('unitCategory')) {
        obj['unitCategory'] = UnitCategory.constructFromObject(data['unitCategory']);
      }
      if (data.hasOwnProperty('maximumValue')) {
        obj['maximumValue'] = ApiClient.convertToType(data['maximumValue'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Unit name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Unit abbreviation
   * @member {String} abbreviatedName
   */
  exports.prototype['abbreviatedName'] = undefined;
  /**
   * Unit category
   * @member {module:model/Unit.CategoryEnum} category
   */
  exports.prototype['category'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Conversion steps list
   * @member {Array.<module:model/ConversionStep>} conversionSteps
   */
  exports.prototype['conversionSteps'] = undefined;
  /**
   * Example: 29
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} categoryName
   */
  exports.prototype['categoryName'] = undefined;
  /**
   * Example: 6
   * @member {Number} categoryId
   */
  exports.prototype['categoryId'] = undefined;
  /**
   * Example: 1
   * @member {Number} advanced
   */
  exports.prototype['advanced'] = undefined;
  /**
   * Example: 0
   * @member {Number} minimumValue
   */
  exports.prototype['minimumValue'] = undefined;
  /**
   * Example: 0
   * @member {Number} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * @member {module:model/UnitCategory} unitCategory
   */
  exports.prototype['unitCategory'] = undefined;
  /**
   * Example: 4
   * @member {Number} maximumValue
   */
  exports.prototype['maximumValue'] = undefined;


  /**
   * Allowed values for the <code>category</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CategoryEnum = {
    /**
     * value: "Distance"
     * @const
     */
    "Distance": "Distance",
    /**
     * value: "Duration"
     * @const
     */
    "Duration": "Duration",
    /**
     * value: "Energy"
     * @const
     */
    "Energy": "Energy",
    /**
     * value: "Frequency"
     * @const
     */
    "Frequency": "Frequency",
    /**
     * value: "Miscellany"
     * @const
     */
    "Miscellany": "Miscellany",
    /**
     * value: "Pressure"
     * @const
     */
    "Pressure": "Pressure",
    /**
     * value: "Proportion"
     * @const
     */
    "Proportion": "Proportion",
    /**
     * value: "Rating"
     * @const
     */
    "Rating": "Rating",
    /**
     * value: "Temperature"
     * @const
     */
    "Temperature": "Temperature",
    /**
     * value: "Volume"
     * @const
     */
    "Volume": "Volume",
    /**
     * value: "Weight"
     * @const
     */
    "Weight": "Weight"  };


  return exports;
}));



},{"../ApiClient":16,"./ConversionStep":31,"./UnitCategory":56}],56:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UnitCategory = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UnitCategory model module.
   * @module model/UnitCategory
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UnitCategory</code>.
   * @alias module:model/UnitCategory
   * @class
   * @param name {String} Category name
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;

  };

  /**
   * Constructs a <code>UnitCategory</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UnitCategory} obj Optional instance to populate.
   * @return {module:model/UnitCategory} The populated <code>UnitCategory</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('standardUnitAbbreviatedName')) {
        obj['standardUnitAbbreviatedName'] = ApiClient.convertToType(data['standardUnitAbbreviatedName'], 'String');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Category name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Base unit for in which measurements are to be converted to and stored
   * @member {String} standardUnitAbbreviatedName
   */
  exports.prototype['standardUnitAbbreviatedName'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],57:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Update = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Update model module.
   * @module model/Update
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Update</code>.
   * @alias module:model/Update
   * @class
   * @param userId {Number} userId
   * @param connectorId {Number} connectorId
   * @param numberOfMeasurements {Number} numberOfMeasurements
   * @param success {Boolean} success
   * @param message {String} message
   */
  var exports = function(userId, connectorId, numberOfMeasurements, success, message) {
    var _this = this;


    _this['userId'] = userId;
    _this['connectorId'] = connectorId;
    _this['numberOfMeasurements'] = numberOfMeasurements;
    _this['success'] = success;
    _this['message'] = message;


  };

  /**
   * Constructs a <code>Update</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Update} obj Optional instance to populate.
   * @return {module:model/Update} The populated <code>Update</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('connectorId')) {
        obj['connectorId'] = ApiClient.convertToType(data['connectorId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfMeasurements')) {
        obj['numberOfMeasurements'] = ApiClient.convertToType(data['numberOfMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * userId
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * connectorId
   * @member {Number} connectorId
   */
  exports.prototype['connectorId'] = undefined;
  /**
   * numberOfMeasurements
   * @member {Number} numberOfMeasurements
   */
  exports.prototype['numberOfMeasurements'] = undefined;
  /**
   * success
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],58:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.User = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The User model module.
   * @module model/User
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>User</code>.
   * @alias module:model/User
   * @class
   * @param id {Number} User id
   * @param displayName {String} User display name
   * @param loginName {String} User login name
   * @param email {String} User email
   * @param accessToken {String} User access token
   * @param administrator {Boolean} Is user administrator
   */
  var exports = function(id, displayName, loginName, email, accessToken, administrator) {
    var _this = this;

    _this['id'] = id;
    _this['displayName'] = displayName;
    _this['loginName'] = loginName;
    _this['email'] = email;
    _this['accessToken'] = accessToken;
    _this['administrator'] = administrator;

























  };

  /**
   * Constructs a <code>User</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/User} obj Optional instance to populate.
   * @return {module:model/User} The populated <code>User</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('loginName')) {
        obj['loginName'] = ApiClient.convertToType(data['loginName'], 'String');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = ApiClient.convertToType(data['email'], 'String');
      }
      if (data.hasOwnProperty('accessToken')) {
        obj['accessToken'] = ApiClient.convertToType(data['accessToken'], 'String');
      }
      if (data.hasOwnProperty('administrator')) {
        obj['administrator'] = ApiClient.convertToType(data['administrator'], 'Boolean');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('earliestReminderTime')) {
        obj['earliestReminderTime'] = ApiClient.convertToType(data['earliestReminderTime'], 'Date');
      }
      if (data.hasOwnProperty('lastFour')) {
        obj['lastFour'] = ApiClient.convertToType(data['lastFour'], 'String');
      }
      if (data.hasOwnProperty('latestReminderTime')) {
        obj['latestReminderTime'] = ApiClient.convertToType(data['latestReminderTime'], 'String');
      }
      if (data.hasOwnProperty('clientUserId')) {
        obj['clientUserId'] = ApiClient.convertToType(data['clientUserId'], 'String');
      }
      if (data.hasOwnProperty('pushNotificationsEnabled')) {
        obj['pushNotificationsEnabled'] = ApiClient.convertToType(data['pushNotificationsEnabled'], 'Boolean');
      }
      if (data.hasOwnProperty('roles')) {
        obj['roles'] = ApiClient.convertToType(data['roles'], 'String');
      }
      if (data.hasOwnProperty('sendPredictorEmails')) {
        obj['sendPredictorEmails'] = ApiClient.convertToType(data['sendPredictorEmails'], 'Boolean');
      }
      if (data.hasOwnProperty('sendReminderNotificationEmails')) {
        obj['sendReminderNotificationEmails'] = ApiClient.convertToType(data['sendReminderNotificationEmails'], 'Boolean');
      }
      if (data.hasOwnProperty('stripeId')) {
        obj['stripeId'] = ApiClient.convertToType(data['stripeId'], 'String');
      }
      if (data.hasOwnProperty('stripePlan')) {
        obj['stripePlan'] = ApiClient.convertToType(data['stripePlan'], 'String');
      }
      if (data.hasOwnProperty('stripeSubscription')) {
        obj['stripeSubscription'] = ApiClient.convertToType(data['stripeSubscription'], 'String');
      }
      if (data.hasOwnProperty('subscriptionProvider')) {
        obj['subscriptionProvider'] = ApiClient.convertToType(data['subscriptionProvider'], 'String');
      }
      if (data.hasOwnProperty('timeZoneOffset')) {
        obj['timeZoneOffset'] = ApiClient.convertToType(data['timeZoneOffset'], 'Number');
      }
      if (data.hasOwnProperty('password')) {
        obj['password'] = ApiClient.convertToType(data['password'], 'String');
      }
      if (data.hasOwnProperty('avatar')) {
        obj['avatar'] = ApiClient.convertToType(data['avatar'], 'String');
      }
      if (data.hasOwnProperty('userRegistered')) {
        obj['userRegistered'] = ApiClient.convertToType(data['userRegistered'], 'Date');
      }
      if (data.hasOwnProperty('userUrl')) {
        obj['userUrl'] = ApiClient.convertToType(data['userUrl'], 'String');
      }
      if (data.hasOwnProperty('capabilities')) {
        obj['capabilities'] = ApiClient.convertToType(data['capabilities'], 'String');
      }
      if (data.hasOwnProperty('firstName')) {
        obj['firstName'] = ApiClient.convertToType(data['firstName'], 'String');
      }
      if (data.hasOwnProperty('lastName')) {
        obj['lastName'] = ApiClient.convertToType(data['lastName'], 'String');
      }
      if (data.hasOwnProperty('trackLocation')) {
        obj['trackLocation'] = ApiClient.convertToType(data['trackLocation'], 'Boolean');
      }
      if (data.hasOwnProperty('combineNotifications')) {
        obj['combineNotifications'] = ApiClient.convertToType(data['combineNotifications'], 'Boolean');
      }
      if (data.hasOwnProperty('avatarImage')) {
        obj['avatarImage'] = ApiClient.convertToType(data['avatarImage'], 'String');
      }
      if (data.hasOwnProperty('stripeActive')) {
        obj['stripeActive'] = ApiClient.convertToType(data['stripeActive'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * User id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * User display name
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * User login name
   * @member {String} loginName
   */
  exports.prototype['loginName'] = undefined;
  /**
   * User email
   * @member {String} email
   */
  exports.prototype['email'] = undefined;
  /**
   * User access token
   * @member {String} accessToken
   */
  exports.prototype['accessToken'] = undefined;
  /**
   * Is user administrator
   * @member {Boolean} administrator
   */
  exports.prototype['administrator'] = undefined;
  /**
   * Example: quantimodo
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Earliest time user should get notifications. Example: 05:00:00
   * @member {Date} earliestReminderTime
   */
  exports.prototype['earliestReminderTime'] = undefined;
  /**
   * Example: 2009
   * @member {String} lastFour
   */
  exports.prototype['lastFour'] = undefined;
  /**
   * Latest time user should get notifications. Example: 23:00:00
   * @member {String} latestReminderTime
   */
  exports.prototype['latestReminderTime'] = undefined;
  /**
   * Example: 118444693184829555362
   * @member {String} clientUserId
   */
  exports.prototype['clientUserId'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} pushNotificationsEnabled
   */
  exports.prototype['pushNotificationsEnabled'] = undefined;
  /**
   * Example: [\"admin\"]
   * @member {String} roles
   */
  exports.prototype['roles'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} sendPredictorEmails
   */
  exports.prototype['sendPredictorEmails'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} sendReminderNotificationEmails
   */
  exports.prototype['sendReminderNotificationEmails'] = undefined;
  /**
   * Example: cus_A8CEmcvl8jwLhV
   * @member {String} stripeId
   */
  exports.prototype['stripeId'] = undefined;
  /**
   * Example: monthly7
   * @member {String} stripePlan
   */
  exports.prototype['stripePlan'] = undefined;
  /**
   * Example: sub_ANTx3nOE7nzjQf
   * @member {String} stripeSubscription
   */
  exports.prototype['stripeSubscription'] = undefined;
  /**
   * Example: google
   * @member {String} subscriptionProvider
   */
  exports.prototype['subscriptionProvider'] = undefined;
  /**
   * Example: 300
   * @member {Number} timeZoneOffset
   */
  exports.prototype['timeZoneOffset'] = undefined;
  /**
   * Example: PASSWORD
   * @member {String} password
   */
  exports.prototype['password'] = undefined;
  /**
   * Example: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
   * @member {String} avatar
   */
  exports.prototype['avatar'] = undefined;
  /**
   * Example: 2013-12-03 15:25:13
   * @member {Date} userRegistered
   */
  exports.prototype['userRegistered'] = undefined;
  /**
   * Example: https://plus.google.com/+MikeSinn
   * @member {String} userUrl
   */
  exports.prototype['userUrl'] = undefined;
  /**
   * Example: a:1:{s:13:\"administrator\";b:1;}
   * @member {String} capabilities
   */
  exports.prototype['capabilities'] = undefined;
  /**
   * Example: Mike
   * @member {String} firstName
   */
  exports.prototype['firstName'] = undefined;
  /**
   * Example: Sinn
   * @member {String} lastName
   */
  exports.prototype['lastName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} trackLocation
   */
  exports.prototype['trackLocation'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} combineNotifications
   */
  exports.prototype['combineNotifications'] = undefined;
  /**
   * Example: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
   * @member {String} avatarImage
   */
  exports.prototype['avatarImage'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} stripeActive
   */
  exports.prototype['stripeActive'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],59:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserCorrelation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserCorrelation model module.
   * @module model/UserCorrelation
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserCorrelation</code>.
   * @alias module:model/UserCorrelation
   * @class
   * @param cause {String} Variable name of the cause variable for which the user desires correlations.
   * @param correlationCoefficient {Number} Pearson correlation coefficient between cause and effect measurements
   * @param durationOfAction {Number} The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @param effect {String} Variable name of the effect variable for which the user desires correlations.
   * @param numberOfPairs {Number} Number of points that went into the correlation calculation
   * @param onsetDelay {Number} The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @param timestamp {Number} Time at which correlation was calculated
   */
  var exports = function(cause, correlationCoefficient, durationOfAction, effect, numberOfPairs, onsetDelay, timestamp) {
    var _this = this;










    _this['cause'] = cause;









    _this['correlationCoefficient'] = correlationCoefficient;



    _this['durationOfAction'] = durationOfAction;
    _this['effect'] = effect;








    _this['numberOfPairs'] = numberOfPairs;
    _this['onsetDelay'] = onsetDelay;





















    _this['timestamp'] = timestamp;






























































  };

  /**
   * Constructs a <code>UserCorrelation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserCorrelation} obj Optional instance to populate.
   * @return {module:model/UserCorrelation} The populated <code>UserCorrelation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'Number');
      }
      if (data.hasOwnProperty('causalityFactor')) {
        obj['causalityFactor'] = ApiClient.convertToType(data['causalityFactor'], 'Number');
      }
      if (data.hasOwnProperty('cause')) {
        obj['cause'] = ApiClient.convertToType(data['cause'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('causeUnit')) {
        obj['causeUnit'] = ApiClient.convertToType(data['causeUnit'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('effect')) {
        obj['effect'] = ApiClient.convertToType(data['effect'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('outcomeDataSources')) {
        obj['outcomeDataSources'] = ApiClient.convertToType(data['outcomeDataSources'], 'String');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('principalInvestigator')) {
        obj['principalInvestigator'] = ApiClient.convertToType(data['principalInvestigator'], 'String');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'Number');
      }
      if (data.hasOwnProperty('reverseCorrelation')) {
        obj['reverseCorrelation'] = ApiClient.convertToType(data['reverseCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('studyBackground')) {
        obj['studyBackground'] = ApiClient.convertToType(data['studyBackground'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCombinationOperation')) {
        obj['effectVariableCombinationOperation'] = ApiClient.convertToType(data['effectVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCommonAlias')) {
        obj['effectVariableCommonAlias'] = ApiClient.convertToType(data['effectVariableCommonAlias'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('createdTime')) {
        obj['createdTime'] = ApiClient.convertToType(data['createdTime'], 'Date');
      }
      if (data.hasOwnProperty('updatedTime')) {
        obj['updatedTime'] = ApiClient.convertToType(data['updatedTime'], 'Date');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'Number');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('causeDataSource')) {
        obj['causeDataSource'] = ApiClient.convertToType(data['causeDataSource'], Object);
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('effectDataSource')) {
        obj['effectDataSource'] = ApiClient.convertToType(data['effectDataSource'], Object);
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('pValue')) {
        obj['pValue'] = ApiClient.convertToType(data['pValue'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorMinimumAllowedValue')) {
        obj['predictorMinimumAllowedValue'] = ApiClient.convertToType(data['predictorMinimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorDataSources')) {
        obj['predictorDataSources'] = ApiClient.convertToType(data['predictorDataSources'], 'String');
      }
    }
    return obj;
  }

  /**
   * 
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * 
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Average Vote
   * @member {Number} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * 
   * @member {Number} causalityFactor
   */
  exports.prototype['causalityFactor'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} cause
   */
  exports.prototype['cause'] = undefined;
  /**
   * Variable category of the cause variable.
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Number of changes in the predictor variable (a.k.a the number of experiments)
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * The way cause measurements are aggregated
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * 
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Unit of the predictor variable
   * @member {String} causeUnit
   */
  exports.prototype['causeUnit'] = undefined;
  /**
   * Unit Id of the predictor variable
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * 
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Pearson correlation coefficient between cause and effect measurements
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * How the data was analyzed
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * How the data was obtained
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effect
   */
  exports.prototype['effect'] = undefined;
  /**
   * Variable category of the effect variable.
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * 
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Illustrates the strength of the relationship
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Large image for Facebook
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Number of points that went into the correlation calculation
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Optimal Pearson Product
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * original name of the cause.
   * @member {String} outcomeDataSources
   */
  exports.prototype['outcomeDataSources'] = undefined;
  /**
   * HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Mike Sinn
   * @member {String} principalInvestigator
   */
  exports.prototype['principalInvestigator'] = undefined;
  /**
   * Value representing the significance of the relationship as a function of crowdsourced insights, predictive strength, data quantity, and data quality
   * @member {Number} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Correlation when cause and effect are reversed. For any causal relationship, the forward correlation should exceed the reverse correlation.
   * @member {Number} reverseCorrelation
   */
  exports.prototype['reverseCorrelation'] = undefined;
  /**
   * Using a two-tailed t-test with alpha = 0.05, it was determined that the change...
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * A function of the effect size and sample size
   * @member {String} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * weak, moderate, strong
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * These data suggest with a high degree of confidence...
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * In order to reduce suffering through the advancement of human knowledge...
   * @member {String} studyBackground
   */
  exports.prototype['studyBackground'] = undefined;
  /**
   * This study is based on data donated by one QuantiModo user...
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * As with any human experiment, it was impossible to control for all potentially confounding variables...
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Url for the interactive study within the web app
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Url for sharing the study on Facebook
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Url for sharing the study on Google+
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Url for sharing the study on Twitter
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Url for sharing the statically rendered study on social media
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * The objective of this study is to determine...
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * This analysis suggests that...
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * N1 Study HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Time at which correlation was calculated
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * User Vote
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * cause value that predicts an above average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Overall Mood, on average, 34% HIGHER after around 3.98mg Remeron
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * cause value that predicts a below average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Overall Mood, on average, 4% LOWER after around 0mg Remeron
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: 0.396
   * @member {Number} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.453667
   * @member {Number} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.14344467795996
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 193
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 2014-07-30 12:50:00
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 2012-05-06 21:15:00
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 0.528359
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: -86400
   * @member {Number} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 0.477
   * @member {Number} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: 17
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -11
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0.613
   * @member {Number} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 9.6986079652717
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: MEAN
   * @member {String} effectVariableCombinationOperation
   */
  exports.prototype['effectVariableCombinationOperation'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} effectVariableCommonAlias
   */
  exports.prototype['effectVariableCommonAlias'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 1
   * @member {Number} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: -1
   * @member {Number} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: -1
   * @member {Number} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 2016-12-28 20:47:30
   * @member {Date} createdTime
   */
  exports.prototype['createdTime'] = undefined;
  /**
   * Example: 2017-05-06 15:40:38
   * @member {Date} updatedTime
   */
  exports.prototype['updatedTime'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: -24
   * @member {Number} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: /5
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: /5
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: /5
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: , on average, 17% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 11% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: {\"id\":6,\"name\":\"up\",\"connectorClientId\":\"10RfjEgKr8U\",\"connectorClientSecret\":\"e17fd34e4bc4642f0c4c99d7acb6e661\",\"displayName\":\"Up by Jawbone\",\"image\":\"https://i.imgur.com/MXNQy3T.png\",\"getItUrl\":\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\",\"shortDescription\":\"Tracks sleep, exercise, and diet.\",\"longDescription\":\"UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.\",\"enabled\":1,\"affiliate\":true,\"defaultVariableCategoryName\":\"Physical Activity\",\"imageHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\"><img id=\\\"up_image\\\" title=\\\"Up by Jawbone\\\" src=\\\"https://i.imgur.com/MXNQy3T.png\\\" alt=\\\"Up by Jawbone\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\\\">Up by Jawbone</a>\"}
   * @member {Object} causeDataSource
   */
  exports.prototype['causeDataSource'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: {\"id\":72,\"name\":\"quantimodo\",\"displayName\":\"QuantiModo\",\"image\":\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\",\"getItUrl\":\"https://quantimo.do\",\"shortDescription\":\"Tracks anything\",\"longDescription\":\"QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.\",\"enabled\":0,\"affiliate\":true,\"defaultVariableCategoryName\":\"Foods\",\"imageHtml\":\"<a href=\\\"https://quantimo.do\\\"><img id=\\\"quantimodo_image\\\" title=\\\"QuantiModo\\\" src=\\\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\\\" alt=\\\"QuantiModo\\\"></a>\",\"linkedDisplayNameHtml\":\"<a href=\\\"https://quantimo.do\\\">QuantiModo</a>\"}
   * @member {Object} effectDataSource
   */
  exports.prototype['effectDataSource'] = undefined;
  /**
   * Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: 3.5306635529222E-5
   * @member {Number} pValue
   */
  exports.prototype['pValue'] = undefined;
  /**
   * Example: 0.63628232030415
   * @member {Number} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 10
   * @member {Number} predictorMinimumAllowedValue
   */
  exports.prototype['predictorMinimumAllowedValue'] = undefined;
  /**
   * Example: 160934
   * @member {Number} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: RescueTime
   * @member {String} predictorDataSources
   */
  exports.prototype['predictorDataSources'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],60:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTag = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserTag model module.
   * @module model/UserTag
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserTag</code>.
   * @alias module:model/UserTag
   * @class
   * @param taggedVariableId {Number} This is the id of the variable being tagged with an ingredient or something.
   * @param tagVariableId {Number} This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
   * @param conversionFactor {Number} Number by which we multiply the tagged variable value to obtain the tag variable (ingredient) value
   */
  var exports = function(taggedVariableId, tagVariableId, conversionFactor) {
    var _this = this;

    _this['taggedVariableId'] = taggedVariableId;
    _this['tagVariableId'] = tagVariableId;
    _this['conversionFactor'] = conversionFactor;
  };

  /**
   * Constructs a <code>UserTag</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTag} obj Optional instance to populate.
   * @return {module:model/UserTag} The populated <code>UserTag</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('taggedVariableId')) {
        obj['taggedVariableId'] = ApiClient.convertToType(data['taggedVariableId'], 'Number');
      }
      if (data.hasOwnProperty('tagVariableId')) {
        obj['tagVariableId'] = ApiClient.convertToType(data['tagVariableId'], 'Number');
      }
      if (data.hasOwnProperty('conversionFactor')) {
        obj['conversionFactor'] = ApiClient.convertToType(data['conversionFactor'], 'Number');
      }
    }
    return obj;
  }

  /**
   * This is the id of the variable being tagged with an ingredient or something.
   * @member {Number} taggedVariableId
   */
  exports.prototype['taggedVariableId'] = undefined;
  /**
   * This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
   * @member {Number} tagVariableId
   */
  exports.prototype['tagVariableId'] = undefined;
  /**
   * Number by which we multiply the tagged variable value to obtain the tag variable (ingredient) value
   * @member {Number} conversionFactor
   */
  exports.prototype['conversionFactor'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],61:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTokenFailedResponse = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserTokenFailedResponse model module.
   * @module model/UserTokenFailedResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserTokenFailedResponse</code>.
   * @alias module:model/UserTokenFailedResponse
   * @class
   * @param code {Number} Status code
   * @param message {String} Message
   * @param success {Boolean} 
   */
  var exports = function(code, message, success) {
    var _this = this;

    _this['code'] = code;
    _this['message'] = message;
    _this['success'] = success;
  };

  /**
   * Constructs a <code>UserTokenFailedResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTokenFailedResponse} obj Optional instance to populate.
   * @return {module:model/UserTokenFailedResponse} The populated <code>UserTokenFailedResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('code')) {
        obj['code'] = ApiClient.convertToType(data['code'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} code
   */
  exports.prototype['code'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],62:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/UserTokenRequestInnerUserField'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./UserTokenRequestInnerUserField'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTokenRequest = factory(root.Quantimodo.ApiClient, root.Quantimodo.UserTokenRequestInnerUserField);
  }
}(this, function(ApiClient, UserTokenRequestInnerUserField) {
  'use strict';




  /**
   * The UserTokenRequest model module.
   * @module model/UserTokenRequest
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserTokenRequest</code>.
   * @alias module:model/UserTokenRequest
   * @class
   * @param organizationAccessToken {String} Organization Access token
   */
  var exports = function(organizationAccessToken) {
    var _this = this;


    _this['organizationAccessToken'] = organizationAccessToken;
  };

  /**
   * Constructs a <code>UserTokenRequest</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTokenRequest} obj Optional instance to populate.
   * @return {module:model/UserTokenRequest} The populated <code>UserTokenRequest</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('user')) {
        obj['user'] = UserTokenRequestInnerUserField.constructFromObject(data['user']);
      }
      if (data.hasOwnProperty('organizationAccessToken')) {
        obj['organizationAccessToken'] = ApiClient.convertToType(data['organizationAccessToken'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {module:model/UserTokenRequestInnerUserField} user
   */
  exports.prototype['user'] = undefined;
  /**
   * Organization Access token
   * @member {String} organizationAccessToken
   */
  exports.prototype['organizationAccessToken'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./UserTokenRequestInnerUserField":63}],63:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTokenRequestInnerUserField = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserTokenRequestInnerUserField model module.
   * @module model/UserTokenRequestInnerUserField
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserTokenRequestInnerUserField</code>.
   * @alias module:model/UserTokenRequestInnerUserField
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>UserTokenRequestInnerUserField</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTokenRequestInnerUserField} obj Optional instance to populate.
   * @return {module:model/UserTokenRequestInnerUserField} The populated <code>UserTokenRequestInnerUserField</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
    }
    return obj;
  }

  /**
   * WordPress user ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],64:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/UserTokenSuccessfulResponseInnerUserField'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./UserTokenSuccessfulResponseInnerUserField'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTokenSuccessfulResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.UserTokenSuccessfulResponseInnerUserField);
  }
}(this, function(ApiClient, UserTokenSuccessfulResponseInnerUserField) {
  'use strict';




  /**
   * The UserTokenSuccessfulResponse model module.
   * @module model/UserTokenSuccessfulResponse
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserTokenSuccessfulResponse</code>.
   * @alias module:model/UserTokenSuccessfulResponse
   * @class
   * @param code {Number} Status code
   * @param message {String} Message
   * @param user {module:model/UserTokenSuccessfulResponseInnerUserField} 
   */
  var exports = function(code, message, user) {
    var _this = this;

    _this['code'] = code;
    _this['message'] = message;
    _this['user'] = user;
  };

  /**
   * Constructs a <code>UserTokenSuccessfulResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTokenSuccessfulResponse} obj Optional instance to populate.
   * @return {module:model/UserTokenSuccessfulResponse} The populated <code>UserTokenSuccessfulResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('code')) {
        obj['code'] = ApiClient.convertToType(data['code'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('user')) {
        obj['user'] = UserTokenSuccessfulResponseInnerUserField.constructFromObject(data['user']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} code
   */
  exports.prototype['code'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {module:model/UserTokenSuccessfulResponseInnerUserField} user
   */
  exports.prototype['user'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./UserTokenSuccessfulResponseInnerUserField":65}],65:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTokenSuccessfulResponseInnerUserField = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserTokenSuccessfulResponseInnerUserField model module.
   * @module model/UserTokenSuccessfulResponseInnerUserField
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserTokenSuccessfulResponseInnerUserField</code>.
   * @alias module:model/UserTokenSuccessfulResponseInnerUserField
   * @class
   * @param id {Number} WordPress user ID
   * @param accessToken {String} User token
   */
  var exports = function(id, accessToken) {
    var _this = this;

    _this['id'] = id;
    _this['access_token'] = accessToken;
  };

  /**
   * Constructs a <code>UserTokenSuccessfulResponseInnerUserField</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTokenSuccessfulResponseInnerUserField} obj Optional instance to populate.
   * @return {module:model/UserTokenSuccessfulResponseInnerUserField} The populated <code>UserTokenSuccessfulResponseInnerUserField</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('access_token')) {
        obj['access_token'] = ApiClient.convertToType(data['access_token'], 'String');
      }
    }
    return obj;
  }

  /**
   * WordPress user ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * User token
   * @member {String} access_token
   */
  exports.prototype['access_token'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],66:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserVariable = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserVariable model module.
   * @module model/UserVariable
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserVariable</code>.
   * @alias module:model/UserVariable
   * @class
   * @param variableId {Number} ID of variable
   */
  var exports = function(variableId) {
    var _this = this;




    _this['variableId'] = variableId;



































































































































  };

  /**
   * Constructs a <code>UserVariable</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserVariable} obj Optional instance to populate.
   * @return {module:model/UserVariable} The populated <code>UserVariable</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('parentId')) {
        obj['parentId'] = ApiClient.convertToType(data['parentId'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('fillingValue')) {
        obj['fillingValue'] = ApiClient.convertToType(data['fillingValue'], 'Number');
      }
      if (data.hasOwnProperty('joinWith')) {
        obj['joinWith'] = ApiClient.convertToType(data['joinWith'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('updated')) {
        obj['updated'] = ApiClient.convertToType(data['updated'], 'Number');
      }
      if (data.hasOwnProperty('public')) {
        obj['public'] = ApiClient.convertToType(data['public'], 'Number');
      }
      if (data.hasOwnProperty('causeOnly')) {
        obj['causeOnly'] = ApiClient.convertToType(data['causeOnly'], 'Boolean');
      }
      if (data.hasOwnProperty('fillingType')) {
        obj['fillingType'] = ApiClient.convertToType(data['fillingType'], 'String');
      }
      if (data.hasOwnProperty('numberOfMeasurements')) {
        obj['numberOfMeasurements'] = ApiClient.convertToType(data['numberOfMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('numberOfProcessedDailyMeasurements')) {
        obj['numberOfProcessedDailyMeasurements'] = ApiClient.convertToType(data['numberOfProcessedDailyMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('measurementsAtLastAnalysis')) {
        obj['measurementsAtLastAnalysis'] = ApiClient.convertToType(data['measurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('lastUnitId')) {
        obj['lastUnitId'] = ApiClient.convertToType(data['lastUnitId'], 'Number');
      }
      if (data.hasOwnProperty('lastOriginalUnitId')) {
        obj['lastOriginalUnitId'] = ApiClient.convertToType(data['lastOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('lastOriginalValue')) {
        obj['lastOriginalValue'] = ApiClient.convertToType(data['lastOriginalValue'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCorrelations')) {
        obj['numberOfCorrelations'] = ApiClient.convertToType(data['numberOfCorrelations'], 'Number');
      }
      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'String');
      }
      if (data.hasOwnProperty('errorMessage')) {
        obj['errorMessage'] = ApiClient.convertToType(data['errorMessage'], 'String');
      }
      if (data.hasOwnProperty('lastSuccessfulUpdateTime')) {
        obj['lastSuccessfulUpdateTime'] = ApiClient.convertToType(data['lastSuccessfulUpdateTime'], 'Date');
      }
      if (data.hasOwnProperty('standard_deviation')) {
        obj['standard_deviation'] = ApiClient.convertToType(data['standard_deviation'], 'Number');
      }
      if (data.hasOwnProperty('variance')) {
        obj['variance'] = ApiClient.convertToType(data['variance'], 'Number');
      }
      if (data.hasOwnProperty('minimumRecordedValue')) {
        obj['minimumRecordedValue'] = ApiClient.convertToType(data['minimumRecordedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumRecordedDailyValue')) {
        obj['maximumRecordedDailyValue'] = ApiClient.convertToType(data['maximumRecordedDailyValue'], 'Number');
      }
      if (data.hasOwnProperty('mean')) {
        obj['mean'] = ApiClient.convertToType(data['mean'], 'Number');
      }
      if (data.hasOwnProperty('median')) {
        obj['median'] = ApiClient.convertToType(data['median'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonUnitId')) {
        obj['mostCommonUnitId'] = ApiClient.convertToType(data['mostCommonUnitId'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValue')) {
        obj['mostCommonValue'] = ApiClient.convertToType(data['mostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueDailyValues')) {
        obj['numberOfUniqueDailyValues'] = ApiClient.convertToType(data['numberOfUniqueDailyValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfChanges')) {
        obj['numberOfChanges'] = ApiClient.convertToType(data['numberOfChanges'], 'Number');
      }
      if (data.hasOwnProperty('skewness')) {
        obj['skewness'] = ApiClient.convertToType(data['skewness'], 'Number');
      }
      if (data.hasOwnProperty('kurtosis')) {
        obj['kurtosis'] = ApiClient.convertToType(data['kurtosis'], 'Number');
      }
      if (data.hasOwnProperty('latitude')) {
        obj['latitude'] = ApiClient.convertToType(data['latitude'], 'Number');
      }
      if (data.hasOwnProperty('longitude')) {
        obj['longitude'] = ApiClient.convertToType(data['longitude'], 'Number');
      }
      if (data.hasOwnProperty('location')) {
        obj['location'] = ApiClient.convertToType(data['location'], 'String');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('outcome')) {
        obj['outcome'] = ApiClient.convertToType(data['outcome'], 'Boolean');
      }
      if (data.hasOwnProperty('sources')) {
        obj['sources'] = ApiClient.convertToType(data['sources'], 'String');
      }
      if (data.hasOwnProperty('earliestSourceTime')) {
        obj['earliestSourceTime'] = ApiClient.convertToType(data['earliestSourceTime'], 'Number');
      }
      if (data.hasOwnProperty('latestSourceTime')) {
        obj['latestSourceTime'] = ApiClient.convertToType(data['latestSourceTime'], 'Number');
      }
      if (data.hasOwnProperty('earliestMeasurementTime')) {
        obj['earliestMeasurementTime'] = ApiClient.convertToType(data['earliestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('latestMeasurementTime')) {
        obj['latestMeasurementTime'] = ApiClient.convertToType(data['latestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('earliestFillingTime')) {
        obj['earliestFillingTime'] = ApiClient.convertToType(data['earliestFillingTime'], 'Number');
      }
      if (data.hasOwnProperty('latestFillingTime')) {
        obj['latestFillingTime'] = ApiClient.convertToType(data['latestFillingTime'], 'Number');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableFillingValue')) {
        obj['userVariableFillingValue'] = ApiClient.convertToType(data['userVariableFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('latestUserMeasurementTime')) {
        obj['latestUserMeasurementTime'] = ApiClient.convertToType(data['latestUserMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('maximumRecordedValue')) {
        obj['maximumRecordedValue'] = ApiClient.convertToType(data['maximumRecordedValue'], 'Number');
      }
      if (data.hasOwnProperty('rawMeasurementsAtLastAnalysis')) {
        obj['rawMeasurementsAtLastAnalysis'] = ApiClient.convertToType(data['rawMeasurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('numberOfRawMeasurements')) {
        obj['numberOfRawMeasurements'] = ApiClient.convertToType(data['numberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserCorrelationsAsCause')) {
        obj['numberOfUserCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfUserCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('standardDeviation')) {
        obj['standardDeviation'] = ApiClient.convertToType(data['standardDeviation'], 'Number');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('variableFillingValue')) {
        obj['variableFillingValue'] = ApiClient.convertToType(data['variableFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonOriginalUnitId')) {
        obj['mostCommonOriginalUnitId'] = ApiClient.convertToType(data['mostCommonOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsCause')) {
        obj['numberOfAggregateCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserVariables')) {
        obj['numberOfUserVariables'] = ApiClient.convertToType(data['numberOfUserVariables'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValue')) {
        obj['secondMostCommonValue'] = ApiClient.convertToType(data['secondMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('updatedTime')) {
        obj['updatedTime'] = ApiClient.convertToType(data['updatedTime'], 'Date');
      }
      if (data.hasOwnProperty('commonVariableUpdatedAt')) {
        obj['commonVariableUpdatedAt'] = ApiClient.convertToType(data['commonVariableUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVariableUpdatedAt')) {
        obj['userVariableUpdatedAt'] = ApiClient.convertToType(data['userVariableUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('meanInUserVariableDefaultUnit')) {
        obj['meanInUserVariableDefaultUnit'] = ApiClient.convertToType(data['meanInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValueInUserVariableDefaultUnit')) {
        obj['secondMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayInHours')) {
        obj['onsetDelayInHours'] = ApiClient.convertToType(data['onsetDelayInHours'], 'Number');
      }
      if (data.hasOwnProperty('chartsLinkStatic')) {
        obj['chartsLinkStatic'] = ApiClient.convertToType(data['chartsLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkDynamic')) {
        obj['chartsLinkDynamic'] = ApiClient.convertToType(data['chartsLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkFacebook')) {
        obj['chartsLinkFacebook'] = ApiClient.convertToType(data['chartsLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkGoogle')) {
        obj['chartsLinkGoogle'] = ApiClient.convertToType(data['chartsLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkTwitter')) {
        obj['chartsLinkTwitter'] = ApiClient.convertToType(data['chartsLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkEmail')) {
        obj['chartsLinkEmail'] = ApiClient.convertToType(data['chartsLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('lastProcessedDailyValue')) {
        obj['lastProcessedDailyValue'] = ApiClient.convertToType(data['lastProcessedDailyValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableMostCommonConnectorId')) {
        obj['userVariableMostCommonConnectorId'] = ApiClient.convertToType(data['userVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('commonVariableMostCommonConnectorId')) {
        obj['commonVariableMostCommonConnectorId'] = ApiClient.convertToType(data['commonVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonConnectorId')) {
        obj['mostCommonConnectorId'] = ApiClient.convertToType(data['mostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValueInUserVariableDefaultUnit')) {
        obj['mostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['mostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserCorrelationsAsEffect')) {
        obj['numberOfUserCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfUserCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsEffect')) {
        obj['numberOfAggregateCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValue')) {
        obj['thirdMostCommonValue'] = ApiClient.convertToType(data['thirdMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValueInUserVariableDefaultUnit')) {
        obj['thirdMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('outcomeOfInterest')) {
        obj['outcomeOfInterest'] = ApiClient.convertToType(data['outcomeOfInterest'], 'Number');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('numberOfUniqueValues')) {
        obj['numberOfUniqueValues'] = ApiClient.convertToType(data['numberOfUniqueValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfTrackingReminders')) {
        obj['numberOfTrackingReminders'] = ApiClient.convertToType(data['numberOfTrackingReminders'], 'Number');
      }
      if (data.hasOwnProperty('iconIcon')) {
        obj['iconIcon'] = ApiClient.convertToType(data['iconIcon'], 'String');
      }
      if (data.hasOwnProperty('commonAlias')) {
        obj['commonAlias'] = ApiClient.convertToType(data['commonAlias'], 'String');
      }
      if (data.hasOwnProperty('predictorOfInterest')) {
        obj['predictorOfInterest'] = ApiClient.convertToType(data['predictorOfInterest'], 'Number');
      }
      if (data.hasOwnProperty('experimentStartTimeString')) {
        obj['experimentStartTimeString'] = ApiClient.convertToType(data['experimentStartTimeString'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTimeSeconds')) {
        obj['experimentStartTimeSeconds'] = ApiClient.convertToType(data['experimentStartTimeSeconds'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTimeString')) {
        obj['experimentEndTimeString'] = ApiClient.convertToType(data['experimentEndTimeString'], 'Date');
      }
      if (data.hasOwnProperty('experimentEndTimeSeconds')) {
        obj['experimentEndTimeSeconds'] = ApiClient.convertToType(data['experimentEndTimeSeconds'], 'Number');
      }
    }
    return obj;
  }

  /**
   * ID of the parent variable if this variable has any parent
   * @member {Number} parentId
   */
  exports.prototype['parentId'] = undefined;
  /**
   * User ID
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of variable
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * ID of unit to use for this variable
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
   * @member {Number} fillingValue
   */
  exports.prototype['fillingValue'] = undefined;
  /**
   * The Variable this Variable should be joined with. If the variable is joined with some other variable then it is not shown to user in the list of variables
   * @member {Number} joinWith
   */
  exports.prototype['joinWith'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * ID of variable category
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * updated
   * @member {Number} updated
   */
  exports.prototype['updated'] = undefined;
  /**
   * Is variable public
   * @member {Number} public
   */
  exports.prototype['public'] = undefined;
  /**
   * A value of 1 indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user
   * @member {Boolean} causeOnly
   */
  exports.prototype['causeOnly'] = undefined;
  /**
   * 0 -> No filling, 1 -> Use filling-value
   * @member {String} fillingType
   */
  exports.prototype['fillingType'] = undefined;
  /**
   * Number of measurements
   * @member {Number} numberOfMeasurements
   */
  exports.prototype['numberOfMeasurements'] = undefined;
  /**
   * Number of processed measurements
   * @member {Number} numberOfProcessedDailyMeasurements
   */
  exports.prototype['numberOfProcessedDailyMeasurements'] = undefined;
  /**
   * Number of measurements at last analysis
   * @member {Number} measurementsAtLastAnalysis
   */
  exports.prototype['measurementsAtLastAnalysis'] = undefined;
  /**
   * ID of last Unit
   * @member {Number} lastUnitId
   */
  exports.prototype['lastUnitId'] = undefined;
  /**
   * ID of last original Unit
   * @member {Number} lastOriginalUnitId
   */
  exports.prototype['lastOriginalUnitId'] = undefined;
  /**
   * Last Value
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Last original value which is stored
   * @member {Number} lastOriginalValue
   */
  exports.prototype['lastOriginalValue'] = undefined;
  /**
   * Number of correlations for this variable
   * @member {Number} numberOfCorrelations
   */
  exports.prototype['numberOfCorrelations'] = undefined;
  /**
   * status
   * @member {String} status
   */
  exports.prototype['status'] = undefined;
  /**
   * error_message
   * @member {String} errorMessage
   */
  exports.prototype['errorMessage'] = undefined;
  /**
   * When this variable or its settings were last updated
   * @member {Date} lastSuccessfulUpdateTime
   */
  exports.prototype['lastSuccessfulUpdateTime'] = undefined;
  /**
   * Standard deviation
   * @member {Number} standard_deviation
   */
  exports.prototype['standard_deviation'] = undefined;
  /**
   * Variance
   * @member {Number} variance
   */
  exports.prototype['variance'] = undefined;
  /**
   * Minimum recorded value of this variable
   * @member {Number} minimumRecordedValue
   */
  exports.prototype['minimumRecordedValue'] = undefined;
  /**
   * Maximum recorded daily value of this variable
   * @member {Number} maximumRecordedDailyValue
   */
  exports.prototype['maximumRecordedDailyValue'] = undefined;
  /**
   * Mean
   * @member {Number} mean
   */
  exports.prototype['mean'] = undefined;
  /**
   * Median
   * @member {Number} median
   */
  exports.prototype['median'] = undefined;
  /**
   * Most common Unit ID
   * @member {Number} mostCommonUnitId
   */
  exports.prototype['mostCommonUnitId'] = undefined;
  /**
   * Most common value
   * @member {Number} mostCommonValue
   */
  exports.prototype['mostCommonValue'] = undefined;
  /**
   * Number of unique daily values
   * @member {Number} numberOfUniqueDailyValues
   */
  exports.prototype['numberOfUniqueDailyValues'] = undefined;
  /**
   * Number of changes
   * @member {Number} numberOfChanges
   */
  exports.prototype['numberOfChanges'] = undefined;
  /**
   * Skewness
   * @member {Number} skewness
   */
  exports.prototype['skewness'] = undefined;
  /**
   * Kurtosis
   * @member {Number} kurtosis
   */
  exports.prototype['kurtosis'] = undefined;
  /**
   * Latitude
   * @member {Number} latitude
   */
  exports.prototype['latitude'] = undefined;
  /**
   * Longitude
   * @member {Number} longitude
   */
  exports.prototype['longitude'] = undefined;
  /**
   * Location
   * @member {String} location
   */
  exports.prototype['location'] = undefined;
  /**
   * Earliest measurement start_time to be used in analysis. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Latest measurement start_time to be used in analysis. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Outcome variables (those with `outcome` == 1) are variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables
   * @member {Boolean} outcome
   */
  exports.prototype['outcome'] = undefined;
  /**
   * Comma-separated list of source names to limit variables to those sources
   * @member {String} sources
   */
  exports.prototype['sources'] = undefined;
  /**
   * Earliest source time
   * @member {Number} earliestSourceTime
   */
  exports.prototype['earliestSourceTime'] = undefined;
  /**
   * Latest source time
   * @member {Number} latestSourceTime
   */
  exports.prototype['latestSourceTime'] = undefined;
  /**
   * Earliest measurement time
   * @member {Number} earliestMeasurementTime
   */
  exports.prototype['earliestMeasurementTime'] = undefined;
  /**
   * Latest measurement time
   * @member {Number} latestMeasurementTime
   */
  exports.prototype['latestMeasurementTime'] = undefined;
  /**
   * Earliest filling time
   * @member {Number} earliestFillingTime
   */
  exports.prototype['earliestFillingTime'] = undefined;
  /**
   * Latest filling time
   * @member {Number} latestFillingTime
   */
  exports.prototype['latestFillingTime'] = undefined;
  /**
   * 
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * 
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: 95614
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: Trader Joes Bedtime Tea / Sleepytime Tea (any Brand)
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Example: 23
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: -1
   * @member {Number} userVariableFillingValue
   */
  exports.prototype['userVariableFillingValue'] = undefined;
  /**
   * Example: 1501383600
   * @member {Number} latestUserMeasurementTime
   */
  exports.prototype['latestUserMeasurementTime'] = undefined;
  /**
   * Example: 1
   * @member {Number} maximumRecordedValue
   */
  exports.prototype['maximumRecordedValue'] = undefined;
  /**
   * Example: 131
   * @member {Number} rawMeasurementsAtLastAnalysis
   */
  exports.prototype['rawMeasurementsAtLastAnalysis'] = undefined;
  /**
   * Example: 295
   * @member {Number} numberOfRawMeasurements
   */
  exports.prototype['numberOfRawMeasurements'] = undefined;
  /**
   * Example: 115
   * @member {Number} numberOfUserCorrelationsAsCause
   */
  exports.prototype['numberOfUserCorrelationsAsCause'] = undefined;
  /**
   * Example: 0.46483219855434
   * @member {Number} standardDeviation
   */
  exports.prototype['standardDeviation'] = undefined;
  /**
   * Example: 13
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: -1
   * @member {Number} variableFillingValue
   */
  exports.prototype['variableFillingValue'] = undefined;
  /**
   * Example: 23
   * @member {Number} mostCommonOriginalUnitId
   */
  exports.prototype['mostCommonOriginalUnitId'] = undefined;
  /**
   * Example: 1
   * @member {Number} numberOfAggregateCorrelationsAsCause
   */
  exports.prototype['numberOfAggregateCorrelationsAsCause'] = undefined;
  /**
   * Example: 2
   * @member {Number} numberOfUserVariables
   */
  exports.prototype['numberOfUserVariables'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondMostCommonValue
   */
  exports.prototype['secondMostCommonValue'] = undefined;
  /**
   * Example: 2017-07-30 14:58:26
   * @member {Date} updatedTime
   */
  exports.prototype['updatedTime'] = undefined;
  /**
   * Example: 2017-02-07 23:43:39
   * @member {Date} commonVariableUpdatedAt
   */
  exports.prototype['commonVariableUpdatedAt'] = undefined;
  /**
   * Example: 2017-07-30 14:58:26
   * @member {Date} userVariableUpdatedAt
   */
  exports.prototype['userVariableUpdatedAt'] = undefined;
  /**
   * Example: MEAN
   * @member {String} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Example: Treatments
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/treatments.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Healthcare/pill-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Treatments
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: 0.31159
   * @member {Number} meanInUserVariableDefaultUnit
   */
  exports.prototype['meanInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['secondMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 23
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: Count
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: count
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: Trader Joes Bedtime Tea / Sleepytime Tea (any Brand)
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Example: value
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: 0.5
   * @member {Number} onsetDelayInHours
   */
  exports.prototype['onsetDelayInHours'] = undefined;
  /**
   * Example: https://local.quantimo.do/api/v2/charts?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png
   * @member {String} chartsLinkStatic
   */
  exports.prototype['chartsLinkStatic'] = undefined;
  /**
   * Example: https://local.quantimo.do/ionic/Modo/www/#/app/charts/Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png
   * @member {String} chartsLinkDynamic
   */
  exports.prototype['chartsLinkDynamic'] = undefined;
  /**
   * Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png
   * @member {String} chartsLinkFacebook
   */
  exports.prototype['chartsLinkFacebook'] = undefined;
  /**
   * Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png
   * @member {String} chartsLinkGoogle
   */
  exports.prototype['chartsLinkGoogle'] = undefined;
  /**
   * Example: https://twitter.com/home?status=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%20%40quantimodo
   * @member {String} chartsLinkTwitter
   */
  exports.prototype['chartsLinkTwitter'] = undefined;
  /**
   * Example: mailto:?subject=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21&body=See%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%0A%0AHave%20a%20great%20day!
   * @member {String} chartsLinkEmail
   */
  exports.prototype['chartsLinkEmail'] = undefined;
  /**
   * Example: 500
   * @member {Number} lastProcessedDailyValue
   */
  exports.prototype['lastProcessedDailyValue'] = undefined;
  /**
   * Example: 51
   * @member {Number} userVariableMostCommonConnectorId
   */
  exports.prototype['userVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 250
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: 250
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 51
   * @member {Number} commonVariableMostCommonConnectorId
   */
  exports.prototype['commonVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 51
   * @member {Number} mostCommonConnectorId
   */
  exports.prototype['mostCommonConnectorId'] = undefined;
  /**
   * Example: 500
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 250
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 250
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 250
   * @member {Number} mostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['mostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 29014
   * @member {Number} numberOfUserCorrelationsAsEffect
   */
  exports.prototype['numberOfUserCorrelationsAsEffect'] = undefined;
  /**
   * Example: 310
   * @member {Number} numberOfAggregateCorrelationsAsEffect
   */
  exports.prototype['numberOfAggregateCorrelationsAsEffect'] = undefined;
  /**
   * Example: 6
   * @member {Number} thirdMostCommonValue
   */
  exports.prototype['thirdMostCommonValue'] = undefined;
  /**
   * Example: 6
   * @member {Number} thirdMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} outcomeOfInterest
   */
  exports.prototype['outcomeOfInterest'] = undefined;
  /**
   * Example: negative
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: negative
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: 2
   * @member {Number} numberOfUniqueValues
   */
  exports.prototype['numberOfUniqueValues'] = undefined;
  /**
   * Example: 1
   * @member {Number} numberOfTrackingReminders
   */
  exports.prototype['numberOfTrackingReminders'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} iconIcon
   */
  exports.prototype['iconIcon'] = undefined;
  /**
   * Example: Anxiety / Nervousness
   * @member {String} commonAlias
   */
  exports.prototype['commonAlias'] = undefined;
  /**
   * Example: 0
   * @member {Number} predictorOfInterest
   */
  exports.prototype['predictorOfInterest'] = undefined;
  /**
   * Example: 2010-03-23 01:31:42
   * @member {Date} experimentStartTimeString
   */
  exports.prototype['experimentStartTimeString'] = undefined;
  /**
   * Example: 1269307902
   * @member {Number} experimentStartTimeSeconds
   */
  exports.prototype['experimentStartTimeSeconds'] = undefined;
  /**
   * Example: 2030-01-01 06:00:00
   * @member {Date} experimentEndTimeString
   */
  exports.prototype['experimentEndTimeString'] = undefined;
  /**
   * Example: 1893477600
   * @member {Number} experimentEndTimeSeconds
   */
  exports.prototype['experimentEndTimeSeconds'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],67:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserVariableDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserVariableDelete model module.
   * @module model/UserVariableDelete
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>UserVariableDelete</code>.
   * @alias module:model/UserVariableDelete
   * @class
   * @param variableId {Number} Id of the variable whose measurements should be deleted
   */
  var exports = function(variableId) {
    var _this = this;

    _this['variableId'] = variableId;
  };

  /**
   * Constructs a <code>UserVariableDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserVariableDelete} obj Optional instance to populate.
   * @return {module:model/UserVariableDelete} The populated <code>UserVariableDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Id of the variable whose measurements should be deleted
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],68:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Variable'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Variable'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Variable = factory(root.Quantimodo.ApiClient, root.Quantimodo.Variable);
  }
}(this, function(ApiClient, Variable) {
  'use strict';




  /**
   * The Variable model module.
   * @module model/Variable
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Variable</code>.
   * @alias module:model/Variable
   * @class
   * @param name {String} User-defined variable display name.
   * @param variableCategoryName {String} Variable category like Mood, Sleep, Physical Activity, Treatment, Symptom, etc.
   * @param defaultUnitAbbreviatedName {String} Abbreviated name of the default unit for the variable
   * @param defaultUnitId {Number} Id of the default unit for the variable
   * @param sources {String} Comma-separated list of source names to limit variables to those sources
   * @param minimumAllowedValue {Number} The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @param maximumAllowedValue {Number} The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @param combinationOperation {module:model/Variable.CombinationOperationEnum} Way to aggregate measurements over time. Options are \"MEAN\" or \"SUM\". SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @param fillingValue {Number} When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
   * @param joinWith {String} The Variable this Variable should be joined with. If the variable is joined with some other variable then it is not shown to user in the list of variables.
   * @param joinedVariables {Array.<module:model/Variable>} Array of Variables that are joined with this Variable
   * @param parent {Number} Id of the parent variable if this variable has any parent
   * @param subVariables {Array.<module:model/Variable>} Array of Variables that are sub variables to this Variable
   * @param onsetDelay {Number} The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @param durationOfAction {Number} The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @param earliestMeasurementTime {Number} Earliest measurement time
   * @param latestMeasurementTime {Number} Latest measurement time
   * @param updated {Number} When this variable or its settings were last updated
   * @param causeOnly {Number} A value of 1 indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user.
   * @param numberOfCorrelations {Number} Number of correlations
   * @param outcome {Number} Outcome variables (those with `outcome` == 1) are variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables.
   * @param rawMeasurementsAtLastAnalysis {Number} The number of measurements that a given user had for this variable the last time a correlation calculation was performed. Generally correlation values are only updated once the current number of measurements for a variable is more than 10% greater than the rawMeasurementsAtLastAnalysis.  This avoids a computationally-demanding recalculation when there's not enough new data to make a significant difference in the correlation.
   * @param numberOfRawMeasurements {Number} Number of measurements
   * @param lastUnit {String} Last unit
   * @param lastValue {Number} Last value
   * @param mostCommonValue {Number} Most common value
   * @param mostCommonUnit {String} Most common unit
   * @param lastSource {Number} Last source
   */
  var exports = function(name, variableCategoryName, defaultUnitAbbreviatedName, defaultUnitId, sources, minimumAllowedValue, maximumAllowedValue, combinationOperation, fillingValue, joinWith, joinedVariables, parent, subVariables, onsetDelay, durationOfAction, earliestMeasurementTime, latestMeasurementTime, updated, causeOnly, numberOfCorrelations, outcome, rawMeasurementsAtLastAnalysis, numberOfRawMeasurements, lastUnit, lastValue, mostCommonValue, mostCommonUnit, lastSource) {
    var _this = this;


    _this['name'] = name;
    _this['variableCategoryName'] = variableCategoryName;
    _this['defaultUnitAbbreviatedName'] = defaultUnitAbbreviatedName;
    _this['defaultUnitId'] = defaultUnitId;
    _this['sources'] = sources;
    _this['minimumAllowedValue'] = minimumAllowedValue;
    _this['maximumAllowedValue'] = maximumAllowedValue;
    _this['combinationOperation'] = combinationOperation;
    _this['fillingValue'] = fillingValue;
    _this['joinWith'] = joinWith;
    _this['joinedVariables'] = joinedVariables;
    _this['parent'] = parent;
    _this['subVariables'] = subVariables;
    _this['onsetDelay'] = onsetDelay;
    _this['durationOfAction'] = durationOfAction;
    _this['earliestMeasurementTime'] = earliestMeasurementTime;
    _this['latestMeasurementTime'] = latestMeasurementTime;
    _this['updated'] = updated;
    _this['causeOnly'] = causeOnly;
    _this['numberOfCorrelations'] = numberOfCorrelations;
    _this['outcome'] = outcome;
    _this['rawMeasurementsAtLastAnalysis'] = rawMeasurementsAtLastAnalysis;
    _this['numberOfRawMeasurements'] = numberOfRawMeasurements;
    _this['lastUnit'] = lastUnit;
    _this['lastValue'] = lastValue;
    _this['mostCommonValue'] = mostCommonValue;
    _this['mostCommonUnit'] = mostCommonUnit;
    _this['lastSource'] = lastSource;

















































  };

  /**
   * Constructs a <code>Variable</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Variable} obj Optional instance to populate.
   * @return {module:model/Variable} The populated <code>Variable</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('sources')) {
        obj['sources'] = ApiClient.convertToType(data['sources'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('fillingValue')) {
        obj['fillingValue'] = ApiClient.convertToType(data['fillingValue'], 'Number');
      }
      if (data.hasOwnProperty('joinWith')) {
        obj['joinWith'] = ApiClient.convertToType(data['joinWith'], 'String');
      }
      if (data.hasOwnProperty('joinedVariables')) {
        obj['joinedVariables'] = ApiClient.convertToType(data['joinedVariables'], [Variable]);
      }
      if (data.hasOwnProperty('parent')) {
        obj['parent'] = ApiClient.convertToType(data['parent'], 'Number');
      }
      if (data.hasOwnProperty('subVariables')) {
        obj['subVariables'] = ApiClient.convertToType(data['subVariables'], [Variable]);
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('earliestMeasurementTime')) {
        obj['earliestMeasurementTime'] = ApiClient.convertToType(data['earliestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('latestMeasurementTime')) {
        obj['latestMeasurementTime'] = ApiClient.convertToType(data['latestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('updated')) {
        obj['updated'] = ApiClient.convertToType(data['updated'], 'Number');
      }
      if (data.hasOwnProperty('causeOnly')) {
        obj['causeOnly'] = ApiClient.convertToType(data['causeOnly'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCorrelations')) {
        obj['numberOfCorrelations'] = ApiClient.convertToType(data['numberOfCorrelations'], 'Number');
      }
      if (data.hasOwnProperty('outcome')) {
        obj['outcome'] = ApiClient.convertToType(data['outcome'], 'Number');
      }
      if (data.hasOwnProperty('rawMeasurementsAtLastAnalysis')) {
        obj['rawMeasurementsAtLastAnalysis'] = ApiClient.convertToType(data['rawMeasurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('numberOfRawMeasurements')) {
        obj['numberOfRawMeasurements'] = ApiClient.convertToType(data['numberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('lastUnit')) {
        obj['lastUnit'] = ApiClient.convertToType(data['lastUnit'], 'String');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValue')) {
        obj['mostCommonValue'] = ApiClient.convertToType(data['mostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonUnit')) {
        obj['mostCommonUnit'] = ApiClient.convertToType(data['mostCommonUnit'], 'String');
      }
      if (data.hasOwnProperty('lastSource')) {
        obj['lastSource'] = ApiClient.convertToType(data['lastSource'], 'Number');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('kurtosis')) {
        obj['kurtosis'] = ApiClient.convertToType(data['kurtosis'], 'Number');
      }
      if (data.hasOwnProperty('mean')) {
        obj['mean'] = ApiClient.convertToType(data['mean'], 'Number');
      }
      if (data.hasOwnProperty('median')) {
        obj['median'] = ApiClient.convertToType(data['median'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonConnectorId')) {
        obj['mostCommonConnectorId'] = ApiClient.convertToType(data['mostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonOriginalUnitId')) {
        obj['mostCommonOriginalUnitId'] = ApiClient.convertToType(data['mostCommonOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsCause')) {
        obj['numberOfAggregateCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsEffect')) {
        obj['numberOfAggregateCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('numberOfTrackingReminders')) {
        obj['numberOfTrackingReminders'] = ApiClient.convertToType(data['numberOfTrackingReminders'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueValues')) {
        obj['numberOfUniqueValues'] = ApiClient.convertToType(data['numberOfUniqueValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserVariables')) {
        obj['numberOfUserVariables'] = ApiClient.convertToType(data['numberOfUserVariables'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValue')) {
        obj['secondMostCommonValue'] = ApiClient.convertToType(data['secondMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('skewness')) {
        obj['skewness'] = ApiClient.convertToType(data['skewness'], 'Number');
      }
      if (data.hasOwnProperty('standardDeviation')) {
        obj['standardDeviation'] = ApiClient.convertToType(data['standardDeviation'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValue')) {
        obj['thirdMostCommonValue'] = ApiClient.convertToType(data['thirdMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('variance')) {
        obj['variance'] = ApiClient.convertToType(data['variance'], 'Number');
      }
      if (data.hasOwnProperty('public')) {
        obj['public'] = ApiClient.convertToType(data['public'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('category')) {
        obj['category'] = ApiClient.convertToType(data['category'], 'String');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('numberOfMeasurements')) {
        obj['numberOfMeasurements'] = ApiClient.convertToType(data['numberOfMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('commonAlias')) {
        obj['commonAlias'] = ApiClient.convertToType(data['commonAlias'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
    }
    return obj;
  }

  /**
   * Variable ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * User-defined variable display name.
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Variable category like Mood, Sleep, Physical Activity, Treatment, Symptom, etc.
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Abbreviated name of the default unit for the variable
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Id of the default unit for the variable
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * Comma-separated list of source names to limit variables to those sources
   * @member {String} sources
   */
  exports.prototype['sources'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Way to aggregate measurements over time. Options are \"MEAN\" or \"SUM\". SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @member {module:model/Variable.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
   * @member {Number} fillingValue
   */
  exports.prototype['fillingValue'] = undefined;
  /**
   * The Variable this Variable should be joined with. If the variable is joined with some other variable then it is not shown to user in the list of variables.
   * @member {String} joinWith
   */
  exports.prototype['joinWith'] = undefined;
  /**
   * Array of Variables that are joined with this Variable
   * @member {Array.<module:model/Variable>} joinedVariables
   */
  exports.prototype['joinedVariables'] = undefined;
  /**
   * Id of the parent variable if this variable has any parent
   * @member {Number} parent
   */
  exports.prototype['parent'] = undefined;
  /**
   * Array of Variables that are sub variables to this Variable
   * @member {Array.<module:model/Variable>} subVariables
   */
  exports.prototype['subVariables'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Earliest measurement time
   * @member {Number} earliestMeasurementTime
   */
  exports.prototype['earliestMeasurementTime'] = undefined;
  /**
   * Latest measurement time
   * @member {Number} latestMeasurementTime
   */
  exports.prototype['latestMeasurementTime'] = undefined;
  /**
   * When this variable or its settings were last updated
   * @member {Number} updated
   */
  exports.prototype['updated'] = undefined;
  /**
   * A value of 1 indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user.
   * @member {Number} causeOnly
   */
  exports.prototype['causeOnly'] = undefined;
  /**
   * Number of correlations
   * @member {Number} numberOfCorrelations
   */
  exports.prototype['numberOfCorrelations'] = undefined;
  /**
   * Outcome variables (those with `outcome` == 1) are variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables.
   * @member {Number} outcome
   */
  exports.prototype['outcome'] = undefined;
  /**
   * The number of measurements that a given user had for this variable the last time a correlation calculation was performed. Generally correlation values are only updated once the current number of measurements for a variable is more than 10% greater than the rawMeasurementsAtLastAnalysis.  This avoids a computationally-demanding recalculation when there's not enough new data to make a significant difference in the correlation.
   * @member {Number} rawMeasurementsAtLastAnalysis
   */
  exports.prototype['rawMeasurementsAtLastAnalysis'] = undefined;
  /**
   * Number of measurements
   * @member {Number} numberOfRawMeasurements
   */
  exports.prototype['numberOfRawMeasurements'] = undefined;
  /**
   * Last unit
   * @member {String} lastUnit
   */
  exports.prototype['lastUnit'] = undefined;
  /**
   * Last value
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Most common value
   * @member {Number} mostCommonValue
   */
  exports.prototype['mostCommonValue'] = undefined;
  /**
   * Most common unit
   * @member {String} mostCommonUnit
   */
  exports.prototype['mostCommonUnit'] = undefined;
  /**
   * Last source
   * @member {Number} lastSource
   */
  exports.prototype['lastSource'] = undefined;
  /**
   * 
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * 
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: 2014-10-23 03:41:06
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 34
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 10.764488721491
   * @member {Number} kurtosis
   */
  exports.prototype['kurtosis'] = undefined;
  /**
   * Example: 2202.3886251393
   * @member {Number} mean
   */
  exports.prototype['mean'] = undefined;
  /**
   * Example: 2255.9284755781
   * @member {Number} median
   */
  exports.prototype['median'] = undefined;
  /**
   * Example: 7
   * @member {Number} mostCommonConnectorId
   */
  exports.prototype['mostCommonConnectorId'] = undefined;
  /**
   * Example: 2
   * @member {Number} mostCommonOriginalUnitId
   */
  exports.prototype['mostCommonOriginalUnitId'] = undefined;
  /**
   * Example: 386
   * @member {Number} numberOfAggregateCorrelationsAsCause
   */
  exports.prototype['numberOfAggregateCorrelationsAsCause'] = undefined;
  /**
   * Example: 2074
   * @member {Number} numberOfAggregateCorrelationsAsEffect
   */
  exports.prototype['numberOfAggregateCorrelationsAsEffect'] = undefined;
  /**
   * Example: 6
   * @member {Number} numberOfTrackingReminders
   */
  exports.prototype['numberOfTrackingReminders'] = undefined;
  /**
   * Example: 74
   * @member {Number} numberOfUniqueValues
   */
  exports.prototype['numberOfUniqueValues'] = undefined;
  /**
   * Example: 307
   * @member {Number} numberOfUserVariables
   */
  exports.prototype['numberOfUserVariables'] = undefined;
  /**
   * Example: 8
   * @member {Number} secondMostCommonValue
   */
  exports.prototype['secondMostCommonValue'] = undefined;
  /**
   * Example: 0.2461351905455
   * @member {Number} skewness
   */
  exports.prototype['skewness'] = undefined;
  /**
   * Example: 1840.535129803
   * @member {Number} standardDeviation
   */
  exports.prototype['standardDeviation'] = undefined;
  /**
   * Example: 7
   * @member {Number} thirdMostCommonValue
   */
  exports.prototype['thirdMostCommonValue'] = undefined;
  /**
   * Example: 2017-07-31 03:57:06
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: 6
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 115947037.40816
   * @member {Number} variance
   */
  exports.prototype['variance'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} public
   */
  exports.prototype['public'] = undefined;
  /**
   * Example: 6
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/sleep.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Sleep
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: Sleep
   * @member {String} category
   */
  exports.prototype['category'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: Sleep Duration
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Example: 308554
   * @member {Number} numberOfMeasurements
   */
  exports.prototype['numberOfMeasurements'] = undefined;
  /**
   * Example: Hours
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: h
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Example: 1
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Duration
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: Hours
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Duration
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: 34
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: Hours
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: h
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Duration
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: slider
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} commonAlias
   */
  exports.prototype['commonAlias'] = undefined;
  /**
   * Example: positive
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: positive
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16,"./Variable":68}],69:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.VariableCategory = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The VariableCategory model module.
   * @module model/VariableCategory
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>VariableCategory</code>.
   * @alias module:model/VariableCategory
   * @class
   * @param name {String} Category name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>VariableCategory</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/VariableCategory} obj Optional instance to populate.
   * @return {module:model/VariableCategory} The populated <code>VariableCategory</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * Category name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],70:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Vote = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Vote model module.
   * @module model/Vote
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>Vote</code>.
   * @alias module:model/Vote
   * @class
   * @param clientId {String} clientId
   * @param userId {Number} ID of User
   * @param causeVariableId {Number} Cause variable id
   * @param effectVariableId {Number} Effect variable id
   * @param value {Boolean} Vote: 0 (for implausible) or 1 (for plausible)
   */
  var exports = function(clientId, userId, causeVariableId, effectVariableId, value) {
    var _this = this;


    _this['clientId'] = clientId;
    _this['userId'] = userId;
    _this['causeVariableId'] = causeVariableId;
    _this['effectVariableId'] = effectVariableId;
    _this['value'] = value;


  };

  /**
   * Constructs a <code>Vote</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Vote} obj Optional instance to populate.
   * @return {module:model/Vote} The populated <code>Vote</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Boolean');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of User
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Cause variable id
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Effect variable id
   * @member {Number} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Vote: 0 (for implausible) or 1 (for plausible)
   * @member {Boolean} value
   */
  exports.prototype['value'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],71:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.VoteDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The VoteDelete model module.
   * @module model/VoteDelete
   * @version 5.8.806
   */

  /**
   * Constructs a new <code>VoteDelete</code>.
   * @alias module:model/VoteDelete
   * @class
   * @param cause {String} Cause variable name for the correlation to which the vote pertains
   * @param effect {String} Effect variable name for the correlation to which the vote pertains
   */
  var exports = function(cause, effect) {
    var _this = this;

    _this['cause'] = cause;
    _this['effect'] = effect;
  };

  /**
   * Constructs a <code>VoteDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/VoteDelete} obj Optional instance to populate.
   * @return {module:model/VoteDelete} The populated <code>VoteDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('cause')) {
        obj['cause'] = ApiClient.convertToType(data['cause'], 'String');
      }
      if (data.hasOwnProperty('effect')) {
        obj['effect'] = ApiClient.convertToType(data['effect'], 'String');
      }
    }
    return obj;
  }

  /**
   * Cause variable name for the correlation to which the vote pertains
   * @member {String} cause
   */
  exports.prototype['cause'] = undefined;
  /**
   * Effect variable name for the correlation to which the vote pertains
   * @member {String} effect
   */
  exports.prototype['effect'] = undefined;



  return exports;
}));



},{"../ApiClient":16}]},{},[25])(25)
});