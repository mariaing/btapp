import {Component, ViewChild} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, Config, Nav, Platform} from 'ionic-angular';

import {FirstRunPage, MainPage} from '../pages/pages';
import {StorageProvider} from "../providers/storage/storage";
import {Push, PushObject, PushOptions} from "@ionic-native/push";
import {TabsPage} from "../pages/tabs/tabs";
import { Api } from "../providers/api/api";

@Component({
    template: `
        <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp {
    rootPage: any = FirstRunPage;

    @ViewChild(Nav) nav: Nav;

    constructor(private push: Push, private alertCtrl: AlertController,private credentials: StorageProvider, private translate: TranslateService, private platform: Platform, private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen) {
        this.initTranslate();
        this.initRegId();

        if (this.credentials.getCredentials() != null) {
            this.rootPage = MainPage;
        } else {
            this.rootPage = FirstRunPage;
        }

    }

    ionViewDidLoad() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            localStorage.removeItem('service');
            localStorage.removeItem('pulsera_state');
            localStorage.removeItem('carga');
        });
    }

    initRegId(){
        let regid : string;
        this.push.hasPermission()
            .then((res: any) => {

                if (res.isEnabled) {
                    console.log('We have permission to send push notifications');
                } else {
                    console.log('We do not have permission to send push notifications');
                }

            });

        const options: PushOptions = {
            android: {
                sound: true,
                vibrate: true,
                icon: 'assets/img/icon.png',
                forceShow: true
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'false'
            },
            windows: {}
        };

        const pushObject: PushObject = this.push.init(options);

        pushObject.on('notification').subscribe((notification: any) =>
            this.panelNotify(notification)
        );

        pushObject.on('registration').subscribe((registration: any) =>{
            regid =registration.registrationId;
            this.credentials.setRegid(registration.registrationId)
        });

        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    }

    private panelNotify(data) {
        console.log(data)
        if(data.additionalData.type === 'confirmacion_cancel'){
            if(data.additionalData.foreground){
                if(localStorage.getItem('service')){
                    let alert = this.alertCtrl.create({
                        title: data.title,
                        message: data.message,
                        buttons: [{
                            text: 'Ok',
                            role: 'cancel',
                            handler: () => {
                                localStorage.removeItem('service');
                                this.nav.setRoot(TabsPage);
                            }
                        }]
                    });
                    alert.present();
                }
            }else{
                if(localStorage.getItem('service')){
                    let alert = this.alertCtrl.create({
                        title: data.title,
                        message: data.message,
                        buttons: [{
                            text: 'Ok',
                            role: 'cancel',
                            handler: () => {
                                localStorage.removeItem('service');
                                this.nav.setRoot(TabsPage);
                            }
                        }]
                    });
                    alert.present();
                }
            }

        }else{
            let alert = this.alertCtrl.create({
                title: data.title,
                message: data.message,
                buttons: [{
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => {
                        //console.log('Cancel clicked');
                    }
                }]
            });
            alert.present();
        }
    }
    initTranslate() {
        // Set the default language for translation strings, and the current language.
        this.translate.setDefaultLang('es');

        if (this.translate.getBrowserLang() !== undefined) {
            this.translate.use(this.translate.getBrowserLang());
        } else {
            this.translate.use('es'); // Set your language here
        }

        this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
            this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
        });
    }
}
