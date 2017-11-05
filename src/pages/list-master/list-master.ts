import {Component, NgZone} from '@angular/core';
import {AlertController, IonicPage, NavController, Platform} from 'ionic-angular';
import {Items} from '../../providers/providers';
import {ChatPage, LoginPage, MyListService, WaitPage} from "../pages";
import {User} from "../../providers/user/user";
import {Diagnostic} from "@ionic-native/diagnostic";
import {BackgroundGeolocationProvider} from "../../providers/background-geolocation/background-geolocation";
import {StorageProvider} from "../../providers/storage/storage";
import {FileUploadResult, Transfer, TransferObject} from "@ionic-native/transfer";
import {UploadImage} from "../../models/UploadImage";
import {Helper} from "../../helpers/helper";
import {NotificationService} from "../../providers/notification/NotificationService";
import {ImageResizer, ImageResizerOptions} from "@ionic-native/image-resizer";
import {Insomnia} from "@ionic-native/insomnia";
import {CameraProfileProvider} from "../../providers/camera-profile/camera-profile";
import {Api} from "../../providers/api/api";
import {Geolocation} from "@ionic-native/geolocation";
import { LocalNotifications } from '@ionic-native/local-notifications';

declare const cordova: any;
declare const google;
declare const io: any;
@IonicPage()
@Component({
    selector: 'page-list-master',
    templateUrl: 'list-master.html'
})
export class ListMasterPage {
    currentItems = [];
    selected_item: any;
    myLat: any;
    myLng: any;
    socket: any;
    public unregisterBackButtonAction: any;
    typePhotography: string = "Ingreso";
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
    // socket_url : string;
    // socket_subscribe : any;
    private file_transfer: TransferObject = this.transfer.create();

    constructor(private platform: Platform,private localNotifications: LocalNotifications, private credentials: StorageProvider,private alertCtrl: AlertController,
                private bglocation: BackgroundGeolocationProvider, private diagnostic: Diagnostic,
                public navCtrl: NavController, public items: Items, private transfer: Transfer,
                private notification_service: NotificationService, private user: User,
                private image_resizer: ImageResizer,private ng_zone: NgZone, private insomnia: Insomnia,
                private cameraProfile: CameraProfileProvider, private api: Api, private geolocation: Geolocation) {
        // this.socket_url = this.api.url;
    }

    subscribe() {
        // this.socket = io(this.socket_url);
        io.socket.get('http://192.168.1.40:1337/empleado/'+this.credentials.getCredentials().empleado.id+'/watcher');
        io.socket.on('NuevoMensaje', (response)=>{
            // Schedule a single notification
            this.localNotifications.schedule({
                title: 'Has recivido un nuevo mensaje de tu empresa',
                text: 'Tu empresa te ha enviado un mensaje, revisa el Chat.',
                sound: this.isAndroid? 'file://sound.mp3': 'file://beep.caf',
                icon: 'http://example.com/icon.png'
            });
        });
    }

    isAndroid(){
        if(cordova.platform.isAndroid()) return true;
        if(!cordova.platform.isAndroid()) return false;
    }
    /**
     * The view loaded, let's query our items for the list
     */
    ionViewDidLoad() {

    }

    public doRefresh(event) {
      this.getServicios();
      if (event != 0) event.complete();
    }

