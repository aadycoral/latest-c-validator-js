# c-validator-js

Example
```javascript
import Validate from 'c-validator'
  
const schema = {
  name: 'required',
  age: 'required|integer',
  contact: {
    email: 'required|email'
  }
}
const [value, errors] = Validate(schema, data)

...
```

Sample value
```javascript
{
  name: 'xxx',
  age: 20,
  contact: {
    email: 'xxx'
  }
}
```

Sample errors
```javascript
[
  { path: 'name', message: '{name} is required' },
  { path: 'contact.email', message: '{name} not valid email' }
]
```

## Validators
Validator                               | Description
--------------------------------------- | --------------------------------------
**required**                            | check if value is not empty or none
**in**                                  | check if value is in the options `in:pending,paid`
**phone**                               | check if value is a phone number
**email**                               | check if value is an email
**datetime**                            | check if value is a valid datetime `datetime:YYYY-MM-DD`
**integer**                             | check if value is a integer
**float**                               | check if value is a float
**boolean**                             | check if value is a boolean

## Advanced
```javascript
const schema = {
  posts: (path, value) => {
    // custom
    return [value, errors]
  }
}
```

## Tests

```sh
$ npm run test
```
