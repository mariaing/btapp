import {Injectable, NgZone} from "@angular/core";
import {
    BackgroundGeolocation, BackgroundGeolocationConfig,
    BackgroundGeolocationResponse
} from "@ionic-native/background-geolocation";
import {Api} from "../api/api";
import {StorageProvider} from "../storage/storage";
import {Geolocation, Geoposition} from "@ionic-native/geolocation";
import {Headers, RequestOptions} from "@angular/http";

@Injectable()
export class BackgroundGeolocationProvider {

    config: BackgroundGeolocationConfig;
    public isRunning: boolean = false;
    //foreground tracking watcher
    public watch: any;

    //geocoordinates
    public lat: number = 0;
    public lng: number = 0;
    public alt: number = 0;

    //time before service restarts
    public est: number = 0;

    constructor(private geolocation: Geolocation, private zone: NgZone, private bglocation: BackgroundGeolocation, private api: Api, private credentials: StorageProvider) {
        // this.config = {
        //     desiredAccuracy: 10,
        //     stationaryRadius: 20,
        //     distanceFilter: 30,
        //     notificationTitle: 'BTproject',
        //     notificationText: 'Enviando ubicacion...',
        //     maxLocations: 1000,
        //     url: this.api.url + '/empleados/' + this.credentials.getCredentials().empleado.id + '/ubicaciones',
        //     httpHeaders: {
        //         'Authorization': 'Bearer ' + this.credentials.getToken()
        //     },
        //     stopOnTerminate: true, // enable this to clear background location settings when the app terminates
        //     interval: 3000,
        //     fastestInterval: 1000,
        //     activitiesInterval: 1000,
        //     saveBatteryOnBackground: true,
        //     syncUrl: this.api.url + '/empleados/' + this.credentials.getCredentials().empleado.id + '/ubicaciones',
        // };
    }

    startTracking() {
        //if the service is already running, do not start it again
        if(!this.isRunning) {

            //set some configuration for the background location service
            let backgroundGeoLocationServiceConfig = {
                desiredAccuracy: 0,
                notificationTitle: 'BTproject',
                notificationText: 'Enviando ubicacion...',
                stationaryRadius: 20,
                distanceFilter: 10,
                debug: false,
                interval: 5000
            };

            // subscribe to the background geo location services
            this.bglocation.configure(backgroundGeoLocationServiceConfig).subscribe((location) => {
                // run update inside of Angular's zone
                this.zone.run(() => {
                    this.lat = location.latitude;
                    this.lng = location.longitude;
                    this.alt = location.altitude;
                    this.sendLocation();
                });
            }, (err) => {
                console.log(err);
            });

            // turn on the background-geolocation system.
            this.bglocation.start();

            // config data for foreground tracking
            let foregroundGeoLocationServiceConfig = {
                frequency: 5000,
                enableHighAccuracy: true
            };

            // subscribe to the foreground geo location service
            this.watch = this.geolocation.watchPosition(foregroundGeoLocationServiceConfig).subscribe((position: Geoposition) => {
                // run update inside of Angular's zone
                this.zone.run(() => {
                    this.lat = position.coords.latitude;
                    this.lng = position.coords.longitude;
                    this.alt = position.coords.altitude;
                    this.sendLocation();
                });
            });

            this.isRunning = true;
        }
    }

    sendLocation(){
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        let body = {
            latitude: this.lat,
            longitude: this.lng
        }
        this.api.post('empleados/' + this.credentials.getCredentials().empleado.id + '/ubicaciones', body, options).subscribe(()=>{

        })
    }

    stopTracking() {
        // stop it only if it's already running
        if(this.isRunning) {

            // stop the background geo location service
            this.bglocation.finish(); // required for iOS
            this.bglocation.stop();

            // stop the foreground geo location tracking
            this.watch.unsubscribe();

            this.isRunning = false;
        }
    }
}