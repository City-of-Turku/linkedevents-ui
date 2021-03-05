import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button, UncontrolledTooltip} from 'reactstrap';
import {injectIntl} from 'react-intl';

function DatePickerButton({intl, disabled, onClick, type, id}) {
    const iconClass = type !== 'time' ? 'glyphicon glyphicon-calendar' : 'glyphicon glyphicon-time';
    const toolTip = type !== 'time' ? intl.formatMessage({id: 'date'}) : intl.formatMessage({id: 'time'});
    return (
        <Fragment>
            <Button
                id={id}
                disabled={disabled}
                aria-hidden
                aria-label={intl.formatMessage({id: 'date-picker-button-label'})}
                tabIndex={-1}
                onClick={onClick}
                className={'custom-date-input__button' + ' ' + iconClass}
            />
            <UncontrolledTooltip placement='top' target={id} innerClassName='tooltip-disabled' hideArrow>
                {toolTip}
            </UncontrolledTooltip>
        </Fragment>
    );
}

DatePickerButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    type: PropTypes.string,
    intl: PropTypes.object,
    id: PropTypes.string,
};

export {DatePickerButton as UnconnectedDatePickerButton};
export default injectIntl(DatePickerButton);
