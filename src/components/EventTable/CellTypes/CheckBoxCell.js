import React from 'react';
import PropTypes from 'prop-types';
import {Input} from 'reactstrap';

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
        const {checked, disabled} = this.props;
        return (
            <td className='checkbox'>
                <Input
                    checked={checked}
                    type='checkbox'
                    invalid={disabled}
                    onChange={this.handleRowSelection}
                />
            </td>
        );
    }
}

CheckBoxCell.propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    event: PropTypes.object,
    tableName: PropTypes.string,
};

export default CheckBoxCell
