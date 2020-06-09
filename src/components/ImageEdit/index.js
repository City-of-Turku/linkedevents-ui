import './index.scss'

import React, {useState} from 'react';
import PropTypes from 'prop-types'
import {injectIntl, FormattedMessage} from 'react-intl'
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    withStyles,
} from '@material-ui/core'
import {Close} from '@material-ui/icons'
import {connect} from 'react-redux'
import HelTextField from '../HelFormFields/HelTextField'
import {postImage as postImageAction} from 'src/actions/userImages'
import {HelMaterialTheme} from '../../themes/material-ui'
import constants from '../../constants'
import {Button, Modal, ModalHeader, ModalBody, Form, FormGroup} from 'reactstrap';


const {CHARACTER_LIMIT, VALIDATION_RULES} = constants

const InlineRadioGroup = withStyles({
    root: {
        flexDirection: 'row',
    },
})(RadioGroup)

/**
 * Handles saving of the form
 * @param name
 * @param photographerName
 * @param license
 * @param altText
 * @param updateExisting
 * @param imageFile
 * @param thumbnailUrl
 * @param postImage
 * @param user
 * @param id
 * @param close
 */
const handleImagePost = ({
    name,
    photographerName,
    license,
    altText,
},
{
    updateExisting = false,
    imageFile,
    thumbnailUrl,
    postImage,
    user,
    id,
    close,
}) => {
    const data = new FormData()

    if (!updateExisting) {
        imageFile
            ? data.append('image', imageFile)
            : data.append('url', thumbnailUrl)
    }

    data.append('name', name)
    data.append('alt_text', altText)
    data.append('photographer_name', photographerName)
    data.append('license', license)

    postImage(data, user, updateExisting ? id : null)
    close()
}

/**
 * Checks whether the submit button should be disabled
 * @param name
 * @param nameMaxLength
 * @param altText
 * @param altTextMinLength
 * @param altTextMaxLength
 * @returns {boolean}
 */
const getIsDisabled = ({
    name,
    nameMaxLength,
    altText,
    altTextMinLength,
    altTextMaxLength,
}) =>
    altText.length < altTextMinLength
    || name.length > nameMaxLength
    || altText.length > altTextMaxLength

const ImageEdit = (props) => {
    const [state, setState] = useState({
        name: props.defaultName || '',
        photographerName: props.defaultPhotographerName || '',
        license: props.license || 'cc_by',
        altText: props.altText || '',
        altTextMinLength: 6,
        nameMaxLength: CHARACTER_LIMIT.SHORT_STRING,
        altTextMaxLength: CHARACTER_LIMIT.MEDIUM_STRING,
    })

    const handleStateChange = (event) => {
        const {name: key, value} = event.target
        setState(state => ({
            ...state,
            [key]: value,
        }))
    }

    const {close, thumbnailUrl} = props
    const {
        name,
        photographerName,
        license,
        altText,
        altTextMinLength,
        nameMaxLength,
        altTextMaxLength,
    } = state

    return (
        <Modal
            className="image-edit-dialog"
            size='xl'
            isOpen={true}
        >
            <ModalHeader tag='h1'>
                <FormattedMessage id={'image-modal-image-info'}/>
                <Button
                    className='icon-button'
                    type='button'
                    aria-label='Close'
                    onClick={() => close()}>
                    <span className='glyphicon glyphicon-remove'></span>
                </Button>
            </ModalHeader>
            <ModalBody>
                <Form onSubmit={() => handleImagePost(state, props)} className="row">
                    <div className="col-sm-8 image-edit-dialog--form">
                        <HelTextField
                            multiLine
                            onChange={handleStateChange}
                            name="altText"
                            required={true}
                            defaultValue={altText}
                            validations={[VALIDATION_RULES.MEDIUM_STRING]}
                            maxLength={altTextMaxLength}
                            label={
                                <FormattedMessage
                                    id={'alt-text'}
                                    values={{
                                        minLength: altTextMinLength,
                                        maxLength: altTextMaxLength}}
                                />
                            }
                        />
                        <HelTextField
                            multiLine
                            onChange={handleStateChange}
                            name="name"
                            defaultValue={name}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            maxLength={nameMaxLength}
                            label={
                                <FormattedMessage
                                    id={'image-caption-limit-for-min-and-max'}
                                    values={{
                                        maxLength: nameMaxLength}}
                                />
                            }
                        />
                        <TextField
                            fullWidth
                            name="photographerName"
                            label={<FormattedMessage id={'photographer'}/>}
                            value={photographerName}
                            onChange={handleStateChange}
                        />
                        <Typography
                            style={{marginTop: HelMaterialTheme.spacing(2)}}
                            variant="h6"
                        >
                            <FormattedMessage id={'image-modal-image-license'}/>
                        </Typography>
                        <InlineRadioGroup
                            aria-label="License"
                            name="license"
                            value={license}
                            onChange={handleStateChange}
                        >
                            <FormControlLabel
                                value="cc_by"
                                control={<Radio color="primary" />}
                                label="Creative Commons BY 4.0"
                            />
                            <FormControlLabel
                                value="event_only"
                                control={<Radio color="primary" />}
                                label={<FormattedMessage id={'image-modal-license-restricted-to-event'}/>}
                            />
                        </InlineRadioGroup>
                        <div
                            className="image-edit-dialog--help-notice"
                            style={{marginTop: HelMaterialTheme.spacing(2)}}
                        >
                            <FormattedMessage id={'image-modal-view-terms-paragraph-text'}/>
                            &nbsp;
                            <a href={'/help#images'} target={'_blank'} rel="noopener noreferrer">
                                <FormattedMessage id={'image-modal-view-terms-link-text'}/>
                            </a>
                        </div>
                    </div>
                    <img className="col-sm-4 image-edit-dialog--image" src={thumbnailUrl} alt={altText} />
                    <div className="col-sm-12">
                        <Button
                            size="lg" block
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={getIsDisabled(state)}
                        >
                            Tallenna tiedot
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    )
}

ImageEdit.propTypes = {
    updateExisting: PropTypes.bool,
    defaultName: PropTypes.string,
    defaultPhotographerName: PropTypes.string,
    altText: PropTypes.string,
    license: PropTypes.string,
    imageFile: PropTypes.object,
    thumbnailUrl: PropTypes.string,
    postImage: PropTypes.func,
    user: PropTypes.object,
    id: PropTypes.number,
    close: PropTypes.func,
}

const mapStateToProps = (state) => ({
    user: state.user,
    editor: state.editor,
    images: state.images,
})

const mapDispatchToProps = (dispatch) => ({
    postImage: (data, user, id) => dispatch(postImageAction(data, user, id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ImageEdit))
