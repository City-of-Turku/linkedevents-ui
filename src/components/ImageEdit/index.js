import './index.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {connect} from 'react-redux';
import {HelTextField, MultiLanguageField} from '../HelFormFields';
import {postImage as postImageAction} from 'src/actions/userImages';
import constants from 'src/constants';
import {Button, Modal, ModalHeader, ModalBody, Input, Label} from 'reactstrap';
import update from 'immutability-helper';
import {getStringWithLocale} from 'src/utils/locale';


const {CHARACTER_LIMIT, VALIDATION_RULES} = constants;

class ImageEdit extends React.Component {
    constructor(props) {
        super(props);
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
        };

        this.getCloseButton = this.getCloseButton.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLicenseChange = this.handleLicenseChange.bind(this);
    }

    componentDidMount() {
        if (this.props.updateExisting) {
            this.setState(
                {
                    image:
                        {
                            name:this.props.defaultName,
                            altText: this.props.altText,
                            photographerName: this.props.defaultPhotographerName,
                        },
                    license: this.props.license,
                });
        }
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
        let imageToPost = {
            name: this.state.image['name'],
            alt_text: this.state.image['altText'],
            photographer_name: this.state.image['photographerName'],
            license: this.state.license,
        };
        if (!this.props.updateExisting) {

            if (this.props.imageFile) {
                let image64 = await this.imageToBase64(this.props.imageFile);
                imageToPost = update(imageToPost,{
                    image:{$set: image64},
                    file_name:{$set: this.props.imageFile.name.split('.')[0]},
                });
            } else {
                imageToPost = update(imageToPost,{
                    url:{$set: this.props.thumbnailUrl},
                });
            }
            this.props.postImage(imageToPost, this.props.user, null);
        }
        else {
            this.props.postImage(imageToPost,this.props.user, this.props.id);
        }
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
                aria-label='Close'
                onClick={() => this.props.close()}
            >
                <span className='glyphicon glyphicon-remove' />
            </Button>
        )
    }

    getFields() {
        return (
            <React.Fragment>
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
                    label={<FormattedMessage id={'photographer'}
                        values={{maxLength: this.state.validation.photographerMaxLength}}
                    />}
                    validations={[VALIDATION_RULES.SHORT_STRING]}
                    maxLength={this.state.validation.photographerMaxLength}
                    onChange={this.handleChange}
                />
            </React.Fragment>
        )
    }

    getLicense() {
        const temp = (string) => this.props.updateExisting && this.state.license === string ? 'checked' : null;
        return (
            <div className='image-license-container'>
                <div className='license-choices'>
                    <Label>
                        <Input
                            addon
                            type='checkbox'
                            name='permission'
                            onChange={this.handleLicenseChange}
                        />
                        <FormattedMessage id={'image-modal-image-license-permission'}>{txt => txt}</FormattedMessage>
                    </Label>

                    <Label>
                        <Input
                            addon
                            type='radio'
                            name='license_type'
                            value='event_only'
                            onChange={this.handleLicenseChange}
                            checked={temp('event_only')} />

                        <FormattedMessage id={'image-modal-license-restricted-to-event'}/>
                    </Label>
                    <Label>
                        <Input
                            addon
                            type='radio'
                            name='license_type'
                            value='cc_by'
                            onChange={this.handleLicenseChange}
                            checked={temp('cc_by')} />
                        Creative Commons BY 4.0
                    </Label>
                </div>
                <div className='license-help-text tip'>
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
        const {close, thumbnailUrl} = this.props;
        return (
            <React.Fragment>
                <Modal
                    className='image-edit-dialog'
                    size='xl'
                    isOpen={true}
                    toggle={close}
                >
                    <ModalHeader tag='h1' close={this.getCloseButton()}>
                        <FormattedMessage id={'image-modal-image-info'}/>
                    </ModalHeader>
                    <ModalBody>
                        <div className='row'>
                            <div className='col-sm-8 image-edit-dialog--form'>
                                {this.getFields()}
                                <div style={{marginTop: '16px'}}>
                                    <FormattedMessage id='image-modal-image-license'>{txt => <h2>{txt}</h2>}</FormattedMessage>
                                </div>
                                {this.getLicense()}
                                <div
                                    className="image-edit-dialog--help-notice"
                                    style={{marginTop: '10px'}}
                                >
                                    <FormattedHTMLMessage id={'image-modal-view-terms-paragraph-text'}/>

                                </div>
                            </div>
                            <img className="col-sm-4 image-edit-dialog--image" src={thumbnailUrl} alt={getStringWithLocale(this.state.image,'altText')} />
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
};

const mapStateToProps = (state) => ({
    user: state.user,
    editor: state.editor,
    images: state.images,
});

const mapDispatchToProps = (dispatch) => ({
    postImage: (data, user, id) => dispatch(postImageAction(data, user, id)),
});

export {ImageEdit as UnconnectedImageEdit}
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ImageEdit));


