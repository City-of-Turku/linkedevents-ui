import React from 'react';
import {shallow, mount} from 'enzyme';
import HelTextField from '../HelTextField';
import {Input, FormText} from 'reactstrap';
import ValidationNotification from '../../ValidationNotification';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import constants from '../../../constants'
const {VALIDATION_RULES, CHARACTER_LIMIT} = constants
import {setData} from 'src/actions/editor.js'

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()
const defaultProps = {
    id: 'test-id',
    name: undefined,
    placeholder: 'placeholdervalue',
    defaultValue: 'oletusarvo',
    label: 'Otsikko',
    multiLine: false,
    required: true,
    disabled: undefined,
    validationErrors: undefined,
    type: 'text',
    index: 'text-index',
    setInitialFocus: false,
}

describe('HelTextField', () => {
    function getWrapper(props) {
        return shallow(<HelTextField {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('renders', () => {
        test('div event-input', () => {
            const div = getWrapper().find('.event-input')
            expect(div).toHaveLength(1)
        })

        describe('label', () => {
            test('with correct props', () => {
                const label = getWrapper().find('label')
                expect(label).toHaveLength(1)
                expect(label.prop('htmlFor')).toBe(defaultProps.label + defaultProps.id)
            })
            test('with correct text when required is true', () => {
                const required = true
                const label = getWrapper({required}).find('label')
                expect(label.text()).toBe(defaultProps.label + '*')
            })
            test('with correct text when required is false', () => {
                const required = false
                const label = getWrapper({required}).find('label')
                expect(label.text()).toBe(defaultProps.label)
            })
        })

        test('Input with correct props', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const inputComponent = wrapper.find(Input)

            expect(inputComponent).toHaveLength(1)
            expect(inputComponent.prop('id')).toBe(defaultProps.label + defaultProps.id)
            expect(inputComponent.prop('placeholder')).toBe(defaultProps.placeholder)
            expect(inputComponent.prop('type')).toBe(defaultProps.type)
            expect(inputComponent.prop('name')).toBe(defaultProps.name)
            expect(inputComponent.prop('value')).toBe(defaultProps.defaultValue)
            expect(inputComponent.prop('aria-required')).toBe(defaultProps.required)
            expect(inputComponent.prop('onChange')).toBe(instance.handleChange)
            expect(inputComponent.prop('onBlur')).toBe(instance.handleBlur)
            expect(inputComponent.prop('innerRef')).toBeDefined()
            expect(inputComponent.prop('disabled')).toBe(defaultProps.disabled)
        })

        describe('FormText', () => {
            test('with correct props when there is an error', () => {
                const wrapper = getWrapper()
                wrapper.setState({error: true})
                const formText = wrapper.find(FormText)
                expect(formText).toHaveLength(1)
                expect(formText.prop('role')).toBe('alert')
                expect(formText.prop('className')).toBe('red-alert')
            })

            test('with correct props when there is no error', () => {
                const wrapper = getWrapper()
                wrapper.setState({error: false})
                const formText = wrapper.find(FormText)
                expect(formText).toHaveLength(1)
                expect(formText.prop('role')).toBe(undefined)
                expect(formText.prop('className')).toBe(undefined)
            })

            test('ValidationNotification with correct props', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const ValidationNotifications = wrapper.find(ValidationNotification)
                expect(ValidationNotifications).toHaveLength(1)
                expect(ValidationNotifications.prop('index')).toBe(defaultProps.index)
                expect(ValidationNotifications.prop('anchor')).toBe(instance.inputRef)
                expect(ValidationNotifications.prop('validationErrors')).toBe(defaultProps.validationErrors)
            })
        })
    })

    describe('functions', () => {
        describe('componentDidMount', () => {
            test('calls setValidationErrorsToState', () => {
                const instance = getWrapper().instance()
                jest.spyOn(instance, 'setValidationErrorsToState')
                instance.componentDidMount()
                expect(instance.setValidationErrorsToState).toHaveBeenCalledTimes(1)
            })

            test('sets focus to ref inputRef if prop.setInitialFocus is true', () => {
                const wrapper = mount(<HelTextField {...defaultProps} setInitialFocus={true} />, {context: {intl}});
                const instance = wrapper.instance()
                const inputRef = instance.inputRef
                jest.spyOn(inputRef, 'focus')
                instance.componentDidMount()
                expect(inputRef.focus).toHaveBeenCalledTimes(1)
            })
    
            test('doesnt set focus to inputRef if prop.setInitialFocus is not true', () => {
                const wrapper = mount(<HelTextField {...defaultProps} setInitialFocus={false} />, {context: {intl}});
                const instance = wrapper.instance()
                const inputRef = instance.inputRef
                jest.spyOn(inputRef, 'focus')
                instance.componentDidMount()
                expect(inputRef.focus).toHaveBeenCalledTimes(0)
            })
        })
        

        describe('UNSAFE_componentWillReceiveProps', () => {
            test('sets state.value when props.defaultValue changes', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const expectedValue = 'test123'
                wrapper.setProps({defaultValue: expectedValue})
                expect(instance.state.value).toBe(expectedValue)
            })

            test('sets state.value to empty string when props.defaultValue changes to falsy value', () => {
                const defaultValue = 'test123'
                const wrapper = getWrapper({defaultValue})
                const instance = wrapper.instance()
                wrapper.setProps({defaultValue: null})
                expect(instance.state.value).toBe('')
            })
        })

        describe('getStringLengthValidationText', () => {

            test('returns chars left msg when there is no error and char limit exists', () => {
                const validationRules = [VALIDATION_RULES.SHORT_STRING, VALIDATION_RULES.MEDIUM_STRING, VALIDATION_RULES.LONG_STRING]
                const charLimits = [CHARACTER_LIMIT.SHORT_STRING, CHARACTER_LIMIT.MEDIUM_STRING, CHARACTER_LIMIT.LONG_STRING]
                const wrapper = getWrapper({value: 'test'})
                const instance = wrapper.instance()

                for (let index = 0; index < validationRules.length; index++) {
                    const validations = [validationRules[index]]
                    wrapper.setProps({validations})
                    const limit = charLimits[index]
                    const diff = limit - instance.state.value.length
                    const expected = instance.context.intl.formatMessage(
                        {id: 'validation-stringLengthCounter'}, {counter: diff + '/' + limit}
                    )
                    expect(instance.getStringLengthValidationText()).toBe(expected)
                }
            })

            test('returns state.errorMessage when char limit doesnt exist', () => {
                const wrapper = getWrapper({value: 'test'})
                const instance = wrapper.instance()
                const expectedError = 'test-error'
                instance.state.errorMessage = expectedError
                expect(instance.getStringLengthValidationText()).toBe(expectedError)
            })

            test('returns state.errorMessage when state.error is true', () => {
                const validations = [VALIDATION_RULES.SHORT_STRING]
                const wrapper = getWrapper({validations, value: 'test'})
                const instance = wrapper.instance()
                instance.state.error = true
                const expectedError = 'test-error'
                instance.state.errorMessage = expectedError
                expect(instance.getStringLengthValidationText()).toBe(expectedError)
            })
        })

        test('getValue returns input ref value', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            instance.inputRef = {value: 'test'}
            expect(instance.getValue()).toBe('test')
        })

        describe('helpText', () => {
            test('returns stringLengthMessage when it exists', () => {
                const validations = [VALIDATION_RULES.SHORT_STRING]
                const wrapper = getWrapper({validations, value: 'test'})
                const instance = wrapper.instance()
                expect(instance.helpText()).toBe(instance.getStringLengthValidationText())
            })

            test('returns false when field is url, there is no stringLengthMessage and state.error is true', () => {
                const validations = [VALIDATION_RULES.IS_URL]
                const wrapper = getWrapper({validations, value: 'test'})
                const instance = wrapper.instance()
                instance.state.error = true
                const expected = instance.context.intl.formatMessage({id: 'validation-isUrl'})
                expect(instance.helpText()).toBe(expected)
            })

            test('returns urlmsg when field is url, there is no stringLengthMessage and state.error is false', () => {
                const validations = [VALIDATION_RULES.IS_URL]
                const wrapper = getWrapper({validations, value: 'test'})
                const instance = wrapper.instance()
                instance.state.error = false
                expect(instance.helpText()).toBe(false)
            })

            test('returns undefined when field isnt url and there is no stringLengthMessage', () => {
                const wrapper = getWrapper({value: 'test'})
                const instance = wrapper.instance()
                expect(instance.helpText()).toBe(undefined)
            })
        })

        describe('handleChange', () => {
            const expectedValue = 'test-change'
            const event = {target: {value: expectedValue}}

            test('sets state value', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.handleChange(event)
                expect(instance.state.value).toBe(expectedValue)
            })

            test('calls setValidationErrorsToState', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                jest.spyOn(instance, 'setValidationErrorsToState')
                instance.handleChange(event)
                expect(instance.setValidationErrorsToState).toHaveBeenCalledTimes(1)
            })

            test('calls props.onChange if its a function', () => {
                const onChange = jest.fn()
                const wrapper = getWrapper({onChange})
                const instance = wrapper.instance()
                instance.handleChange(event)
                expect(onChange.mock.calls.length).toBe(1);
                expect(onChange.mock.calls[0][0]).toBe(event);
                expect(onChange.mock.calls[0][1]).toBe(expectedValue);
            })
        })

        describe('handleBlur', () => {
            const expectedValue = 'test-change'
            const event = {target: {value: expectedValue}}

            describe('if there are no validation errors, name exists and forceApplyToStore is true', () => {
                const name = 'test-name'
                
                test('calls context.dispatch', () => {
                    const wrapper = getWrapper({forceApplyToStore: true, name})
                    const instance = wrapper.instance()
                    dispatch.mockClear()
                    instance.handleBlur(event)
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(dispatch.mock.calls[0][0]).toEqual(setData({[name]: expectedValue}));
                })
                
                test('calls setDirtyState if props.setDirtyState is defined', () => {
                    const setDirtyState = jest.fn()
                    const wrapper = getWrapper({forceApplyToStore: true, name, setDirtyState})
                    const instance = wrapper.instance()
                    instance.handleBlur(event)
                    expect(setDirtyState.mock.calls.length).toBe(1);
                })
            })

            test('calls props.onBlur if it is a function', () => {
                const onBlur = jest.fn()
                const wrapper = getWrapper({onBlur})
                const instance = wrapper.instance()
                instance.handleBlur(event)
                expect(onBlur.mock.calls.length).toBe(1);
                expect(onBlur.mock.calls[0][0]).toEqual(event);
                expect(onBlur.mock.calls[0][1]).toEqual(expectedValue);
            })
        })

        describe('getValidationErrors', () => {
            const validations = [VALIDATION_RULES.IS_URL]

            test('returns an array of validation error objects when errors exist', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.inputRef = {value: 'test'}
                const expected = {'passed': false, 'rule': 'isUrl'}
                expect(instance.getValidationErrors()).toEqual([expected])
            })

            test('returns an empty array when validation errors dont exist', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.inputRef = {value: 'https://google.fi'}
                expect(instance.getValidationErrors()).toEqual([])
            })
        })

        describe('setValidationErrorsToState', () => {
            const validations = [VALIDATION_RULES.SHORT_STRING, VALIDATION_RULES.IS_URL]
            test('sets state.errors to true when there are validation errors', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.state.error = false
                instance.inputRef = {value: 'test'}
                instance.setValidationErrorsToState()
                expect(instance.state.error).toBe(true)
            })

            test('sets state.errors to false when there are no validation errors', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.state.error = true
                instance.inputRef = {value: 'https://google.fi'}
                instance.setValidationErrorsToState()
                expect(instance.state.error).toBe(false)
            })

            test('sets correct state.errorMessage when over char limit', () => {
                const limitRules = [VALIDATION_RULES.SHORT_STRING, VALIDATION_RULES.MEDIUM_STRING, VALIDATION_RULES.LONG_STRING]
                const charLimits = [CHARACTER_LIMIT.SHORT_STRING, CHARACTER_LIMIT.MEDIUM_STRING, CHARACTER_LIMIT.LONG_STRING]

                const wrapper = getWrapper()
                const instance = wrapper.instance()

                for (let index = 0; index < limitRules.length; index++) {
                    const validations = [limitRules[index]]
                    wrapper.setProps({validations})
                    const limit = charLimits[index];
                    instance.inputRef = {value: 'a'.repeat(limit + 1)}
                    instance.setValidationErrorsToState()
                    const expected = instance.context.intl.formatMessage({id: `validation-stringLimitReached`}, {limit})
                    expect(instance.state.errorMessage).toBe(expected)
                }
            })

            test('sets correct state.errorMessage when error is not char limit', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.inputRef = {value: 'not-url'}
                instance.setValidationErrorsToState()
                const expected = instance.context.intl.formatMessage({id: `validation-${VALIDATION_RULES.IS_URL}`})
                expect(instance.state.errorMessage).toBe(expected)
            })
        })

        describe('noValidationErrors', () => {
            const validations = [VALIDATION_RULES.IS_URL]
            test('returns false if there are validation errors', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.inputRef = {value: 'not-url'}
                expect(instance.noValidationErrors()).toBe(false)
            })

            test('returns true if there are no validation errors', () => {
                const wrapper = getWrapper({validations})
                const instance = wrapper.instance()
                instance.inputRef = {value: 'https://google.fi'}
                expect(instance.noValidationErrors()).toBe(true)
            })
        })
        describe('validationErrors & input invalid-prop', () => {
            const validations = [VALIDATION_RULES.REQUIRE_MULTI]
            test('validationErrors exists', () => {
                const wrapper = getWrapper({validationErrors: validations})
                const input = wrapper.find(Input)
                expect(input.prop('invalid')).toBe(true);
            })
            test('validationErrors does not exists', () => {
                const wrapper = getWrapper({validationErrors: defaultProps.validationErrors})
                const input = wrapper.find(Input)
                expect(input.prop('invalid')).toBe(false);
            })
        })
    })
})
