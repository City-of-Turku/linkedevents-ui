import React from 'react';
import PropTypes from 'prop-types'

import {get as getIfExists} from 'lodash'
import {connect} from 'react-redux'
import {fetchUserImages as fetchUserImagesAction} from 'src/actions/userImages'
import ImageThumbnail from '../ImageThumbnail'

const ImagePagination = (props) => {
    // During the first modal load there is no data yet. Data is fetched in ComponentDidMount.
    if (props.responseMetadata === undefined) {
        return null;
    }

    const pageAmount = Math.ceil(parseInt(props.responseMetadata.count) / 100);
    const currentPage = props.responseMetadata.currentPage;

    let classes;
    const pages = [];

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

class ImageGalleryGrid extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.fetchImages();
    }

    componentDidUpdate() {
        const {fetchComplete, isFetching} = this.props.images;

        if (fetchComplete || isFetching) {
            return;
        }

        // this.fetchImages();
    }

    fetchImages = (user = this.props.user, pageSize = 100, pageNumber = null) => {
        if (user) {
            this.props.fetchUserImages(pageSize, pageNumber);
        }
    };

    // Get the desired page number as a parameter and fetch images for that page
    changeImagePage = (pageNumber) => {
        this.fetchImages(this.props.user, 100, pageNumber);
    };

    handleDelete() {
        this.props.action();
    }


    render() {
        // save the id of the selected image of this event (or editor values)
        let selected_id = getIfExists(this.props.editor.values, 'image.id', null);

        // show latest modified at top
        let sorted = this.props.images.items.sort((a, b) => {
            const date_a = new Date(a.last_modified_time);
            const date_b = new Date(b.last_modified_time);
            return date_b - date_a
        });

        let images = this.props.images.items.reduce((acc, cur, idx) => {
            if (idx < 4) {
                let selected = selected_id === cur.id;
                acc.push(<ImageThumbnail
                    locale={this.props.locale}
                    selected={selected}
                    key={cur.id}
                    url={cur.url}
                    data={cur}
                    modal={this.props.modal}
                />);
            }
            return acc;
        }, []);

        // build the classes for the thumbnails
        let imgs = this.props.images.items.map((img) => {
            let selected = selected_id == img.id
            return (
                <ImageThumbnail
                    locale={this.props.locale}
                    selected={selected}
                    key={img.id}
                    url={img.url}
                    data={img}
                    modal={this.props.modal}
                    close={this.props.close}
                    user={this.props.user}
                />
            )
        });

        // ...and finally check if there is no image for this event to be able to set the class
        let selected = selected_id == null;

        // unsift == prepend
        imgs.unshift(<ImageThumbnail selected={selected} key={0} empty={true} url="" data={{}} modal={this.props.modal} close={this.props.close}/>)

        return (
            <div className='image-grid container-fluid'>
                <div className='row'>
                    {this.props.modal ? imgs : images}
                    <div className='clearfix' />
                </div>
                {this.props.modal && (
                    <ImagePagination clickedPage={this.changeImagePage} responseMetadata={this.props.images.meta} />
                )}

            </div>
        )
    }
}

ImageGalleryGrid.propTypes = {
    images: PropTypes.any,
    user: PropTypes.object,
    editor: PropTypes.object,
    fetchUserImages: PropTypes.func,
    locale: PropTypes.string,
    modal: PropTypes.bool,
    action: PropTypes.func,
    close: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
    fetchUserImages: (user, amount, pageNumber) => dispatch(fetchUserImagesAction(user, amount, pageNumber)),
});

const mapStateToProps = (state, ownProps) => ({
});

ImagePagination.propTypes = {
    responseMetadata: PropTypes.object,
    clickedPage: PropTypes.func,
};

// TODO: if leave null, react-intl not refresh. Replace this with better React context
export default connect(mapStateToProps, mapDispatchToProps)(ImageGalleryGrid)
