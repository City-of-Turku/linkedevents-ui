import React from 'react';
import {shallow} from 'enzyme';
import {Button} from 'reactstrap';
import {UnconnectedHeaderBar as HeaderBar, NavLinks} from './index';
import LanguageSelector from './LanguageSelector';
import constants from '../../constants';
const {APPLICATION_SUPPORT_TRANSLATION} = constants;
const LanguageOptions = APPLICATION_SUPPORT_TRANSLATION.map(item => ({
    label: item.toUpperCase(),
    value: item,
}));
const defaultProps = {
    routerPush: () => {},
    userLocale: {locale: 'fi'},
    setLocale: () => {},
    location: window.location,
    isOpen: false,
    showModerationLink: false,
};
const userAdmin = {
    displayName: 'Matti Meikäläinen',
    userType: 'admin',
    organizationsWithRegularUsers: ['jokuOrganisaatio'],
}
describe('HeaderBar', () => {
    function getWrapper(props) {
        return shallow(<HeaderBar {...defaultProps} {...props}/>);
    }
    describe('componentDidMount', () => {
        test('state.showModerationLink is true if user is admin and part of organization', () => {
            const element = getWrapper({user: userAdmin});
            expect(element.state('showModerationLink')).toBe(true);
        });
    });
    describe('render', () => {
        test('contains LanguageSelector with correct props', () => {
            const element = getWrapper().find(LanguageSelector);
            expect(element.prop('languages')).toEqual(LanguageOptions);
            expect(element.prop('userLocale')).toEqual(defaultProps.userLocale);
            expect(element.prop('changeLanguage')).toBeDefined();
        })
    });
    describe('NavLinks props', () => {
        test('NavLinks', () => {
            const element = getWrapper({user: userAdmin}).find(NavLinks);
            expect(element.prop('showModerationLink')).toBe(true)
        })
    })
})
const defaultNavProps = {
    showModerationLink: false,
    toMainPage: () => null,
    toSearchPage: () => null,
    toHelpPage: () => null,
    toModerationPage: () => null,
}
describe('NavLinks', () => {
    function getWrapper(props) {
        return shallow(<NavLinks {...defaultNavProps} {...props}/>);
    }
    test('renders with default props', () => {
        const element = getWrapper().find(Button);
        expect(element).toHaveLength(3);
        expect(element.at(0).prop('onClick')).toEqual(defaultNavProps.toMainPage);
        expect(element.at(1).prop('onClick')).toEqual(defaultNavProps.toSearchPage);
        expect(element.at(2).prop('onClick')).toEqual(defaultNavProps.toHelpPage);
    });
    test('renders additional Button when showModerationLink is true', () => {
        const element = getWrapper({showModerationLink: true}).find(Button);
        expect(element).toHaveLength(4);
        expect(element.at(3).prop('onClick')).toEqual(defaultNavProps.toModerationPage);
    })
})
