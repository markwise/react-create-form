import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {validateForm} from './validator'
import compareArrays from './compareArrays'

/**
 * Shallow compares field values to determine if the component should update.
 *
 * @param {Object} nextFields
 *    The nextProps fields property.
 *
 * @param {Object} prevFields
 *    The current props fields property.
 *
 * @param {Object} state
 *    The current state.
 *
 * @returns {Boolean}
 *    Returns true if the form should update, otherwise, false.
 */
const shouldUpdate = (nextFields = {}, prevFields = {}, state) => {
  let names = Object.keys(state)

  return Object.entries(nextFields).some(([name, nextValue]) => {
    // Skip if there is no field definition entry for name
    if (!names.includes(name)) return false
    let prevValue = prevFields[name]

    // Compare select-multiple type values
    if (Array.isArray(nextValue) && Array.isArray(prevValue)) {
      return !compareArrays(nextValue, prevValue)
    }

    return nextValue !== prevValue
  })
}


/**
 * Converts the HOC's state object to an array and filters out field names
 * included in blacklist.
 *
 * @param {Object} state
 *    The HOC's state object.
 *
 * @param {Array} [blacklist]
 *    An optional list of fields to exclude from the resulting array.
 *
 * @returns {Array}
 */
const filterForm = (state, blacklist = []) => (
  Object.entries(state).filter(([name]) => !blacklist.includes(name))
)


/**
 * Returns the initial state derived from the field definition object.
 *
 * All field definition entries are normalized and have the same shape
 * regardless if they validate or not.
 *
 * If clean is true, the field doesn't have a value and has not been interacted
 * with. However, if a field has an initial value or a value is set, via
 * onChange, the field is no longer clean (in an indeterminate state). This in
 * combination with the rules property provides a cue for the validator to know
 * if a field should be validated or not.
 *
 * @param {Object} fields
 *    A field definition object.
 *
 * @returns {Object}
 *    The form's initial state.
 */
const createInitialState = fields => (
  Object.entries(fields)
    .reduce((state, [name, {value = '', label = 'Field', rules = []}]) => (
      {...state, [name]: {value, label, rules, clean: !value.length}}
    ), {})
)


/**
 * Returns the HOC's display name. Creating the display name in this way is
 * straight from the React docs on Higher-Order Components, which is useful for
 * debugging.
 */
const getDisplayName = ({displayName, name = 'Component'}) => (
  `ReactCreateForm(${displayName || name})`
)


/**
 * Creates and returns the HOC.
 *
 * @param {Class} WrappedComponent
 *    A form component.
 *
 * @param {Object} fields
 *    A field definition object.
 *
 * @returns {Class}
 */
