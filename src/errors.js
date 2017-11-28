const prefix = '${"$label".length ? "$label" : "Field"}'

export const errors = {
  required: `${prefix} is required.`,
  matches:  `${prefix} must match the pattern $1.`,
  min:      `${prefix} must be at least $1 character\${$1 === 1 ? '' : 's'}.`,
  max:      `${prefix} must be at most $1 character\${$1 === 1 ? '' : 's'}.`,
  length:   `${prefix} must be $1 character\${$1 === 1 ? '' : 's'}.`,
  equals:   `${prefix} must be equal to\${'$1'.split(',').length > 1 ? ' one of the following' : ''} "\${'$1'.split(',').join(', ')}".`,
  starts:   `${prefix} must start with "\${'$1'}".`,
  ends:     `${prefix} must end with "\${'$1'}".`,
  contains: `${prefix} must contain "\${'$1'}".`,
  number:   `${prefix} must be a number.`,
  range:    `${prefix} must be a number from \${$1} to \${$2}.`,
  between:  `${prefix} must be a number between \${$1} and \${$2}.`,
}
