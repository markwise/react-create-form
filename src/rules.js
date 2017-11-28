const createError = (error, args = [], label, value) => {
  // Replace $1...$5 rule argument patterns
  // Not used with custom rule validators
  error = args.reduce((acc, arg, index) => (
    acc.replace(new RegExp(`\\$${index + 1}`, 'g'), arg)
  ), error)

  // Replace $label, $value patterns
  error = error
    .replace(/\$label/g, label)
    .replace(/\$value/g, value)

  // TODO: sanitize error before eval
  // TODO: throw error on eval if required rule argument undefined
  return error ? eval('`' + error + '`') : 'Validation failed.'
}


const createRule = isValid => (
  (...args) => (error = '') => (value = '', label = '', state) => (
    isValid(value, args, state) ? '' : createError(error, args, label, value)
  )
)


export const rules = {
  required: createRule(value => value.length > 0),
  min:      createRule((value, [length]) => value.length >= length),
  max:      createRule((value, [length]) => value.length <= length),
  length:   createRule((value, [length]) => value.length === length),
  matches:  createRule((value, [pattern]) => pattern.test(value)),
  number:   createRule(value => /^\d+$/.test(value)),
  starts:   createRule((value, [match]) => value.indexOf(match) === 0),
  ends:     createRule((value, [match]) => value.indexOf(match, value.length - match.length) !== -1),
  contains: createRule((value, [match]) => value.indexOf(match) !== -1),

  range: createRule((value, [min, max]) => {
    value = Number(value)
    return value >= min && value <= max
  }),

  between: createRule((value, [min, max]) => {
    value = Number(value)
    return value > min && value < max
  }),

  equals: createRule((value, [list]) => {
    if (!Array.isArray(list)) list = [list]
    return list.some(item => item === value)
  }),

  custom: validate => (
    (value = '', label = '', state) => {
      let error = validate(value, state)
      if (typeof error !== 'string') error = ''
      return error ? createError(error, void 0, label, value) : ''
    }
  )

  // TODO: add email rule
  // TODO: add phone rule
  // TODO: add zip rule
  // TODO: add credit card rule
  // TODO: add compare two fields rules (might leave this as a custom rule)
  // TODO: add date rule
}