export const createForm = (WrappedComponent, fields) => (
  class ReactCreateForm extends Component {
    static displayName = getDisplayName(WrappedComponent)

    static defaultProps = {
      id: null,
      fields: {}
    }

    static propTypes = {
      id: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.number,
        PropTypes.string
      ]),
      fields: PropTypes.object
    }

    constructor(props) {
      super(props)
      this.initialState = createInitialState(fields)
      this.state = this.initialState
      this.update = this.update.bind(this)
      this.reset = this.reset.bind(this)
      this.getFormDataAsJSON = this.getFormDataAsJSON.bind(this)
      this.getFormData = this.getFormData.bind(this)
      this.validate = this.validate.bind(this)
      this.handleReset = this.handleReset.bind(this)
      this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
      let {fields} = this.props
      if (Object.keys(fields).length) this.update(fields)
    }

    componentWillReceiveProps(nextProps) {
      let {fields} = nextProps

      if (!Object.keys(fields).length) {
        this.reset()
      } else
      if (shouldUpdate(fields, this.props.fields, this.state)) {
        this.update(fields)
      }
    }


    /**
     * Updates field state values. If a field doesn't have a definition entry,
     * it is ignored.
     *
     * @param {Object} fields
     *    An object of field name/value pairs.
     */
    update(fields) {
      let names = Object.keys(this.state)

      this.setState(prevState =>
        Object.entries(fields).reduce((fields, [name, value]) => {
          // Skip if there is no field definition entry for name
          if (!names.includes(name)) return fields
          let field = prevState[name]
          let clean = field.clean && value === ''
          return {...fields, [name]: {...field, value, clean}}
        }, {})
      )
    }


    /**
     * Resets field values to the initial state defined in the field definition
     * object. This includes resetting fields that have been validated to an
     * indeterminate state by setting clean to true.
     */
    reset() {
      this.setState(this.initialState)
    }


    /**
     * Returns a Promise that resolves field values as JSON. If the field value
     * is a file upload, an array is returned as the value with each file object
     * converted to base64 and appended to the array. Because base64 conversion
     * of file objects significantly increases the size of data being
     * transmitted, it is recommended to use getFormData with file uploads.
     *
     * @param {Array} [blacklist]
     *    An optional list of fields to exclude from the resulting JSON.
     *
     * @returns {Promise}
     *    A Promise that resolves it's value to JSON.
     */
    getFormDataAsJSON(blacklist) {
      let fields = filterForm(this.state, blacklist)

      function readFiles(files, fileReader) {
        let i = files.length
        return () => i-- ? !!fileReader.readAsDataURL(files[i]) : true
      }

      function nextField(fields, index, resolve, data = {}) {
        if (index--) {
          let [name, {value, files}] = fields[index]

          // handle file uploads
          if (files) {
            let fileReader = new FileReader()
            let nextFile = readFiles(files, fileReader)
            let fileList = []

            fileReader.addEventListener('load', event => {
              fileList = [...fileList, event.currentTarget.result]

              // If done (true), there are no more files to read
              if (nextFile()) {
                data[name] = fileList
                nextField(fields, index, resolve, data)
              }
            })

            nextFile()

          // All other field types
          } else {
            data[name] = value
            nextField(fields, index, resolve, data)
          }
        } else {
          resolve(JSON.stringify(data))
        }
      }

      return new Promise(resolve => {
        nextField(fields, fields.length, resolve)
      })
    }


    /**
     * Returns a Promise that resolves field values as FormData. This method
     * should be used when transmitting multipart/form-data (file uploads).
     *
     * @param {Array} [blacklist]
     *    An optional list of fields to exclude from the resulting FormData.
     *
     * @returns {Promise}
     *    A Promise that resolves it's value to FormData.
     */
    getFormData(blacklist) {
      let fields = filterForm(this.state, blacklist)
      let formData = new FormData()

      fields.forEach(([name, {value, files}]) => {
        if (files) {
          ;[...files].forEach(file => formData.append(`${name}[]`, file))
        } else {
          formData.append(name, value)
        }
      })

      // A promise is returned here for consistency with getFormDataAsJSON
      // so they can be used interchangeably.
      return Promise.resolve(formData)
    }


    /**
     * Technically this method does not validate, but forces all fields to be
     * eligible for validation on the next render by setting each field's clean
     * property to false. This means a field is not in an indeterminate state.
     *
     * @param {Object} form
     *    A validated form object. This is passed internally.
     *
     * @returns {Promise}
     *    A resolved promise if the form is valid, otherwise, a rejected promise.
     */
    validate(form) {
      if (form.willSubmit) {
        return Promise.resolve()
      } else {
        let fields = Object.entries(this.state)
        let clean = fields.some(([name, field]) => field.clean)

        // This will only run one time
        if (clean) {
          fields.forEach(([name, field]) => {
            if (field.clean) {
              this.setState({[name]: {...field, clean: false}})
            }
          })
        }

        return Promise.reject()
      }
    }


    /**
     * Form onReset handler
     */
    handleReset(event) {
      event.preventDefault()
      this.reset()
    }


    /**
     * Handles onChange for all html form element types.
     */
    handleChange(event) {
      let target = event.currentTarget
      let {name, type, value} = target
      let field = {...this.state[name], value, clean: false}

      if (type === 'select-multiple') {
        field = {...field, value: [...target.selectedOptions].map(option => option.value)}
      } else
      if (type === 'checkbox' && !target.checked) {
        field = {...field, value: ''}
      } else
      if (type === 'file') {
        field = {...field, files: target.files}
      }

      this.setState({[name]: field})
    }


    render() {
      let {fields, ...props} = this.props
      let form = validateForm(this.state)

      return (
        <WrappedComponent
          {...props}
          id={props.id || fields.id || null}
          form={form}
          onChange={this.handleChange}
          onReset={this.handleReset}
          validate={() => this.validate(form)}
          getFormData={this.getFormData}
          getFormDataAsJSON={this.getFormDataAsJSON}
        />
      )
    }
  }
)
