import './index.scss';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import EventDetails from '../EventDetails'
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {Button, Modal, ModalHeader, ModalBody} from 'reactstrap';
import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping.js'

class PreviewModal extends React.Component {

        static propTypes = {
            toggle: PropTypes.func,
            isOpen: PropTypes.bool,
        }
        state = {
            event: {},
            superEvent: {},
            subEvents: [],
            publisher: null,
        }
        render() {
            const {event, superEvent, publisher, editor} = this.state
            const formattedEvent = mapAPIDataToUIFormat(this.state.event)
            return (
                <Modal
                    className='previewModal'
                    size='xl'
                    isOpen={this.props.isOpen}
                    toggle={this.props.toggle}
                >
                    <ModalBody>
                        <div>
                            <EventDetails
                                values={formattedEvent}
                                superEvent={superEvent}
                                rawData={event}
                                publisher={publisher}
                                editor={editor}
                            />
                        </div>
                    </ModalBody>
                </Modal>
            );
        }
}
PreviewModal.PropTypes = {
    toggle: PropTypes.func,
    values: PropTypes.object,
    superEvent: PropTypes.object,
    rawData: PropTypes.object,
    publisher: PropTypes.object,
    editor: PropTypes.object,
    intl: intlShape,
}

export default injectIntl(PreviewModal)
