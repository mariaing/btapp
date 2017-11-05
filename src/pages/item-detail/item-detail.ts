import {Component, ElementRef, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {Geolocation, Geoposition} from "@ionic-native/geolocation";

declare const google : any;
@IonicPage()
@Component({
    selector: 'page-item-detail',
    templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
    service : any;
    map: any;
    directionsService: any = null;
    directionsDisplay: any = null;
    bounds: any = null;
    myLatLng: any;

    constructor(public geolocation: Geolocation, public platform: Platform, public navCtrl: NavController, public navParams: NavParams) {
        this.service = this.navParams.get('service');
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer();
        this.bounds = new google.maps.LatLngBounds();

    }

    ionViewDidLoad(){
        this.getPosition();
    }
    getPosition():any{
        this.geolocation.getCurrentPosition().then(response => {
            this.loadMap(response);
        }).catch(error => {
            console.log(error);
        });
    }

    loadMap(position: Geoposition) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        console.log(latitude, longitude);
        // create a new map by passing HTMLElement
        let mapEle: HTMLElement = document.getElementById('map');

        // create LatLng object
        this.myLatLng = {lat: latitude, lng: longitude};

        // create map
        this.map = new google.maps.Map(mapEle, {
            center: this.myLatLng,
            zoom: 12
        });

        this.directionsDisplay.setMap(this.map);

        google.maps.event.addListenerOnce(this.map, 'idle', () => {
            mapEle.classList.add('show-map');
            this.calculateRoute();
        });
    }

    private calculateRoute(){
        this.bounds.extend(this.myLatLng);

        this.map.fitBounds(this.bounds);

        this.directionsService.route({
            origin: new google.maps.LatLng(this.myLatLng.lat, this.myLatLng.lng),
            destination: new google.maps.LatLng(this.service.pos_lat, this.service.pos_lng),
            travelMode: google.maps.TravelMode.DRIVING,
            avoidTolls: true
        }, (response, status)=> {
            if(status === google.maps.DirectionsStatus.OK) {
                console.log(response);
                this.directionsDisplay.setDirections(response);
            }else{
                alert('Could not display directions due to: ' + status);
            }
        });
    }

    // addMarker() {
    //     let marker = new google.maps.Marker({
    //         map: this.map,
    //         animation: google.maps.Animation.DROP,
    //         position: this.map.getCenter()
    //     });
    //
    //     let content = this.service.cliente_nombre + "<br>" + this.service.ciudad + ', ' + this.service.direccion;
    //
    //     this.addInfoWindow(marker, content);
    // }
    //
    // addInfoWindow(marker, content){
    //
    //     let infoWindow = new google.maps.InfoWindow({
    //         content: content
    //     });
    //
    //     google.maps.event.addListener(marker, 'click', () => {
    //         infoWindow.open(this.map, marker);
    //     });
    //
    // }

    ionViewWillEnter() {

    }

    ionViewWillLeave() {

    }
}
