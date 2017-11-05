import {ErrorHandler, NgModule} from '@angular/core';
import {Http, HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {GoogleMaps} from '@ionic-native/google-maps';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {IonicApp, IonicErrorHandler, IonicModule, NavController} from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import {Camera} from '@ionic-native/camera';

import {Items} from '../mocks/providers/items';
import {User} from '../providers/providers';
import {Api} from '../providers/providers';
import {MyApp} from './app.component';

import {StorageProvider} from "../providers/storage/storage";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import { DevicesProvider } from '../providers/devices/devices';
import { CameraProfileProvider } from '../providers/camera-profile/camera-profile';
import { CameraDeviceProvider } from '../providers/camera-device/camera-device';
import {BluetoothProvider} from "../providers/bluetooth/bluetooth";
import {EmployeProvider} from "../providers/employe/employe";
import {ImagePicker} from "@ionic-native/image-picker";
import {NotificationService} from "../providers/notification/NotificationService";
import {ImageResizer} from "@ionic-native/image-resizer";
import {Insomnia} from "@ionic-native/insomnia";
import {ChangepassPage} from "../pages/changepass/changepass";
import {PushProvider} from "../providers/push/push";
import {Push} from "@ionic-native/push";
import {Geolocation, Geoposition} from "@ionic-native/geolocation";
import {BackgroundGeolocation} from "@ionic-native/background-geolocation";
import {BackgroundGeolocationProvider} from "../providers/background-geolocation/background-geolocation";
import {Diagnostic} from "@ionic-native/diagnostic";
import {ListMasterPage} from "../pages/list-master/list-master";
import {MyListServicePage} from "../pages/my-list-service/my-list-service";
import {LocalNotifications} from "@ionic-native/local-notifications";
// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
    declarations: [
        MyApp,
        ChangepassPage
    ],
    imports: [
        BrowserModule,
        HttpModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [Http]
            }
        }),
        IonicModule.forRoot(MyApp,{
            tabsHideOnSubPages: true,
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        ChangepassPage
    ],
    providers: [
        SplashScreen,
        StatusBar,
        Api,
        User,
        File,
        Transfer,
        Camera,
        FilePath,
        GoogleMaps,
        BluetoothSerial,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        Items,
        StorageProvider,
    DevicesProvider,
    CameraProfileProvider,
    CameraDeviceProvider,
        BluetoothProvider,
        EmployeProvider,
        ImagePicker,
        NotificationService,
        ImageResizer,
        Insomnia,
        PushProvider,
        Push,
        Geolocation,
        BackgroundGeolocation,
        BackgroundGeolocationProvider,
        Diagnostic,
        LocalNotifications
    ]
})
export class AppModule {
}
