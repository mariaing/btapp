import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {Api} from '../api/api';
import {StorageProvider} from "../storage/storage";
import {PushProvider} from "../push/push";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {BackgroundGeolocationProvider} from "../background-geolocation/background-geolocation";


@Injectable()
export class User {
    _user: any;

    constructor(private bgLocation: BackgroundGeolocationProvider, private btserial: BluetoothSerial, private push: PushProvider, public http: Http, public api: Api, private credentials: StorageProvider) {
    }

    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    login(accountInfo: any) {
        let seq = this.api.post('user/authentication', accountInfo).share();

        seq
            .map(res => res.json())
            .subscribe(res => {
                // If the API returned a successful response, mark the user as logged in
                if (res.code == 'OK') {
                    this._loggedIn(res.data);
                } else {
                }
            }, err => {
                console.error('ERROR', err);
            });

        return seq;
    }

    /**
     * Log the user out, which forgets the session
     */
    logout() {
        this._user = null;
        this.credentials.clearCredentials();
        this.btserial.disconnect().then((data)=>{});
        this.btserial.clear().then((data)=>{});
        this.bgLocation.stopTracking();
    }

    /**
     * Process a login/signup response to store user data
     */
    _loggedIn(resp) {
        this.credentials.setCredentials(resp.user);
        this.credentials.setToken(resp.token);
        this.credentials.setStateTutorial();
        this.push.suscribe();
        this._user = resp.user;
    }
}
