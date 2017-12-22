import compareArrays from './compareArrays'

describe('compareArrays', () => {
  it('should return true', () => {
    expect(compareArrays()).toBe(true)
    expect(compareArrays([], [])).toBe(true)
    expect(compareArrays(['foo'], ['foo'])).toBe(true)
    expect(compareArrays(['foo', 'bar'], ['foo', 'bar'])).toBe(true)
    expect(compareArrays(['foo', 'bar'], ['bar', 'foo'])).toBe(true)
    expect(compareArrays(['bar', 'foo'], ['foo', 'bar'])).toBe(true)
    expect(compareArrays(['foo', 'bar', 'baz'], ['foo', 'bar', 'baz'])).toBe(true)
    expect(compareArrays(['baz', 'bar', 'foo'], ['foo', 'bar', 'baz'])).toBe(true)
    expect(compareArrays(['foo', 'bar', 'baz'], ['baz', 'bar', 'foo'])).toBe(true)
  })

  it('should return false', () => {
    expect(compareArrays(['foo'])).toBe(false)
    expect(compareArrays(['foo'], ['bar'])).toBe(false)
    expect(compareArrays(['foo', 'bar'], ['bar'])).toBe(false)
    expect(compareArrays(['foo', 'bar'], ['foo'])).toBe(false)
    expect(compareArrays(['foo'], ['foo', 'bar'])).toBe(false)
    expect(compareArrays(['foo'], ['bar', 'foo'])).toBe(false)
    expect(compareArrays(['bar'], ['foo'])).toBe(false)
    expect(compareArrays(['bar', 'foo'], ['foo'])).toBe(false)
    expect(compareArrays(['bar', 'foo'], ['bar'])).toBe(false)
    expect(compareArrays(['bar'], ['bar', 'foo'])).toBe(false)
    expect(compareArrays(['bar'], ['foo', 'bar'])).toBe(false)
  })
})
