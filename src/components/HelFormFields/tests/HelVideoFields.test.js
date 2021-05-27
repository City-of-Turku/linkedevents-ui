import React from 'react';
import {mount} from 'enzyme';
import {mockEditorNewEvent} from '__mocks__/mockData';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

jest.mock('@city-i18n/localization.json', () => ({
    mapPosition: [60.451744, 22.266601],
}),{virtual: true});

jest.mock('@city-assets/urls.json', () => ({
    rasterMapTiles: 'this is a url to the maptiles',
}),{virtual: true});

import {UnconnectedHelVideoFields} from '../HelVideoFields/HelVideoFields';
import {SideField} from '../../FormFields';
import {HelTextField} from '../index';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages});
const {intl} = intlProvider.getChildContext();
const mockEditor = mockEditorNewEvent;



describe('HelVideoFields', () => {
    const defaultProps = {
        action: 'create',
        setData: jest.fn(),
        clearVideos: jest.fn(),
        validationErrors: {},
        setDirtyState: jest.fn(),
        languages: mockEditor.contentLanguages,
        intl: {intl},
        editorValues: {},
        defaultValues: [],
    };
    const MOCK_VIDEO = {
        url: 'http://www.turku.fi/',
        name: {fi: 'This is the finnish name of the first video'},
        alt_text: {fi: 'This is the finnish alt text for the first video.'},
    };
    const MOCK_VIDEO_2 = {
        url: 'http://www.turku.fi/sv',
        name: {fi: 'This is the finnish name of the second video'},
        alt_text: {fi: 'This is the finnish alt text for the second video.'},
    };

    const EMPTY_VIDEO = {
        url: '',
        name: {},
        alt_text: {},
    };

    function getWrapper(props) {
        return mount(<UnconnectedHelVideoFields {...defaultProps} {...props} />, {context: {intl}});
    }


    describe('methods', () => {

        describe('componentDidMount', () => {
            let componentDidMount;
            let wrapper;

            beforeEach(() => {
                componentDidMount = jest.spyOn(UnconnectedHelVideoFields.prototype, 'componentDidMount');
            });

            afterEach(() => {
                wrapper.unmount();
            });

            test('has been called when mounted', () => {
                wrapper = getWrapper();

                expect(componentDidMount).toHaveBeenCalled();
            });

            test('sets defaultValues to state', () => {
                wrapper = getWrapper({defaultValues:[MOCK_VIDEO]});

                expect(componentDidMount).toHaveBeenCalled();
                expect(wrapper.state()).toEqual({
                    videos:[MOCK_VIDEO],
                });
            });

            test('sets empty video object to state if no defaultValues', () => {
                wrapper = getWrapper();

                expect(wrapper.state()).toEqual({
                    videos:[EMPTY_VIDEO],
                });
            });
        });

        describe('componentDidUpdate', () => {
            test('setData is called with correct prop if prevProps.languages !== this.props.languages', () => {
                const multiLangVideo = _.cloneDeep(MOCK_VIDEO);
                multiLangVideo.name.sv = 'This is the swedish name of the video';
                multiLangVideo.alt_text.sv = 'This is the swedish alt text of the video';
                let wrapper = getWrapper({defaultValues:[multiLangVideo]});
                let instance = wrapper.instance();
                const spy = jest.spyOn(instance.props,'setData');

                wrapper.setProps({languages:['fi']});
                expect(spy).toHaveBeenCalledWith({videos: [MOCK_VIDEO]});
                wrapper.unmount();
            });

            test('if prevProps.action was update && this.props.action is create -> clear state by setting it to an empty video', () =>{
                const wrapper = getWrapper({defaultValues:[MOCK_VIDEO], action: 'update'});
                expect(wrapper.state()).toEqual({videos:[MOCK_VIDEO]});
                wrapper.setProps({action: 'create'});
                expect(wrapper.state()).toEqual({videos:[EMPTY_VIDEO]});
            });

        });

        describe('handleBlur', () => {
            let wrapper;


            afterEach(() => {
                wrapper.unmount();
            });

            test('calls setData ', () => {
                wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(instance.props, 'setData');
                const correctVideo = _.cloneDeep(MOCK_VIDEO);

                instance.handleBlur({},{},[correctVideo]);
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('handleChange', () => {
            test('changes a video', () => {
                const wrapper = getWrapper({defaultValues: [MOCK_VIDEO]});
                const instance = wrapper.instance();

                expect(wrapper.state()).toEqual({videos: [MOCK_VIDEO]});
                instance.handleChange({}, {fi: 'New name for the video'},'name', 0);

                const expectedValue = Object.assign({}, MOCK_VIDEO);
                expectedValue.name.fi = 'New name for the video';
                expect(wrapper.state()).toEqual({videos: [expectedValue]})
            });

            test('changes correct video according to index', () => {
                const expectedValue = Object.assign({}, MOCK_VIDEO);
                expectedValue.name.fi = 'Finnish name';
                const wrapper = getWrapper({defaultValues: [MOCK_VIDEO, MOCK_VIDEO_2]});
                const instance = wrapper.instance();

                expect(wrapper.state()).toEqual({videos: [MOCK_VIDEO, MOCK_VIDEO_2]});

                instance.handleChange({},{fi: 'Finnish name'},'name',0);
                expect(wrapper.state()).toEqual({videos: [expectedValue, MOCK_VIDEO_2 ]});

            });
        });

        describe('handleAddVideo', () => {
            test('adds a video to state' ,() => {
                const wrapper = getWrapper();

                expect(wrapper.state()['videos'].length).toBe(1);

                wrapper.instance().handleAddVideo();
                expect(wrapper.state()['videos'].length).toBe(2);

                wrapper.instance().handleAddVideo();
                expect(wrapper.state()['videos'].length).toBe(3);
            });
        });

        describe('handleDeleteVideo', () => {
            test('removes video at index', () => {
                const wrapper = getWrapper({defaultValues: [MOCK_VIDEO]});

                wrapper.instance().handleAddVideo();
                expect(wrapper.state()['videos'].length).toBe(2);

                wrapper.instance().handleDeleteVideo(0);
                expect(wrapper.state()['videos'].length).toBe(1);
                expect(wrapper.state()['videos'][0]).not.toBe(MOCK_VIDEO);
            });
        });

        describe('checkIfRequired', () => {
            let wrapper;
            let instance;

            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            })

            afterEach(() => {
                wrapper.unmount();
            })

            test('returns true if object contains a value', () => {
                const partialVideo = _.cloneDeep(EMPTY_VIDEO);
                partialVideo.name.fi = 'This is a new name for the vi'
                const actual = instance.checkIfRequired(partialVideo);

                expect(actual).toBe(true);
            });

            test('returns false if object contains no values', () => {
                const emptyVideo = _.cloneDeep(EMPTY_VIDEO);
                const actual = instance.checkIfRequired(emptyVideo);

                expect(actual).toBe(false);
            });

        });

    });

    describe('render', () => {

        describe('HelTextField', () => {
            test('correct amount of HelTextFields, 1 + 2 * amount of languages', () => {
                const contentLanguages = ['fi']; // length = 1

                let wrapper = getWrapper({languages: contentLanguages});
                let textFieldElements = wrapper.find(HelTextField);

                // textFieldElements should be 3
                expect(textFieldElements).toHaveLength(1 + 2 * contentLanguages.length);

                contentLanguages.push('sv'); // length = 2
                wrapper = getWrapper({languages: contentLanguages});
                textFieldElements = wrapper.find(HelTextField);

                // textFieldElements length should be 5
                expect(textFieldElements).toHaveLength(1 + 2 * contentLanguages.length);

                contentLanguages.push('en'); // length = 3
                wrapper = getWrapper({languages: contentLanguages});
                textFieldElements = wrapper.find(HelTextField);

                // textFieldElements length should be 7
                expect(textFieldElements).toHaveLength(1 + 2 * contentLanguages.length);
            });

            test('required prop changes true/false depending on if a value has been added', () => {
                const wrapper = getWrapper();
                function randomKey(foo) {
                    return foo[Math.floor(Math.random() * foo.length)];
                }

                let textFieldElements = wrapper.find(HelTextField);
                expect(textFieldElements.at(randomKey([0, 1, 2])).prop('required')).toBe(false);

                wrapper.instance().handleChange({},{fi:'finnish alt text'},'alt_text', 0);
                wrapper.update();

                textFieldElements = wrapper.find(HelTextField);
                expect(textFieldElements.at(randomKey([0, 1, 2])).prop('required')).toBe(true);

                wrapper.instance().handleChange({},{fi:''},'alt_text', 0);
                wrapper.update();

                textFieldElements = wrapper.find(HelTextField);
                expect(textFieldElements.at(randomKey([0, 1, 2])).prop('required')).toBe(false);
            });
        });
    });
});

