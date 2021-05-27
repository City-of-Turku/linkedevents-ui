import React from 'react';
import PropTypes from 'prop-types';
import ImageGalleryGrid from '../ImageGalleryGrid';
import ImageEdit from '../ImageEdit';
import './index.scss';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import {FormattedMessage} from 'react-intl';
import ImagePickerForm from '../ImagePicker';
import {get as getIfExists} from 'lodash';
import {fetchUserImages as fetchUserImagesAction} from 'src/actions/userImages'
import ValidationNotification from 'src/components/ValidationNotification'
import classNames from 'classnames';

class ImageGallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openEditModal: false,
            openOrgModal: false,
            fetchDefaults: true,
        }

        this.toggleEditModal = this.toggleEditModal.bind(this);
        this.toggleOrgModal = this.toggleOrgModal.bind(this);
        this.validationRef = React.createRef()
    }

    componentDidMount() {
        if (this.state.fetchDefaults) {
            this.props.fetchUserImages(100,1, true);
            this.setState({fetchDefaults: false})
        }

    }

    toggleEditModal() {
        this.setState({openEditModal: !this.state.openEditModal})
    }

    toggleOrgModal() {
        this.setState({openOrgModal: !this.state.openOrgModal})
    }

    getPreview(props) {
        const backgroundImage = props.backgroundImage ? props.backgroundImage : null;
        const backgroundStyle = {backgroundImage: 'url(' + backgroundImage + ')'};
        const {validationErrors} = this.props

        const stylingProps = {
            className: classNames('image-picker--preview', {'validationError': validationErrors && !backgroundImage}),
            style: backgroundImage ? backgroundStyle : undefined,
        };
        const formatted = !backgroundImage && <FormattedMessage id='no-image' />
        return (
            <React.Fragment>
                <div {...stylingProps}>
                    {formatted}
                </div>
            </React.Fragment>
        )
    }

    render() {
        const {validationErrors} = this.props;
        const backgroundImage = getIfExists(this.props.editor.values,'image.url', '');
        const defaultImages = {items: this.props.images.defaultImages};

        return (
            <React.Fragment>
                <div className='col-sm-6 imageGallery' ref={this.validationRef}>
                    <div/>
                    <Button
                        className='toggleEdit'
                        size='lg'
                        block
                        onClick={this.toggleEditModal}
                    >
                        <span aria-hidden className="glyphicon glyphicon-plus"/>
                        <FormattedMessage id='upload-new-image' />
                    </Button>
                    <ValidationNotification
                        anchor={this.validationRef.current}
                        validationErrors={validationErrors}
                        className='validation-notification' 
                    />
                    <Button
                        className='toggleOrg'
                        size='lg'
                        block
                        onClick={this.toggleOrgModal}
                    >
                        <span aria-hidden className="glyphicon glyphicon-plus"/>
                        <FormattedMessage id='upload-image-select-bank' />
                    </Button>
                    <ImageEdit open={this.state.openEditModal} close={this.toggleEditModal}/>
                    <ImagePickerForm label="image-preview" name="image" loading={false} isOpen={this.state.openOrgModal} close={this.toggleOrgModal}/>
                    {true &&
                        <React.Fragment>
                            <div className='image-select-default'>
                                <FormattedMessage id='select-from-default'>{txt => <h3>{txt}</h3>}</FormattedMessage>
                            </div>
                            <ImageGalleryGrid
                                user={this.props.user}
                                editor={this.props.editor}
                                images={defaultImages}
                                locale={this.props.locale}
                            />
                            <hr aria-hidden='true'/>
                        </React.Fragment>
                    }

                </div>
                <div className='col-sm-5 side-field'>
                    <div className={classNames('image-picker', {'background': backgroundImage})}>
                        {this.getPreview({backgroundImage: backgroundImage})}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}



ImageGallery.propTypes = {
    user: PropTypes.object,
    editor: PropTypes.object,
    images: PropTypes.object,
    fetchUserImages: PropTypes.func,
    locale: PropTypes.string,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
};

const mapDispatchToProps = (dispatch) => ({
    fetchUserImages: (user, amount, pageNumber, mainPage) => dispatch(fetchUserImagesAction(user, amount, pageNumber, mainPage)),
});

const mapStateToProps = (state) => ({
    images: state.images,
    user: state.user,
    editor: state.editor,
});
export {ImageGallery as UnconnectedImageGallery}
export default connect(mapStateToProps, mapDispatchToProps)(ImageGallery)
