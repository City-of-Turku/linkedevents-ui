import './index.scss';

import React from 'react';
import PropTypes from 'prop-types'
import ImagePagination from './ImagePagination';
import {get as getIfExists} from 'lodash'
import {connect} from 'react-redux'
import {fetchUserImages as fetchUserImagesAction} from 'src/actions/userImages'
import ImageThumbnail from '../ImageThumbnail'
import {Button, Input, Label, Form, InputGroup, InputGroupAddon} from 'reactstrap';
import Spinner from 'react-bootstrap/Spinner';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';

class ImageGalleryGrid extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchString: '',
        }
    }

    componentDidMount() {
        this.fetchImages();
    }

    fetchImages = (user = this.props.user, pageSize = 100, pageNumber = null, publicImages = false, filter = false, filterString = null) => {
        const {fetchUserImages, defaultModal} = this.props;
        const {searchString} = this.state;
        if (defaultModal) {
            fetchUserImages(pageSize, pageNumber , true);
        }
        if (user && searchString === '') {
            fetchUserImages(pageSize, pageNumber);
        }
        if(user && searchString !== '') {
            fetchUserImages(pageSize, pageNumber, false, true, searchString)
        }
    };

    // Get the desired page number as a parameter and fetch images for that page
    changeImagePage = (pageNumber) => {
        this.fetchImages(this.props.user, 100, pageNumber);
    };

    searchOnChange = (e) => {
        this.setState({searchString: e})
    }

    submitHandler = () => {
        const {searchString} = this.state;
        event.preventDefault();
        if (searchString !== '') {
            this.fetchImages();
        } else if (searchString === '') {
            this.fetchImages()
        }
    }

    render() {
        // save the id of the selected image of this event (or editor values)
        let selected_id = getIfExists(this.props.editor.values, 'image.id', null);

        // build the classes for the thumbnails
        let images = this.props.images.items.map((img) => {
            let selected = selected_id == img.id
            return (
                <ImageThumbnail
                    locale={this.props.locale}
                    selected={selected}
                    key={img.id}
                    url={img.url}
                    data={img}
                    defaultModal={this.props.defaultModal}
                    close={this.props.close}
                    user={this.props.user}
                />
            )
        });

        // ...and finally check if there is no image for this event to be able to set the class
        let selected = selected_id == null;
        const {isFetching, fetchComplete} = this.props.images
        const {defaultModal, user, intl} = this.props

        return (
            <div className='image-grid container-fluid'>
                {!defaultModal && user &&
                    <div>
                        <div className='search-images'>
                            <Form onSubmit={this.submitHandler}>
                                <Label htmlFor='search-imgs'><FormattedMessage id='search-images'/></Label>
                                <InputGroup>
                                    <InputGroupAddon className='inputIcon' addonType="prepend">
                                        <span aria-hidden className="glyphicon glyphicon-search"/>
                                    </InputGroupAddon>
                                    <Input
                                        id='search-imgs'
                                        placeholder={intl.formatMessage({id: 'search-images-text'})}
                                        type='text'
                                        onChange={(e) => this.searchOnChange(e.target.value)}
                                        value={this.state.searchString}
                                    />
                                
                                    <Button
                                        color='primary'
                                        variant='contained'
                                        type='submit'>
                                        <FormattedMessage id='search-images-text' />
                                    </Button>
                                </InputGroup>
                            </Form>
                        </div>
                        <hr/>
                        {isFetching && !fetchComplete
                            ? <div/>
                            : images.length > 0
                                ? <p role='status'>Kuvia pankissa {images.length}</p>
                                : <p role='status'>Kuvia pankissa {images.length}</p>
                        }
                        <hr/>
                    </div>
                }
                {isFetching && !fetchComplete
                    ? <div className="search-loading-spinner"><Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner></div>
                    : <div className='row'>
                        {images.length > 0 ? images : <div/>}
                        <div className='clearfix'/>
                    </div>
                }
                {!defaultModal && (
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
    defaultModal: PropTypes.bool,
    action: PropTypes.func,
    close: PropTypes.func,
    intl: intlShape,
};

const mapDispatchToProps = (dispatch) => ({
    fetchUserImages: (user, amount, pageNumber, publicImages, filter, filterString) => dispatch(fetchUserImagesAction(user, amount, pageNumber, publicImages, filter, filterString)),
});

const mapStateToProps = (state, ownProps) => ({
});

export {ImageGalleryGrid as UnconnectedImageGalleryGrid}
// TODO: if leave null, react-intl not refresh. Replace this with better React context
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ImageGalleryGrid))
