const moment = require('moment')
const raw = require('./raw')

const validaters = {
  required: (path, value) => {
    let errors = []
    if (raw.validation.empty(value)) {
      errors.push({
        path,
        message: '{name} is required',
      })
    }
    return [value, errors]
  },
  in: (path, value, args) => {
    let errors = []
    args = typeof args === 'string' ? args.split(',') : (args || [])
    if (!raw.validation.empty(value)) {
      if (!raw.validation.in(value, args)) {
        errors.push({
          path,
          message: '{name} not in option',
        })
      }
    }
    return [value, errors]
  },
  slug: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string') {
        errors.push({
          path,
          message: '{name} mush be string',
        })
      } else {
        value = raw.sanitization.slug(value)
      }
    }
    return [value, errors]
  },
  phone: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string' || !raw.validation.isPhone(value)) {
        errors.push({
          path,
          message: '{name} not valid phone',
        })
      }
    }
    return [value, errors]
  },
  email: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string' || !raw.validation.isEmail(value)) {
        errors.push({
          path,
          message: '{name} not valid email',
        })
      }
    }
    return [value, errors]
  },
  datetime: (path, value, args) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      const datetime = moment(value, args, true)
      if (datetime.isValid()) {
        value = datetime.format(args)
      } else {
        errors.push({
          path,
          message: '{name} not valid datetime',
        })
      }
    }
    return [value, errors]
  },
  integer: (path, value) => [raw.sanitization.toInteger(value), []],
  float: (path, value) => [raw.sanitization.toFloat(value), []],
  boolean: (path, value) => [raw.sanitization.toBoolean(value), []],
}

const schemaFormat = schema => {
  if (typeof schema === 'string') {
    return {
      _type: 'string',
      condition: schema
    }
  } else if (Array.isArray(schema)) {
    return {
      _type: 'list',
      item: schema.length ? schema[0] : '',
    }
  } else if (typeof schema === 'object') {
    if (schema._type) {
      return schema
    }
    return {
      _type: 'dist',
      schema: schema,
    }
  } else if (typeof schema === 'function') {
    return {
      _type: 'custom',
      validation: schema,
    }
  }
  throw new Error('Schema syntax error')
}

const cvalidate = (schema, value, path, rootData) => {
  schema = schemaFormat(schema)
  rootData = rootData || value
  
  let errors = []
  switch (schema._type) {
    case 'string':
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = validaters[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      break
    case 'list':
      if (!Array.isArray(value)) {
        errors.push({
          path, message: '{name} should be a list'
        })
        break
      }
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = validaters[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      let list = []
      for (let [i, _value] of value.entries()) {
        let [v, _errors] = cvalidate(schema.item, _value, path ? `${path}.${i}` : i, rootData)
        if (_errors) {
          errors = [...errors, ..._errors]
        }
        list.push(v)
      }
      value = list
      break
    case 'dist':
      if (typeof value !== 'object') {
        errors.push({
          path, message: '{name} is invalid'
        })
        break
      }
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = validaters[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      let dist = {}
      for (let [k, s] of Object.entries(schema.schema)) {
        let [v, _errors] = cvalidate(s, value[k], path ? `${path}.${k}` : k, rootData)
        if (_errors) {
          errors = [...errors, ..._errors]
        }
        dist[k] = v
      }
      value = dist
      break
    case 'custom':
      let [v, _errors] = schema.validation(path, value, rootData)
      if (_errors) {
        errors = [...errors, ..._errors]
      }
      value = v
      break
  }
  return [value, errors]
}

module.exports = cvalidate