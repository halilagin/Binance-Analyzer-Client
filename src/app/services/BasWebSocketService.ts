import {Observable} from 'rxjs/Rx';
import {Injectable} from "@angular/core";


// see: https://www.youtube.com/watch?v=1CJN6yg2aUw


@Injectable()

export class BasWebSocketService {
  ws:WebSocket;

  createObservableSocket(url:string):Observable<MessageEvent>{
    this.ws = new WebSocket(url);
    return new Observable(observer =>{
      this.ws.onmessage = (event) => {observer.next(event); };
      this.ws.onerror = (event) => {observer.error(event); console.log("socket.error:",event);};
      this.ws.onclose = (event) => {observer.complete(); console.log("socket.closed:",event);};

    });
  }

  sendMessage(message:any) {
    this.ws.send(message);
  }
}
