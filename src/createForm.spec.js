import React, {Component} from 'react'
import {mount, shallow} from 'enzyme'
import {createForm} from './createForm'
import {rules} from './rules'

const createWrapper = fields => {
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
    let wrapper = createWrapper({name: {}})
    let {name} = wrapper.state()
    expect(name.value).toBe('')
    // label, rules and clean are set for fields that will validate
    expect(name.label).toBe(void 0)
    expect(name.rules).toBe(void 0)
    expect(name.clean).toBe(void 0)
  })

  it('should init default values for fields that will validate', () => {
    let rules = [() => {}]
    let wrapper = createWrapper({name: {rules}})
    let {name} = wrapper.state()
    expect(name.value).toBe('')
    expect(name.label).toBe('')
    expect(name.rules).toBe(rules)
    expect(name.clean).toBe(true)
  })

  it('should not init default values for fields that will validate', () => {
    // rules must have at least one validation function
    let wrapper = createWrapper({name: {rules: []}})
    let {name} = wrapper.state()
    expect(name.value).toBe('')
    expect(name.label).toBe(void 0)
    expect(name.rules).toBe(void 0)
    expect(name.clean).toBe(void 0)
  })

  it('should init values', () => {
    let wrapper = createWrapper({name: {value: 'Mark Wise'}})
    let {name} = wrapper.state()
    expect(name.value).toBe('Mark Wise')
  })

  it('should init values for fields that will validate', () => {
    let rules = [() => {}]
    let fields = {name: {value: 'Mark Wise', label: 'Name', rules}}
    let wrapper = createWrapper(fields)
    let {name} = wrapper.state()
    expect(name.value).toBe('Mark Wise')
    expect(name.label).toBe('Name')
    expect(name.rules).toBe(rules)
    expect(name.clean).toBe(true)
  })
})


describe('wrapped component', () => {
  it('should have props', () => {
    let wrapper = createWrapper({})
    let props = wrapper.props()
    expect(props.form).toEqual(expect.any(Object))
    expect(props.onChange).toEqual(expect.any(Function))
    expect(props.onReset).toEqual(expect.any(Function))
    expect(props.validate).toEqual(expect.any(Function))
    expect(props.getFormData).toEqual(expect.any(Function))
    expect(props.getFormDataAsJSON).toEqual(expect.any(Function))
  })

  it('props.form should have shape', () => {
    let wrapper = createWrapper({})
    let props = wrapper.props()
    let {form} = props
    let {errors, willSubmit} = form
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    // Will be true when there are no fields to validate
    expect(willSubmit).toBe(true)
  })

  it('props.form should have shape when fields will validate', () => {
    let wrapper = createWrapper({name: {rules: [() => {}]}})
    let props = wrapper.props()
    let {form} = props
    let {errors, willSubmit} = form
    expect(errors).toEqual(expect.any(Array))
    expect(errors.length).toBe(0)
    // Will be false until all fields that will validate pass validation
    expect(willSubmit).toBe(false)
  })

  it('props.form.<field> should have shape', () => {
    let wrapper = createWrapper({name: {}})
    let props = wrapper.props()
    let {value, errors, error} = props.form.name
    expect(value).toBe('')
    // errors and error exist if the field will validate
    expect(errors).toBe(void 0)
    expect(error).toBe(void 0)
  })

  it('props.form.<field> should have shape when field will validate', () => {
    let wrapper = createWrapper({name: {rules: [() => {}]}})
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
    let wrapper = createWrapper({name: {}})
    expect(wrapper.state().name.value).toBe('')
    expect(wrapper.props().form.name.value).toBe('')

    wrapper.props().onChange({
      currentTarget: {
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
    let wrapper = createWrapper({colors: {value: []}})
    expect(wrapper.state().colors.value).toEqual([])
    expect(wrapper.props().form.colors.value).toEqual([])

    wrapper.props().onChange({
      currentTarget: {
        type: 'select-multiple',
        name: 'colors',
        value: '',
        selectedOptions: [{value: 'RED'}, {value: 'GREEN'}, {value: 'BLUE'}]
      }
    })

    wrapper.update()
    expect(wrapper.state().colors.value).toEqual(['RED', 'GREEN', 'BLUE'])
    expect(wrapper.props().form.colors.value).toEqual(['RED', 'GREEN', 'BLUE'])

    wrapper.props().onChange({
      currentTarget: {
        type: 'select-multiple',
        name: 'colors',
        value: '',
        selectedOptions: [{value: 'GREEN'}]
      }
    })

    wrapper.update()
    expect(wrapper.state().colors.value).toEqual(['GREEN'])
    expect(wrapper.props().form.colors.value).toEqual(['GREEN'])
  })

  it('should manage checkbox types', () => {
    let wrapper = createWrapper({yes: {}})
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
    let wrapper = createWrapper({resume: {}})
    let resume = wrapper.state().resume
    expect(resume.files).toBe(void 0)
    expect(resume.value).toBe('')
    expect(wrapper.props().form.resume.value).toBe('')

    wrapper.props().onChange({
      currentTarget: {
        type: 'file',
        name: 'resume',
        value: 'C:\\fakepath\\Foo Bar.docx',
        files: []
      }
    })

    wrapper.update()
    resume = wrapper.state().resume
    expect(resume.files).toEqual(expect.any(Array))
    expect(resume.value).toBe('C:\\fakepath\\Foo Bar.docx')
    expect(wrapper.props().form.resume.value).toBe('C:\\fakepath\\Foo Bar.docx')
  })

  it('should manage validation lifecycle', () => {
    let wrapper = createWrapper({name: {rules: [rules.required()()]}})
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
