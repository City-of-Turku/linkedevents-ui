import {Passport} from 'passport'
import HelsinkiStrategy from 'passport-helsinki'
import _debug from 'debug'

const debug = _debug('auth')

export function getPassport(settings) {
    const passport = new Passport()

    const helsinkiStrategy = new HelsinkiStrategy({
        clientID: settings.helsinkiAuthId,
        clientSecret: settings.helsinkiAuthSecret,
        callbackURL: settings.publicUrl + '/auth/login/helsinki/return',
    }, (accessToken, refreshToken, profile, done) => {
        debug('access token:', accessToken)
        debug('refresh token:', refreshToken)
        debug('acquiring token from api...')

        helsinkiStrategy.getAPIToken(accessToken, settings.helsinkiTargetApp, (token) => {
            profile.token = token
            return done(null, profile)
        })
    })

    passport.use(helsinkiStrategy)

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))

    return passport;
}

function successfulLoginHandler(req, res) {
    const js =
    `setTimeout(function() {
      if(window.opener) {
          window.close();
      }
      else { location.href = "/"; }
    }, 300);`
    res.send('<html><body>Login successful.<script>' + js + '</script>');
}

export function addAuth(server, passport, settings) {
    server.use(passport.initialize());
    server.use(passport.session());
    server.get('/auth/login/helsinki', passport.authenticate('helsinki'));
    server.get('/auth/login/helsinki/return', passport.authenticate('helsinki'), successfulLoginHandler);
    server.get('/auth/logout', (req, res) => {
        res.send('<html><body><form method="post"></form><script>document.forms[0].submit()</script>');
    });
    server.post('/auth/logout', (req, res) => {
        req.logout();
        res.send('OK');
    });
    server.get('/auth/me', (req, res) => {
        res.json(req.user || {});
    });
}
