import {Observable, Subject} from 'rxjs/Rx';
import {Injectable} from "@angular/core";


// see: https://www.youtube.com/watch?v=1CJN6yg2aUw
// see: http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject

@Injectable()
export class WebSocketCandleReaderService {
  private subject = new Subject<any>();

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
