import 'rxjs/add/operator/map';

import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */

@Injectable()
export class Api {
    url: string = 'http://192.168.1.40:1337';

    constructor(public http: Http) {
    }

    get(ruta: string, options?: RequestOptions) {
        if (!options) {
            options = new RequestOptions();
        }

        return this.http.get(this.url + '/' + ruta, options).map(res => res.json());
    }

    post(ruta: string, body: any, options?: RequestOptions) {
        return this.http.post(this.url + '/' + ruta, body, options);
    }

    put(ruta: string, body: any, options?: RequestOptions) {
        return this.http.put(this.url + '/' + ruta, body, options).map(res => res.json());
    }

    delete(ruta: string, options?: RequestOptions) {
        return this.http.delete(this.url + '/' + ruta, options).map(res => res.json());
    }

    patch(ruta: string, body: any, options?: RequestOptions) {
        return this.http.put(this.url + '/' + ruta, body, options).map(res => res.json());
    }
}
