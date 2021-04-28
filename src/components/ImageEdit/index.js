import './index.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {connect} from 'react-redux';
import {HelTextField, MultiLanguageField} from '../HelFormFields';
import {postImage as postImageAction} from 'src/actions/userImages';
import constants from 'src/constants';
import {Button, Modal, ModalHeader, ModalBody} from 'reactstrap';
import update from 'immutability-helper';
import {getStringWithLocale} from 'src/utils/locale';
import validationFn from 'src/validation/validationRules'

const {CHARACTER_LIMIT, VALIDATION_RULES} = constants;

class ImageEdit extends React.Component {
    constructor(props) {
        super(props);
        this.hiddenFileInput = React.createRef();
        this.state = {
            image: {
                name: {},
                altText: {},
                photographerName: '',
            },
            validation: {
                altTextMinLength: 6,
                photographerMaxLength: CHARACTER_LIMIT.SHORT_STRING,
                nameMaxLength: CHARACTER_LIMIT.SHORT_STRING,
                altTextMaxLength: CHARACTER_LIMIT.MEDIUM_STRING,
            },
            license: 'event_only',
            imagePermission: false,
            edit: false,
            imageFile: null,
            thumbnailUrl: null,
            urlError: false,
            fileSizeError: false,
            hideAltText: false,
        };

        this.getCloseButton = this.getCloseButton.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLicenseChange = this.handleLicenseChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.clearPictures = this.clearPictures.bind(this);
        this.setAltDecoration = this.setAltDecoration.bind(this);
    }

    componentDidMount() {
        if (this.props.updateExisting) {
            this.setState(
                {
                    image:
                        {
                            name:this.props.defaultName || {},
                            altText: this.props.altText || {},
                            photographerName: this.props.defaultPhotographerName || '',
                        },
                    license: this.props.license,
                });
        }
    }


