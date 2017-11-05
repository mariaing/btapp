import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, ViewController} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../providers/notification/NotificationService";
import {EmployeProvider} from "../../providers/employe/employe";
import {LoginPage} from "../pages";

/**
 * Generated class for the ChangepassPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-changepass',
    templateUrl: 'changepass.html',
})
export class ChangepassPage {

    chagepassForm: FormGroup;
    micomparePasswords : boolean = false;
    constructor(private formBuilder: FormBuilder, public navCtrl: NavController, private employeProvider: EmployeProvider,
                public viewCtrl: ViewController, private notification_service: NotificationService,
                private alertCtrl: AlertController) {
        this.chagepassForm = this.formBuilder.group({
            new_password: ['', Validators.required],
            confirm_password: ['', Validators.required]
        }, {validator: this.comparePasswords('new_password', 'confirm_password')});

    }

    ionViewDidLoad() {

    }
    comparePasswords(new_password: string, confirm_password: string) {
        return (group: FormGroup): {[key: string]: any} => {
            let password = group.controls[new_password];
            let confirmPassword = group.controls[confirm_password];

            if (password.value !== confirmPassword.value) {
                return {
                    micomparePasswords: true
                };
            }else{
                return {
                    micomparePasswords: false
                };
            }

        }
    }
    updatePass() {
        if(this.chagepassForm.value.new_password === '' || this.chagepassForm.value.confirm_password === ''){
            this.notification_service.notify_warning('Debe llenar los campos para actualizar la contraseña');
        }else{
            this.employeProvider.updatePass(this.chagepassForm.value.new_password).subscribe(()=>{
                let alert = this.alertCtrl.create({
                    title: 'Contrasena cambiada !',
                    message: 'Se cerrara la sesion para continuar.',
                    buttons:[{
                        text: 'Ok',
                        role: 'cancel',
                        handler: ()=>{
                            this.navCtrl.setRoot(LoginPage);
                        }
                    }]

                });
                alert.present();
            })
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
