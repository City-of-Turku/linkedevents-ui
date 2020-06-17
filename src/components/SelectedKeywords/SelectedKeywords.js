import './SelectedKeywords.scss'
import PropTypes from 'prop-types';
import React from 'react'
// Removed Material-Ui/core since it's no longer in use.
import {Badge, Button} from 'reactstrap';




const SelectedKeywords = ({selectedKeywords,onDelete}) => {
    
   
    return(
        <div
            className="keyword-chip-container"
        >
            {selectedKeywords.map((keyword, index) => (
                <Badge
                    className="keyword-chip-item"
                    key={`keyword-${index}`}
                    color="primary"
                >{keyword.label}  
                    <Button onClick={() => onDelete(keyword)} className="badge badge-primary">x</Button>
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
    
}

export default SelectedKeywords