    ionViewWillEnter() {
        this.subscribe();
        this.getServicios();
        this.verifyEnableGeolocation();
        this.initializeBackButtonCustomHandler();
    }
    public initializeBackButtonCustomHandler(): void {
        this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
            this.customHandleBackButton();
        }, 10);
    }

    ionViewWillLeave() {
        // Unregister the custom back button action for this page
        this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    }

    private customHandleBackButton(): void {
        // do what you need to do here ...
    }
    public async  verifyEnableGeolocation(): Promise<void>{
        let enable = await this.diagnostic.isLocationEnabled().then((isEnable)=>{
            console.info('Is enable', isEnable);
            if(isEnable){
                this.bglocation.startTracking();
                this.myLocation();
            }else{
                let alert = this.alertCtrl.create({
                    title: 'Atencion !',
                    message: 'Por politicas de la empresa, debes mantener los servicios de ubicacion activados',
                    buttons: [{
                        text: 'Ajustes',
                        role: 'cancel',
                        handler: ()=>{
                            this.openLocationSettings().then((response) =>{
                                this.bglocation.startTracking();
                                this.myLocation();
                            })
                        }
                    }]
                });
                alert.present();
            }
        })
        return enable;
    }

    public async openLocationSettings(): Promise<any>{
        return await this.diagnostic.switchToLocationSettings();
    }

    private getServicios() {
        this.items.getList().subscribe((response) => {
            this.currentItems = response.data;
        })
    }

    /**
     * Confinm an item from the list of items.
     */
    confirmItem(item) {
        this.selected_item = item;

        var itemcount = 0;
        this.items.getItem().subscribe(response => {
            itemcount = response.data.length;
        });
        if(itemcount > 0){
          let alert = this.alertCtrl.create({
            title: 'Atencion',
            message: 'Actualmente te ecuentras en un servicio, no puedes aceptar otro.',
            buttons: [{
                text: 'Ok',
                role: 'cancel',
                handler: () => {

                }
            }]
          });
          alert.present();
          return;
        }
        if(this.credentials.getStatePulsera() === '255' || this.credentials.getStatePulsera() === null){
            let alert = this.alertCtrl.create({
                title: 'Atencion',
                message: 'La pulsera se registra como no conectada, verifica que todo este correcto e intenta aceptar el nuevamente.',
                buttons: [{
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => {

                    }
                }]
            });
            alert.present();
            return;
        }
        this.navCtrl.push(WaitPage, this.selected_item);

        // if(this.verifyEnableGeolocation()){
        //     this.myLocation();
        //     let directionsService = new google.maps.DirectionsService();
        //     let start = new google.maps.LatLng(item.pos_lat, item.pos_lng);
        //     let end = new google.maps.LatLng(this.myLat, this.myLng);
        //
        //     let request = {
        //         origin: start,
        //         destination: end,
        //         travelMode: google.maps.TravelMode.DRIVING
        //     };
        //
        //     directionsService.route(request, (result, status) => {
        //         console.log(result);
        //         if (status == google.maps.DirectionsStatus.OK) {
        //             if (result.routes[0].legs[0].distance.value < 850) {
        //                 let alert = this.alertCtrl.create({
        //                     title: 'Aceptar servicio',
        //                     message: 'Usa esta opcion solo si esta seguro de estar en el lugar del trabajo.',
        //                     buttons: [{
        //                         text: 'Cancelar',
        //                         role: 'cancel',
        //                         handler: () => {
        //                             //console.log('Cancel clicked');
        //                         }
        //                     }, {
        //                         text: 'Confirmar',
        //                         handler: () => {
        //                             this.open_camera();
        //                         }
        //                     }
        //                     ]
        //                 });
        //                 alert.present();
        //             } else {
        //                 let alert = this.alertCtrl.create({
        //                     title: 'Atencion',
        //                     message: 'No puedes aceptar este servicio, te encuentras fuera de la ubicacion',
        //                     buttons: [{
        //                         text: 'Ok',
        //                         role: 'cancel',
        //                         handler: () => {
        //                             return;
        //                         }
        //                     }]
        //                 });
        //                 alert.present();
        //             }
        //         }
        //     });
        // }
    }

    public async  myLocation(): Promise<void>{
        this.geolocation.getCurrentPosition().then((position) => {
            this.myLat = position.coords.latitude;
            this.myLng = position.coords.longitude;
        }, (err) => {
            console.log(err);
        });
    }
    /**
     * Opens the camera and displays the picture if available
     */
    public async open_camera(): Promise<void> {
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
                type: this.typePhotography
            }
        };
        try {
            // Start uploading!
            let result = await this.file_transfer.upload(
                encodeURI(this.images[this.current].path),
                encodeURI(this.api.url + "/asignaciones/" + this.selected_item.id + '/imagen'),
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
            this.items.acceptItemService(this.selected_item).subscribe((res)=>{
              this.notification_service.notify_success('Se cargo la imagen correctamente');
              if(!localStorage.getItem('service')){
                  this.navCtrl.push(WaitPage, this.selected_item);
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

    openItem(item) {
        this.navCtrl.push('ItemDetailPage', {
            service: item
        });
    }

    public async logout(): Promise<void>{
        let la = await this.user.logout();
        this.navCtrl.push(LoginPage);
    }

    goPageMyListService(){
        this.navCtrl.push(MyListService);
    }

    public pageChat(){
        this.navCtrl.push(ChatPage);
    }
}
