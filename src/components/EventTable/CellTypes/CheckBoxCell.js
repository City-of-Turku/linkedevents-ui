import React from 'react';
import PropTypes from 'prop-types';
import {Input} from 'reactstrap';
import {getEventName} from 'src/utils/events';

class CheckBoxCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: false,
        }
        this.handleRowSelection = this.handleRowSelection.bind(this);
    }

    handleRowSelection() {
        const {event, tableName} = this.props;
        const notStateCheck = !this.state.isChecked;
        this.props.onChange(notStateCheck, event.id, tableName);
        this.setState({isChecked : !this.state.isChecked});
    }

    render() {
        const {checked, disabled, event} = this.props;
        const locale = this.context.intl.locale;
        return (
            <td className='checkbox'>
                <label htmlFor={event.id} className='visually-hidden'>
                    {this.context.intl.formatMessage({id: 'table-events-checkbox'}, {name: getEventName(event, locale)})}
                </label>
                <Input
                    id={event.id}
                    checked={checked}
                    type='checkbox'
                    invalid={disabled}
                    onChange={this.handleRowSelection}
                />
            </td>
        );
    }
}
CheckBoxCell.contextTypes = {
    intl: PropTypes.object,
};

CheckBoxCell.propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    event: PropTypes.object,
    tableName: PropTypes.string,
};

export default CheckBoxCell
