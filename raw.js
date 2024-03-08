const specialChars = [
  ['&', '&amp;'],
  ['"', '&quot;'],
  ['\'', '&#x27;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['/', '&#x2F;'],
  ['\\\\', '&#x5C;'],
  ['`', '&#96;'],
]

exports.sanitization = {
  slug: v => v.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  toBoolean: v => {
    switch (typeof v) {
      case 'string':
        return v !== 'false' && v !== '0'
      default:
        return !!v
    }
  },
  toInteger: v => {
    let x
    if (isNaN(v)) {
      return 0
    }
    x = parseInt(v)
    return x || 0
  },
  toFloat: v => {
    let x
    if (isNaN(v)) {
      return 0
    }
    x = parseFloat(v)
    return x || 0
  },
  escape: v => {
    specialChars.forEach(s => {
      v.replace(new RegExp(s[0], 'g'), s[1])
    })
    return v
  },
  unescape: v => {
    specialChars.forEach(s => {
      v.replace(new RegExp(s[1], 'g'), s[0])
    })
    return v
  },
}

exports.validation = {
  empty: v => {
    if (v === null || v === undefined) {
      return true
    }
    switch (typeof v) {
      case 'string':
      case 'array':
        return v.length === 0
      case 'object':
        return Object.keys(v).length === 0
    }
  },
  in: (v, args) => args.includes(v),
  isPhone: v => new RegExp("^\\+[1-9]\\d{1,14}$").test(v),
  isEmail: v => new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_\\`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[a-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\\b").test(v),
}