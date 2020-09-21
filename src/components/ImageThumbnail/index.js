import './index.scss'

import React from 'react'
import PropTypes from 'prop-types'

import {FormattedMessage, injectIntl} from 'react-intl'
import {connect} from 'react-redux'
import {deleteImage, selectImage as selectImageAction} from 'src/actions/userImages'
import ImageEdit from '../ImageEdit'
import {getStringWithLocale} from 'src/utils/locale';
import {Button} from 'reactstrap'
import {isEmpty} from 'lodash';
import {confirmAction} from '../../actions/app';
import classNames from 'classnames';


class ImageThumbnail extends React.PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            edit: false,
        }

        this.selectThis = this.selectThis.bind(this)
        this.handleDelete = this.handleDelete.bind(this);
    }

    selectThis() {
        if (!this.props.selected) {
            this.props.selectImage(this.props.data);
            if (this.props.close) {
                this.props.close();
            }

        } else {
            this.props.selectImage({});
        }

    }

    handleDelete(event) {

        let selectedImage = this.props.data
        const currentLanguage = this.props.locale;
        if (!isEmpty(selectedImage)) {
            this.props.confirmAction('confirm-image-delete', 'warning', 'delete', {
                action: (e) => this.props.deleteImage(selectedImage, this.props.user),
                additionalMsg: getStringWithLocale(selectedImage, 'name', currentLanguage),
                additionalMarkup: ' ',
            })

        }
    }

    render() {
        let locale = this.props.locale;
        let classname = this.props.selected ? 'image-thumb selected' : 'image-thumb'
        let mainPreview = !this.props.modal;
        let prev = mainPreview ? {height: '114px'} : {};
        if(this.props.empty) {
            classname += ' no-image'
            return (
                <div className={
                    classNames({'col-md-3': this.props.modal},{'col-md-6': !this.props.modal},' col-xs-12')} onClick={this.selectThis} id={this.props.data.id} style={{display: 'none'}}>
                    <div className={classname}>
                        <div className="thumbnail" style={{backgroundColor: 'lightgray'}} />
                        <div className="no-image-text"><FormattedMessage id="no-image" /></div>
                    </div>
                </div>
            )
        }


        const bgStyle = {backgroundImage: 'url(' + this.props.url + ')'};

        let editModal = null;

        if (this.state.edit) {
            editModal = <ImageEdit
                id={this.props.data.id}
                defaultName={this.props.data.name}
                altText={this.props.data.alt_text}
                defaultPhotographerName={this.props.data.photographer_name}
                thumbnailUrl={this.props.url}
                license={this.props.data.license}
                open={this.state.edit}
                close={() => this.setState({edit: false})}
                updateExisting
            />;
        }

        return (
            <div
                className={
                    classNames({'col-md-3': this.props.modal},{'col-md-6': !this.props.modal},' col-xs-12')}
                id={this.props.data.id}
            >
                <div className={classname} style={prev}>
                    <Button
                        aria-label={this.context.intl.formatMessage({id: `thumbnail-picture-select`}) + '' + getStringWithLocale(this.props.data, 'name', locale)}
                        className="thumbnail"
                        style={bgStyle}
                        onClick={this.selectThis}
                    />

                    {this.props.modal && (
                        <div className='name' >
                            <span className={'image-title'}>
                                {getStringWithLocale(this.props.data, 'name', locale) || <FormattedMessage id="edit-image"/>}
                            </span>
                            <div className='name-buttons'>
                                <button
                                    className={'btn'}
                                    onClick={() => this.setState({edit: true})}
                                    aria-label={this.context.intl.formatMessage({id: `thumbnail-picture-edit`})}
                                >
                                    <span className='glyphicon glyphicon-cog' aria-hidden style={{color: 'white', marginRight: '0'}}/>
                                </button>
                                <button
                                    className={'btn'}
                                    onClick={this.handleDelete}
                                    aria-label={this.context.intl.formatMessage({id: `thumbnail-picture-delete`})}
                                >
                                    <span className='glyphicon glyphicon-trash' aria-hidden style={{color: 'white', marginRight: '0'}}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                { editModal }
            </div>
        )
    }
}
ImageThumbnail.propTypes = {
    data: PropTypes.object,
    selected: PropTypes.bool,
    empty: PropTypes.bool,
    url: PropTypes.string,
    selectImage: PropTypes.func,
    confirmAction: PropTypes.func,
    deleteImage: PropTypes.func,
    locale: PropTypes.string,
    modal: PropTypes.bool,
    action: PropTypes.func,
    user: PropTypes.object,
    close: PropTypes.func,
}

ImageThumbnail.contextTypes = {
    intl: PropTypes.object,
}

const mapDispatchToProps = (dispatch) => ({
    selectImage: (data) => dispatch(selectImageAction(data)),
    deleteImage: (selectedImage, user) => dispatch(deleteImage(selectedImage, user)),
    confirmAction: (msg,style, actionButtonLabel, data) => dispatch(confirmAction(msg,style,actionButtonLabel,data)),
})

const mapStateToProps = () => ({})
// TODO: if leave null, react-intl not refresh. Replace this with better React context
export default connect(mapStateToProps, mapDispatchToProps)(ImageThumbnail)
