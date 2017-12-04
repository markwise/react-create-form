import React, {Component} from 'react'
import {mount, shallow} from 'enzyme'
import {createForm} from './createForm'
import {rules} from './rules'

const createShallowWrapper = fields => {
  let Form = () => <form></form>
  let TestForm = createForm(Form, fields)
  return shallow(<TestForm />)
}

describe('hoc', () => {
  it('should have prototype', () => {
    let Form = () => <form></form>
    let TestForm = createForm(Form, {})
    let p = TestForm.prototype
    expect(p.handleChange).toEqual(expect.any(Function))
    expect(p.handleReset).toEqual(expect.any(Function))
    expect(p.validate).toEqual(expect.any(Function))
    expect(p.getFormData).toEqual(expect.any(Function))
    expect(p.getFormDataAsJSON).toEqual(expect.any(Function))
  })

  it('should init default values', () => {
    let wrapper = createShallowWrapper({name: {}})
    let {name} = wrapper.state()
    expect(name.value).toBe('')
    // label, rules and clean should only be set for fields that will validate
    expect(name).not.toHaveProperty('label')
    expect(name).not.toHaveProperty('rules')
    expect(name).not.toHaveProperty('clean')
  })

  it('should init default values for fields that will validate', () => {
    let rules = [() => {}]
    let wrapper = createShallowWrapper({name: {rules}})
    let {name} = wrapper.state()
    expect(name.value).toBe('')
    expect(name.label).toBe('')
    expect(name.rules).toBe(rules)
    expect(name.clean).toBe(true)
  })

  it('should not init default values for fields that will validate', () => {
    let wrapper = createShallowWrapper({name: {rules: []}})
    let {name} = wrapper.state()
    expect(name.value).toBe('')
    // rules must have at least one validation function for label, rules and
    // clean to be set
    expect(name).not.toHaveProperty('label')
    expect(name).not.toHaveProperty('rules')
    expect(name).not.toHaveProperty('clean')
  })

  it('should init values', () => {
    let wrapper = createShallowWrapper({name: {value: 'Mark Wise'}})
    let {name} = wrapper.state()
    expect(name.value).toBe('Mark Wise')
  })

  it('should init values for fields that will validate', () => {
    let rules = [() => {}]
    let fields = {name: {value: 'Mark Wise', label: 'Name', rules}}
    let wrapper = createShallowWrapper(fields)
    let {name} = wrapper.state()
    expect(name.value).toBe('Mark Wise')
    expect(name.label).toBe('Name')
    expect(name.rules).toBe(rules)
    expect(name.clean).toBe(true)
  })
})


describe('wrapped component', () => {
  it('should have props', () => {
    let wrapper = createShallowWrapper({})
    let props = wrapper.props()
    expect(props.form).toEqual(expect.any(Object))
    expect(props.onChange).toEqual(expect.any(Function))
    expect(props.onReset).toEqual(expect.any(Function))
    expect(props.validate).toEqual(expect.any(Function))
    expect(props.getFormData).toEqual(expect.any(Function))
    expect(props.getFormDataAsJSON).toEqual(expect.any(Function))
  })

  it('props.form should have shape', () => {
    let wrapper = createShallowWrapper({})
    let props = wrapper.props()
    let {form} = props
    let {errors, willSubmit} = form
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    // Always true when there are no fields to validate
    expect(willSubmit).toBe(true)
  })

  it('props.form should have shape when fields will validate', () => {
    let wrapper = createShallowWrapper({name: {rules: [() => {}]}})
    let props = wrapper.props()
    let {form} = props
    let {errors, willSubmit} = form
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    // Will be false until all fields that will validate pass validation
    expect(willSubmit).toBe(false)
  })

  it('props.form.<field> should have shape', () => {
    let wrapper = createShallowWrapper({name: {}})
    let props = wrapper.props()
    let {name} = props.form
    expect(name.value).toBe('')
    // errors and error exist if the field will validate
    expect(name).not.toHaveProperty('errors')
    expect(name).not.toHaveProperty('error')
  })

  it('props.form.<field> should have shape when field will validate', () => {
    let wrapper = createShallowWrapper({name: {rules: [() => {}]}})
    let props = wrapper.props()
    let {value, errors, error} = props.form.name
    expect(value).toBe('')
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    expect(error).toBe('')
  })
})


describe('wrapped component props.onChange', () => {
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


describe('wrapped component props.onReset', () => {
  it('should reset state', () => {
    let wrapper = createShallowWrapper({
      firstName: {rules: [() => {}]},
      lastName: {rules: [() => {}]}
    })

    let initialState = {
      firstName: {value: '', clean: true},
      lastName: {value: '', clean: true}
    }

    expect(wrapper.state()).toMatchObject(initialState)

    wrapper.props().onChange({
      currentTarget: {
        type: 'text',
        name: 'firstName',
        value: 'Mark'
      }
    })

    wrapper.props().onChange({
      currentTarget: {
        type: 'text',
        name: 'lastName',
        value: 'Wise'
      }
    })

    expect(wrapper.state()).toMatchObject({
      firstName: {value: 'Mark', clean: false},
      lastName: {value: 'Wise', clean: false}
    })

    wrapper.props().onReset({preventDefault(){}})
    expect(wrapper.state()).toMatchObject(initialState)
  })
})


describe('wrapped component props.validate', () => {
  it('should validate fields', () => {
    let wrapper = createShallowWrapper({
      firstName: {rules: [rules.required()()]},
      lastName: {rules: [rules.required()()]}
    })

    expect(wrapper.state()).toMatchObject({
      firstName: {clean: true},
      lastName: {clean: true}
    })

    let props = wrapper.props()
    let form = props.form
    expect(form).toMatchObject({
      errors: [],
      firstName: {errors: [], error: ''},
      lastName: {errors: [], error: ''}
    })

    props.validate(form).catch(() => {})
    wrapper.update()

    expect(wrapper.state()).toMatchObject({
      firstName: {clean: false},
      lastName: {clean: false}
    })

    form = wrapper.props().form
    expect(form.errors.length).toBe(2)
    let {firstName} = form
    expect(firstName.errors.length).toBe(1)
    expect(firstName.error.length).toBeGreaterThan(0)
    let {lastName} = form
    expect(lastName.errors.length).toBe(1)
    expect(lastName.error.length).toBeGreaterThan(0)
  })

  it('should resolve promise', done => {
    let wrapper = createShallowWrapper({})
    wrapper.props().validate({willSubmit: true}).then(() => done())
  })

  it('should reject promise', done => {
    let wrapper = createShallowWrapper({})
    wrapper.props().validate({willSubmit: false}).catch(() => done())
  })
})


describe('wrapped component props.getFormData', () => {})


describe('wrapped component props.getFormDataAsJSON', () => {})
