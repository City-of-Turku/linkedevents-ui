import React from 'react'
import PropTypes from 'prop-types'
import {injectIntl} from 'react-intl';
import './CustomTablePagination.scss'

import PageChangeButtons from './PageChangeButtons'

function renderOptions(options){
    const optionElements = options.map((optionValue) => {
        return(
            <option
                key={optionValue}
                value={optionValue}
            >
                {optionValue}
            </option>
        )      
    })

    return optionElements
}

function CustomTablePagination({count, rowsPerPage, rowsPerPageOptions, page, onChangePage,
    onChangeRowsPerPage, labelDisplayedRows, labelRowsPerPage, intl, shortcutElementId}){
 
    const from = rowsPerPage * page + 1
    let to = rowsPerPage * page + rowsPerPage
    if(to > count)
        to = count

    const previousPageExists = page > 0
    const nextPageExists = to < count

    return(
        <td className="custom-table-pagination" colSpan="1000">
            <div className="flex-container">
                <div className="custom-table-pagination__spacer"></div>
                <div className="custom-table-pagination__content">
                    {rowsPerPageOptions.length > 0 && 
                        <label htmlFor="page-counts">{labelRowsPerPage}</label>
                    }
                    {rowsPerPageOptions.length > 0 && 
                        <select id="page-counts" name="page-counts" value={rowsPerPage} onChange={onChangeRowsPerPage}>
                            {renderOptions(rowsPerPageOptions)}
                        </select>
                    }
                    
                    <p
                        role="status"
                        className="visually-hidden"
                    >
                        {intl.formatMessage({id: 'table-pagination-results'}, {from, to, count})}
                        {intl.formatMessage({id: 'table-events-page-number'}) + '' + (page + 1)}
                    </p>
                    <p aria-hidden>{labelDisplayedRows({from, to, count})}</p>
                    <PageChangeButtons
                        page={page}
                        onChangePage={onChangePage}
                        previousPageExists={previousPageExists}
                        nextPageExists={nextPageExists}
                        intl={intl}/>
                    {shortcutElementId && 
                        <a id="back-to-start-shortcut" href={'#' + shortcutElementId}>
                            {intl.formatMessage({id: 'table-pagination-shortcut-link'})}
                        </a>
                    }
                </div>
            </div>
        </td>
    )
}

CustomTablePagination.propTypes = {
    count: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    rowsPerPageOptions: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeRowsPerPage: PropTypes.func.isRequired,
    labelDisplayedRows: PropTypes.func.isRequired,
    labelRowsPerPage: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
    shortcutElementId: PropTypes.string,
}

export {CustomTablePagination as CustomTablePaginationWithoutIntl}
export default injectIntl(CustomTablePagination)
