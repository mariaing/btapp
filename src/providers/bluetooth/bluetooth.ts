import { Injectable } from '@angular/core';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {AlertController, LoadingController, NavController} from "ionic-angular";
import {WelcomePage} from "../../pages/welcome/welcome";
import {StorageProvider} from "../storage/storage";
import {EmployeProvider} from "../employe/employe";
import {Items} from "../../mocks/providers/items";


/*
  Generated class for the CameraDeviceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BluetoothProvider {
    loading = null;
    H255 : boolean;
    H0 : boolean;
    timer : number;
    espera: any;
    device : any;
    devices = [];

    constructor(private items: Items, private employeProvider: EmployeProvider, private credentials: StorageProvider, private btserial: BluetoothSerial, public navCtrl: NavController, public loadingCtrl: LoadingController, private alertCtrl: AlertController) {

    }

    enableBluetooth(){
        this.btserial.enable().then((response)=>{
            this.listDevices();
            this.scanDevices();
        }, (err) => {
        })
    }

    private scanDevices(){
        let loading = this.loadingCtrl.create({
            content: 'Buscando dispositivos...'
        });
        loading.present();
        this.btserial.discoverUnpaired().then((response) => {
            this.devices = response;
            loading.dismiss();
        }, (err) => {
            loading.dismiss();
        })
    }

    private listDevices(){
        let loading = this.loadingCtrl.create({
            content: 'Listando dispositivos...'
        });
        loading.present();
        this.btserial.list().then((response) => {
            this.devices = response;
            loading.dismiss();
        }, (err) => {
            loading.dismiss();
        })
    }

    connect(device){
        let loading = this.loadingCtrl.create({
            content: 'Conectando...'
        });
        loading.present();
        this.device = device;
        this.btserial.connect(device.id).subscribe((responseConnect) => {
            loading.dismiss();
            this.btserial.subscribe('\n').subscribe((responseSuscribe)=>{
                this.btserial.isEnabled().then((responseEnable) => {
                    this.btserial.isConnected().then((responseBConnect)=>{
                        responseSuscribe = responseSuscribe.toString().replace(/(^\s+|\s+$)/g,'');
                        this.credentials.setStatePulsera(responseSuscribe);
                        clearInterval(this.espera);
                        if(responseSuscribe === '0' && this.H0 === false){
                            this.H255 = false;
                            this.H0 = true;
                            this.employeProvider.updateStatePulsera(responseSuscribe).subscribe(()=>{

                            });
                        }else if(responseSuscribe === '255' && this.H255 === false){
                            this.H255 = true;
                            this.H0 = false;
                            this.employeProvider.updateStatePulsera(responseSuscribe).subscribe(()=>{

                            });
                        }
                    }, (responseBConnectError) => {
                        this.showReconect();
                    });
                })
            });
            this.navCtrl.parent.select(0);
        }, (responseConnectError) => {
            this.isDeconnected();
        });
    }

    private isDeconnected(){
        let alert = this.alertCtrl.create({
            title: 'Atencion!',
            message: 'El bluetooth ha sido desactivado/desconectado o la pulsera a salido del rango de alcance, por favor, active el bluetooth o acerque la pulsera para volver a conectarse.',
            buttons: [{
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                    this.btserial.disconnect().then((data)=>{});
                    this.btserial.clear().then((data)=>{});
                    let alert = this.alertCtrl.create({
                        title: 'Atencion!',
                        message: 'Empezara un conteo de 5 minutos para reconectar la pulsera, si no lo hace se cerrara su sesion y se reiniciara el trabajo aceptado.',
                        buttons: [{
                            text: 'Ok',
                            role: 'cancel',
                            handler: () => {
                                this.H255 = false;
                                this.H0 = false;
                                this.credentials.setStatePulsera('255');
                                this.employeProvider.updateStatePulsera('255').subscribe(()=>{

                                });
                                this.inTimerWait();
                            }
                        }]
                    });
                    alert.present();
                }
            }]
        });
        alert.present();
    }

    private showReconect(){
        let alert = this.alertCtrl.create({
            title: 'Atencion!',
            message: 'La pulsera esta desconectada, quieres conectarte nuevamente?.',
            buttons: [{
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    //console.log('Cancel clicked');
                }
            }, {
                text: 'Ok',
                handler: () => {
                    clearInterval(this.espera);
                    this.connect(this.device);
                }
            }
            ]
        });
        alert.present();
    }

    private inTimerWait(){
        this.espera = setInterval(()=>{
            console.log('El timer');
            if(this.timer === 4){
                clearInterval(this.espera);
                let alert = this.alertCtrl.create({
                    title: 'Alerta!',
                    message: 'Han pasado los 5 minutos desde la desconeccion de la pulsera, deseas reconectarte?.',
                    buttons: [{
                        text: 'No',
                        role: 'cancel',
                        handler: () => {
                            if(localStorage.getItem('service')){
                                this.items.cancelItemState(localStorage.getItem('service')).subscribe((data)=>{
                                    console.log(data);
                                    this.logout();
                                });
                            }else{
                                this.logout();
                            }
                        }
                    }, {
                        text: 'Si',
                        role: 'cancel',
                        handler: () =>{
                            clearInterval(this.espera);
                            this.btserial.enable().then((responseEnable) => {
                                this.connect(this.device);
                            });
                        }
                    }]
                });
                alert.present();
            }else {
                this.timer++;
            }
        }, 60000)
    }

    EnterPage() {
        if(this.credentials.getStatePulsera() === '0'){
            let alert = this.alertCtrl.create({
                title: 'Espera',
                message: 'Ya estas conectado a la pulsera, no tienes nada que hacer aca.',
                buttons: [{
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => {
                        this.navCtrl.parent.select(0);
                    }
                }]
            });
            alert.present();
        }else {
            this.enableBluetooth();
        }
    }
    ionViewDidLoad() {

    }


    logout(){
        this.navCtrl.push(WelcomePage);
    }

}
