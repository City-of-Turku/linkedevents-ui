import React from 'react'
import HelTextField from './HelTextField.js'
import DatePicker from 'react-datepicker/dist/react-datepicker.js'
import 'react-datepicker/dist/react-datepicker.css'
import './HelDatePicker.scss'

import {connect} from 'react-redux'
import {setData} from 'src/actions/editor.js'

import moment from 'moment'

let HelDatePicker = React.createClass({
    getInitialState: function() {
        return {
            date: this.props.defaultValue ? moment(this.props.defaultValue) : moment()
        }
    },

    propTypes: {
        defaultValue: React.PropTypes.object,
        name: React.PropTypes.string.isRequired,
        onBlur: React.PropTypes.func.isRequired
    },

    componentDidMount: function () {
        this.props.onChange('date', this.state.date._d)
    },

    handleChange: function (date) {
        this.setState({
          date: date
        })
        this.props.onChange('date', date._d)
    },

    handleBlur: function () {
        this.props.onBlur()
    },

    render: function () {
        return (
          <div className='hel-text-field'>
            <DatePicker
                placeholderText='pp.kk.vvvv'
                selected={this.state.date}
                name={this.props.name}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
            />
          </div>

        )
    }
});

export default connect((state) => ({
    editor: state.editor
}))(HelDatePicker)