    handleUpload(event) {
        const file = event.target.files[0];
        if (file && !this.validateFileSizes(file)) {
            return;
        }
        const data = new FormData();

        data.append('image', file);

        if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
            this.setState({
                edit: true,
                imageFile: file,
                thumbnailUrl: window.URL.createObjectURL(file),
            });
        }
    }

    validateFileSizes = (file) => {
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

    handleInputBlur() {
        const myData = document.getElementById('upload-external')
        const formData = new FormData(myData);
        const MyData = formData.get('externalUrl');
        const url = MyData
        if (!validationFn['isUrl'](undefined, url, undefined)) {
            this.setState({urlError: true,
            })
            return false 
        } else {
            return true
        }
    }

    handleExternalImageSave = () => {
        event.preventDefault();
        const foo = document.getElementById('upload-external')
        const formData = new FormData(foo);
        console.log(formData.get('externalUrl'));
        const bar = formData.get('externalUrl');
        this.setState({thumbnailUrl: bar, imageFile: null});
    }

    clickHiddenUpload() {
        this.hiddenFileInput.current.click();
    }

    /**
     * Clears both picture states if user decides to use different picture
     */
    clearPictures() {
        this.setState(({
            imageFile: null,
            thumbnailUrl: null,
        }))
    }

    /**
     * Handles setting decorative altText for picture and hiding inputs
     * @param e 
     */
    setAltDecoration(e) {
        this.setState({hideAltText: e.target.checked})
    }

    /**
     * Handles the license radio input/image permission checkbox onClicks.
     * name = license_type -> set selected value to state.license
     * name = permission -> toggles state.imagePermission
     * @param e
     */
    handleLicenseChange(e) {

        if(e.target.name === 'license_type') {
            if (e.target.value === 'cc_by' || e.target.value === 'event_only') {
                this.setState({license: `${e.target.value}`});
            }
        }
        if (e.target.name === 'permission') {
            this.setState({imagePermission: !this.state.imagePermission})
        }

    }

    /**
     * Reads imageFile and returns image's data as a base64 encoded string.
     * @param imageFile
     * @returns {Promise<unknown>}
     */
    imageToBase64(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        })
    }

    /**
     * Modifies/finalizes the object that is then dispatched to the server,
     * when !updateExisting the imageFile is encoded to a base64 string and added to the object that is dispatched,
     * @returns {Promise<void>}
     */
    async handleImagePost() {
        const langs = this.props.editor.contentLanguages;
        const decorationAlts = langs.reduce((acc,curr)  => {
            acc[curr] = this.context.intl.formatMessage({id: `description-alt.${curr}`});
            return acc;
        },  {});
        let imageToPost = {
            name: this.state.image['name'],
            alt_text: this.state.image['altText'],
            photographer_name: this.state.image['photographerName'],
            license: this.state.license,
        };
        if (this.state.hideAltText) {
            imageToPost = update(imageToPost, {
                alt_text:{$set: decorationAlts},
            });
        }
        if (!this.props.updateExisting) {
            if (this.props.imageFile || this.state.imageFile) {
                let image64 = await this.imageToBase64(this.state.imageFile);
                imageToPost = update(imageToPost,{
                    image:{$set: image64},
                    file_name:{$set: this.state.imageFile.name.split('.')[0]},
                });
            } else {
                imageToPost = update(imageToPost,{
                    url:{$set: this.state.thumbnailUrl},
                });
            }
            this.props.postImage(imageToPost, this.props.user, null);
        }
        else {
            this.props.postImage(imageToPost,this.props.user, this.props.id);
        }
        this.setState({
            image: {
                name: {},
                altText: {},
                photographerName: '',
            },
            license: 'event_only',
            imagePermission: false,
            edit: false,
            imageFile: null,
            thumbnailUrl: null,
            urlError: false,
            fileSizeError: false,
            hideAltText: false,
        })
        this.props.close();
    }

    /**
     * Sets value to correct location in state
     * @example
     * this.state.image: {name:{}, altText:{},...}
     * handleChange({target:{id: name}} {fi:'some text'})
     * this.state.image: {name:{fi: 'some text'},altText:{},...}
     * handleChange({target:{id: altText}} {fi:'alt text here'})
     * this.state.image: {name:{fi: 'some text'},altText:{fi:'alt text here'},...}
     * @param event
     * @param value
     */
    handleChange(event, value){
        const {id} = event.target;
        let localImage = this.state.image;
        if (id.includes('altText')) {

            localImage = update(localImage, {
                'altText': {
                    $set: value,
                },
            });
            this.setState({image: localImage})
        }

        else if (id.includes('name')) {

            localImage = update(localImage, {
                'name': {
                    $set: value,
                },
            });
            this.setState({image: localImage})
        }
        else {
            localImage['photographerName'] = update(localImage['photographerName'], {
                $set: value,
            })
            this.setState({image: localImage});
        }

    }

    getCloseButton() {
        return (
            <Button
                className='icon-button'
                type='button'
                aria-label={this.context.intl.formatMessage({id: `close-image-edit-modal`})}
                onClick={() => this.props.close()}
            >
                <span className='glyphicon glyphicon-remove' />
            </Button>
        )
    }

    getFields() {
        return (
            <React.Fragment>
                {!this.state.hideAltText &&
                    <MultiLanguageField
                        id='altText'
                        multiLine
                        required={true}
                        defaultValue={this.state.image.altText}
                        validations={[VALIDATION_RULES.MEDIUM_STRING]}
                        label='alt-text'
                        languages={this.props.editor.contentLanguages}
                        maxLength={this.state.validation.altTextMaxLength}
                        onChange={this.handleChange}
                        onBlur={this.handleChange}
                    />
                }
                <MultiLanguageField
                    id='name'
                    multiLine
                    required={true}
                    defaultValue={this.state.image.name}
                    validations={[VALIDATION_RULES.SHORT_STRING]}
                    label='image-caption-limit-for-min-and-max'
                    languages={this.props.editor.contentLanguages}
                    onChange={this.handleChange}
                    onBlur={this.handleChange}
                />

                <HelTextField
                    fullWidth
                    name='photographerName'
                    required={true}
                    defaultValue={this.state.image.photographerName}
                    label={this.context.intl.formatMessage({id: 'photographer'})}
                    validations={[VALIDATION_RULES.SHORT_STRING]}
                    maxLength={this.state.validation.photographerMaxLength}
                    onChange={this.handleChange}
                />
            </React.Fragment>
        )
    }

    getLicense() {
        return (
            <div className='image-license-container'>
                <div className='license-choices'>
                    <div className='custom-control custom-checkbox'>
                        <input
                            className='custom-control-input'
                            type='checkbox'
                            id='permission'
                            name='permission'
                            onChange={this.handleLicenseChange}
                        />
                        <label className='custom-control-label' htmlFor='permission'>
                            <FormattedMessage id={'image-modal-image-license-permission'}>{txt => txt}</FormattedMessage>
                        </label>
                    </div>
                    <div className='custom-control custom-radio'>
                        <input
                            className='custom-control-input'
                            type='radio'
                            id='event_only'
                            name='license_type'
                            value='event_only'
                            onChange={this.handleLicenseChange}
                            checked
                        />
                        <label className='custom-control-label' htmlFor='event_only'>
                            <FormattedMessage id={'image-modal-license-restricted-to-event'}/>
                        </label>
                    </div>
                    <div className='custom-control custom-radio'>
                        <input
                            className='custom-control-input'
                            type='radio'
                            id='cc_by'
                            name='license_type'
                            value='cc_by'
                            onChange={this.handleLicenseChange}
                        />
                        <label className='custom-control-label' htmlFor='cc_by'>
                            Creative Commons BY 4.0
                        </label>
                    </div>
                </div>
                <div className='license-help-text tip' aria-label={this.context.intl.formatMessage({id: 'license-help-text'})}>
                    <FormattedMessage id={'image-modal-image-license-explanation-event-only'}/>
                    <FormattedHTMLMessage id={'image-modal-image-license-explanation-cc-by'} />
                </div>

            </div>
        )
    }

    /**
     * Returns true if some value in altText:{} or name:{} is too short or too long, or imagePermission is false
     * @returns {boolean}
     */
    getNotReadyToSubmit() {
        const {altTextMinLength, altTextMaxLength, nameMaxLength, photographerMaxLength} = this.state.validation;
        const {name, altText, photographerName} = this.state.image;
        const {imagePermission} = this.state;

        const altTextTooShort = Object.values(altText).some(value => value.length < altTextMinLength);
        const altTextTooLong = Object.values(altText).some(value => value.length > altTextMaxLength);
        const nameTooShort = Object.values(name).some(value => value.length === 0);
        const nameTooLong = Object.values(name).some(value => value.length > nameMaxLength);
        const photographerNameNotValid = photographerName.length === 0 || photographerName.length > photographerMaxLength;

        return (altTextTooShort || altTextTooLong) || nameTooShort || nameTooLong || photographerNameNotValid || !imagePermission;
    }



    render() {
        const {open, close} = this.props;
        const {thumbnailUrl} = this.state;
        const thumb = this.state.thumbnailUrl || this.props.thumbnailUrl;
        const errorMessage = this.state.urlError ? 'validation-isUrl' : 'uploaded-image-size-error';
        return (
            <React.Fragment>
                <Modal
                    className='image-edit-dialog'
                    role='dialog'
                    size='xl'
                    isOpen={open}
                    toggle={close}
                >
                    <ModalHeader tag='h1' close={this.getCloseButton()}>
                        <FormattedMessage id={'image-modal-image-info'}/>
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            <div className='col-sm-12  image-edit-dialog--form'>
                                {!this.props.updateExisting &&
                                <div className='file-upload'>
                                    <div className='tip' aria-label={this.context.intl.formatMessage({id: 'image-upload-help'})}>
                                        <p>
                                            <FormattedMessage id='uploaded-image-event-tip'>{txt => txt}</FormattedMessage>
                                            <br/>
                                            <FormattedMessage id='uploaded-image-size-tip'>{txt => txt}</FormattedMessage>
                                            <br/>
                                            <FormattedMessage id='uploaded-image-size-tip2'>{txt => txt}</FormattedMessage>
                                            <br/>
                                            <FormattedMessage id='uploaded-image-size-tip3'>{txt => txt}</FormattedMessage>
                                        </p>
                                    </div>
                                    <div className='file-upload-buttons'>
                                        <div className='file-upload--new'>
                                            <input
                                                onChange={(e) => this.handleUpload(e)}
                                                style={{display: 'none'}}
                                                name='file_upload'
                                                type='file'
                                                ref={this.hiddenFileInput}
                                                aria-hidden
                                            />
                                            <Button
                                                size='xl' block
                                                className='upload-img'
                                                variant='contained'
                                                onClick={() => this.clickHiddenUpload()}
                                            >
                                                <FormattedMessage id='upload-image' />
                                            </Button>
                                        </div>
                                        <div className='file-upload--external'>
                                            <form onSubmit={this.handleExternalImageSave} id='upload-external'>
                                                <label className='image-url'>
                                                    <FormattedMessage id='upload-image-from-url' />
                                                    <input
                                                        className='file-upload--external-input'
                                                        onChange={this.handleExternalImage}
                                                        name='externalUrl'
                                                        onBlur={this.handleInputBlur}
                                                        type='url'
                                                    />
                                                </label>
                                                {(this.state.fileSizeError || this.state.urlError) && (
                                                    <React.Fragment>
                                                        <FormattedMessage id={errorMessage}>{txt => <p role="alert" className='image-error'>{txt}</p>}</FormattedMessage>
                                                    </React.Fragment>
                                                )}
                                                <Button
                                                    size='xl' block
                                                    className='file-upload--external-button'
                                                    variant='contained'
                                                    color='primary'
                                                    type='submit'
                                                >
                                                    <FormattedMessage id='upload-image-from-url-button' />
                                                </Button>
                                                <div className='image'>
                                                    <img className="col-sm-6 image-edit-dialog--image" src={thumb} alt={getStringWithLocale(this.state.image,'altText')} />
                                                </div>
                                                <div className='tools'>
                                                    <Button
                                                        onClick={this.clearPictures}
                                                        variant='contained'
                                                        color='primary'
                                                        size='xl' block
                                                    >
                                                        <FormattedMessage id='uploaded-image-button-delete' />
                                                    </Button>
                                                    <div className='tip' aria-label={this.context.intl.formatMessage({id: 'uploaded-image-alt-tip-help'})}>
                                                        <p>
                                                            <FormattedMessage id='uploaded-image-alt-tip'>{txt => txt}</FormattedMessage>
                                                            <br/>
                                                            <FormattedMessage id='uploaded-image-alt-tip2'>{txt => txt}</FormattedMessage>
                                                        </p>
                                                    </div>
                                                    <div className='custom-control custom-checkbox'>
                                                        <input
                                                            className='custom-control-input'
                                                            id='hideAltText'
                                                            name='decoration'
                                                            type="checkbox"
                                                            onChange={this.setAltDecoration}
                                                        />
                                                        <label className='custom-control-label' htmlFor='hideAltText'>
                                                            <FormattedMessage id={'uploaded-image-alt-decoration'}/>
                                                        </label>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                }

                                {this.getFields()}
                                <div className='help-license'>
                                    <FormattedMessage id='image-modal-image-license'>{txt => <h2>{txt}</h2>}</FormattedMessage>
                                </div>
                                {this.getLicense()}
                                <div className="help-notice">
                                    <FormattedHTMLMessage id={'image-modal-view-terms-paragraph-text'}/>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <Button
                                    size="lg" block
                                    type="button"
                                    color="primary"
                                    variant="contained"
                                    disabled={this.getNotReadyToSubmit()}
                                    onClick={() => this.handleImagePost()}
                                >
                                    <FormattedMessage id={'image-modal-save-button-text'}>{txt => txt}</FormattedMessage>
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            </React.Fragment>
        )
    }
}

ImageEdit.propTypes = {
    editor: PropTypes.object,
    close: PropTypes.func,
    thumbnailUrl: PropTypes.string,
    imageFile: PropTypes.object,
    id: PropTypes.number,
    postImage: PropTypes.func,
    user: PropTypes.object,
    updateExisting: PropTypes.bool,
    defaultName: PropTypes.object,
    altText: PropTypes.object,
    defaultPhotographerName: PropTypes.string,
    license: PropTypes.string,
    open: PropTypes.bool,
};
ImageEdit.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user,
    editor: state.editor,
    images: state.images,
});

const mapDispatchToProps = (dispatch) => ({
    postImage: (data, user, id) => dispatch(postImageAction(data, user, id)),
});

export {ImageEdit as UnconnectedImageEdit}
// export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ImageEdit));
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ImageEdit))

