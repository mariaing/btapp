import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';



@Injectable()
export class StorageProvider {

    private credentials : any;
    private token : any;
    private state : string;
    private regid : string;
    constructor( ) {
    }

    setCredentials(credentials){
        this.credentials = credentials;
        localStorage.setItem('credentials', JSON.stringify(credentials))
    }
    getCredentials(){
        this.credentials = localStorage.getItem('credentials');
        return JSON.parse(this.credentials);
    }

    setToken(token){
        this.token = token;
        localStorage.setItem('token', this.token)
    }

    setRegid(regid){
        this.regid = regid;
        localStorage.setItem('reg_id', this.regid);
    }
    getToken(){
        this.token = localStorage.getItem('token');
        return this.token;
    }

    getRegid(){
        return localStorage.getItem('reg_id');
    }

    setStatePulsera(state){
        this.state = state;
        localStorage.setItem('pulsera_state', state);
    }
    getStatePulsera(){
        this.state = localStorage.getItem('pulsera_state');
        return this.state;
    }

    setStateTutorial(){
        localStorage.setItem('tuto', 'false');
    }

    setCargaPulsera(value){
        localStorage.setItem('carga', value);
    }

    getCargaPulsera(){
        return localStorage.getItem('carga');
    }

    clearCredentials(){
        localStorage.removeItem('credentials');
        localStorage.removeItem('jwt');
        localStorage.removeItem('pulsera_state');
        localStorage.removeItem('service');
        localStorage.removeItem('reg_id');
        localStorage.removeItem('carga');
    }
}
