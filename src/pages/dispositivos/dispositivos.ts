import {Component, NgZone} from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, Platform} from 'ionic-angular';
import {Items} from "../../mocks/providers/items";
import {EmployeProvider} from "../../providers/employe/employe";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {StorageProvider} from "../../providers/storage/storage";
import {ChatPage, LoginPage, WaitPage} from "../pages";
import {User} from "../../providers/user/user";
import {FileUploadResult, Transfer, TransferObject} from "@ionic-native/transfer";
import {UploadImage} from "../../models/UploadImage";
import {ImageResizer, ImageResizerOptions} from "@ionic-native/image-resizer";
import {Insomnia} from "@ionic-native/insomnia";
import {CameraProfileProvider} from "../../providers/camera-profile/camera-profile";
import {Helper} from "../../helpers/helper";
import {NotificationService} from "../../providers/notification/NotificationService";
import {Api} from "../../providers/api/api";

@IonicPage()
@Component({
    selector: 'page-dispositivos',
    templateUrl: 'dispositivos.html'
})
export class DispositivosPage {
    loading = null;
    H255: boolean;
    H0: boolean;
    timer: number = 0;
    espera: any;
    device: any;
    values: any;
    carga : boolean;
    typePhotography: string = "Reconección";

    public deviceItems : any;

    /**
     * The selected images
     */
    public images: Array<UploadImage> = [];
    /**
     * A flag that indicates whether the app is uploading files or not
     */

    /**
     * The index of the current image being uploaded
     */
    public current: number = 0;
    /**
     * Total images to upload
     */
    public total: number;
    /**
     * Amount of progress made during an image upload
     */
    public progress: number = 0;
    /**
     * The transfer object
     */
    private file_transfer: TransferObject = this.transfer.create();
    public unregisterBackButtonAction: any;


    constructor(private platform: Platform,private transfer: Transfer,private user: User, private items: Items,
                private employeProvider: EmployeProvider, private credentials: StorageProvider,
                private btserial: BluetoothSerial, public navCtrl: NavController,
                public loadingCtrl: LoadingController, private alertCtrl: AlertController,
                private image_resizer: ImageResizer,private ng_zone: NgZone, private insomnia: Insomnia,
                private cameraProfile: CameraProfileProvider, private notification_service: NotificationService,
                private api: Api) {
        this.deviceItems = [];
        this.values = [];
        this.H0 = false;
        this.H255 = false;
        this.carga = false;


    }

    doRefresh(event) {
      this.btserial.enable().then((response) => {
        this.listDevices();
        this.scanDevices();
    }, (err) => {
    })
      if (event != 0) event.complete();
    }

    ionViewWillLeave() {
        // Unregister the custom back button action for this page
        this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    }

