import {Component, ViewChild} from '@angular/core';
import {Content, IonicPage, NavController, NavParams, TextInput} from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {Api} from "../../providers/api/api";
import {Headers, RequestOptions} from '@angular/http';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var io: any;
@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
    @ViewChild(Content) content: Content;
    @ViewChild('chat_input') messageInput: TextInput;
    msgList: any;
    // user: UserInfo;
    // toUser: UserInfo;
    editorMsg = '';
  constructor(private api: Api, private credentials: StorageProvider,public navCtrl: NavController, public navParams: NavParams) {
      this.msgList = [];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }
    ionViewDidEnter() {
        //get message list
        this.getMsg().subscribe((res) => {
            console.log(res)
            this.msgList = res.data;
            this.scrollToBottom();
        });
        io.socket.off('NuevoMensaje', (response)=>{

        })
        io.socket.on('NuevoMensaje', (response)=>{
            console.log('llego donde era')
            this.pushNewMsg(response);
        })
    }
    onFocus() {
        // this.content.resize();
        this.scrollToBottom();
    }
    /**
     * @name getMsg
     * @returns {Promise<ChatMessage[]>}
     */
    getMsg() {
        let authHeader = new Headers();
        let token = this.credentials.getToken();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }

        let options = new RequestOptions({headers: authHeader});
        return this.api.get('empleados/'+this.credentials.getCredentials().empleado.id+'/mensajes', options);
    }

    /**
     * @name sendMsg
     */
    sendMsg() {
        if (!this.editorMsg.trim()) return;


        let newMsg = {
            who: 'contact',
            empleado: this.credentials.getCredentials().empleado.id,
            empresa: this.credentials.getCredentials().empleado.empresa,
            message: this.editorMsg,
        };

        this.editorMsg = '';

        let authHeader = new Headers();
        let token = this.credentials.getToken();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }

        let options = new RequestOptions({headers: authHeader});
        this.api.post('empleados/mensajes', newMsg,options).subscribe((res)=>{
            this.pushNewMsg(res.json().data);
        });
    }

    /**
     * @name pushNewMsg
     * @param msg
     */
    pushNewMsg(msg) {
        this.msgList.push(msg);
        this.scrollToBottom();
    }

    getMsgIndexById(id: string) {
        return this.msgList.findIndex(e => e.messageId === id)
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.content.scrollToBottom) {
                this.content.scrollToBottom();
            }
        }, 400)
    }
}
