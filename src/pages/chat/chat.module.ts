import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import {RelativeTimePipe} from "../../pipes/relative-time/relative-time";

@NgModule({
  declarations: [
    ChatPage,
      RelativeTimePipe
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
  ],
})
export class ChatPageModule {}
