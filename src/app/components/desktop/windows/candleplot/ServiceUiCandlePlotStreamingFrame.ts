/**
 * Created by halil on 26/01/2018.
 */


import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs";
import {KeyedCollection} from "../../../../model/collections";
import * as d3  from 'd3-ng2-service/src/bundle-d3';
import {MCandle} from "../../../../model/bac.frontend";
import {MUiCandle} from "../../../../model/model";

// circular cache
// candles array is circular.
// see: http://www.sanfoundry.com/java-program-circular-buffer/


@Injectable()
export class ServiceUiCandlePlotStreamingFrame {


  private subject = new Subject<any>();

  constructor(){
  }


  sendMessage(message: any) {
    this.subject.next(message);
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

}
