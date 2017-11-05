import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Items} from "../../mocks/providers/items";

/**
 * Generated class for the MyListServicePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-list-service',
  templateUrl: 'my-list-service.html',
})
export class MyListServicePage {
    tabBarElement: any;
    currentItems = [];
    horas : number = 0;
  constructor(public navCtrl: NavController, public items: Items) {
      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

    ionViewWillEnter() {
        this.getServicios();
        this.tabBarElement.style.display = 'none';
    }

    ionViewWillLeave() {
        this.tabBarElement.style.display = 'flex';
    }

    takeMeBack() {
        this.navCtrl.parent.select(0);
    }

    private getServicios() {
        this.horas= 0;
        this.items.getList('finalizado').subscribe((response) => {
            this.currentItems = response.data;
            this.currentItems.forEach( (value, key, index) => {
                console.log(value);
                this.horas += value.duracion;
            })
        })
    }

}
