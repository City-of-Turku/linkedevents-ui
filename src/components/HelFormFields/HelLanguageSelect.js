// Group of checkboxes that output an array on change

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {setLanguages as setLanguageAction} from 'src/actions/editor.js';

class HelLanguageSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: this.props.checked,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.checked !== this.props.checked) {
            this.setState({lang: this.props.checked})
        }
    }

    onChange = () => {
        const {options} = this.props;
        const checkedOptions = options
            .filter((option, index) => this[`checkRef${index}`].checked)
            .map((checkedOption) => checkedOption.value);
        if (checkedOptions.length === 0 && this.state.lang.length !== 0) {
            return null
        }
        this.props.setLanguages(checkedOptions);

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(checkedOptions);
        }
    };

    render() {
        const {options, checked} = this.props;
        const checkboxes = options.map((item, index) => {
            const checkedOptions = checked;
            const isChecked = checkedOptions && checkedOptions.includes(item.value);
            const disabled = isChecked && checkedOptions && checkedOptions.length === 1;

            return (
                <div className='custom-control custom-checkbox' key={index}>
                    <input
                        id={`checkBox-${item.value}`}
                        className='custom-control-input'
                        type='checkbox'
                        ref={(ref) => (this[`checkRef${index}`] = ref)}
                        key={index}
                        name={item.value}
                        checked={isChecked}
                        onChange={this.onChange}
                        aria-checked={isChecked}
                        aria-disabled={disabled}
                    />
                    <label className={classNames('custom-control-label', {disabled: disabled})} htmlFor={`checkBox-${item.value}`}>
                        <FormattedMessage id={item.label} />
                    </label>
                </div>
            );
        });

        return <div className='language-selection'>{checkboxes}</div>;
    }
}

HelLanguageSelect.propTypes = {
    setLanguages: PropTypes.func,
    onChange: PropTypes.func,
    options: PropTypes.array,
    checked: PropTypes.array,
};

const mapDispatchToProps = (dispatch) => ({
    setLanguages: (langs) => dispatch(setLanguageAction(langs)),
});

const mapStateToProps = () => ({});
// TODO: if leave null, react-intl not refresh. Replace this with better React context
export {HelLanguageSelect as UnconnectedLanguageSelect}
export default connect(mapStateToProps, mapDispatchToProps)(HelLanguageSelect);
