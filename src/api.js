class API {
    static eventInfoLanguages() {
        return [
            {
                value: 'fi',
                label: 'in-fi',
            },
            {
                value: 'sv',
                label: 'in-sv',
            },
            {
                value: 'en',
                label: 'in-en',
            },
            //Commented out because our version of Linkedevents doesn't use this - Turku
            // {
            //     value: 'ru',
            //     label: 'in-ru',
            // },
            // {
            //     value: 'zh_hans',
            //     label: 'in-zh_hans',
            // },
            // {
            //     value: 'ar',
            //     label: 'in-ar',
            // },
        ]
    }
}

export default API
