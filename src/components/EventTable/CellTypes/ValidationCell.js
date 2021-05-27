import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from 'reactstrap';
import {injectIntl} from 'react-intl';
import {doValidations} from 'src/validation/validator';
import getContentLanguages from 'src/utils/language';
import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping';
import {connect} from 'react-redux';
import {push} from 'connected-react-router';
import constants from 'src/constants';
import classNames from 'classnames';

const {PUBLICATION_STATUS} = constants;

class ValidationCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasErrors: false,
            tooltipOpen: false,
        }
        this.toggleTooltip = this.toggleTooltip.bind(this);
        this.moveToEdit = this.moveToEdit.bind(this);
    }

    componentDidMount() {
        const {event, editor} = this.props;
        const formattedEvent = mapAPIDataToUIFormat(event);

        formattedEvent.sub_events = [];

        const validations = doValidations(
            formattedEvent,
            getContentLanguages(formattedEvent),
            PUBLICATION_STATUS.PUBLIC,
            editor.keywordSets
        );

        const hasValidationErrors = Object.keys(validations).length > 0;

        if (hasValidationErrors) {
            this.props.handleInvalidRow(event.id);
            this.setState({hasErrors: true});
        }
    }

    toggleTooltip() {
        this.setState({tooltipOpen: !this.state.tooltipOpen});
    }

    moveToEdit() {
        const {routerPush, event} = this.props;
        routerPush(`/event/update/${event.id}`);
    }


    render() {
        const {intl} = this.props;

        return (
            <td className={classNames('validation-cell',{'error': this.state.hasErrors})}>
                {this.state.hasErrors &&
                <span id='validationAlert' className='glyphicon glyphicon-alert' onClick={this.moveToEdit}/>
                }
                {this.state.hasErrors &&
                <Tooltip isOpen={this.state.tooltipOpen} target='validationAlert' toggle={this.toggleTooltip} onClick={this.moveToEdit}>
                    {intl.formatMessage({id: 'event-validation-errors'})}
                </Tooltip>
                }
            </td>
        );
    }
}

ValidationCell.propTypes = {
    routerPush: PropTypes.func,
    intl: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    handleInvalidRow: PropTypes.func,
};

const mapStateToProps = (state) => ({
    editor: state.editor,
});

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ValidationCell))