    private customHandleBackButton(): void {
        // do what you need to do here ...
    }
    public initializeBackButtonCustomHandler(): void {
        this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
            this.customHandleBackButton();
        }, 10);
    }

    enableBluetooth() {
        this.btserial.enable().then((response) => {
            this.listDevices();
            this.scanDevices();
        }, (err) => {
        })
    }

    private scanDevices() {
        let loading = this.loadingCtrl.create({
            content: 'Buscando dispositivos...'
        });
        loading.present();
        this.btserial.discoverUnpaired().then((response) => {

            this.deviceItems = response;
            loading.dismiss();
        }, (err) => {
            loading.dismiss();
        })
    }

    private listDevices() {
        let loading = this.loadingCtrl.create({
            content: 'Listando dispositivos...'
        });
        loading.present();
        this.btserial.list().then((response) => {

            this.deviceItems = response;
            loading.dismiss();
        }, (err) => {
            loading.dismiss();
        })
    }

    connect(device) {
        let loading = this.loadingCtrl.create({
            content: 'Conectando...'
        });
        loading.present();
        this.device = device;
        console.info('Device', device);
        loading.dismiss();
        // var probar =device.id.toString().replace(/(^\s+|\s+$)/g, '')
        // if(probar === this.credentials.getCredentials().empleado.iddispositivo){
        //     let alert = this.alertCtrl.create({
        //         title: 'Que haces!',
        //         message: 'Estas intentado conectarte a un dispositivo que no te pertence.',
        //         buttons: [{
        //             text: 'Ok',
        //             role: 'cancel',
        //             handler: () => {}
        //         }]
        //     });
        //     alert.present();
        // }else{

        // }
        this.btserial.connect(device.id).subscribe((responseConnect) => {
          this.btserial.subscribe('\n').subscribe((responseSuscribe) => {
              this.btserial.isEnabled().then((responseEnable) => {
                  this.btserial.isConnected().then((responseBConnect) => {
                      responseSuscribe = responseSuscribe.toString().replace(/(^\s+|\s+$)/g, '');
                      if(responseSuscribe === 'L'  && this.carga === false){
                        this.carga = true;
                        let alert = this.alertCtrl.create({
                            title: 'Atencion!',
                            message: 'La bateria de tu dispositivo esta descargada, por favor ponla a cargar para seguir trabajando nuevamente.',
                            buttons: [{
                                text: 'Ok',
                                role: 'cancel',
                                handler: () => {
                                  this.H255 = true;
                                  this.H0 = false;
                                  this.employeProvider.updateStatePulsera(responseSplit[0]).subscribe(() => {
                                      this.credentials.setStatePulsera(responseSplit[0]);
                                  });
                                }
                            }]
                        });
                        alert.present();
                      }else{
                        responseSuscribe = responseSuscribe.replace(/{/g, '');
                        responseSuscribe =responseSuscribe.replace(/}/g, '');
                        var responseSplit = responseSuscribe.split(",");

                        this.calculatePercentBaterry(responseSplit[1]);
                        console.log(responseSplit);
                        for (var i = 0; i < responseSplit.length; i++) {
                            if (responseSplit[0] === '0' && this.H0 === false) {
                                console.info('Esta conectada ', responseSplit[0])
                                this.H255 = false;
                                this.H0 = true;
                                this.employeProvider.updateStatePulsera(responseSplit[0]).subscribe(() => {
                                    this.credentials.setStatePulsera(responseSplit[0]);
                                });
                            } else if (responseSplit[0] === '255' && this.H255 === false) {
                                console.info('Esta desconectada ', responseSplit[0]);
                                localStorage.removeItem('carga');
                                this.reconnectOnDeconncted();
                                this.H255 = true;
                                this.H0 = false;
                                this.employeProvider.updateStatePulsera(responseSplit[0]).subscribe(() => {
                                    this.credentials.setStatePulsera(responseSplit[0]);
                                });
                            }
                        }
                      }
                      clearInterval(this.espera);
                  }, (responseBConnectError) => {
                      this.showReconect();
                  });
              })
          });
          this.navCtrl.parent.select(0);
      }, (responseConnectError) => {
          loading.dismiss();
          this.isDeconnected();
      });
    }

    private reconnectOnDeconncted(){
        if(localStorage.getItem('service')){
            let alert = this.alertCtrl.create({
                title: 'Alerta!',
                message: 'Acualmente se encuentra realizando un servicio y su pulsera se registro como desconectada, al reconectarse debera tomarse nuevamente una fotografia de confirmación, si no desea reconectarse su servicio sera cancelado y se cerrara su sesión. Desea Reconectar No/Si',
                buttons: [{
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        if (localStorage.getItem('service')) {
                            this.items.cancelItemState(localStorage.getItem('service')).subscribe((data) => {
                                this.logout();
                            });
                        } else {
                            this.logout();
                        }
                    }
                }, {
                    text: 'Si',
                    handler: () => {
                        if(localStorage.getItem('pulsera_state') === '255'){
                            let alert = this.alertCtrl.create({
                                title: 'Atencion!',
                                message: 'La pulsera aun se registra como desconectada, no puede realizar esta accion',
                                buttons: [{
                                    text: 'Ok',
                                    role: 'cancel'
                                }]
                            });
                            alert.present();
                            return;
                        }else{
                            if (localStorage.getItem('service')) {
                                this.open_camera();
                            }
                        }

                        // this.btserial.enable().then((responseEnable) => {
                        //     this.connect(this.device);
                        // });
                    }
                }]
            });
            alert.present();
        }
    }

    private calculatePercentBaterry(value){
        if(value == '4.2'){
            this.credentials.setCargaPulsera('100')
        }else if(value == '4.1'){
            this.credentials.setCargaPulsera('90')
        }else if(value == '4' || value == '4.0'){
            this.credentials.setCargaPulsera('80')
        }else if(value == '3.9'){
            this.credentials.setCargaPulsera('70')
        }else if(value == '3.8'){
            this.credentials.setCargaPulsera('60')
        }else if(value == '3.7'){
            this.credentials.setCargaPulsera('50')
        }else if(value == '3.6'){
            this.credentials.setCargaPulsera('40')
        }
    }
    private isDeconnected() {
        let alert = this.alertCtrl.create({
            title: 'Atencion!',
            message: 'El bluetooth ha sido desactivado/desconectado o la pulsera a salido del rango de alcance, por favor, active el bluetooth o acerque la pulsera para volver a conectarse.',
            buttons: [{
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                    this.btserial.disconnect().then((data) => {
                    });
                    this.btserial.clear().then((data) => {
                    });
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

                                this.employeProvider.updateStatePulsera('255').subscribe(() => {

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

    private showReconect() {
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

    private inTimerWait() {
        this.espera = setInterval(() => {
            console.log('El timer');
            if (this.timer === 4) {
                clearInterval(this.espera);
                let alert = this.alertCtrl.create({
                    title: 'Alerta!',
                    message: 'Han pasado los 5 minutos desde la desconeccion de la pulsera, deseas reconectarte?.',
                    buttons: [{
                        text: 'No',
                        role: 'cancel',
                        handler: () => {
                            if (localStorage.getItem('service')) {
                                this.items.cancelItemState(localStorage.getItem('service')).subscribe((data) => {
                                    console.log(data);
                                    this.logout();
                                });
                            } else {
                                this.logout();
                            }
                        }
                    }, {
                        text: 'Si',
                        role: 'cancel',
                        handler: () => {
                            clearInterval(this.espera);
                            if (localStorage.getItem('service')) {
                                this.open_camera();
                            }

                            this.btserial.enable().then((responseEnable) => {
                                this.connect(this.device);
                            });
                        }
                    }]
                });
                alert.present();
            } else {
                this.timer++;
            }
        }, 60000)
    }

    ionViewWillEnter() {
        this.deviceItems = [];
        if (this.credentials.getStatePulsera() === '0') {
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
        } else {
            this.enableBluetooth();
        }
        this.initializeBackButtonCustomHandler();
    }

    ionViewDidLoad() {

    }

    /**
     * Opens the camera and displays the picture if available
     */
    public async open_camera(): Promise<void> {
        this.images = [];
        let orignal = await this.cameraProfile.open_camera();
        this.images.push(new UploadImage({
            path: orignal,
            guid: Helper.guid(),
            thumb: await this.resize(orignal)
        }));
        this.start_upload();
    }

    /**
     * Resizes an image
     * @param original The path to the original image
     */
    private async resize(original: string): Promise<string> {
        let options = {
            uri: original,
            folderName: 'btproject',
            quality: 90,
            width: 1280,
            height: 1280
        } as ImageResizerOptions;
        return this.image_resizer.resize(options);
    }

    /**
     * Starts the upload of the
     */
    public async start_upload(): Promise<void> {

        this.total = this.images.length;
        // Keep the phone awake (e.g. dont let go in sleep mode)
        this.insomnia.keepAwake();
        // Start the first upload
        this.upload();
    }

    /**
     * The on upload progress callback event
     * @param progressEvent The progress event of the image upload
     */
    public on_progress = (progressEvent: ProgressEvent): void => {
        this.ng_zone.run(() => {
            if (progressEvent.lengthComputable) {
                let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                if (progress > 100) progress = 100;
                if (progress < 0) progress = 0;
                this.progress = progress;
            }
        });
    }

    /**
     * Actually uploads an image
     */
    public async upload(): Promise<void> {
        // Bind the progress function
        this.file_transfer.onProgress(this.on_progress);
        // Prepare our upload options
        let options = {
            fileKey: 'file',
            fileName: this.images[this.current].path.split('/').pop(),
            mimeType: 'image/jpeg',
            chunkedMode: false,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + this.credentials.getToken()
            },
            params: {
                type: 'Reconección',
                duracion_in_moment: localStorage.getItem('time_moment')
            }
        };
        try {
            // Start uploading!
            let result = await this.file_transfer.upload(
                encodeURI(this.images[this.current].path),
                encodeURI(this.api.url + "/asignaciones/" + JSON.parse(localStorage.getItem('service')).id + '/imagen'),
                options,
                false
            );
            this.on_success(result);
        } catch (e) {
            this.on_failed(e);
        }
    }

    /**
     * The on success upload callback
     * @param result The upload result
     */
    public on_success = (result: FileUploadResult): void => {
        // Mark the image as uploaded
        this.images[this.current].uploaded = true;
        // Do we have more to upload?
        if (this.current + 1 < this.images.length) {
            // Yes, we have. Up the current index
            this.current++;
            // reset the progress
            this.progress = 0;
            // and start the upload
            this.upload();
        } else {
            // No, we're done with uploading. Allow the device to sleep again.
            // This is important, because if you don't allow sleep again
            // in any case, apple wont accept your app in the store.
            this.insomnia.allowSleepAgain();
            this.images = [];
            this.current = 0;
            this.notification_service.notify_success('Se cargo la imagen correctamente');
            this.items.acceptItemService(JSON.parse(localStorage.getItem('service'))).subscribe((res)=>{
                if(!localStorage.getItem('service')){
                    this.navCtrl.push(WaitPage, JSON.parse(localStorage.getItem('service')));
                }
            })
        }
    };

    /**
     * The on failed upload callback
     * @param error The upload error
     */
    public on_failed = (error: any): void => {
        // Something went wrong, allow sleep again
        this.insomnia.allowSleepAgain();
        // These are cancel events, if user canceled don't do anything
        if (error.code == 3 || error.code == 4) return;
        this.notification_service.notify_error(error);

    }


    public async logout(): Promise<void>{
        let la = await this.user.logout();
        this.navCtrl.push(LoginPage);
    }

    public pageChat(){
        this.navCtrl.push(ChatPage);
    }

}
