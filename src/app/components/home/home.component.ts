import { Component, OnInit } from '@angular/core';
import {BasWebSocketService} from "../../services/BasWebSocketService";
import {BacLocalService} from "../../services/BacLocalService";
import {BacServerInitializationState, EnumBacServerInitializationState} from "../../model/bac.frontend";
import {ServerInitProgressBarService} from "../../services/ServerInitProgressBarService";
import {WebSocketCandleReaderService} from "../../services/WebSocketCandleReaderService";

@Component({
  selector: 'div[app-home]',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  serverMessage:MessageEvent=null;
  basMessage:any=null;
  public ws:WebSocket;

  constructor(public wsService:BasWebSocketService,
              private bacLocalService:BacLocalService,
              private serverInitializerProgressBarMessageService:ServerInitProgressBarService,
              private candleReaderService:WebSocketCandleReaderService){
    this.wsService.createObservableSocket("ws://localhost:4271")
      .subscribe(data=> this.wsHandler(data));


  }

  wsHandler(data:any){
    this.serverMessage = data;
    //console.log("websocket.server.message:",this.serverMessage);
    this.basMessage = JSON.parse(this.serverMessage.data);

    if (this.basMessage.action=="startSubscription") {
      this.subscribeMe();
    } else if (this.basMessage.action=="ServerInitializerStarted") {
      this.bacLocalService.clientState.bacServerInitializationState = EnumBacServerInitializationState.STARTED;
      this.serverInitializerProgressBarMessageService.sendMessage(EnumBacServerInitializationState.STARTED);
    } else if (this.basMessage.action=="ServerInitializingInProgress") {
      this.bacLocalService.clientState.bacServerInitializationState = EnumBacServerInitializationState.INPROGRESS;
      this.serverInitializerProgressBarMessageService.sendMessage(EnumBacServerInitializationState.INPROGRESS);
    } else if (this.basMessage.action=="ServerInitializerFinished") {
      this.bacLocalService.clientState.bacServerInitializationState = EnumBacServerInitializationState.FINISHED;
      this.serverInitializerProgressBarMessageService.sendMessage(EnumBacServerInitializationState.FINISHED);
    }else if (this.basMessage.action=="retrieveCandles") {
      this.candleReaderService.sendMessage(this.basMessage);
    }
  }

  startSubscription(){
    if (this.bacLocalService.clientState.bacClientId==undefined ||  this.bacLocalService.clientState.bacClientId==null){
      //first time subscription
      this.bacLocalService.clientState.bacClientIndex = this.basMessage.clientIndex;
      this.bacLocalService.clientState.bacClientId = this.basMessage.clientId;

      let message = {
        "action":"finishNewSubscription",
        plotParams:{
          "symbol":this.symbol,
          "timeInterval":this.timeInterval
        },
        clientInfo:{
          clientId:this.basMessage.clientId
        }
      };
      console.log("finishNewSubscription",message);
      this.wsService.sendMessage(JSON.stringify(message));

    } else {
      let message = {
        "action":"finishReSubscription",
        plotParams:{
          "symbol":this.symbol,
          "timeInterval":this.timeInterval
        },
        clientInfo:{
          clientIndex:this.bacLocalService.clientState.bacClientId,
          clientIdPreviouslySubscribed:this.bacLocalService.clientState.bacClientId,
          clientIdNewlyBeingSubscribed:this.basMessage.clientId
        }
      };
      console.log("finishReSubscription",message);
      this.wsService.sendMessage(JSON.stringify(message));

    }

  }

  sendMessage(message:any){
    this.wsService.sendMessage(message);
  }

  ngOnInit() {
  }

}
