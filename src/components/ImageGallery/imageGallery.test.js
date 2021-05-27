import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedImageGallery} from './ImageGallery';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Button} from 'reactstrap';
import ImageEdit from '../ImageEdit';
import ImagePickerForm from '../ImagePicker';
import ValidationNotification from 'src/components/ValidationNotification'
import constants from '../../constants'
const {VALIDATION_RULES} = constants
import {mockImages} from '__mocks__/mockData';


const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    openEditModal: false,
    openOrgModal: false,
    fetchDefaults: true,
    validationErrors: undefined,
    editor: {
        values: {
            image: {
                url: '',
            },
        },
    },
    images: {
        defaultImages: null,
    },
    fetchUserImages: jest.fn(),
}


describe('ImageGallery', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedImageGallery {...defaultProps} {...props}/>, {context: {intl}});
    }
    describe('components', () => {
        describe('buttons', () => {
            test('contains correct props', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const element = wrapper.find(Button)
                expect(element).toHaveLength(2);
                expect(element.at(0).prop('onClick')).toBe(instance.toggleEditModal);
                expect(element.at(1).prop('onClick')).toBe(instance.toggleOrgModal);
            });
        })
        describe('formattedMessages', () => {
            test('correct amount', () => {
                const element = getWrapper().find(FormattedMessage);
                expect(element).toHaveLength(4);
            })
        })
        describe('imageEdit', () => {
            test('contains correct props', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const imageEdit = wrapper.find(ImageEdit)
                expect(imageEdit).toHaveLength(1)
                expect(imageEdit.prop('open')).toBe(instance.state.openEditModal)
                expect(imageEdit.prop('close')).toBe(instance.toggleEditModal)
            })
        })
        describe('imagePickerForm', () => {
            test('contains correct props', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const imagePicker = wrapper.find(ImagePickerForm)
                expect(imagePicker).toHaveLength(1)
                expect(imagePicker.prop('label')).toBe('image-preview')
                expect(imagePicker.prop('name')).toBe('image')
                expect(imagePicker.prop('loading')).toBe(false)
                expect(imagePicker.prop('isOpen')).toBe(instance.state.openOrgModal)
                expect(imagePicker.prop('close')).toBe(instance.toggleOrgModal)
            })
        })
        describe('validationNotification', () => {
            test('contains correct props', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const notification = wrapper.find(ValidationNotification)
                expect(notification).toHaveLength(1)
                expect(notification.prop('anchor')).toBe(null)
                expect(notification.prop('validationErrors')).toBe(undefined)
                expect(notification.prop('className')).toBe('validation-notification')
            })
        })
    })
    describe('methods', () => {
        describe('states', () => {
            test('first Button toggles openEditModal', () => {
                const wrapper = getWrapper();
                const element = wrapper.find(Button).at(0)
                expect(element).toHaveLength(1);
                expect(wrapper.state('openEditModal')).toBe(false);
                element.simulate('click')
                expect(wrapper.state('openEditModal')).toBe(true);
            });
            test('second Button toggles openOrgModal', () => {
                const wrapper = getWrapper();
                const element = wrapper.find(Button).at(1)
                expect(element).toHaveLength(1);
                expect(wrapper.state('openOrgModal')).toBe(false);
                element.simulate('click')
                expect(wrapper.state('openOrgModal')).toBe(true);
            });
            test('componentDidUpdate changes fetchDefaults', () => {
                const wrapper = getWrapper()
                wrapper.setState({fetchDefaults: true});
                const instance = wrapper.instance();
                instance.componentDidMount();
                expect(wrapper.state('fetchDefaults')).toBe(false)
            })
        })
        describe('functions', () => {
            describe('fetchUserImages', () => {
                test('is called', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    instance.componentDidMount()
                    expect(defaultProps.fetchUserImages).toHaveBeenCalled()
                })
                test('is not called while fetchDefaults is false', () => {
                    const wrapper = getWrapper()
                    wrapper.setState({fetchDefaults: false});
                    const instance = wrapper.instance();
                    defaultProps.fetchUserImages.mockClear()
                    instance.componentDidMount()
                    expect(defaultProps.fetchUserImages).not.toHaveBeenCalled()
                })
            })
            describe('toggleEditModal', () => {
                test('openEditModal-state changes', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    expect(wrapper.state('openEditModal')).toBe(false)
                    instance.toggleEditModal()
                    expect(wrapper.state('openEditModal')).toBe(true)
                })
            })
            describe('toggleOrgModal', () => {
                test('openOrgModal-state changes', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    expect(wrapper.state('openOrgModal')).toBe(false)
                    instance.toggleOrgModal()
                    expect(wrapper.state('openOrgModal')).toBe(true)
                })
            })
            describe('getPreview', () => {
                test('default return', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    instance.getPreview({backgroundImage: ''})
                    const previewDiv = wrapper.find('div.image-picker--preview')
                    expect(previewDiv).toHaveLength(1)
                })
                test('return with validationError', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    instance.getPreview({backgroundImage: ''})
                    wrapper.setProps({validationErrors: [VALIDATION_RULES.REQUIRED_IMAGE]})
                    const previewDiv = wrapper.find('div.image-picker--preview.validationError')
                    expect(previewDiv).toHaveLength(1)
                })
                test('return with image', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const testImage = wrapper.setProps(defaultProps.editor.values.image.url = 'https://test.fi')
                    instance.getPreview({backgroundImage: testImage})
                    const previewDiv = wrapper.find('div.image-picker.background')
                    expect(previewDiv).toHaveLength(1)
                })
            })
        })
    })
})
