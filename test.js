const Validate = require('./')
const raw = require('./raw')

describe('validator', () => {
  describe('main', () => {
    describe('schema', () => {
      const schema = {
        name: 'required',
        slug: 'required|slug',
        age: 'required|integer',
        height: 'required|float',
        birthday: 'required|datetime:YYYY-MM-DD',
        contact: {
          email: 'required|email',
          phones: {
            _type: 'list',
            condition: 'required',
            item: 'required|phone'
          },
          addresses: [{
            region: 'required',
            building: 'required',
          }]
        },
        projects: (path, value) => {
          let errors = []
          if (!Array.isArray(value)) {
            errors.push({path, message: '{name} should be a list'})
          } else if (raw.validation.empty(value)) {
            errors.push({path, message: '{name} is required'})
          } else {
            for (let [k, v] of value.entries()) {
              if (typeof v !== 'object' || !v.title) {
                errors.push({path: `${path}.${k}`, message: '{name} is invalid project'})
              }
            }
          }
          return [value, errors]
        },
        isadmin: 'boolean',
      }
      test('should return a list of errors when value not match with schema', () => {
        const data = {
          name: 'Test',
          slug: '',
          age: 20,
          height: 180.2,
          birthday: '1testing',
          contact: {
            email: 'testtesting.com',
            phones: '62372424',
            addresses: [{
              region: 'test',
            }],
          },
          projects: [{
            slug: 'test',
          }],
          isadmin: 'false',
        }
        const [value, errors] = Validate(schema, data)
        expect(errors).toEqual([
          {
            path: 'slug',
            message: '{name} is required', 
          },
          {
            path: 'birthday',
            message: '{name} not valid datetime', 
          },
          {
            path: 'contact.email',
            message: '{name} not valid email', 
          },
          {
            path: 'contact.phones',
            message: '{name} should be a list', 
          },
          {
            path: 'contact.addresses.0.building',
            message: '{name} is required', 
          },
          {
            path: 'projects.0',
            message: '{name} is invalid project', 
          }
        ])
      })
      test('should return true when value match with schema', () => {
        const data = {
          name: 'Test',
          slug: 'name-test',
          age: '20',
          height: '180.2',
          birthday: '1922-01-23',
          contact: {
            email: 'test@testing.com',
            phones: ['62372424'],
            addresses: [{
              region: 'test',
              building: 'test',
            }],
          },
          projects: [{
            title: 'test',
          }],
          isadmin: 'false',
        }
        const [value, errors] = Validate(schema, data)
        expect(value).toEqual({
          name: 'Test',
          slug: 'name-test',
          age: 20,
          height: 180.2,
          birthday: '1922-01-23',
          contact: {
            email: 'test@testing.com',
            phones: ['62372424'],
            addresses: [{
              region: 'test',
              building: 'test',
            }],
          },
          projects: [{
            title: 'test',
          }],
          isadmin: false,
        })
      })
    })
  })
  describe('validation', () => {
    describe('required', () => {
      test('should return true when value = null', () => {
        expect(raw.validation.empty(null)).toEqual(true)
      })
      test('should return true when value = []', () => {
        expect(raw.validation.empty([])).toEqual(true)
      })
      test('should return true when value = {}', () => {
        expect(raw.validation.empty({})).toEqual(true)
      })
      test('should return false when value = `not empty`', () => {
        expect(raw.validation.empty('not empty')).toEqual(false)
      })
    })
    describe('in', () => {
      test('should return false when value not in [`a`, `b`, `c`]', () => {
        expect(raw.validation.in('d', [])).toEqual(false)
      })
      test('should return true when value in [`a`, `b`, `c`]', () => {
        expect(raw.validation.in('a', ['a','b','c'])).toEqual(true)
        expect(raw.validation.in('b', ['a','b','c'])).toEqual(true)
        expect(raw.validation.in('c', ['a','b','c'])).toEqual(true)
      })
    })
    describe('phone', () => {
      test('should return false when value = `test`', () => {
        expect(raw.validation.isPhone('test')).toEqual(false)
      })
      test('should return true when value = `+12398930343`', () => {
        expect(raw.validation.isPhone('+12398930343')).toEqual(true)
      })
    })
    describe('email', () => {
      test('should return false when value = `test`', () => {
        expect(raw.validation.isEmail('test')).toEqual(false)
      })
      test('should return true when value = `test@test.com`', () => {
        expect(raw.validation.isEmail('test@test.com')).toEqual(true)
      })
    })
  })
})