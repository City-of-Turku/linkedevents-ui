import './SelectedKeywords.scss'
import PropTypes from 'prop-types';
import React from 'react'
// Removed Material-Ui/core since it's no longer in use.
import {Badge, Button} from 'reactstrap';
import {getStringWithLocale} from '../../utils/locale';
const SelectedKeywords = ({selectedKeywords,onDelete, locale, intl}) => {
    return(
        <div
            className="keyword-chip-container"
        >
            {selectedKeywords.map((keyword, index) => (
                <Badge
                    className="keyword-chip-item"
                    key={`keyword-${index}`}
                    color="primary"
                >{keyword.name[locale] || keyword.label}
                    <Button
                        onClick={() => onDelete(keyword)}
                        className="badge badge-pill  badge-primary"
                        aria-label={intl.formatMessage({id: 'event-keywords-delete'}) + ' ' + (getStringWithLocale(keyword,'name',locale, keyword.label))}>
                            &times;
                    </Button>
                </Badge>
            ))}
        </div>
    )
}

SelectedKeywords.defaultProps = {
    selectedKeywords: [],
    onDelete: () => {},
}
SelectedKeywords.propTypes = {
    selectedKeywords: PropTypes.array,
    onDelete: PropTypes.func,
    locale: PropTypes.string,
    intl: PropTypes.object,
}

export default SelectedKeywords
