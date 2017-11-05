import { Injectable } from '@angular/core';
import { Headers, RequestOptions} from '@angular/http';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {Api} from "../api/api";
import {StorageProvider} from "../storage/storage";


@Injectable()
export class EmployeProvider {
    constructor( private api: Api, private credentials: StorageProvider) {}

    updateStatePulsera(state) {
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        let body = new FormData();
        body.append('estado', state);
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('empleados/'+this.credentials.getCredentials().empleado.id+'/estado_pulsera', body,options);
    }

    updateStateEmploye(state){
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        let body = new FormData();
        body.append('estado', state);
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('empleados/'+this.credentials.getCredentials().empleado.id+'/cambioEstado', body,options);
    }

    updateDataEmploye(data){
        let token = this.credentials.getToken();
        let authHeader = new Headers();

        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('empleados/'+this.credentials.getCredentials().empleado.id, data,options);
    }

    updatePass(new_password){
        let token = this.credentials.getToken();
        let authHeader = new Headers();

        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('user/' + this.credentials.getCredentials().id+'/updateContrasena/'+new_password, null, options);
    }
}
