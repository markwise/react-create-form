const createError = (error = '', args = [], label, value) => {
  let arg1 = args[0]
  let arg2 = args[1]

  // Format rule arguments that are lists. Applies to equals, starts, ends and
  // contains rules, which can optionally take a list of matches.
  if (Array.isArray(arg1) && arg1.length > 1) {
    arg1 = `one of: ${arg1.join(', ')}`
  }

  error = error
    .replace(/\$1/g, arg1)
    .replace(/\$2/g, arg2)
    .replace(/\$label/g, label)
    .replace(/\$value/g, value)
    .replace(/\\/g, '\\\\')

  return error ? eval('`' + error + '`') : 'Validation failed.'
}


const createRule = validate => (
  (...args) => error => (value, label, fields) => (
    validate(value, args, fields) ? '' : createError(error, args, label, value)
  )
)


export const rules = {
  // Length rules

  required: createRule(value => value.length > 0),
  length: createRule((value, [length]) => value.length === length),
  min: createRule((value, [length]) => value.length >= length),
  max: createRule((value, [length]) => value.length <= length),

  // Matching rules

  equals: createRule((value, [list]) => {
    // Normalize rule argument as an array
    if (!Array.isArray(list)) list = [list]
    return list.includes(value)
  }),

  starts: createRule((value, [list]) => {
    if (!Array.isArray(list)) list = [list]
    return list.some(item => value.indexOf(item) === 0)
  }),

  ends: createRule((value, [list]) => {
    if (!Array.isArray(list)) list = [list]
    let l = value.length
    return list.some(item => value.indexOf(item, l - String(item).length) !== -1)
  }),

  contains: createRule((value, [list]) => {
    if (!Array.isArray(list)) list = [list]
    return list.some(item => value.indexOf(item) !== -1)
  }),

  // Number rules

  number: createRule(value => /^\d+$/.test(value)),

  range: createRule((value, [from, to]) => {
    value = Number(value)
    return value >= from && value <= to
  }),

  between: createRule((value, [from, to]) => {
    value = Number(value)
    return value > from && value < to
  }),

  // Custom rules

  matches: createRule((value, [pattern]) => pattern.test(value)),

  custom: validate => (
    (value, label, fields) => {
      let error = validate(value, fields)
      if (typeof error !== 'string') error = ''
      return error ? createError(error, void 0, label, value) : ''
    }
  )
}
