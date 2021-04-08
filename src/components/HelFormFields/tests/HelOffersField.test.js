import React from 'react';
import {shallow} from 'enzyme';
import HelCheckbox from '../HelCheckbox';
import {IntlProvider, FormattedMessage} from 'react-intl';
import NewOffer from '../NewOffer';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import HelOffersField from '../HelOffersField';
import {Button} from 'reactstrap';
import {addOffer, setOfferData, setFreeOffers} from 'src/actions/editor.js';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()

const defaultProps = {
    defaultValue: undefined,
    languages: ['fi'],
    validationErrors: {},
}

describe('HelOffersField', () => {
    function getWrapper(props) {
        return shallow(<HelOffersField {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('renders', () => {
        describe('checkbox', () => {
            test('correct props', () => {
                const wrapper = getWrapper()
                const checkbox = wrapper.find(HelCheckbox)
                expect(checkbox).toHaveLength(1)
                expect(checkbox.prop('fieldID')).toBe('is-free-checkbox')
                expect(checkbox.prop('defaultChecked')).toBe(true)
                expect(checkbox.prop('label')).toEqual(<FormattedMessage id='is-free'/>)
                expect(checkbox.prop('onChange')).toBeDefined()
            })
        })
        describe('button', () => {
            test('this.state.isFree true & no button', () => {
                const wrapper = getWrapper()
                const button = wrapper.find(Button)
                expect(button).toHaveLength(0)
            })
            test('this.state.isFree false, button found & correct props', () => {
                const wrapper = getWrapper()
                wrapper.setState({isFree: false})
                const button = wrapper.find(Button)
                expect(button).toHaveLength(1)
                expect(button.prop('size')).toBe('lg')
                expect(button.prop('variant')).toBe('contained')
                expect(button.prop('disabled')).toBe(false)
                expect(button.prop('block')).toBe(true)
                expect(button.prop('onClick')).toBeDefined()
            })

        })
    })
    describe('methods', () => {
        describe('setIsFree', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            const offerData = {0: {is_free: false}}
            test('setIsFree called when defaultValue is undefined', () => {
                const spy = jest.spyOn(instance, 'addNewOffer');
                instance.setIsFree()
                expect(spy).toHaveBeenCalledTimes(1)
                expect(dispatch).toHaveBeenCalledWith(setOfferData(offerData, 0))
            })
            test('setIsFree called when defaultValue is defined', () => {
                const spy = jest.spyOn(instance, 'addNewOffer');
                wrapper.setProps({defaultValue: [offerData]})
                instance.setIsFree()
                expect(spy).toHaveBeenCalledTimes(0)
                expect(dispatch).toHaveBeenCalledWith(setFreeOffers(true))
            })
        })

        describe('addNewOffer', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            const obj = {
                is_free: true,
            };
            
            test('addNewOffer called with addOffer(object)', () => {
                instance.addNewOffer()
                expect(dispatch).toHaveBeenCalledWith(addOffer(obj))
            })
        })

        describe('generateOffers', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            const offers = [{
                0: {
                    description: {fi: 'Ensimmäinen'},
                    info_url: {fi: 'www.google.fi'},
                    is_free: false,
                    price: {fi: '1'},
                },
                1: {
                    description: {fi: 'Toinen'},
                    info_url: {fi: 'www.google.fi'},
                    is_free: false,
                    price: {fi: '2'},
                },
            }]
            test('expect NewOffer to have length of offers', () => {
                const OffersWrapper = getWrapper({defaultValue: offers})
                OffersWrapper.setState({isFree: false})
                const offerDetails = OffersWrapper.instance().generateOffers(offers);
                const offerWrapper = shallow(<div className="offers">{offerDetails}</div>);
                expect(offerWrapper).toHaveLength(offers.length);
                expect(offerWrapper.find(NewOffer)).toHaveLength(offers.length);
            })
        })

        describe('componentDidUpdate', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
                instance.forceUpdate();
            });
            const offers = [{
                0: {
                    description: {fi: 'Ensimmäinen'},
                    info_url: {fi: 'www.google.fi'},
                    is_free: false,
                    price: {fi: '1'},
                },
                1: {
                    description: {fi: 'Toinen'},
                    info_url: {fi: 'www.google.fi'},
                    is_free: false,
                    price: {fi: '2'},
                },
            }]

            test('defaultValue equal to state.values', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const expectedValue = offers
                wrapper.setState({isFree: false})
                wrapper.setProps({defaultValue: expectedValue})
                expect(instance.state.values).toEqual(expectedValue)
            })
            test('clearing defaultValues & dispatch of setFreeOffers', () => {
                const expectedValue = offers
                wrapper.setState({isFree: false})
                wrapper.setProps({defaultValue: expectedValue})

                expect(wrapper.state('values')).toEqual(expectedValue)
                wrapper.setProps({defaultValue: undefined})
                
                expect(dispatch).toHaveBeenCalledWith(setFreeOffers(true))
            })
        })
    })
})


