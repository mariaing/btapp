import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Api } from '../api/api';

@Injectable()
export class Items {

  constructor(public http: Http, public api: Api) {
  }

}
