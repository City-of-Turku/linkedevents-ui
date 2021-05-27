import React from 'react';
import PropTypes from 'prop-types';
import constants from 'src/constants';
import HeaderCell from './HeaderCell';

const {TABLE_COLUMNS} = constants

const TableHeaderCell = ({
    children,
    isActive,
    sortDirection,
    name,
    events,
    tableName,
    invalidRows,
    selectedRows,
    handleRowSelect,
    handleSortChange,
    fetchComplete,
    sortBy,
}) => {

    return (
        <React.Fragment>
            {name === 'checkbox' &&
            <HeaderCell
                isActive={isActive}
                sortDirection={sortDirection}
                name={name}
                events={events}
                tableName={tableName}
                invalidRows={invalidRows}
                selectedRows={selectedRows}
                handleRowSelect={handleRowSelect}
                handleSortChange={handleSortChange}
                fetchComplete={fetchComplete}
                active={name === sortBy}
            >
                {children}
            </HeaderCell>
            }
            {name === 'validation' &&
                <td className="validation-cell" />
            }
            {name !== 'checkbox' && name !== 'validation' &&
            <HeaderCell
                isActive={isActive}
                sortDirection={sortDirection}
                name={name}
                events={events}
                tableName={tableName}
                invalidRows={invalidRows}
                selectedRows={selectedRows}
                handleRowSelect={handleRowSelect}
                handleSortChange={handleSortChange}
                fetchComplete={fetchComplete}
                active={name === sortBy}
                direction={sortDirection}
            >
                {children}
            </HeaderCell>
            }

        </React.Fragment>
    )
}

TableHeaderCell.defaultProps = {
    events: [],
    invalidRows: [],
    selectedRows: [],
}

TableHeaderCell.propTypes = {
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
    fetchComplete: PropTypes.bool,
    sortBy: PropTypes.string,
}

export default TableHeaderCell
