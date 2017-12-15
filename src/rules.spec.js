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

describe('rules.equals', () => {
  describe('single match', () => {
    const validate = createValidator(rules.equals('foo')(errors.equals))

    it('should pass validation', () => {
      expect(validate('foo')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must be equal to foo.'
      expect(validate('')).toBe(error)
      expect(validate('foolish')).toBe(error)
    })
  })

  describe('multiple matches', () => {
    const validate = createValidator(rules.equals(['foo', 'bar', 'baz'])(errors.equals))

    it('should pass validation', () => {
      expect(validate('foo')).toBe('')
      expect(validate('bar')).toBe('')
      expect(validate('baz')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must be equal to one of: foo, bar, baz.'
      expect(validate('')).toBe(error)
      expect(validate('foolish')).toBe(error)
      expect(validate('barmaid')).toBe(error)
      expect(validate('bazooka')).toBe(error)
    })

    it('should use single match error format', () => {
      let error = createValidator(rules.equals(['foo'])(errors.equals))('')
      expect(error).toBe('Field must be equal to foo.')
    })
  })
})

describe('rules.starts', () => {
  describe('single match', () => {
    const validate = createValidator(rules.starts('foo')(errors.starts))

    it('should pass validation', () => {
      expect(validate('foolish')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must start with foo.'
      expect(validate('')).toBe(error)
      expect(validate('samfoo')).toBe(error)
    })
  })

  describe('multiple matches', () => {
    const validate = createValidator(rules.starts(['foo', 'bar', 'baz'])(errors.starts))

    it('should pass validation', () => {
      expect(validate('foolish')).toBe('')
      expect(validate('barmaid')).toBe('')
      expect(validate('bazooka')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must start with one of: foo, bar, baz.'
      expect(validate('')).toBe(error)
      expect(validate('samfoo')).toBe(error)
      expect(validate('lumbar')).toBe(error)
      expect(validate('shabaz')).toBe(error)
    })

    it('should use single match error format', () => {
      let error = createValidator(rules.starts(['foo'])(errors.starts))('')
      expect(error).toBe('Field must start with foo.')
    })
  })
})

describe('rules.ends', () => {
  describe('single match', () => {
    const validate = createValidator(rules.ends('foo')(errors.ends))

    it('should pass validation', () => {
      expect(validate('samfoo')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must end with foo.'
      expect(validate('')).toBe(error)
      expect(validate('foolish')).toBe(error)
    })
  })

  describe('multiple matches', () => {
    const validate = createValidator(rules.ends(['foo', 'bar', 'baz'])(errors.ends))

    it('should pass validation', () => {
      expect(validate('samfoo')).toBe('')
      expect(validate('lumbar')).toBe('')
      expect(validate('shabaz')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must end with one of: foo, bar, baz.'
      expect(validate('')).toBe(error)
      expect(validate('foolish')).toBe(error)
      expect(validate('barmaid')).toBe(error)
      expect(validate('bazooka')).toBe(error)
    })

    it('should use single match error format', () => {
      let error = createValidator(rules.ends(['foo'])(errors.ends))('')
      expect(error).toBe('Field must end with foo.')
    })
  })
})

describe('rules.contains', () => {
  describe('single match', () => {
    const validate = createValidator(rules.contains('foo')(errors.contains))

    it('should pass validation', () => {
      expect(validate('foo')).toBe('')
      expect(validate('samfoo')).toBe('')
      expect(validate('foolish')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must contain foo.'
      expect(validate('')).toBe(error)
      expect(validate('pneumonoultramicroscopicsilicovolcanoconiosis')).toBe(error)
    })
  })

  describe('multiple matches', () => {
    const validate = createValidator(rules.contains(['foo', 'bar', 'baz'])(errors.contains))

    it('should pass validation', () => {
      expect(validate('foo')).toBe('')
      expect(validate('bar')).toBe('')
      expect(validate('baz')).toBe('')
      expect(validate('foolish')).toBe('')
      expect(validate('barmaid')).toBe('')
      expect(validate('bazooka')).toBe('')
      expect(validate('samfoo')).toBe('')
      expect(validate('lumbar')).toBe('')
      expect(validate('shabaz')).toBe('')
    })

    it('should fail validation', () => {
      let error = 'Field must contain one of: foo, bar, baz.'
      expect(validate('')).toBe(error)
      expect(validate('pneumonoultramicroscopicsilicovolcanoconiosis')).toBe(error)
    })

    it('should use single match error format', () => {
      let error = createValidator(rules.contains(['foo'])(errors.contains))('')
      expect(error).toBe('Field must contain foo.')
    })
  })
})

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
