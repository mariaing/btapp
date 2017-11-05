import {Component} from '@angular/core';
import {IonicPage, NavController, ToastController} from 'ionic-angular';
import {User} from "../../providers/user/user";
import {TranslateService} from "@ngx-translate/core";
import {MainPage} from "../pages";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
 */
@IonicPage()
@Component({
    selector: 'page-welcome',
    templateUrl: 'welcome.html'
})
export class WelcomePage {
    private loginErrorString: string;
    private loginForm : FormGroup;
    tabBarElement: any;

    constructor(public navCtrl: NavController, public user: User,
                public toastCtrl: ToastController,
                public translateService: TranslateService, private formBuilder: FormBuilder) {
        // this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.translateService.get('LOGIN_ERROR').subscribe((value) => {
            this.loginErrorString = value;
        });

    }

    ionViewDidLoad() {

    }

    ionViewWillEnter() {
        // if(this.tabBarElement) this.tabBarElement.style.display = 'none';
    }

    ionViewWillLeave() {
        // if(this.tabBarElement) this.tabBarElement.style.display = 'flex';
    }

    doLogin() {
        this.user.login(this.loginForm.value).subscribe((resp) => {
            this.navCtrl.push(MainPage);
        }, (err) => {
            let toast = this.toastCtrl.create({
                message: this.loginErrorString,
                duration: 3000,
                position: 'top'
            });
            toast.present();
        });
    }
}
