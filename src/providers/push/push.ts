import {Injectable} from "@angular/core";
import {Push, PushObject, PushOptions} from "@ionic-native/push";
import {AlertController} from "ionic-angular";
import {Api} from "../api/api";
import {StorageProvider} from "../storage/storage";
import {Headers, RequestOptions} from "@angular/http";

@Injectable()
export class PushProvider {
    regid: string;
    constructor(private credentials: StorageProvider, private api: Api, private push: Push, private alertCtrl: AlertController){ }

    suscribe() {
        this.updateRegId(localStorage.getItem('reg_id'));
        // this.push.hasPermission()
        //     .then((res: any) => {
        //
        //         if (res.isEnabled) {
        //             console.log('We have permission to send push notifications');
        //         } else {
        //             console.log('We do not have permission to send push notifications');
        //         }
        //
        //     });
        //
        // const options: PushOptions = {
        //     android: {
        //         senderID: '1041132021812'
        //     },
        //     ios: {
        //         alert: 'true',
        //         badge: true,
        //         sound: 'false'
        //     },
        //     windows: {}
        // };
        //
        // const pushObject: PushObject = this.push.init(options);
        //
        // pushObject.on('notification').subscribe((notification: any) =>
        //     this.panelNotify(notification)
        // );
        //
        // pushObject.on('registration').subscribe((registration: any) =>{
        //     this.regid =registration.registrationId;
        //     this.credentials.setRegid(registration.registrationId)
        //     this.updateRegId(registration.registrationId);
        // });
        //
        // pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    }

    private updateRegId(reg_id = null){
        let token = this.credentials.getToken();
        let regId = reg_id || this.credentials.getRegid();
        let authHeader = new Headers();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('user/'+this.credentials.getCredentials().id+'/updateRegId/'+regId,null,options).subscribe(()=>{

        })
    }
    // private panelNotify(data) {
    //     if(data.type === 'confirmacion_cancel'){
    //         let alert = this.alertCtrl.create({
    //             title: data.title,
    //             message: data.message,
    //             buttons: [{
    //                 text: 'Ok',
    //                 role: 'cancel',
    //                 handler: () => {
    //                     localStorage.removeItem('service');
    //                     this.navCtrl.setRoot(TabsPage)
    //                 }
    //             }]
    //         });
    //         alert.present();
    //     }else{
    //         let alert = this.alertCtrl.create({
    //             title: data.title,
    //             message: data.message,
    //             buttons: [{
    //                 text: 'Ok',
    //                 role: 'cancel',
    //                 handler: () => {
    //                     //console.log('Cancel clicked');
    //                 }
    //             }]
    //         });
    //         alert.present();
    //     }
    // }
}