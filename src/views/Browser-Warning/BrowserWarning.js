import React from 'react';

function BrowserWarning() {
    return (
        <div>
            <p className='alert alert-warning'>
                Linkedevents does not support old browsers.
                Please use another browser (such as
                <a href='https://www.google.com/chrome/'> Chrome</a>,
                <a href='https://www.mozilla.org/en-US/firefox/new/'> Firefox</a> or
                <a href='https://www.microsoft.com/en-us/edge'> Edge
                </a>
                ).
            </p>

            <p className='alert alert-warning'>
                Linkedevents ei tue vanhoja selaimia. 
                Käytä toista selainta (kuten
                <a href='https://www.google.com/intl/fi/chrome/'> Chrome</a>,
                <a href='https://www.mozilla.org/fi/firefox/new/'> Firefox</a> tai
                <a href='https://www.microsoft.com/fi-fi/edge'> Edge</a>
                ).
            </p>

            <p className='alert alert-warning'>
                Linkedevents stöder inte längre äldre webbläsare.
                Vänligen använd någon annan webbläsare (t.ex
                <a href='https://www.google.com/intl/sv/chrome/'> Chrome</a>,
                <a href='https://www.mozilla.org/sv-SE/firefox/new/'> Firefox</a> eller
                <a href='https://www.microsoft.com/sv-se/edge'> Edge</a>
                ).
            </p>
        </div>
    );
}

export default BrowserWarning;
