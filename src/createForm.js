import React, {Component} from 'react'
import {validateForm} from './validator'


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

const createInitialState = fields => (
  Object.entries(fields)
    .reduce((state, [name, {label = '', value = '', rules}]) => {
      let field = {value}
      if (rules && rules.length) field = {...field, label, rules, clean: true}
      return {...state, [name]: field}
    }, {})
)

const getDisplayName = Component => (
  Component.displayName || Component.name || 'Component'
)

export const createForm = (WrappedComponent, fields) => (
  class FormHOC extends Component {
    static displayName = `FormHOC(${getDisplayName(WrappedComponent)})`

    constructor(props) {
      super(props)
      this.initialState = createInitialState(fields)
      this.state = this.initialState
      this.handleChange = this.handleChange.bind(this)
      this.handleReset = this.handleReset.bind(this)
      this.validate = this.validate.bind(this)
      this.getFormData = this.getFormData.bind(this)
      this.getFormDataAsJSON = this.getFormDataAsJSON.bind(this)
    }


    /**
     * Handles onChange for all html input types, select and textarea.
     */
    handleChange(event) {
      let target = event.currentTarget
      let {name, type, value} = target
      let field = {...this.state[name], value}

      if (type === 'select-multiple') {
        field = {...field, value: [...target.selectedOptions].map(option => option.value)}
      } else
      if (type === 'checkbox' && !target.checked) {
        field = {...field, value: ''}
      } else
      if (type === 'file') {
        field = {...field, files: target.files}
      }

      if (field.clean) field = {...field, clean: false}
      this.setState({[name]: field})
    }


    /**
     * Reset form
     */
    handleReset(event) {
      event.preventDefault()
      this.setState(this.initialState)
    }


    /**
     * Technically this method does not validate, but forces all fields to be
     * eligible for validation on the next render by setting each fields clean
     * property to false. This means a field is not in an indeterminate state.
     *
     * @param {Object} form
     *    A validated form object passed as props.form to the WrappedComponent.
     *
     * @returns {Promise}
     *    A resolved promise if the form is valid, otherwise, a rejected promise.
     */
    validate(form = {}) {
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
     * Returns a Promise that resolves field values as FormData. This method
     * should be used when transmitting multipart/form-data (file uploads).
     *
     * @param {Array} [blacklist]
     *    An optional list of fields to exclude from the resulting FormData.
     *
     * @returns {Promise}
     *    A Promise that resolves to FormData.
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
     *    A Promise that resolves to JSON.
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


    render() {
      return (
        <WrappedComponent
          {...this.props}
          form={validateForm(this.state)}
          onChange={this.handleChange}
          onReset={this.handleReset}
          validate={this.validate}
          getFormData={this.getFormData}
          getFormDataAsJSON={this.getFormDataAsJSON}
        />
      )
    }
  }
)
