import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {Items} from "../../mocks/providers/items";

/**
 * Generated class for the ItemWaitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-item-wait',
    templateUrl: 'item-wait.html',
})
export class ItemWaitPage {
    public unregisterBackButtonAction: any;
    tabBarElement: any;
    service: any;
    timer: any;
    tTranscurrido: string;

    constructor(private platform: Platform ,private items: Items, public navCtrl: NavController, public navParams: NavParams) {
        if(localStorage.getItem('time_moment')){
            this.tTranscurrido = localStorage.getItem('time_moment');
        }
        else{
            this.tTranscurrido = "0";
        }
        this.service = this.navParams.data;
        localStorage.setItem('service', JSON.stringify(this.service));
        this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
        // platform.ready().then(() => {
        //   platform.registerBackButtonAction(() => {
        //     return;
        //   });
        // });
    }

    ionViewDidLoad() {

    }

    ionViewWillEnter() {
        this.startTimer();
        this.tabBarElement.style.display = 'none';
        this.initializeBackButtonCustomHandler();
    }

    ionViewWillLeave() {
        clearInterval(this.timer);
        this.tabBarElement.style.display = 'flex';
        this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    }

    public initializeBackButtonCustomHandler(): void {
        this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
            this.customHandleBackButton();
        }, 10);
    }

    private customHandleBackButton(): void {
        // do what you need to do here ...
    }

    takeMeBack() {
        this.navCtrl.parent.select(0);
    }


    cancelarAsignacion() {
        this.items.cancelItemService(this.service).subscribe((response) => {
            this.navCtrl.parent.select(0);
        }, (err) => {
            console.log(err)
        })
    }

    finalizarTrabajo() {
        this.items.finishItemService(this.service, this.tTranscurrido).subscribe((response) => {
            this.navCtrl.parent.select(0);
        }, (err) => {
            console.log(err)
        })
    }

    startTimer(){
        this.timer =  setInterval(() => {
            this.items.updaTime(this.service, this.tTranscurrido).subscribe((response) => {
                 this.tTranscurrido = response.data.duracion;
            });
        }, 60000);
    }
}
