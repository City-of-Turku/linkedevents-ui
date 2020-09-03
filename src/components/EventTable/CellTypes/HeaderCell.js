import React from 'react';
import PropTypes from 'prop-types';
import constants from 'src/constants';
import {Input} from 'reactstrap';


const {TABLE_COLUMNS} = constants;

class HeaderCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: false,
            isActive: false,
        }
        this.handleRow = this.handleRow.bind(this);
        this.handleSort = this.handleSort.bind(this);
    }

    handleRow() {
        const checked = !this.state.isChecked;
        this.props.handleRowSelect(checked, undefined, this.props.tableName, true);
        this.setState({isChecked: !this.state.isChecked});
    }

    handleSort() {
        this.props.handleSortChange(this.props.name, this.props.tableName);
        this.setState({isActive: !this.state.isActive});
    }
    render() {
        const {name, sortDirection, active, children} = this.props;

        return(
            <React.Fragment>
                {name === 'checkbox' &&
                <th className='checkbox'>
                    <label htmlFor='allchecked' className='visually-hidden'>
                        {this.context.intl.formatMessage({id: 'table-events-checkbox-all'})}
                    </label>
                    <Input checked={this.state.isChecked} type='checkbox' id='allchecked' onChange={this.handleRow} />
                </th>
                }
                {name !== 'checkbox' && name !== 'validation' &&
                <th className='table-header'>
                    <div onClick={this.handleSort}>
                        {children}
                        {active && sortDirection === 'asc' &&
                            <span className='glyphicon glyphicon-arrow-up' />
                        }
                        {active && sortDirection === 'desc' &&
                            <span className='glyphicon glyphicon-arrow-down' />
                        }
                    </div>
                </th>
                }
            </React.Fragment>
        )
    }
}
HeaderCell.contextTypes = {
    intl: PropTypes.object,
};
HeaderCell.propTypes = {
    fetchComplete: PropTypes.bool,
    children: PropTypes.element,
    isActive: PropTypes.func,
    sortDirection: PropTypes.string,
    name: PropTypes.oneOf(TABLE_COLUMNS),
    tableName: PropTypes.string,
    events: PropTypes.array,
    invalidRows: PropTypes.array,
    selectedRows: PropTypes.array,
    handleRowSelect: PropTypes.func,
    handleSortChange: PropTypes.func,
    direction: PropTypes.string,
    active: PropTypes.bool,
};
HeaderCell.defaultProps = {
    events: [],
    invalidRows: [],
    selectedRows: [],
};

export default HeaderCell
