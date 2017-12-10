export const errors = {
  required: '$label is required.',
  matches:  '$label must match the pattern $1.',
  min:      '$label must be at least $1 character${$1 === 1 ? "" : "s"}.',
  max:      '$label must be at most $1 character${$1 === 1 ? "" : "s"}.',
  length:   '$label must be $1 character${$1 === 1 ? "" : "s"}.',
  equals:   '$label must be equal to${"$1".split(",").length > 1 ? " one of the following:" : ""} ${"$1".split(",").join(", ")}.',
  starts:   '$label must start with ${"$1"}.',
  ends:     '$label must end with ${"$1"}.',
  contains: '$label must contain ${"$1"}.',
  number:   '$label must be a number.',
  range:    '$label must be a number from ${$1} to ${$2}.',
  between:  '$label must be a number between ${$1} and ${$2}.'
}
