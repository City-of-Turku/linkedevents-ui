import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import {Button} from 'reactstrap'

import fiMessages from 'src/i18n/fi.json';
import PageChangeButtons from '../PageChangeButtons'

describe('CustomTablePagination/PageChangeButtons', () => {
    const testMessages = mapValues(fiMessages, (value, key) => value);
    const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
    const {intl} = intlProvider.getChildContext();

    const defaultProps = {
        page: 0,
        onChangePage: jest.fn(),
        previousPageExists: false,
        nextPageExists: false,
        intl,
    }

    function getWrapper(props) {
        return shallow(<PageChangeButtons {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        test('div with two buttons', () => {
            const wrapper = getWrapper()
            expect(wrapper.find('div')).toHaveLength(1)
            expect(wrapper.find(Button)).toHaveLength(2)
        })

        describe('previous button', () => {
            describe('with correct props', () => {
                test('when previous page exists', () => {
                    const previousPageExists = true
                    const page = 1
                    const wrapper = getWrapper({previousPageExists, page})
                    const previousButton = wrapper.find(Button).first()
                    expect(previousButton.length).toBe(1)
                    expect(previousButton.prop('onClick')).toBeDefined()
                    expect(previousButton.prop('aria-label')).toBe(intl.formatMessage({id: 'table-pagination-previous-page'}))
                    expect(previousButton.prop('disabled')).toBe(!previousPageExists)
                    expect(previousButton.prop('size')).toBe('sm')
                    expect(previousButton.children().text()).toBe('<')
                })
                
                test('when previous page doesnt exist', () => {
                    const previousPageExists = false
                    const page = 0
                    const wrapper = getWrapper({previousPageExists, page})
                    const previousButton = wrapper.find(Button).first()
                    expect(previousButton.length).toBe(1)
                    expect(previousButton.prop('onClick')).not.toBeDefined()
                    expect(previousButton.prop('aria-label')).toBe(intl.formatMessage({id: 'table-pagination-previous-page'}))
                    expect(previousButton.prop('disabled')).toBe(!previousPageExists)
                    expect(previousButton.prop('size')).toBe('sm')
                    expect(previousButton.children().text()).toBe('<')
                })
            })

            describe('next button', () => {
                describe('with correct props', () => {
                    test('when next page exists', () => {
                        const nextPageExists = true
                        const page = 0
                        const wrapper = getWrapper({nextPageExists, page})
                        const nextButton = wrapper.find(Button).last()
                        expect(nextButton.length).toBe(1)
                        expect(nextButton.prop('onClick')).toBeDefined()
                        expect(nextButton.prop('aria-label')).toBe(intl.formatMessage({id: 'table-pagination-next-page'}))
                        expect(nextButton.prop('disabled')).toBe(!nextPageExists)
                        expect(nextButton.prop('size')).toBe('sm')
                        expect(nextButton.children().text()).toBe('>')
                    })
                    
                    test('when next page doesnt exist', () => {
                        const nextPageExists = false
                        const page = 1
                        const wrapper = getWrapper({nextPageExists, page})
                        const nextButton = wrapper.find(Button).last()
                        expect(nextButton.length).toBe(1)
                        expect(nextButton.prop('onClick')).not.toBeDefined()
                        expect(nextButton.prop('aria-label')).toBe(intl.formatMessage({id: 'table-pagination-next-page'}))
                        expect(nextButton.prop('disabled')).toBe(!nextPageExists)
                        expect(nextButton.prop('size')).toBe('sm')
                        expect(nextButton.children().text()).toBe('>')
                    })
                })
            })
        })
    })

    describe('onChangePage', () => {
        beforeEach(() => {
            defaultProps.onChangePage.mockReset()
        })

        describe('on previousButton', () => {
            test('is called when previous page exists', () => {
                const previousPageExists = true
                const page = 1
                const previousButton = getWrapper({previousPageExists, page}).find(Button).first()
                previousButton.simulate('click')
                expect(defaultProps.onChangePage).toHaveBeenCalled()
            })

            test('is not called when previous page doesnt exist', () => {
                const previousPageExists = false
                const page = 1
                const previousButton = getWrapper({previousPageExists, page}).find(Button).first()
                previousButton.simulate('click')
                expect(defaultProps.onChangePage).not.toHaveBeenCalled()
            })
        })

        describe('on nextButton', () => {
            test('is called when next page exists', () => {
                const nextPageExists = true
                const page = 1
                const nextButton = getWrapper({nextPageExists, page}).find(Button).last()
                nextButton.simulate('click')
                expect(defaultProps.onChangePage).toHaveBeenCalled()
            })

            test('is not called when next page doesnt exist', () => {
                const nextPageExists = false
                const page = 1
                const nextButton = getWrapper({nextPageExists, page}).find(Button).last()
                nextButton.simulate('click')
                expect(defaultProps.onChangePage).not.toHaveBeenCalled()
            })
        })
    })
})
