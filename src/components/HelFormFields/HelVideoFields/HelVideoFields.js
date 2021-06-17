import './HelVideoFields.scss';

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {setData as setDataAction} from 'src/actions/editor';
import {HelTextField, MultiLanguageField} from '../index';
import {SideField} from '../../FormFields';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {isEmpty, get} from 'lodash';
import update from 'immutability-helper';

import constants from 'src/constants';
const  {VALIDATION_RULES} = constants;

/**
 * empty video object
 * @type {{alt_text: {}, name: {}, url: string}}
 */
const EMPTY_VIDEO = {
    name: {},
    alt_text: {},
    url: '',
};


class HelVideoFields extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            videos: [],
        }
        this.handleAddVideo = this.handleAddVideo.bind(this);
        this.handleDeleteVideo = this.handleDeleteVideo.bind(this);
    }


    componentDidMount() {
        const defaultValues = this.props.defaultValues;
        if (defaultValues && defaultValues.length > 0) {
            this.setState({videos: this.props.defaultValues})
        } else {
            this.setState({videos: [Object.assign({}, EMPTY_VIDEO)]})
        }
    }

    /**
     * If prevProps languages !== this.props.languages
     * ie. ['fi','sv'] -> ['fi'] then the 'sv' keys with their values are removed
     * and the result is dispatched to redux store.
     * @param prevProps
     * @param prevState
     * @param snapshot
     * @example
     * {
     *     name: {
     *         fi: 'finnish',
     *         sv: 'swedish',
     *     },
     *
     * }
     * becomes
     * {
     *     name: {
     *         fi: 'finnish',
     *     },
     * }
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.languages !== this.props.languages) {
            const usedLanguages = this.props.languages;
            let videos = this.state.videos;

            for (let video of videos) {
                for (let key in video) {
                    if (typeof video[key] === 'object') {
                        Object.keys(video[key]).forEach((k) => {
                            if (!usedLanguages.includes(k)) {
                                video[key] = update(video[key], {
                                    $unset: [k],
                                })
                            }
                        })
                    }
                }
            }
            this.props.setData({videos: videos});
        }
        if (prevProps.action === 'update' && this.props.action === 'create') {
            this.setState({videos: [Object.assign({}, EMPTY_VIDEO)]})
        }
    }

    /**
     * Sends dispatch containing current videos to redux store
     * @param event
     * @param value
     * @param video
     */
    handleBlur(event, value, video) {
        this.props.setData({videos: video});
    }

    /**
     *
     * Sets value object to the correct video , if the object value is empty then { } is set.
     * @param {Object} event
     * @param {Object} value
     * @param {string} name - key where value is to be set
     * @param {number} index - index of video in state.videos array
     * @example
     *  if name: {fi: ''}
     *  then name: { }
     */
    handleChange(event, value, name, index) {
        const usedLanguages = this.props.languages;
        this.setState(state => {
            let videos = [...state.videos];

            if (name !== 'url' && typeof value === 'object') {
                let hasData;
                Object.entries(value).forEach((entry, index) => {
                    if (usedLanguages.length > 1) {hasData = entry.some(x => x.length > 0)}
                    else {hasData = entry.every(x => x.length > 0)}
                })
                if (!hasData) {value = {}}
            }

            let target = videos[index];
            videos[index] = update(target, {
                [name]: {
                    $set: value,
                },
            })
            return {videos};
        });
    }

    /**
     * Adds one video to state.videos array
     * @example
     * state.videos = [{video}]
     * handleAddVideo()
     * state.videos = [{video}{video}]
     */
    handleAddVideo() {
        let updatedStateVideos = this.state.videos;
        updatedStateVideos = update(updatedStateVideos, {$push:[Object.assign({}, EMPTY_VIDEO)]});
        this.setState({videos: updatedStateVideos})
    }

    /**
     * Removes video at index from state.videos
     * @example
     * state.videos = [{one}{two}{three}]
     * handleDeleteVideo(1)
     * state.videos = [{one}{three}]
     */
    handleDeleteVideo(index) {
        const currentStateVideos = this.state.videos;
        const filteredCurrentStateVideos = currentStateVideos.filter((video, itemIndex) => itemIndex !== index);
        this.setState({videos: filteredCurrentStateVideos});
        this.props.setData({videos: filteredCurrentStateVideos});
    }


    /**
     * Checks if video contains any values are not length > 0
     * @example
     * {
     *     name: {
     *         fi: '',
     *     }
     *     alt_text: {
     *         fi: '',
     *     },
     *     url: '',
     * } // this video would return False
     * {
     *     name: {
     *         fi:'',
     *     },
     *     alt_text: {
     *         fi:'test',
     *     },
     *     url: '',
     * } // this video would return True
     * @param {Object} video
     * @returns {boolean}
     */
    checkIfRequired(video) {
        const entries = Object.values(video);
        let result;

        for (const entry of entries) {
            if (result) {break}
            if (typeof entry === 'object') {
                for (const key in entry) {
                    result = !isEmpty(entry[key]);
                    if (result) {break}
                }
            }
            if (typeof entry === 'string') {result = entry.length > 0;}
        }
        return result;
    }

    render() {

        // TODO: Uncomment the Button components to enable adding multiple video fields.
        // Everything should work with multiple videos but it should be tested/checked before using.

        const stateVideos = this.state.videos;
        const required = stateVideos.map(video => this.checkIfRequired(video));
        return (
            <React.Fragment>
                <div className="row event-videos">
                    <div className="col-xs-12 col-sm-6">
                        {stateVideos.map((video, index) => (
                            <div key={`video-field-${index}`} className={classNames('event-videos--item-container', {'indented': this.state.videos.length > 1})}>
                                <div className='event-videos--item-inputs'>
                                    { /*this.state.videos.length > 1 &&
                                    <Button
                                        size='sm'
                                        onClick={() => this.handleDeleteVideo(index)}
                                        style={{left: '480px', position: 'absolute'}}
                                    >
                                        {this.props.intl.formatMessage({id: 'delete'})}
                                    </Button>
                                    */}
                                    <HelTextField
                                        id='event-video-url'
                                        key='url-video-field'
                                        required={required[index]}
                                        defaultValue={video.url}
                                        label={this.context.intl.formatMessage({id: 'event-video-url'})}
                                        validations={[VALIDATION_RULES.IS_URL]}
                                        validationErrors={get(this.props.validationErrors,['videos', index, 'url'], null)}
                                        onChange={(e, v) => this.handleChange(e, v, 'url', index)}
                                        onBlur={(e, v) => this.handleBlur(e, v, this.state.videos)}
                                        placeholder='https://...'
                                        type='url'
                                    />
                                    <MultiLanguageField
                                        id='event-video-name'
                                        defaultValue={video.name}
                                        required={required[index]}
                                        multiLine={false}
                                        validations={[VALIDATION_RULES.SHORT_STRING]}
                                        validationErrors={get(this.props.validationErrors,['videos', index, 'name'], null)}
                                        label='event-video-name'
                                        languages={this.props.languages}
                                        onChange={(e, v) => this.handleChange(e, v, 'name', index)}
                                        onBlur={(e, v) => this.handleBlur(e, v, this.state.videos)}
                                        type='text'
                                    />
                                    <MultiLanguageField
                                        id='event-video-alt_text'
                                        defaultValue={video.alt_text}
                                        required={required[index]}
                                        multiLine={false}
                                        validations={[VALIDATION_RULES.MEDIUM_STRING]}
                                        validationErrors={get(this.props.validationErrors,['videos', index, 'alt_text'], null)}
                                        label='event-video-alt_text'
                                        languages={this.props.languages}
                                        onChange={(e, v) => this.handleChange(e, v, 'alt_text', index)}
                                        onBlur={(e, v) => this.handleBlur(e, v, this.state.videos)}
                                        type='text'
                                    />
                                </div>
                            </div>
                        ))}
                        {/*
                        <div>
                            <Button
                                size='lg'
                                block
                                onClick={this.handleAddVideo}
                            >
                                {this.context.intl.formatMessage({id: 'event-video-add'})}
                            </Button>
                        </div>
                        */}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

HelVideoFields.contextTypes = {
    intl: PropTypes.object,
}

HelVideoFields.propTypes = {
    action: PropTypes.string,
    setData: PropTypes.func,
    defaultValues: PropTypes.array,
    validationErrors: PropTypes.object,
    setDirtyState: PropTypes.func,
    languages: PropTypes.array,
    intl: PropTypes.object,
    editorValues: PropTypes.object,
}

const mapStateToProps = (state) => ({
    languages: state.editor.contentLanguages,
    editorValues: state.editor.values,
})

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
});

export {HelVideoFields as UnconnectedHelVideoFields}
export default connect(mapStateToProps, mapDispatchToProps)(HelVideoFields)
