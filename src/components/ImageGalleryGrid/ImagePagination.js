import React from 'react';
import PropTypes from 'prop-types';

const ImagePagination = (props) => {
    // During the first modal load there is no data yet. Data is fetched in ComponentDidMount.
    if (props.responseMetadata === undefined) {
        return null;
    }

    const pageAmount = Math.ceil(parseInt(props.responseMetadata.count) / 100);
    const currentPage = props.responseMetadata.currentPage;

    let classes;
    const pages = [];
    console.log(props.responseMetadata, 'pagimeta')
    for (let i = 1; i < pageAmount + 1; i++) {
        classes = (props.responseMetadata.currentPage !== undefined && currentPage == i) ? 'page-item active' : 'page-item';

        pages.push(<li className={classes} key={i}><a className='page-link' href='#' onClick={() => props.clickedPage(i)}>{i}</a></li>);
    }

    return <nav aria-label='Image pagination'>
        <ul className='pagination'>
            {pages}
        </ul>
    </nav>
};

ImagePagination.propTypes = {
    responseMetadata: PropTypes.object,
    clickedPage: PropTypes.func,
};

export default ImagePagination
