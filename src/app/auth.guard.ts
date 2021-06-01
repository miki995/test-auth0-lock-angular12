import { ApplicationRef, Inject, Injectable, LOCALE_ID, NgZone } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import * as auth from 'auth0-lock';
import * as auth0 from 'auth0-js';

import { BehaviorSubject } from 'rxjs';

export enum AuthTypes {
  Login = 1,
  SignUp = 2,
  InvitationLogin = 3,
  InvitationSignUp = 4
}

@Injectable()
export class Auth {

  status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  onUserSignUp: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  lock;
  auth0sdk;

  private user: any;
  /* Handling Invitations */
  private loginType: AuthTypes = AuthTypes.Login;
  private timeoutHold = 2000;


  // Call this method in app.component.ts
  // if using hash-based routing
  constructor(private zone: NgZone,
              private applicationRef: ApplicationRef,
              @Inject(LOCALE_ID) private localeId: string,
              private router: Router) {

    this.user = { user: 'miki' };

    this.auth0sdk = new auth0.WebAuth({
      domain: 'miki',
      clientID: 'miki',
      responseType: 'token id_token',
      scope: 'openid profile read:current_user',
      audience: 'miki',
      redirectUri: 'miki',
    });

    this.auth0sdk.checkSession({}, (err, authResult) => {
      if (err) {
        return;
      }

      localStorage.setItem('profile', JSON.stringify(authResult.idTokenPayload));

      zone.run(() => authThis.user = authResult.idTokenPayload);

      authThis.redirect();
    });

    this.lock = new auth.default('miki', 'miki', {
      auth: {
        redirectUrl: 'miki',
        responseType: 'token id_token',
        audience: 'miki',
        params: {
          scope: 'openid profile read:current_user'
        },
        sso: true
      },
      autoclose: true,
      rememberLastLogin: true,
      allowSignUp: false,
      oidcConformant: true,
      closable: false,
      language: (this.localeId === 'en-US' || this.localeId === 'en-gb') ? 'en' : this.localeId,
      theme: {
        logo: '/assets/images/reynaers.png'
      },
      languageDictionary: {
        title: 'Hive'
      }
    });

    const lock = this.lock;
    const authThis = this;
  }

  authenticated(): boolean {

    // Check if there's an unexpired JWT
    return true;
  }

  redirect(): void {

    this.loginType = AuthTypes.Login;
    this.lock.hide();

    this.router.navigateByUrl('/dashboard');
  }

  /**
   * Invoke 0Auth login screen
   */
  login(obj?: {}, type?: AuthTypes, inviteId?: string): void {
    // Show the Auth0 Lock widget
    this.lock.show(obj);
  }

  logout() {

    localStorage.removeItem('profile');
    this.auth0sdk.logout({
      clientID: 'miki',
    });

    // this.angularFire.auth.signOut();

    this.status.next(false);
    this.login();
  }
}

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: Auth) {
  }

  canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {

    // show login screen on page load
    if (!this.authService.authenticated()) {
      this.authService.login();
    }

    this.router.navigate([ '' ]);

    return false;
  }
}
