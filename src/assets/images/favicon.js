import React from 'react';
import {Helmet} from 'react-helmet';

import eventsFavicon from '@city-images/favicon.ico';

const favicon = eventsFavicon;

function Favicon() {
    return (
        <Helmet link={[{href: favicon, rel: 'icon', type: 'image/x-icon'}]} />
    );
}

export default Favicon;
