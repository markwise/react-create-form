import {rules} from './rules'
import {errors} from './errors'

const createValidator = validate => (
  value => validate(value, 'Field')
)

it('should have rules', () => {
  expect(rules.required).toEqual(expect.any(Function))
  expect(rules.length).toEqual(expect.any(Function))
  expect(rules.min).toEqual(expect.any(Function))
  expect(rules.max).toEqual(expect.any(Function))
  expect(rules.equals).toEqual(expect.any(Function))
  expect(rules.starts).toEqual(expect.any(Function))
  expect(rules.ends).toEqual(expect.any(Function))
  expect(rules.contains).toEqual(expect.any(Function))
  expect(rules.number).toEqual(expect.any(Function))
  expect(rules.range).toEqual(expect.any(Function))
  expect(rules.between).toEqual(expect.any(Function))
  expect(rules.matches).toEqual(expect.any(Function))
  expect(rules.custom).toEqual(expect.any(Function))
})

describe('rules.required', () => {
  const validate = createValidator(rules.required()(errors.required))

  it('should pass validation', () => {
    expect(validate('1')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field is required.'
    expect(validate('')).toBe(error)
  })
})


// Character length rule types

describe('rules.length', () => {
  const validate = createValidator(rules.length(3)(errors.length))

  it('should pass validation', () => {
    expect(validate('123')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must be 3 characters.'
    expect(validate('')).toBe(error)
    expect(validate('12')).toBe(error)
    expect(validate('1234')).toBe(error)
  })
})

describe('rules.min', () => {
  const validate = createValidator(rules.min(3)(errors.min))

  it('should pass validation', () => {
    expect(validate('123')).toBe('')
    expect(validate('1234')).toBe('')
    expect(validate('12345')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must be at least 3 characters.'
    expect(validate('')).toBe(error)
    expect(validate('1')).toBe(error)
    expect(validate('12')).toBe(error)
  })
})

describe('rules.max', () => {
  const validate = createValidator(rules.max(3)(errors.max))

  it('should pass validation', () => {
    expect(validate('')).toBe('')
    expect(validate('1')).toBe('')
    expect(validate('12')).toBe('')
    expect(validate('123')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must be at most 3 characters.'
    expect(validate('1234')).toBe(error)
    expect(validate('12345')).toBe(error)
    expect(validate('123456')).toBe(error)
  })
})


// Character matching rule types

describe('rules.equals', () => {
  describe('one value', () => {
    const validate = createValidator(rules.equals('foo')(errors.equals))

    it('should pass validation', () => {
      expect(validate('foo')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must be equal to foo.'
      expect(validate('')).toBe(error)
      expect(validate('bar')).toBe(error)
      expect(validate('baz')).toBe(error)
    })
  })

  describe('multiple values', () => {
    const validate = createValidator(rules.equals(['foo', 'bar', 'baz'])(errors.equals))

    it('should pass validation', () => {
      expect(validate('foo')).toBe('')
      expect(validate('bar')).toBe('')
      expect(validate('baz')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must be equal to one of: foo,bar,baz.'
      expect(validate('')).toBe(error)
      expect(validate('qux')).toBe(error)
    })
  })
})

describe('rules.starts', () => {
  const validate = createValidator(rules.starts('pne')(errors.starts))

  it('should pass validation', () => {
    expect(validate('pneumonoultramicroscopicsilicovolcanoconiosis')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must start with pne.'
    expect(validate('')).toBe(error)
    expect(validate('sisoinoconaclovociliscipocsorcimartluonomuenp')).toBe(error)
  })
})

describe('rules.ends', () => {
  const validate = createValidator(rules.ends('sis')(errors.ends))

  it('should pass validation', () => {
    expect(validate('pneumonoultramicroscopicsilicovolcanoconiosis')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must end with sis.'
    expect(validate('')).toBe(error)
    expect(validate('sisoinoconaclovociliscipocsorcimartluonomuenp')).toBe(error)
  })
})

describe('rules.contains', () => {
  const validate = createValidator(rules.contains('volcano')(errors.contains))

  it('should pass validation', () => {
    expect(validate('pneumonoultramicroscopicsilicovolcanoconiosis')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must contain volcano.'
    expect(validate('')).toBe(error)
    expect(validate('foo')).toBe(error)
  })
})


// Number rule types

describe('rules.number', () => {
  const validate = createValidator(rules.number()(errors.number))

  it('should pass validation', () => {
    expect(validate('1')).toBe('')
    expect(validate('12')).toBe('')
    expect(validate('123')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must be a number.'
    expect(validate('')).toBe(error)
    expect(validate('3D')).toBe(error)
    expect(validate('4x4')).toBe(error)
  })
})

describe('rules.range', () => {
  const validate = createValidator(rules.range(3, 5)(errors.range))

  it('should pass validation', () => {
    expect(validate('3')).toBe('')
    expect(validate('4')).toBe('')
    expect(validate('5')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must be a number from 3 to 5.'
    expect(validate('')).toBe(error)
    expect(validate('2')).toBe(error)
    expect(validate('6')).toBe(error)
    expect(validate('x')).toBe(error)
  })
})

describe('rules.between', () => {
  const validate = createValidator(rules.between(3, 5)(errors.between))

  it('should pass validation', () => {
    expect(validate('4')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must be a number between 3 and 5.'
    expect(validate('')).toBe(error)
    expect(validate('3')).toBe(error)
    expect(validate('5')).toBe(error)
    expect(validate('x')).toBe(error)
  })
})


// Custom rule types

describe('rules.matches', () => {
  const validate = createValidator(rules.matches(/^\d+$/)(errors.matches))

  it('should pass validation', () => {
    expect(validate('1')).toBe('')
    expect(validate('12')).toBe('')
    expect(validate('123')).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Field must match the pattern /^\\d+$/.'
    expect(validate('')).toBe(error)
    expect(validate('3D')).toBe(error)
    expect(validate('4x4')).toBe(error)
  })
})

describe('rules.custom', () => {
  it('should have value param', () => {
    rules.custom(value => {
      expect(value).toBe('foo')
    })('foo')
  })

  it('should have fields param', () => {
    rules.custom((value, fields) => {
      expect(fields).toEqual(expect.any(Object))
    })('', '', {})
  })

  it('should pass validation', () => {
    let validate = rules.custom(() => '')
    expect(validate()).toBe('')

    // If a string is not returned, the error will be set to an empty string
    // and pass validation
    validate = rules.custom(() => 7)
    expect(validate()).toBe('')
  })

  it('should fail validation', () => {
    let error = 'Custom error.'
    let validate = rules.custom(() => error)
    expect(validate()).toBe(error)
  })

  it('should substitute $label and $value', () => {
    let validate = rules.custom(() => '$label is $value')
    expect(validate('foo', 'Metasyntactic')).toBe('Metasyntactic is foo')
  })
})
