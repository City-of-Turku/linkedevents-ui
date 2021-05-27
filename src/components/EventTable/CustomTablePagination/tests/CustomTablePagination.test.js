import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';

import fiMessages from 'src/i18n/fi.json';

import {CustomTablePaginationWithoutIntl} from '../index'
import PageChangeButtons from '../PageChangeButtons';

describe('CustomTablePagination', () => {
    const testMessages = mapValues(fiMessages, (value, key) => value);
    const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
    const {intl} = intlProvider.getChildContext();

    const defaultProps = {
        count: 35,
        rowsPerPage: 25,
        rowsPerPageOptions: ['10', '25', '50', '100'],
        page: 0,
        onChangePage: () => {},
        onChangeRowsPerPage: () => {},
        labelDisplayedRows: ({from, to, count}) => `${from}-${to} / ${count}`,
        labelRowsPerPage: 'rows per page',
        intl,
        shortcutElementId: 'shortcut-id',
    }

    function getWrapper(props) {
        return shallow(<CustomTablePaginationWithoutIntl {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        test('td', () => {
            const wrapper = getWrapper();
            const td = wrapper.find('td')
            expect(td.length).toBe(1)
            expect(td.prop('colSpan')).toBe('1000')
        })

        test('flex container div', () => {
            expect(getWrapper().find('.flex-container').length).toBe(1)
        })

        test('spacer div', () => {
            expect(getWrapper().find('.custom-table-pagination__spacer').length).toBe(1)
        })

        test('content div', () => {
            expect(getWrapper().find('.custom-table-pagination__content').length).toBe(1)
        })

        describe('rows per page', () => {
            describe('when there are atleast one option', () => {
                const wrapper = getWrapper();
                test('label with correct props', () => {
                    const content = wrapper.find('.custom-table-pagination__content')
                    const label = content.find('label')
                    expect(label.length).toBe(1)
                    expect(label.prop('htmlFor')).toBe('page-counts')
                    expect(label.text()).toBe(defaultProps.labelRowsPerPage)
                })

                test('select with correct props', () => {
                    const select = wrapper.find('#page-counts')
                    expect(select.length).toBe(1)
                    expect(select.prop('name')).toBe('page-counts')
                    expect(select.prop('value')).toBe(defaultProps.rowsPerPage)
                    expect(select.prop('onChange')).toBe(defaultProps.onChangeRowsPerPage)
                })

                test('select options with correct props', () => {
                    const options = wrapper.find('option')
                    expect(options.length).toBe(4)
                    options.forEach((option, index) => {
                        expect(option.key()).toBe(defaultProps.rowsPerPageOptions[index])
                        expect(option.prop('value')).toBe(defaultProps.rowsPerPageOptions[index])
                        expect(option.text()).toBe(defaultProps.rowsPerPageOptions[index])
                    })
                })
            })

            describe('when there are no options', () => {
                const rowsPerPageOptions = []
                const wrapper = getWrapper({rowsPerPageOptions})
                test('label isnt rendered', () => {
                    const content = wrapper.find('.custom-table-pagination__content')
                    const label = content.find('label')
                    expect(label.length).toBe(0)
                })

                test('select isnt rendered', () => {
                    const select = wrapper.find('#page-counts')
                    expect(select.length).toBe(0)
                })

                test('select isnt rendered', () => {
                    const options = wrapper.find('option')
                    expect(options.length).toBe(0)
                })
            })
        })

        test('visually hidden table pagination results & table page number', () => {
            const paginationResults = getWrapper().find('.visually-hidden')
            const tableResults = intl.formatMessage({id:'table-pagination-results'}, {from: 1, to: 25, count: 35})
            const tableNumber = intl.formatMessage({id:'table-events-page-number'}) + ' ' + (defaultProps.page + 1)
            expect(paginationResults.length).toBe(1)
            expect(paginationResults.prop('role')).toBe('status')
            expect(paginationResults.text()).toEqual(tableResults + ' ' + tableNumber)
        })

        test('aria hidden displayed rows label', () => {
            const from = 1
            const to = 25
            const count = defaultProps.count
            const displayRowsLabel = getWrapper().find('p').last()
            expect(displayRowsLabel.length).toBe(1)
            expect(displayRowsLabel.prop('aria-hidden')).toBe(true)
            expect(displayRowsLabel.text()).toBe(defaultProps.labelDisplayedRows({from, to, count}))
        })

        test('PageChangeButtons with correct props', () => {
            const pageChangeButtons = getWrapper().find(PageChangeButtons)
            expect(pageChangeButtons.length).toBe(1)
            expect(pageChangeButtons.prop('page')).toBe(defaultProps.page)
            expect(pageChangeButtons.prop('onChangePage')).toBe(defaultProps.onChangePage)
            expect(pageChangeButtons.prop('previousPageExists')).toBe(false)
            expect(pageChangeButtons.prop('nextPageExists')).toBe(true)
            expect(pageChangeButtons.prop('intl')).toBe(defaultProps.intl)
        })

        describe('shortcut link', () => {
            test('is rendered when shortcutElementId is defined', () => {
                const shortcutLink = getWrapper().find('#back-to-start-shortcut')
                expect(shortcutLink.length).toBe(1)
                expect(shortcutLink.prop('href')).toBe('#' + defaultProps.shortcutElementId)
                expect(shortcutLink.text()).toBe(intl.formatMessage({id: 'table-pagination-shortcut-link'}))
            })

            test('is not rendered when shortcutElementId isnt defined', () => {
                const shortcutElementId = undefined
                const shortcutLink = getWrapper({shortcutElementId}).find('#back-to-start-shortcut')
                expect(shortcutLink.length).toBe(0)
            })
        })
    })
})
