import './HelOffersField.scss';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';

import {FormattedMessage} from 'react-intl';
import HelCheckbox from './HelCheckbox';
import NewOffer from './NewOffer';
import {Button} from 'reactstrap';
import constants from '../../constants';
import {addOffer, setOfferData, setFreeOffers} from 'src/actions/editor.js';

const {GENERATE_LIMIT} = constants;
class HelOffersField extends React.Component {
    static contextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };

    constructor(props) {
        super(props);
        let isFreeEvent = true;
        if (this.props.defaultValue && this.props.defaultValue.length > 0) {
            isFreeEvent = false; //we have length in defaultvalue array so we have prices -> not a free event.
        }
        this.state = {
            values: this.props.defaultValue,
            isFree: isFreeEvent,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.defaultValue && this.props.defaultValue !== this.state.values) {
            this.setState({values: this.props.defaultValue});
        }
        if (this.props.defaultValue && this.props.defaultValue[0] && this.props.defaultValue[0].is_free !== this.state.isFree ) {
            this.setState({isFree: this.props.defaultValue[0].is_free});
        }
        if (prevProps.defaultValue !== 0 && this.props.defaultValue == 0) {
            this.context.dispatch(setFreeOffers(!this.state.isFree));
            this.setState({values: undefined, isFree: !this.state.isFree});
        }
    }

    setIsFree(e, value) {
        if (!this.props.defaultValue || !this.props.defaultValue.length) {
            this.addNewOffer();
            this.context.dispatch(setOfferData({0: {is_free: !this.state.isFree}}, 0));
        } else {
            this.context.dispatch(setFreeOffers(!this.state.isFree));
        }
        this.setState({isFree: !this.state.isFree});
    }

    addNewOffer() {
        const obj = {
            is_free: this.state.isFree,
        };
        this.context.dispatch(addOffer(obj));
    }

    generateOffers(offers) {
        const newOffers = [];
        let keys;
        let lastKey;
        if (offers) {
            keys = Object.keys(offers);
            lastKey = keys[keys.length - 1];
        }

        for (const key in offers) {
            if (offers.hasOwnProperty(key) && !this.state.isFree) {
                newOffers.push(
                    <NewOffer
                        key={key}
                        length={newOffers.length + 1}
                        offerKey={key}
                        defaultValue={this.props.defaultValue[key]}
                        validationErrors={this.props.validationErrors}
                        languages={this.props.languages}
                        isFree={this.state.isFree}
                        setInitialFocus={key === lastKey ? true : false}
                    />
                );
            }
        }
        return newOffers;
    }

    render() {
        const {values} = this.state;
        const offerDetails = this.generateOffers(this.props.defaultValue);
        //Change OFFER_LENGTH in constants to change maxium length of prices users can add, currently limited to 20
        const isOverLimit = values && values.length >= GENERATE_LIMIT.OFFER_LENGTH;
        const disabled = isOverLimit || this.state.isFree;

        return (
            <Fragment>
                <HelCheckbox
                    fieldID='is-free-checkbox'
                    defaultChecked={this.state.isFree}
                    ref='is_free'
                    label={<FormattedMessage id='is-free' />}
                    onChange={(e, v) => this.setIsFree(e, v)}
                />
                <div className="offers">
                    { offerDetails }
                </div>
                {!this.state.isFree &&
                    <Button
                        size='lg'block
                        variant="contained"
                        disabled={disabled}
                        onClick={() => this.addNewOffer()}
                    ><span aria-hidden className="glyphicon glyphicon-plus"></span>
                        <FormattedMessage id="event-add-price" />
                    </Button>
                }
                {isOverLimit && 
                    <p className='offersLimit' role='alert'>
                        <FormattedMessage id='event-add-price-limit' values={{count: GENERATE_LIMIT.OFFER_LENGTH}} />
                    </p>
                }
            </Fragment>
        );
    }
}

HelOffersField.propTypes = {
    defaultValue: PropTypes.array,
    validationErrors: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    languages: PropTypes.array,
};

export default HelOffersField;  
