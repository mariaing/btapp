import {Component, NgZone} from '@angular/core';
import {ActionSheetController, IonicPage, ModalController, NavController, Platform} from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {Api} from "../../providers/api/api";
import {EmployeProvider} from "../../providers/employe/employe";
import {CameraProfileProvider} from "../../providers/camera-profile/camera-profile";
import {FileUploadResult, Transfer, TransferObject} from "@ionic-native/transfer";
import {Helper} from "../../helpers/helper";
import {UploadImage} from "../../models/UploadImage";
import {ImageResizer, ImageResizerOptions} from "@ionic-native/image-resizer";
import {Insomnia} from "@ionic-native/insomnia";
import {NotificationService} from "../../providers/notification/NotificationService";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ChangepassPage} from "../changepass/changepass";
import {LoginPage} from "../pages";
import {User} from "../../providers/user/user";
import {ChatPage} from "../pages";


@IonicPage()
@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})
export class ProfilePage {
    data: any;
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
    /**
     * A collection of upload responses
     */
    public upload_responses: any = [];

    private infoEmployeForm : FormGroup;
    private carga_bateria :any;
    public unregisterBackButtonAction: any;

    constructor(private platform: Platform,public modalCtrl: ModalController, private formBuilder: FormBuilder, private cameraProfile: CameraProfileProvider, private emProvider: EmployeProvider,
                public actionSheetCtrl: ActionSheetController, public api: Api, public navCtrl: NavController,
                private credentials: StorageProvider,  private transfer: Transfer,
                private notification_service: NotificationService, private user: User,
                private image_resizer: ImageResizer,private ng_zone: NgZone, private insomnia: Insomnia) {
        this.data = this.credentials.getCredentials();
        this.infoEmployeForm = this.formBuilder.group({
            identificacion: [this.data.empleado.identificacion || '', Validators.required],
            nombres: [this.data.empleado.nombres || '', Validators.required],
            apellidos: [this.data.empleado.apellidos || '', Validators.required],
            telefono: [this.data.empleado.telefono || '', Validators.required],
            direccion: [this.data.empleado.direccion || '', Validators.required],
            email: [this.data.empleado.email || '', [Validators.required, Validators.email]],
            fecha_nacimiento: [this.data.empleado.fecha_nacimiento || '', Validators.required]
        });
        this.carga_bateria = this.credentials.getCargaPulsera();
    }

    ionViewWillEnter() {
        this.data = this.credentials.getCredentials();
        this.initializeBackButtonCustomHandler();
    }

    public changeEstado() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Selecciona el estado en que quieres aparecer',
            buttons: [
                {
                    text: 'Disponible',
                    handler: () => {
                        this.emProvider.updateStateEmploye('disponible').subscribe(() => {
                            this.data.empleado.estado = 'disponible';
                            this.credentials.setCredentials(this.data);
                        });
                    }
                },
                {
                    text: 'Ocupado',
                    handler: () => {
                        this.emProvider.updateStateEmploye('ocupado').subscribe(() => {
                            this.data.empleado.estado = 'ocupado';
                            this.credentials.setCredentials(this.data);
                        });
                    }
                },
                {
                    text: 'Calamidad',
                    handler: () => {
                        this.emProvider.updateStateEmploye('calamidad').subscribe(() => {
                            this.data.empleado.estado = 'calamidad';
                            this.credentials.setCredentials(this.data);
                        });
                    }
                },
                {
                    text: 'No cambiar mi estado',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    editImage(){
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Seleccionar origen de la imagen de perfil',
            buttons: [
                {
                    text: 'Cargar desde la galeria',
                    handler: () => {
                        this.open_albums();
                    }
                },
                {
                    text: 'Usar camara',
                    handler: () => {
                        this.open_camera();
                    }
                },
                {
                    text: 'Cancelar',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    /**
     * Opens the albums and displays the selected images if available
     */
    public async open_albums(): Promise<void> {
        let originals = await this.cameraProfile.open_albums();
        // Map the originals to an array of UploadImage
        let requests = await originals.map(async x => new UploadImage({
            path: x,
            guid: Helper.guid(),
            thumb: await this.resize(x)
        }));
        let images = await Promise.all(requests);
        // Save the originals
        this.images = this.images.concat(images);
        this.start_upload();
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
            params: {}
        };
        try {
            // Start uploading!
            let result = await this.file_transfer.upload(
                encodeURI(this.images[this.current].path),
                encodeURI(this.api.url + "/empleados/" + this.credentials.getCredentials().empleado.id + '/imagen'),
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
        }
    }

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

    editDataForm(){
        this.emProvider.updateDataEmploye(this.infoEmployeForm.value).subscribe((response) => {
            this.notification_service.notify_success('Se actualizaron los datos correctamente');
        })
    }
    openModalChagePass(){
        let changePassModal = this.modalCtrl.create(ChangepassPage);
        changePassModal.present();
    }
    public async logout(): Promise<void>{
        let la = await this.user.logout();
            this.navCtrl.push(LoginPage);
    }
    ionViewDidLoad() {
    }

    public pageChat(){
        this.navCtrl.push(ChatPage);
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
}