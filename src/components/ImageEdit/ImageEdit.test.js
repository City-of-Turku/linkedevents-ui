import React from 'react';
import {shallow, mount} from 'enzyme';
// these 2 mocks are for the EventMap component, i dont understand why this test needs them
jest.mock('@city-i18n/localization.json', () => ({
    mapPosition: [60.451744, 22.266601],
}),{virtual: true});

jest.mock('@city-assets/urls.json', () => ({
    rasterMapTiles: 'this is a url to the maptiles',
}),{virtual: true});
import {UnconnectedImageEdit} from './index';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {HelTextField, MultiLanguageField} from '../HelFormFields';
import {Input} from 'reactstrap';
import constants from 'src/constants';
import {mockImages, mockUser, mockEditorNewEvent} from '__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const {CHARACTER_LIMIT, VALIDATION_RULES} = constants;

const defaultImageFile = {
    lastModified: 1523945176255,
    name: 'test.jpg',
    size: 992558,
    type: 'image/jpeg',
    webkitRelativePath: '',
};
const defaultProps = {
    imageFile: defaultImageFile,
    thumbnailUrl: 'http://localhost:8080/cba659d9-5440-4a21-9b58-df53064ec763',
    user: mockUser,
    close: jest.fn,
    editor: mockEditorNewEvent,
    postImage: jest.fn,
    intl: {intl},
    updateExisting: false,
};

describe('ImageEdit', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedImageEdit {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('methods', () => {
        describe('componentDidMount', () => {
            test('if updateExisting: true, set image data to state', () => {
                const editImage = {
                    defaultName: {fi: 'default name to edit'},
                    altText: {fi: 'alt-text to edit'},
                    defaultPhotographerName: 'Phil Photo',
                };
                const wrapper = getWrapper({
                    updateExisting: true,
                    defaultName: editImage.defaultName,
                    altText: editImage.altText,
                    defaultPhotographerName: editImage.defaultPhotographerName,
                    license: 'event_only',
                });

                expect(wrapper.state('image')['name']).toEqual(editImage.defaultName);
                expect(wrapper.state('image')['altText']).toEqual(editImage.altText);
                expect(wrapper.state('image')['photographerName']).toEqual(editImage.defaultPhotographerName);
                expect(wrapper.state('license')).toBe('event_only');
            });
        });


    })

    describe('render', () => {

        describe('contains input -', () => {
            test('two MultiLanguageField with correct parameters', () => {
                const wrapper = getWrapper();
                wrapper.instance().handleChange({target:{id:'altText'}},{fi: 'finnish alt-text'});
                wrapper.instance().handleChange({target:{id:'name'}},{fi: 'finnish name'});
                const elements = wrapper.find(MultiLanguageField);
                expect(elements).toHaveLength(2);

                // first MultiLanguageField - altText
                expect(elements.at(0).prop('id')).toBe('altText');
                expect(elements.at(0).prop('validations')).toEqual([VALIDATION_RULES.MEDIUM_STRING]);
                expect(elements.at(0).prop('label')).toBe('alt-text');
                expect(elements.at(0).prop('maxLength')).toEqual(CHARACTER_LIMIT.MEDIUM_STRING);
                expect(elements.at(0).prop('defaultValue')).toEqual({fi: 'finnish alt-text'});

                // second MultiLanguageField - name
                expect(elements.at(1).prop('id')).toBe('name');
                expect(elements.at(1).prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING]);
                expect(elements.at(1).prop('label')).toBe('image-caption-limit-for-min-and-max');
                expect(elements.at(1).prop('defaultValue')).toEqual({fi: 'finnish name'});
            });
            test('HelTextField with correct parameters', () => {
                const wrapper = getWrapper();
                wrapper.instance().handleChange({target:{id:'photo'}},'Phil Photo');
                const element = wrapper.find(HelTextField);

                expect(element).toHaveLength(1);
                expect(element.prop('fullWidth')).toBeDefined();
                expect(element.prop('name')).toEqual('photographerName');
                expect(element.prop('label')).toBeDefined();
                expect(element.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING]);
                expect(element.prop('maxLength')).toEqual(CHARACTER_LIMIT.SHORT_STRING);
                expect(element.prop('defaultValue')).toEqual('Phil Photo');
            });

            test('three Input components with correct parameters', () => {
                const wrapper = getWrapper();
                const elements = wrapper.find(Input);

                expect(elements).toHaveLength(3);
                expect(elements.at(0).prop('type')).toBe('checkbox');
                expect(elements.at(1).prop('type')).toBe('radio');
                expect(elements.at(2).prop('type')).toBe('radio');
                expect(elements.at(0).prop('name')).toBe('permission');
                expect(elements.at(1).prop('name')).toBe('license_type');
                expect(elements.at(2).prop('name')).toBe('license_type');
                expect(elements.at(1).prop('value')).toBe('event_only');
                expect(elements.at(2).prop('value')).toBe('cc_by');
            });


        })


    })

})

