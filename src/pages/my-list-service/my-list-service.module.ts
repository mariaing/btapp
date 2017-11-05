import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyListServicePage } from './my-list-service';

@NgModule({
  declarations: [
    MyListServicePage,
  ],
  imports: [
    IonicPageModule.forChild(MyListServicePage),
  ],
})
export class MyListServicePageModule {}
