import './index.scss'

import React from 'react';
import PropTypes from 'prop-types'

import {FormattedMessage, injectIntl} from 'react-intl'
import {Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, Typography, TextField} from '@material-ui/core'
import {Close, ErrorOutline, Publish} from '@material-ui/icons'
import {deleteImage} from 'src/actions/userImages.js'
import {connect} from 'react-redux'
import {get as getIfExists, isEmpty} from 'lodash'
import ImageEdit from '../ImageEdit'
import ImageGalleryGrid from '../ImageGalleryGrid'
import {confirmAction} from 'src/actions/app.js'
import {HelMaterialTheme} from '../../themes/material-ui'

// Display either the image thumbnail or the "Add an image to the event" text.
const PreviewImage = (props) => {
    const backgroundImage = (props.backgroundImage) ? props.backgroundImage : null;
    const backgroundStyle = {backgroundImage: 'url(' + backgroundImage + ')'};
    
    if (backgroundImage) {
        return (
            <div className="image-picker--preview" style={backgroundStyle} onClick={() => props.openModalMethod()}/>
        );
    } else {
        return (
            <React.Fragment>
                <div className="image-picker--preview" onClick={() => props.openModalMethod()}>
                    <Publish />
                    <label>
                        <FormattedMessage id="choose-image"/>
                    </label>
                </div>
            </React.Fragment>
        );
    }
};

export class ImagePicker extends React.Component {

    constructor(props) {
        super(props);

        this.hiddenFileInput = React.createRef()

        this.state = {
            open: false,
            edit: false,
            imageFile: null,
            thumbnailUrl: null,
            fileSizeError: false,
        };
    }

    clickHiddenUploadInput() {
        this.hiddenFileInput.current.click()
    }

    handleExternalImage = (event) => {
        this.setState({thumbnailUrl: event.target.value})
    }

    handleExternalImageSave() {
        this.setState({edit: true, imageFile: null})
    }

    handleUpload(event) {
        const file = event.target.files[0];
    
        if (file && ! this.validateFileSize(file)) {
            return;
        }
        
        const data = new FormData();
        
        data.append('image', file);
        
        if(file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' )) {
            this.setState({edit: true, imageFile: file, thumbnailUrl: window.URL.createObjectURL(file)});
        }
    }
    
    validateFileSize = (file) => {
        const maxSizeInMB = 2;
        
        const binaryFactor = 1024 * 1024;
        const decimalFactor = 1000 * 1000;
        
        const fileSizeInMB = parseInt(file.size) / decimalFactor;
        
        if (fileSizeInMB > maxSizeInMB) {
            this.setState({
                fileSizeError: true,
            });
            
            return false;
        } else {
            if (this.state.fileSizeError) {
                this.setState({
                    fileSizeError: false,
                });
            }
            
            return true;
        }
    };

    handleDelete(event) {
        let selectedImage = this.props.editor.values.image
        if (!isEmpty(selectedImage)) {
            this.props.dispatch(
                confirmAction(
                    'confirm-image-delete',
                    'warning',
                    'delete',
                    {
                        action: e => this.props.dispatch(deleteImage(selectedImage, this.props.user)),
                        additionalMsg: selectedImage.name,
                        additionalMarkup: ' ',
                    }
                )
            )
        }
    }
    
    handleEdit() {
        this.setState({
            edit: true,
        });
    }

    closeGalleryModal() {
        this.setState({open: false})
    }
    
    openGalleryModal = () => {
        this.setState({open: true});
    };

