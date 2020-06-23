

const singleValueStyles = (provided) => ({
    ...provided,
    color: '#1a1a1a',
})
const menuListStyles = (provided) => ({
    ...provided,
    backgroundColor: '#fff',
    borderRadius: 2,
})
const optionStyles = (provided, {isSelected, isFocused}) => ({
    ...provided,
    backgroundColor: isSelected
        // selected
        ? '#0072c6'
        : isFocused
            // focused but not selected
            ? '#cce2f3'
            // not focused and not selected
            : '#fff',
    color: isSelected
        ? '#fff'
        : '#1a1a1a',
    ':hover': {
        ...provided[':hover'],
        backgroundColor: isSelected
            ? '#0072c6'
            : '#cce2f3',
    },
})

export const HelSelectStyles = {
    singleValue: singleValueStyles,
    menuList: menuListStyles,
    option: optionStyles,
}

export const HelLanguageSelectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: 'transparent',
        border: '0',
        cursor: 'pointer',
        width: 55,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#fff',
        fontWeight: 'bold',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#fff',
        padding: 0,
        ':hover': {
            color: '#fff',
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    menuList: menuListStyles,
    option: (provided, state) => ({
        ...optionStyles(provided, state),
        textAlign: 'center',
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: 0,
    }),
}

export const HelSelectTheme = (theme) => ({
    ...theme,
    borderRadius: 2,
    colors: {
        ...theme.colors,
        primary:  '#0072c6',
        danger: '#c4123e',
    },
})
