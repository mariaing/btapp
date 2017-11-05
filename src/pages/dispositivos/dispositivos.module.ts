import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { DispositivosPage } from './dispositivos';

@NgModule({
  declarations: [
      DispositivosPage,
  ],
  imports: [
    IonicPageModule.forChild(DispositivosPage),
    TranslateModule.forChild()
  ],
  exports: [
      DispositivosPage
  ]
})
export class DispositivosPagePageModule { }
