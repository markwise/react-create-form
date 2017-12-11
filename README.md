# react-create-form
A React form state management and validation framework.

It's designed to be flexible and intuitive and makes no assumptions about the style and structure of a form. As such, it can be integrated with an existing UI framework or form component library.

## Installation

```
npm i react-create-form
```

**Peer Dependencies:**

react >= 15.6.2
<br>
react-dom >= 15.6.2
<br>
prop-types >= 15.5.7

## Outline

**Guides**
- [State Management](#state-management)
- [Validation](#validation)

**API**
- [createForm](#createformformcomponent-fielddefinition)
- [rules](#rules)
- [errors](#errors)
- [props](#props)

<br>

# State Management

First and foremost react-create-form manages form state. It handles state management for all HTML form element types. It also provides methods to get a form's state as FormData or JSON.

Example

```javascript
import React, {Component} from 'react'
import createForm from 'react-create-form'

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  async handleSubmit(event) {
    event.preventDefault()
    let formData = await this.props.getFormData()
    // make fetch request or dispatch redux/flux action
  }

  render() {
    let {onChange, form} = this.props
    return (
      <form
        autoComplete="off"
        onSubmit={this.handleSubmit}
      >
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={form.username.value}
            onChange={onChange}
          >
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={form.password.value}
            onChange={onChange}
          >
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
    )
  }
}

export default createForm(LoginForm, {
  username: {value: ''},
  password: {value: ''}
})
```

The function [createForm](#createformformcomponent-fielddefinition) returns a Higher-Order Component (HOC) that wraps your form component. The first argument is your form component. The second argument is a field definition object. The field definition key should match the name attribute of the HTML form element. The value property is required.

## Form element types

### select-multiple types

With the exception of select-multiple types, which use an array, the value for all other types in the field definition object are strings.

```javascript
<div>
  <label>Select one or more colors</label>
  <select
    name="colors"
    value={form.colors.value}
    multiple={true}
    onChange={onChange}
  >
    <option value="RED">Red</option>
    <option value="GREEN">Green</option>
    <option value="BLUE">Blue</option>
  </select>
</div>
```

Field definition

```javascript
{
  colors: {value: ['RED', 'BLUE']}
}
```

### radio types

```javascript
<div>
  <label>
    <input
      type="radio"
      name="colors"
      value="RED"
      checked={form.colors.value === 'RED'}
      onChange={onChange}
    />
    Red
  </label>
  <label>
    <input
      type="radio"
      name="colors"
      value="GREEN"
      checked={form.colors.value === 'GREEN'}
      onChange={onChange}
    />
    Green
  </label>
  <label>
    <input
      type="radio"
      name="colors"
      value="BLUE"
      checked={form.colors.value === 'BLUE'}
      onChange={onChange}
    />
    Blue
  </label>
</div>
```

Field definition

```javascript
{
  colors: {value: 'RED'}
}
```

### checkbox types

```javascript
<div>
  <label>
    <input
      type="checkbox"
      name="red"
      value="RED"
      checked={form.red.value === 'RED'}
      onChange={onChange}
    />
    Red
  </label>
  <label>
    <input
      type="checkbox"
      name="green"
      value="GREEN"
      checked={form.green.value === 'GREEN'}
      onChange={onChange}
    />
    Green
  </label>
  <label>
    <input
      type="checkbox"
      name="blue"
      value="BLUE"
      checked={form.blue.value === 'BLUE'}
      onChange={onChange}
    />
    Blue
  </label>
</div>
```

Field definition

```javascript
{
  red:   {value: 'RED'},
  green: {value: ''},
  blue:  {value: 'BLUE'}
}
```

### file and other types

Because file types rely on the user selecting a file, an empty string is the only value that can be set. All other types are just string values and should follow the format specified in the specs. For example, the value for a date type will be an ISO 8601 date format (yyyy-mm-dd).

https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input

## Resetting a form

The props passed to the form component expose an onReset handler. It does exactly what you would expect it to. It resets field values to the initial state defined in the field definition object, and resets fields that have been validated to an indeterminate state.

```javascript
<form onReset={onReset}>
  <button type="reset">Reset</button>
</form>
```

## Submitting a form

Although react-create-form doesn't handle submitting a form for you, it does provide you with two methods to get the form's state, getFormData and getFormDataAsJSON. As the method names describe, getFormData returns the form's state as an instance of FormData and getFormDataAsJSON returns the form's state as JSON.

```javascript
async handleSubmit(event) {
  event.preventDefault()
  let formData = await this.props.getFormData()
  // or
  let json = await this.props.getFormDataAsJSON()
  // make fetch request or dispatch redux/flux action
}
```

Besides the data format returned, there are a few differences to be aware of.

When submitting files selected with a file type chooser, getFormDataAsJSON will base64 encode the file objects. This can significantly increase the size of data being transmitted, so it is recommended to always use getFormData when submitting files. But if you must, don't forget to decode them on the flip side.

When FormData is added to a fetch request, the Content-Type header is auto set to multipart/form-data, whereas, submitting JSON, you must manually set the Content-Type header to application/json.

When processing file objects submitted as FormData, the field name will have brackets appended to it. For example, a file type chooser with a name of "resume" can be referenced as "resume[]".

<br>

# Validation

The following form has one field and is validated when the field's value changes. Three validation [rules](#rules) have been added to the field's definition and will validate in the order they have been added to the rules property. If the field fails validation an error message will be displayed, otherwise, it will be hidden. The optional label property in the field definition is used for display in [errors](#errors). If omitted, the more generic "Field" is used. Finally, the submit button will be disabled until all fields that will validate have passed validation.

```javascript
import React, {Component} from 'react'
import createForm, {rules, errors} from 'react-create-form'

class ColorForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(event) {
    event.preventDefault()
    // do something awesome here, or don't
  }

  render() {
    let {form, onChange} = this.props
    return (
      <form
        autoComplete="off"
        onSubmit={this.handleSubmit}
      >
        <div>
          <label>Favorite Color</label>
          <input
            type="text"
            name="color"
            value={form.color.value}
            onChange={onChange}
          />
          // Display a single error
          {form.color.error &&
            <div>{form.color.error}</div>
          }
        </div>
        <div>
          // The submit button will be disabled until the color field has
          // passed validation.
          <button type="submit" disabled={!form.willSubmit}>
            Submit
          </button>
        </div>
      </form>
    )
  }
}

export default createForm(ColorForm, {
  color: {
    value: '',
    // Optional label property that is used for display in errors. If omitted,
    // the more generic "Field" is used.
    label: 'Favorite Color',
    // The color field will validate against rules in this order.
    rules: [
      rules.required()(errors.required),
      rules.min(3)(errors.min),
      rules.max(27)(errors.max)
    ]
  }
})
```

The above example only shows one error for the color field at a time, even though the required and min rules can both fail at the same time. Using the errors property, we can show all field errors at the same time.

```javascript
...
<div>
  <label>Favorite Color</label>
  <input
    type="text"
    name="color"
    value={form.color.value}
    onChange={onChange}
  />
  {form.color.errors.length > 0 &&
    <ul>
      {form.color.errors.map(error =>
        <li key={error}>{error}</li>
      )}
    </ul>
  }
</div>
...
```

A more traditional way of displaying errors is to show all errors for all fields that failed validation at the top of the form.

```javascript
...
{form.errors.length > 0 &&
  <div>
    {form.errors.map((errors, index) =>
      <ul key={index}>
        {errors.map(error =>
          <li key={error}>{error}</li>
        )}
      </ul>
    )}
  </div>
}
<div>
  <label>Favorite Color</label>
  <input
    type="text"
    name="color"
    value={form.color.value}
    onChange={onChange}
  />
</div>
...
```

And if we just want to show one error per field...

```javascript
...
{form.errors.length > 0 &&
  <div>
    {form.errors.map((errors, index) =>
      <ul key={index}>
        <li>{errors[0]}</li>
      </ul>
    )}
  </div>
}
...
```

We can also validate the form when it's submitted instead of disabling the submit button until all fields that will validate have passed validation. A field still validates when it's value changes. In this way, a user gets feedback when a field value changes and when a form is submitted, providing a less restrictive interface.

```javascript
...
async handleSubmit(event) {
  event.preventDefault()
  let {validate} = this.props
  try {
    await validate()
    // I am valid, submit me...c'mon submit me
  } catch(e) {}
}
...
<button type="submit">Submit</button>
...
```

<br>

# createForm(FormComponent, fieldDefinition)

Returns a Higher-Order Component that manages a form component's state and validity.

**FormComponent (required)** - A React form component.

**fieldDefinition (required)** - A field definition object.

Example

```javascript
class ColorForm extends Component {
  render() {
    let {form, onChange} = this.props
    return (
      <form>
        <div>
          <label>Favorite Color</label>
          <input
            type="text"
            name="color"
            value={form.color.value}
            onChange={onChange}
          />
          {form.color.error &&
            <div>{form.color.error}</div>
          }
        </div>
      </form>
    )
  }
}

export default createForm(ColorForm, {
  // The field definition key should match the name attribute of the HTML form
  // element. In this case, color.
  color: {
    // Value is required.
    value: ''
  }
})
```

To validate the color field, add a rules property and one or more validation [rules](#rules) to the field definition entry.

```javascript
export default createForm(ColorForm, {
  color: {
    value: '',
    // The color field will validate against rules in this order.
    rules: [
      rules.required()(errors.required),
      rules.min(3)(errors.min),
      rules.max(27)(errors.max)
    ]
  }
})
```

An optional label property can be used for display in [errors](#errors). If the label property is omitted, the more generic "Field" is used.

```javascript
export default createForm(ColorForm, {
  color: {
    value: '',
    label: 'Favorite Color',
    rules: [
      rules.required()(errors.required),
      rules.min(3)(errors.min),
      rules.max(27)(errors.max)
    ]
  }
})
```

<br>

# rules

There are two types of rules standard and custom. With that said, all of the rules are standard except the one called custom.

### Standard Rules

A standard rule is a curried function that may or may not take arguments.

```javascript
rules.required()

// or

rules.min(3)
```

It returns a second function that takes an error. You can use react-create-form errors or write your own.

```javascript
rules.required()(errors.required)

// or

rules.required()('Field is required')
```

It then returns a validate function that is used internally by react-create-form's validator.

### Custom Rules

A [custom rule](#customvalidate) is still a curried function, but immediately returns a validate function. You must supply as the name suggests, your own validation implementation and error.

```javascript
rules.custom(value =>
  value.toString().trim().length > 0
    ? ''
    : 'Field is required'
)
```

## Rules Directory

If a rule you're looking for doesn't exist, you can easily create it using a  matches or custom rule. Over time more rules will be added to the rules directory.

- [required](#required)
- [min](#minlength)
- [max](#maxlength)
- [length](#lengthlength)
- [matches](#matchesregex)
- [number](#number)
- [starts](#startsmatch)
- [ends](#endsmatch)
- [contains](#containsmatch)
- [range](#rangefrom-to)
- [between](#betweenfrom-to)
- [equals](#equalslist)
- [custom](#customvalidate)

### required

Test that a field has at least one character.

```javascript
rules.required()(errors.required)
```

### min(length)

Test that a field has at least a minimum number of characters.

**length (required)** - A number that is the minimum number of characters allowed.

```javascript
rules.min(3)(errors.min)
```

### max(length)

Test that a field has at most a maximum number of characters.

**length (required)** - A number that is the maximum number of characters allowed.

```javascript
rules.max(3)(errors.max)
```

### length(length)

Test that a field is an exact number of characters.

**length (required)** - A number that is the exact number of characters allowed.

```javascript
rules.length(5)(errors.length)
```

### matches(regex)

Test that a field matches a pattern.

**regex (required)** - A regular expression to match the field against.

```javascript
rules.matches(/^\d+$/)(errors.matches)
```

### number

Test that a field is a number.

```javascript
rules.number()(errors.number)
```

### starts(match)

Test that a field starts with a set of characters.

**match (required)** - A string of characters that a field should start with.

```javascript
rules.starts('Hello')(errors.starts)
```

### ends(match)

Test that a field ends with a set of characters.

**match (required)** - A string of characters that a field should end with.

```javascript
rules.ends('World')(errors.ends)
```

### contains(match)

Test that a field contains a set of characters.

**match (required)** - A string of characters that a field should contain.

```javascript
rules.contains('or')(errors.contains)
```

### range(from, to)

Test that a field contains a number within a range.

**from (required)** - A number that is the bottom of the range.

**to (required)** - A number that is the top of the range.

```javascript
rules.range(3, 7)(errors.range)
```

### between(from, to)

Test that a field contains a number between a range.

**from (required)** - A number that is the bottom of the range.

**to (required)** - A number that is the top of the range.

```javascript
rules.between(3, 7)(errors.between)
```

### equals(list)

Test that a field is equal to one of the values in list.

**list (required)** - A string value or array of values that a field should be equal to.

```javascript
rules.equals('foo')(errors.equals)

// or

rules.equals(['foo', 'bar', 'baz'])(errors.equals)
```

### custom(validate)

Test a field against a custom rule implementation. If the field passes validation, return an empty string, otherwise, return an error.

**validate(value, fields) (required)** - A function that will be called when the field is validated. When validate is called, it will be passed the field's value as the first param and an object containing all field name value pairs as the second param.

The following example is a custom rule to test a required field.

```javascript
rules.custom(value =>
  value.toString().trim().length > 0
    ? ''
    : 'Field is required.'
  }
)
```

Using the fields param, we can compare two field values, such as when creating a password.

```javascript
rules.custom((value, fields) =>
  value.trim() === fields.password2.trim()
    ? ''
    : 'Password and Verify Password fields must match.'
)
```

The error returned from a custom rule can also use variable substitution.

```javascript
rules.custom(value =>
  value.toString().trim().length > 0
    ? ''
    // $label will be substituted for the label property defined in the field definition
    : '$label is required.'
  }
)
```

<br>

# errors

You can use errors provided by react-create-form or write your own.

All rules have a matching error except custom.

```
errors.required
errors.min
errors.max
errors.length
errors.matches
errors.number
errors.starts
errors.ends
errors.contains
errors.range
errors.between
errors.equals
```

## Write your own

When writing your own errors, you can use variable substitution and conditional logic to dynamically create an error. This is how all of the default errors are written.

For example, if we defined a required rule for a field with the label 'First Name', we can substitute it in the error.

```javascript
rules.required()('$label is required.')
// error: First Name is required.
```

The label property must exist in the field definition, otherwise the more generic "Field" is used.

```javascript
rules.required()('$label is a required.')
// error: Field is required.
```

We can substitute rule arguments.

```javascript
rules.length(5)('$label must be $1 characters.')
// error: Field must be 5 characters.
```

Most rules have 1 argument, which corresponds to $1. Additional arguments will be $2, $3, ...etc if they exist.

```javascript
rules.between(3, 7)('$label must be a number between $1 and $2.')
// error: Field must be a number between 3 and 7.
```

We can substitute a field's value, although, it's a less common use case.

```javascript
rules.required()('Please enter $value.')
// error: Please enter foo bar baz.
```

Finally, we can use conditional logic.

```javascript
rules.min(1)('$label must be at least $1 character${$1 === 1 ? "" : "s"}.')
// error: Field must be at least 1 character.

rules.min(2)('$label must be at least $1 character${$1 === 1 ? "" : "s"}.')
// error: Field must be at least 2 characters.
```

Variable substitution and conditional logic can be used with errors returned from a custom rule. Since a custom rule doesn't have rule arguments, they are not applicable.

```javascript
rules.custom(value =>
  value.toString().trim().length > 0
    ? ''
    : '$label is required.'
  }
)
```

<br>

# props

The following props are exposed by the HOC to the wrapped form component.

- [form](#form)
- [onChange](#onchange)
- [onReset](#onreset)
- [validate](#validate)
- [getFormData](#getformdatablacklist)
- [getFormDataAsJSON](#getformdataasjsonblacklist)

## form

An object containing the current state of the form.

**Properties:**

- [form.errors](#formerrors)
- [form.willSubmit](#formwillsubmit)
- [form[field]](#formfield)

### form.errors

An array of all errors for all fields that failed validation.

Example

```javascript
let {form} = this.props
...
{form.errors.length > 0 &&
  <div>
    {form.errors.map((errors, index) =>
      <ul key={index}>
        {errors.map(error =>
          <li key={error}>{error}</li>
        )}
      </ul>
    )}
  </div>
}
```

And if we just want to show one error per field

```javascript
let {form} = this.props
...
{form.errors.length > 0 &&
  <div>
    {form.errors.map((errors, index) =>
      <ul key={index}>
        <li>{errors[0]}</li>
      </ul>
    )}
  </div>
}
```

### form.willSubmit

A boolean value indicating whether a form is valid or invalid. This is typically used to disable/enable a submit button. If there are no fields to validate, the default is true, otherwise false.

```javascript
let {form} = this.props
...
<button type="submit" disabled={!form.willSubmit}>
  Submit
</button>
```

### form[field]

An object keyed by the name of the field definition key (should be the name attribute of the HTML form element).

**Properties:**

- [form[field].value](#formfieldvalue)
- [form[field].errors](#formfielderrors)
- [form[field].error](#formfielderror)

### form[field].value

An array if the HTML form element type is select-multiple, otherwise a string. The initial value is set in the field's definition entry.

```javascript
let {form, onChange} = this.props
...
<div>
  <label>First Name</label>
  <input
    type="text"
    name="firstName"
    value={form.firstName.value}
    onChange={onChange}
  />
</div>
```

### form[field].errors

An array of all field errors. Use this if you want to display all field errors at the same time.

```javascript
let {form, onChange} = this.props
...
<div>
  <label>First Name</label>
  <input
    type="text"
    name="firstName"
    value={form.firstName.value}
    onChange={onChange}
  />
  {form.firstName.errors.length > 0 &&
    <ul>
      {form.firstName.errors.map(error =>
        <li key={error}>{error}</li>
      )}
    </ul>
  }
</div>
```

### form[field].error

If a field has errors, it will be the first error in form[field].errors, otherwise, an empty string. Use this if you want to display one field error at a time.

```javascript
let {form, onChange} = this.props
...
<div>
  <label>First Name</label>
  <input
    type="text"
    name="firstName"
    value={form.firstName.value}
    onChange={onChange}
  />
  {form.firstName.error &&
    <div>{form.firstName.error}</div>
  }
</div>
```

You can also just use the first error in form[field].errors.

```javascript
...
{form.firstName.errors.length > 0 &&
  <div>{form.firstName.errors[0]}</div>
}
...
```

## onChange()

The onChange event handler for all form elements.

```javascript
let {form, onChange} = this.props
...
<div>
  <label>First Name</label>
  <input
    type="text"
    name="firstName"
    value={form.firstName.value}
    onChange={onChange}
  />
</div>
```

## onReset()

The onReset handler resets field values to the initial state defined in the field definition object, and resets fields that have been validated to an indeterminate state.

```javascript
let {onReset} = this.props
...
<form onReset={onReset}>
  <button type="reset">Reset</button>
</form>
```

## validate()

Validates all fields.

Using validate provides a more traditional way to validate a form without disabling the submit button. A field still validates when it's value changes. In this way, a user gets feedback when a field value changes and when a form is submitted, providing a less restrictive interface.

```javascript
async handleSubmit(event) {
  event.preventDefault()
  let {validate} = this.props
  try {
    await validate()
    // I am valid, submit me...c'mon submit me
  } catch(e) {}
}
...
<button type="submit">Submit</button>
```

## getFormData([blacklist])

Returns a promise that has a resolved value equal to the form's state as an instance of FormData.

**blacklist (optional)** - an array of field names to exclude from the FormData result.

Example

```javascript
async handleSubmit(event) {
  event.preventDefault()
  let formData = await this.props.getFormData()
  // make fetch request or dispatch redux/flux action
}
```

To exclude fields, use the blacklist option

```javascript
async handleSubmit(event) {
  event.preventDefault()
  let formData = await this.props.getFormData(['foo', 'bar', 'baz'])
  // The fields foo, bar and baz are excluded
}
```

When FormData is added to a fetch request, the Content-Type header is automatically set to multipart/form-data.

When processing file objects submitted as FormData, the field name will have brackets appended to it. For example, a file type chooser with a name of "resume" can be referenced as "resume[]".


## getFormDataAsJSON([blacklist])

Returns a promise that has a resolved value equal to the form's state as JSON.

**blacklist (optional)** - an array of field names to exclude from the JSON result.

Example

```javascript
async handleSubmit(event) {
  event.preventDefault()
  let json = await this.props.getFormDataAsJSON()
  // make fetch request or dispatch redux/flux action
}
```

To exclude fields, use the blacklist option

```javascript
async handleSubmit(event) {
  event.preventDefault()
  let json = await this.props.getFormDataAsJSON(['foo', 'bar', 'baz'])
  // The fields foo, bar and baz are excluded
}
```

When submitting files selected with a file type chooser, getFormDataAsJSON will base64 encode the file objects. This can significantly increase the size of data being transmitted, so it is recommended to always use getFormData when submitting files. But if you must, don't forget to decode them on the flip side.

---

License: [ISC](LICENSE)
