import {Observable} from 'rxjs/Rx';
import {Injectable} from "@angular/core";


// see: https://www.youtube.com/watch?v=1CJN6yg2aUw


@Injectable()
export class BasWebSocketService {
  ws:WebSocket;
  socketIsReady:boolean=false;
  createObservableSocket(url:string):Observable<MessageEvent>{
    this.ws = new WebSocket(url);
    return new Observable(observer =>{
      this.ws.onmessage = (event) => {observer.next(event); };
      this.ws.onerror = (event) => {observer.error(event); console.log("socket.error:",event);};
      this.ws.onclose = (event) => {observer.complete(); console.log("socket.closed:",event);};
      this.ws.onopen = (event) => { this.socketIsReady=true;};

    });
  }


  sendMessage(message:any) {
    // let sleep= async function(msec){
    //   return new Promise(resolve => setTimeout(resolve, msec));
    // };
    // while(this.socketIsReady==false){
    //   console.log("sending a message needs a ready connection");
    //   //setTimeout(()=>{},200);
    //   await sleep(200);
    // }
    // if (this.socketIsReady)
    //   this.ws.send(message);


    let cs = JSON.parse(localStorage.getItem("clientState"));

    var intervalID = setInterval(()=>{
      if (this.socketIsReady ) {
        this.ws.send(JSON.stringify(message));
        clearInterval(intervalID);
      } else {
        console.log("sending a message needs a ready connection", cs);
      }

    }, 200);
  }


  startNewSubscription(clientId){

    let message = {
      "action":"startNewSubscription",
      "plotParams":{

      },
      "clientInfo":{
        clientId:clientId
      }
    };
    console.log("startNewSubscription",clientId);

    var intervalID = setInterval(()=>{
      if (this.socketIsReady ) {
        this.ws.send(JSON.stringify(message));
        clearInterval(intervalID);
      } else {
        console.log("sending a message needs a ready connection");
      }

    }, 200);
  }


  startReSubscription(clientIdPreviouslySubscribed,clientIdNewlyBeingSubscribed){


    let message = {
      "action":"startReSubscription",
      "plotParams":{

      },
      "clientInfo":{
        "clientId":clientIdPreviouslySubscribed,
        "clientIdPreviouslySubscribed":clientIdPreviouslySubscribed,
        "clientIdNewlyBeingSubscribed":clientIdNewlyBeingSubscribed
      }
    };

    console.log("startReSubscription",clientIdPreviouslySubscribed,clientIdNewlyBeingSubscribed);

    var intervalID = setInterval(()=>{
      if (this.socketIsReady ) {
        this.ws.send(JSON.stringify(message));
        clearInterval(intervalID);
      } else {
        console.log("sending a message needs a ready connection");
      }

    }, 200);
  }



}
