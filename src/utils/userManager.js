import {createUserManager} from 'redux-oidc';
import {WebStorageStateStore} from 'oidc-client';

const baseUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

const userManagerConfig = {
    client_id: oidcSettings.client_id,
    redirect_uri: `${baseUrl}/callback`,
    response_type: 'id_token token',
    scope: `openid profile email ${oidcSettings.openid_audience}`,
    authority: oidcSettings.openid_authority,
    post_logout_redirect_uri: `${baseUrl}/callback/logout`,
    automaticSilentRenew: true,
    silent_redirect_uri: `${baseUrl}/silent-renew`,
    stateStore: new WebStorageStateStore({store: localStorage}),
    userStore: new WebStorageStateStore({store: localStorage}),
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
