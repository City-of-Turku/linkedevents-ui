import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'reactstrap'

function PageChangeButtons({page, onChangePage, previousPageExists, nextPageExists, intl}){
    const previousPage = page - 1
    const nextpage = page + 1

    return(
        <div className="custom-table-pagination__buttons">
            <Button
                onClick={previousPageExists ? (event) => onChangePage(event, previousPage) : undefined}
                aria-label={intl.formatMessage({id: 'table-pagination-previous-page'})}
                disabled={!previousPageExists}
                size="sm"
            >
                {'<'}
            </Button>
            <Button
                onClick={nextPageExists ? (event) => onChangePage(event, nextpage) : undefined}
                aria-label={intl.formatMessage({id: 'table-pagination-next-page'})}
                disabled={!nextPageExists}
                size="sm"
            >
                {'>'}
            </Button>
        </div>
    )
}

PageChangeButtons.propTypes = {
    page: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    previousPageExists: PropTypes.bool.isRequired,
    nextPageExists: PropTypes.bool.isRequired,
    intl: PropTypes.object.isRequired,
}

export default PageChangeButtons
