/**
 * Checks if cookie with the name 'CookieConsent' exists.
 * If it exists and its value is 'true' -> addCookieScript() is called.
 * @example
 * const consentValue = document.cookie.split('; ')
 * .find(row => row.startsWith('CookieConsent')).split('=')[1];
 * if (consentValue === 'true') { addCookieScript(); }
 */
function checkCookieConsent() {
    if (document.cookie.split('; ').find(row => row.startsWith('CookieConsent'))) {
        const consentValue = document.cookie.split('; ').find(row => row.startsWith('CookieConsent')).split('=')[1];
        if (consentValue === 'true') {
            addCookieScript();
        }
    }
}

/**
 * Creates new script element with src from urls.analytics.
 *
 * Checks if a script element with that src already exists, if not then the element is appended to <head> .
 */
function addCookieScript() {
    const scriptElements = Object.values(document.getElementsByTagName('head')[0].getElementsByTagName('script'));
    if (!scriptElements.find(element => element.src.includes('https://testivaraamo.turku.fi:8003/'))) {
        const cookieScript = document.createElement('script');
        cookieScript.type = 'text/javascript';
        const content = document.createTextNode(
            renderAnalyticsCode()
        );
        cookieScript.append(content);
        document.getElementsByTagName('head')[0].appendChild(cookieScript);
    }
}

/**
 * Returns script string with siteId according to param
 * @param piwikSiteId
 * @returns {string|null}
 */
function renderAnalyticsCode(piwikSiteId = 5) {
    // setVisitorCookieTimeout sets expiration (in seconds) for the _pk_id cookie, currently 90 days
    return `
      var _paq = _paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://testivaraamo.turku.fi:8003/";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', ${piwikSiteId}]);
        _paq.push(['setVisitorCookieTimeout','7776000']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript';
        g.async=true;
        g.defer=true;
        g.src=u+'matomo.js';
        s.parentNode.insertBefore(g,s);
      })();
    `;
}
export {checkCookieConsent, addCookieScript};
