const validateField = ({rules, value, label}, fields) => {
  let errors = []

  rules.forEach(validate => {
    let error = validate(value.toString().trim(), label, fields)
    if (error) errors = [...errors, error]
  })

  return errors
}


/**
 * Returns an object of field name value pairs that is primarly used in custom
 * rules to compare multiple field values.
 */
const getFields = entries => (
  entries.reduce((fields, [name, {value}]) => (
    {...fields, [name]: value}
  ), {})
)

export const validateForm = state => {
  let form = {}
  let allErrors = []
  let fieldValidity = []
  let entries = Object.entries(state)
  let fields = getFields(entries)

  entries.forEach(([name, {value, label, rules, clean}]) => {
    let field = {value, errors: [], error: ''}

    // Does the field have validation rules
    if (rules.length) {
      let isValid = false

      // Has the field been interacted with (not in an indeterminate state)
      if (!clean) {
        let errors = validateField({rules, value, label}, fields)
        if (errors.length) {
          field = {...field, errors, error: errors[0]}
          allErrors = [...allErrors, errors]
        } else {
          isValid = true
        }
      }

      fieldValidity = [...fieldValidity, isValid]
    }

    form = {...form, [name]: field}
  })

  let willSubmit = !fieldValidity.some(isValid => isValid === false)
  return {...form, willSubmit, errors: allErrors}
}
