const createError = (error = '', args = [], label, value) => {
  // Replace $1...$5 rule argument patterns
  // Not used with custom rules
  error = args.reduce((acc, arg, index) => (
    acc.replace(new RegExp(`\\$${index + 1}`, 'g'), arg)
  ), error)

  // Replace $label, $value patterns
  error = error
    .replace(/\$label/g, label)
    .replace(/\$value/g, value)

  return error ? eval('`' + error + '`') : 'Validation failed.'
}


const createRule = validate => (
  (...args) => error => (value, label, fields) => (
    validate(value, args, fields) ? '' : createError(error, args, label, value)
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

  range: createRule((value, [from, to]) => {
    value = Number(value)
    return value >= from && value <= to
  }),

  between: createRule((value, [from, to]) => {
    value = Number(value)
    return value > from && value < to
  }),

  equals: createRule((value, [list]) => {
    if (!Array.isArray(list)) list = [list]
    return list.some(item => item === value)
  }),

  custom: validate => (
    (value, label, fields) => {
      let error = validate(value, fields)
      if (typeof error !== 'string') error = ''
      return error ? createError(error, void 0, label, value) : ''
    }
  )
}
