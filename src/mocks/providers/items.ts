import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Api} from "../../providers/api/api";
import {StorageProvider} from "../../providers/storage/storage";
import * as moment from "moment";

@Injectable()
export class Items {
    dataAsing : any;
    constructor(public http: Http, private api: Api, private credentials: StorageProvider) {
        this.dataAsing = {};
    }

    getList(estado = null) {
        let authHeader = new Headers();
        let where = estado || 'vigente';
        let token = this.credentials.getToken();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }

        let options = new RequestOptions({headers: authHeader});
        let campos = 'cliente_nombre,pos_lat,pos_lng,fecha_asignada,cliente_telefono,direccion,estado,hora_asignada,ciudad,fecha_finalizada,hora_finalizada,duracion';
        return this.api.get('asignaciones?fields='+campos+'&where={"empleado" : "'+this.credentials.getCredentials().empleado.id+'","estado":{"contains":"'+where+'"}}', options);
    }

    getItem(){
      let authHeader = new Headers();
      let where = 'aceptado';
      let token = this.credentials.getToken();
      if (token) {
          authHeader.append('Authorization', 'Bearer ' + token);
      }

      let options = new RequestOptions({headers: authHeader});
      let campos = 'estado';
      return this.api.get('asignaciones?fields='+campos+'&where={"empleado" : "'+this.credentials.getCredentials().empleado.id+'","estado":{"contains":"'+where+'"}}', options);
    }
    cancelItemState(item){
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        let body = new FormData();
        body.append('estado', 'vigente');
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }

        let options = new RequestOptions({headers: authHeader});

        return this.api.put('asignaciones/'+item.id+'/updateEstado', body, options)
    }

    acceptItemService(item){
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        let body = new FormData();
        body.append('estado', 'aceptado');
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('asignaciones/' + item.id + '/updateEstado', body, options);
    }

    cancelItemService(item){
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        let body = new FormData();
        body.append('estado', 'vigente');
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('asignaciones/'+item.id+'/updateEstado', body, options);
    }

    finishItemService(item, duration){
        let token = this.credentials.getToken();
        let time = moment().format('HH:mm A');
        let date = moment().format('YYYY-MM-DD');
        let body = new FormData();
        body.append('estado', 'finalizado');
        body.append('fecha_finalizada', date);
        body.append('hora_finalizada', time);
        body.append('duracion', duration);
        let authHeader = new Headers();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('asignaciones/' + item.id + '/updateEstado', body, options);
    }

    updaTime(item, duracion){
        let token = this.credentials.getToken();
        let body = new FormData();

        this.getOne(item).subscribe((response) =>{
            let tiempo = response.data.duracion + 1;
            localStorage.setItem('time_moment', tiempo);
        })
        let authHeader = new Headers();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.put('asignaciones/' + item.id + '/updateTime', {'duracion': localStorage.getItem('time_moment') }, options);
    }

    getOne(item){
        let token = this.credentials.getToken();
        let authHeader = new Headers();
        if (token) {
            authHeader.append('Authorization', 'Bearer ' + token);
        }
        let options = new RequestOptions({headers: authHeader});
        return this.api.get('asignaciones/' + item.id, options);
    }
}