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



  // Make the function wait until the connection is made...
  waitForSocketConnection(socket, callback){
  setTimeout(
     () =>{
      if (socket.readyState === WebSocket.OPEN) {
        console.log("Connection is made");
        if(callback != null){
          callback();
        }
        return;

      } else {
        console.log("wait for connection...");
        this.waitForSocketConnection(socket, callback);
      }

    }, 500); // wait 500 milisecond for the connection...
  }


  sendMessage(message:any) {
    this.waitForSocketConnection(this.ws, ()=>{
      this.ws.send(message);
    });
    //this.ws.send(message);
  }
}