    render() {
        const backgroundImage = getIfExists(this.props.editor.values, 'image.url', '');
    
        let editModal = null;
        
        if (this.state.edit && this.state.thumbnailUrl) {
            /* When adding a new image from hard drive */
            editModal = <ImageEdit
                imageFile={this.state.imageFile}
                thumbnailUrl={this.state.thumbnailUrl}
                close={() => this.setState({edit: false})}
            />;
        } else if (this.state.edit && !isEmpty(this.props.editor.values.image)) {
            /* When editing existing image by pressing the edit button on top of the grid */
            editModal = <ImageEdit
                id={this.props.editor.values.image.id}
                defaultName={this.props.editor.values.image.name}
                altText={this.props.editor.values.image.alt_text}
                defaultPhotographerName={this.props.editor.values.image.photographer_name}
                thumbnailUrl={this.props.editor.values.image.url}
                license={this.props.editor.values.image.license}
                close={() => this.setState({edit: false})}
                updateExisting
            />;
        }

        return (
            <div className="image-picker">
                { this.props.loading
                    ? <CircularProgress className="loading-spinner" size={60}/>
                    : <PreviewImage backgroundImage={backgroundImage} openModalMethod={this.openGalleryModal} />
                }

                <Dialog
                    className="image-picker--dialog"
                    open={this.state.open}
                    fullWidth
                    maxWidth="lg"
                    onClose={() => this.closeGalleryModal()}
                    transitionDuration={0}
                >
                    <DialogTitle>
                        <FormattedMessage id="event-image-title" />
                        <IconButton onClick={() => this.closeGalleryModal()}>
                            <Close/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography className="image-picker--dialog-title" variant="h6">
                            <FormattedMessage id="new-image" />
                        </Typography>
                        <div className="file-upload">
                            <div className="file-upload--new">
                                <input
                                    onChange={(e) => this.handleUpload(e)}
                                    style={{display: 'none'}}
                                    type="file"
                                    ref={this.hiddenFileInput}
                                />
                                <Button
                                    className="upload-img"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => this.clickHiddenUploadInput()}
                                >
                                    <FormattedMessage id="upload-image" />
                                </Button>
                                {this.state.fileSizeError &&
                                    <React.Fragment>
                                        <ErrorOutline style={{margin: HelMaterialTheme.spacing(0, 1, 0, 2)}} />
                                        <FormattedMessage id="uploaded-image-size-error" />
                                    </React.Fragment>
                                }
                            </div>
                            <div className="file-upload--external">
                                <TextField
                                    className="file-upload--external-input"
                                    label={<FormattedMessage id="upload-image-from-url"/>}
                                    onChange={this.handleExternalImage}
                                />
                                <Button
                                    className="file-upload--external-button"
                                    variant="contained"
                                    color="primary"
                                    style={{marginLeft: HelMaterialTheme.spacing(2)}}
                                    disabled={!this.state.thumbnailUrl || this.state.thumbnailUrl.length === 0}
                                    onClick={() => this.handleExternalImageSave()}
                                >
                                    <FormattedMessage id="attach-image-to-event"/>
                                </Button>
                            </div>
                        </div>
                        <hr/>
                        <Typography className="image-picker--dialog-title" variant="h6">
                            <FormattedMessage id="use-existing-image"/>
                        </Typography>

                        <div className={'button-row'}>
                            <Button
                                className="delete"
                                color="secondary"
                                variant="contained"
                                onClick={() => this.handleDelete()}
                                disabled={isEmpty(this.props.editor.values.image)}
                            >
                                <FormattedMessage id="delete-from-filesystem"/>
                            </Button>

                            <div className={'wrapper-right'}>
                                <Button
                                    className="edit"
                                    variant="contained"
                                    disabled={isEmpty(this.props.editor.values.image)}
                                    onClick={() => this.handleEdit()}
                                >
                                    <FormattedMessage id="edit-selected-image"/>
                                </Button>
                                <Button
                                    className="attach"
                                    variant="contained"
                                    onClick={() => this.closeGalleryModal()}
                                    color="primary"
                                >
                                    <FormattedMessage id="attach-image-to-event"/>
                                </Button>
                            </div>
                        </div>

                        <ImageGalleryGrid editor={this.props.editor} user={this.props.user} images={this.props.images} />
                    </DialogContent>
                </Dialog>
                {editModal}
            </div>
        )
    }
}

ImagePicker.defaultProps = {
    editor: {
        values: {},
    },
    images: {},
    user: {},
    loading: true,
};

ImagePicker.propTypes = {
    editor: PropTypes.object,
    user: PropTypes.object,
    images: PropTypes.object,
    children: PropTypes.element,
    dispatch: PropTypes.func,
    loading: PropTypes.bool,
};

PreviewImage.propTypes = {
    backgroundImage: PropTypes.string,
    openModalMethod: PropTypes.func,
};

const mapStateToProps = (state) => ({
    user: state.user,
    editor: state.editor,
    images: state.images,
})

export default connect(mapStateToProps)(injectIntl(ImagePicker))
