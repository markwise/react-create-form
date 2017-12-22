import React, {Component} from 'react'
import {shallow} from 'enzyme'
import {createForm} from './createForm'
import {rules} from './rules'

const createWrappedForm = fields => {
  let Form = () => <form></form>
  return createForm(Form, fields)
}

const createShallowWrapper = (fields, props = {}) => {
  let TestForm = createWrappedForm(fields)
  return shallow(<TestForm {...props} />)
}

describe('HOC', () => {
  it('should have prototype', () => {
    let TestForm = createWrappedForm({})
    expect(TestForm.prototype).toMatchObject({
      update: expect.any(Function),
      reset: expect.any(Function),
      getFormDataAsJSON: expect.any(Function),
      getFormData: expect.any(Function),
      validate: expect.any(Function),
      handleReset: expect.any(Function),
      handleChange: expect.any(Function)
    })
  })

  it('should initialize field state with default values', () => {
    let wrapper = createShallowWrapper({name: {}})
    expect(wrapper.state('name')).toMatchObject({
      value: '',
      label: 'Field',
      rules: expect.any(Array),
      clean: true
    })
  })

  it('should initialize field state with definition values', () => {
    let rules = []
    let fields = {name: {value: 'Jimmy Doolittle', label: 'Name', rules}}
    let wrapper = createShallowWrapper(fields)
    let name = wrapper.state('name')
    expect(name.rules).toBe(rules)
    expect(name).toMatchObject({
      value: 'Jimmy Doolittle',
      label: 'Name',
      clean: false
    })
  })

  it('should have default props', () => {
    let wrapper = createShallowWrapper({})
    let props = wrapper.instance().props
    expect(props).toMatchObject({id: null, fields: expect.any(Object)})
  })

  it('should not call `update` when the component is mounted', () => {
    let TestForm = createWrappedForm({})
    let updateSpy = jest.spyOn(TestForm.prototype, 'update')
    let wrapper = shallow(<TestForm />)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('should call `update` when the component is mounted', () => {
    let TestForm = createWrappedForm({})
    let updateSpy = jest.spyOn(TestForm.prototype, 'update')
    let wrapper = shallow(<TestForm fields={{foo: ''}}/>)
    expect(updateSpy).toHaveBeenCalled()
  })

  it('should update field state values', () => {
    let fields = {firstName: {value: ''}, lastName: {value: ''}}
    let TestForm = createWrappedForm(fields)
    let updateSpy = jest.spyOn(TestForm.prototype, 'update')
    let props = {fields: {firstName: 'Orville', lastName: 'Wright'}}
    let wrapper = shallow(<TestForm {...props} />)

    expect(updateSpy.mock.calls.length).toBe(1)
    expect(wrapper.state('firstName').value).toBe('Orville')
    expect(wrapper.state('lastName').value).toBe('Wright')

    wrapper.setProps({fields: {firstName: 'Wilbur'}})
    expect(updateSpy.mock.calls.length).toBe(2)
    expect(wrapper.state('firstName').value).toBe('Wilbur')
    expect(wrapper.state('lastName').value).toBe('Wright')
  })

  it('should not add extra fields to state', () => {
    let fields = {foo: {value: ''}}
    let wrapper = createShallowWrapper(fields)
    expect(wrapper.state()).toHaveProperty('foo')

    // Fields that don't have a field definition entry are ignored
    wrapper.setProps({fields: {foo: 'foo', bar: 'bar', baz: 'baz'}})
    expect(wrapper.state()).toHaveProperty('foo')
    expect(wrapper.state()).not.toHaveProperty('bar')
    expect(wrapper.state()).not.toHaveProperty('baz')
  })

  it('should reset fields to initial state', () => {
    let fields = {firstName: {value: ''}, lastName: {value: ''}}
    let TestForm = createWrappedForm(fields)
    let resetSpy = jest.spyOn(TestForm.prototype, 'reset')
    let wrapper = shallow(<TestForm />)

    expect(wrapper.state('firstName').value).toBe('')
    expect(wrapper.state('lastName').value).toBe('')

    wrapper.setProps({fields: {firstName: 'Howard', lastName: 'Hughes'}})
    expect(resetSpy).not.toHaveBeenCalled()
    expect(wrapper.state('firstName').value).toBe('Howard')
    expect(wrapper.state('lastName').value).toBe('Hughes')

    // Setting fields to an empty object resets field values to the initial
    // state defined in the form definition. This has the same effect as when
    // the onReset handler is called.
    wrapper.setProps({fields: {}})
    expect(resetSpy).toHaveBeenCalled()
    expect(wrapper.state('firstName').value).toBe('')
    expect(wrapper.state('lastName').value).toBe('')
  })
})


describe('WrappedComponent', () => {
  it('should have props', () => {
    let wrapper = createShallowWrapper({})
    expect(wrapper.props()).toMatchObject({
      id: null, // null, number, or string
      form: expect.any(Object),
      onChange: expect.any(Function),
      onReset: expect.any(Function),
      validate: expect.any(Function),
      getFormData: expect.any(Function),
      getFormDataAsJSON: expect.any(Function)
    })
  })
})


describe('WrappedComponent.props.id', () => {
  it('should default to `null`', () => {
    let wrapper = createShallowWrapper({})
    expect(wrapper.props().id).toBeNull()
  })

  it('should be `props.id`', () => {
    let wrapper = createShallowWrapper({}, {id: 1})
    expect(wrapper.props().id).toBe(1)
  })

  it('should be `fields.id`', () => {
    let wrapper = createShallowWrapper({}, {fields: {id: 1}})
    expect(wrapper.props().id).toBe(1)
  })

  it('should override `fields.id`', () => {
    // props.id takes precedence over fields.id
    let wrapper = createShallowWrapper({}, {id: 1, fields: {id: 2}})
    expect(wrapper.props().id).toBe(1)
  })
})


describe('WrappedComponent.props.form', () => {
  it('should have default shape', () => {
    let wrapper = createShallowWrapper({})
    let {errors, willSubmit} = wrapper.props().form
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    // Always true when there are no fields to validate
    expect(willSubmit).toBe(true)
  })

  it('should have default shape when fields will validate', () => {
    let wrapper = createShallowWrapper({name: {rules: [() => {}]}})
    let {errors, willSubmit} = wrapper.props().form
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    // Will be false until all fields that will validate pass validation
    expect(willSubmit).toBe(false)
  })

  describe('form[field]', () => {
    it('should have default shape', () => {
      let wrapper = createShallowWrapper({name: {}})
      let {value, errors, error} = wrapper.props().form.name
      expect(value).toBe('')
      expect(errors).toEqual(expect.any(Array))
      expect(errors.length).toBe(0)
      expect(error).toBe('')
    })
  })
})


describe('WrappedComponent.props.onChange', () => {
  it('should manage select-single, textarea, and input types', () => {
    let wrapper = createShallowWrapper({name: {}})
    expect(wrapper.state().name.value).toBe('')
    expect(wrapper.props().form.name.value).toBe('')

    wrapper.props().onChange({
      currentTarget: {
        // The handleChange event handles all types the same except for
        // select-multiple, checkbox and file, which have their own tests.
        type: 'text',
        name: 'name',
        value: 'Mark Wise'
      }
    })

    wrapper.update()
    expect(wrapper.state().name.value).toBe('Mark Wise')
    expect(wrapper.props().form.name.value).toBe('Mark Wise')
  })

  it('should manage select-multiple types', () => {
    let wrapper = createShallowWrapper({colors: {value: []}})
    expect(wrapper.state().colors.value).toEqual(expect.any(Array))
    expect(wrapper.props().form.colors.value).toEqual(expect.any(Array))

    wrapper.props().onChange({
      currentTarget: {
        type: 'select-multiple',
        name: 'colors',
        value: '',
        selectedOptions: [{value: 'RED'}, {value: 'GREEN'}, {value: 'BLUE'}]
      }
    })

    wrapper.update()
    let value = ['RED', 'GREEN', 'BLUE']
    expect(wrapper.state().colors.value).toEqual(value)
    expect(wrapper.props().form.colors.value).toEqual(value)

    wrapper.props().onChange({
      currentTarget: {
        type: 'select-multiple',
        name: 'colors',
        value: '',
        selectedOptions: [{value: 'GREEN'}]
      }
    })

    wrapper.update()
    value = ['GREEN']
    expect(wrapper.state().colors.value).toEqual(value)
    expect(wrapper.props().form.colors.value).toEqual(value)
  })

  it('should manage checkbox types', () => {
    let wrapper = createShallowWrapper({yes: {}})
    expect(wrapper.state().yes.value).toBe('')
    expect(wrapper.props().form.yes.value).toBe('')

    wrapper.props().onChange({
      currentTarget: {
        type: 'checkbox',
        name: 'yes',
        value: 'YES',
        checked: true
      }
    })

    wrapper.update()
    expect(wrapper.state().yes.value).toBe('YES')
    expect(wrapper.props().form.yes.value).toBe('YES')

    wrapper.props().onChange({
      currentTarget: {
        type: 'checkbox',
        name: 'yes',
        value: 'YES',
        checked: false
      }
    })

    wrapper.update()
    expect(wrapper.state().yes.value).toBe('')
    expect(wrapper.props().form.yes.value).toBe('')
  })

  it('should manage file types', () => {
    let wrapper = createShallowWrapper({resume: {}})
    let {resume} = wrapper.state()
    expect(resume.value).toBe('')
    expect(resume).not.toHaveProperty('files')
    expect(wrapper.props().form.resume.value).toBe('')

    let value = 'C:\\fakepath\\Foo Bar.docx'
    wrapper.props().onChange({
      currentTarget: {
        type: 'file',
        name: 'resume',
        value,
        files: []
      }
    })

    wrapper.update()
    resume = wrapper.state().resume
    expect(resume.value).toBe(value)
    expect(resume.files).toEqual(expect.any(Array))
    expect(wrapper.props().form.resume.value).toBe(value)
  })

  it('should manage validation lifecycle', () => {
    let wrapper = createShallowWrapper({name: {rules: [rules.required()()]}})
    let form = wrapper.props().form
    let name = form.name
    expect(wrapper.state().name.clean).toBe(true)
    expect(form.errors.length).toBe(0)
    expect(form.willSubmit).toBe(false)
    expect(name.value).toBe('')
    expect(name.errors.length).toBe(0)
    expect(name.error.length).toBe(0)

    // value entered, passes validation
    wrapper.props().onChange({
      currentTarget: {
        type: 'text',
        name: 'name',
        value: 'Mark Wise'
      }
    })

    wrapper.update()
    form = wrapper.props().form
    name = form.name
    expect(wrapper.state().name.clean).toBe(false)
    expect(form.errors.length).toBe(0)
    expect(form.willSubmit).toBe(true)
    expect(name.value).toBe('Mark Wise')
    expect(name.errors.length).toBe(0)
    expect(name.error.length).toBe(0)

    // value removed, fails validation
    wrapper.props().onChange({
      currentTarget: {
        type: 'text',
        name: 'name',
        value: ''
      }
    })

    wrapper.update()
    form = wrapper.props().form
    name = form.name
    expect(wrapper.state().name.clean).toBe(false)
    expect(form.errors.length).toBe(1)
    expect(form.willSubmit).toBe(false)
    expect(name.value).toBe('')
    expect(name.errors.length).toBe(1)
    expect(name.error.length).toBeGreaterThan(0)

    // value entered, passes validation
    wrapper.props().onChange({
      currentTarget: {
        type: 'text',
        name: 'name',
        value: 'Mark Wise'
      }
    })

    wrapper.update()
    form = wrapper.props().form
    name = form.name
    expect(wrapper.state().name.clean).toBe(false)
    expect(form.errors.length).toBe(0)
    expect(form.willSubmit).toBe(true)
    expect(name.value).toBe('Mark Wise')
    expect(name.errors.length).toBe(0)
    expect(name.error.length).toBe(0)
  })
})


describe('WrappedComponent.props.onReset', () => {
  it('should reset state', () => {
    let TestForm = createWrappedForm({name: {value: ''}})
    let resetSpy = jest.spyOn(TestForm.prototype, 'reset')
    let wrapper = shallow(<TestForm />)
    let initialState = {value: '', clean: true}
    expect(wrapper.state('name')).toMatchObject(initialState)

    wrapper.props().onChange({
      currentTarget: {
        type: 'text',
        name: 'name',
        value: 'Chuck Yeager'
      }
    })

    expect(wrapper.state('name')).toMatchObject({value: 'Chuck Yeager', clean: false})
    wrapper.props().onReset({preventDefault(){}})
    expect(resetSpy).toHaveBeenCalled()
    expect(wrapper.state('name')).toMatchObject(initialState)
  })
})


describe('WrappedComponent.props.validate', () => {
  it('should validate fields', () => {
    let wrapper = createShallowWrapper({
      firstName: {rules: [rules.required()('error')]},
      lastName: {rules: [rules.required()('error')]}
    })

    let state = wrapper.state()
    expect(state.firstName.clean).toBe(true)
    expect(state.lastName.clean).toBe(true)
    let {form} = wrapper.props()
    expect(form.errors.length).toBe(0)
    let {firstName} = form
    expect(firstName.errors.length).toBe(0)
    expect(firstName.error).toBe('')
    let {lastName} = form
    expect(lastName.errors.length).toBe(0)
    expect(lastName.error).toBe('')

    wrapper.props().validate().catch(() => {})
    wrapper.update()

    state = wrapper.state()
    expect(state.firstName.clean).toBe(false)
    expect(state.lastName.clean).toBe(false)
    form = wrapper.props().form
    expect(form.errors.length).toBe(2)
    firstName = form.firstName
    expect(firstName.errors.length).toBe(1)
    expect(firstName.errors[0]).toBe('error')
    expect(firstName.error).toBe('error')
    lastName = form.lastName
    expect(lastName.errors.length).toBe(1)
    expect(lastName.errors[0]).toBe('error')
    expect(lastName.error).toBe('error')
  })

  it('should resolve promise', done => {
    let wrapper = createShallowWrapper({
      name: {
        value: 'Amelia Earhart',
        rules: [
          rules.required()('error')
        ]
      }
    })

    wrapper.props().validate().then(() => done())
  })

  it('should reject promise', done => {
    let wrapper = createShallowWrapper({
      name: {
        value: '',
        rules: [
          rules.required()('error')
        ]
      }
    })

    wrapper.props().validate().catch(() => done())
  })
})


describe('WrappedComponent.props.getFormData', () => {
  it('should resolve promise with FormData', async () => {
    let wrapper = createShallowWrapper({
      firstName: {value: 'Charles'},
      lastName: {value: 'Lindbergh'}
    })

    expect.assertions(2)
    let formData = await wrapper.props().getFormData()
    expect(formData.get('firstName')).toBe('Charles')
    expect(formData.get('lastName')).toBe('Lindbergh')
  })

  it('should filter blacklist', async () => {
    let wrapper = createShallowWrapper({
      foo: {value: 'FOO'},
      bar: {value: 'BAR'},
      baz: {value: 'BAZ'}
    })

    expect.assertions(3)
    let formData = await wrapper.props().getFormData(['baz'])
    expect(formData.get('foo')).toBe('FOO')
    expect(formData.get('bar')).toBe('BAR')
    expect(formData.has('baz')).toBe(false)
  })
})


describe('WrappedComponent.props.getFormDataAsJSON', () => {
  it('should resolve promise with JSON', async () => {
    let wrapper = createShallowWrapper({
      firstName: {value: 'Charles'},
      lastName: {value: 'Lindbergh'}
    })

    expect.assertions(1)
    let json = await wrapper.props().getFormDataAsJSON()
    expect(json).toBe('{"lastName":"Lindbergh","firstName":"Charles"}')
  })

  it('should filter blacklist', async () => {
    let wrapper = createShallowWrapper({
      foo: {value: 'FOO'},
      bar: {value: 'BAR'},
      baz: {value: 'BAZ'}
    })

    expect.assertions(1)
    let json = await wrapper.props().getFormDataAsJSON(['baz'])
    expect(json).toBe('{"bar":"BAR","foo":"FOO"}')
  })
})
