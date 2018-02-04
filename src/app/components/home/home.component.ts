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
      this.startSubscription();
    } if (this.basMessage.action=="ackNewSubscription") {
      this.ackNewSubscription();
    } if (this.basMessage.action=="ackReSubscription") {
      this.ackReSubscription();
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



  ackReSubscription(){
    this.bacLocalService.clientState.bacClientId = this.basMessage.clientId;
    this.bacLocalService.clientState.bacClientTempId = null;
    console.log("ackReSubscription, clientId",this.bacLocalService.clientState.bacClientId);
    this.bacLocalService.clientIdReceived(this.bacLocalService.clientState);

  }

  ackNewSubscription(){
    console.log("ackNewSubscription, clientId",this.basMessage.clientId);

    this.bacLocalService.clientState.bacClientId = this.basMessage.clientId;
    this.bacLocalService.clientState.bacClientTempId = null;
    this.bacLocalService.clientIdReceived(this.bacLocalService.clientState);

  }
  startSubscription(){
    // if (this.bacLocalService.clientState.bacClientId==undefined ||  this.bacLocalService.clientState.bacClientId==null){
    //   //first time subscription
    //   this.bacLocalService.clientState.bacClientTempId = this.basMessage.clientId;
    //   this.wsService.startNewSubscription(this.basMessage.clientId);
    // } else {//resubscription
    //   let clientIdPreviouslySubscribed=this.bacLocalService.clientState.bacClientId;
    //   let clientIdNewlyBeingSubscribed=this.basMessage.clientId;
    //   this.bacLocalService.clientState.bacClientId=null;
    //   this.wsService.startReSubscription(clientIdPreviouslySubscribed, clientIdNewlyBeingSubscribed);
    // }

      this.bacLocalService.clientState.bacClientId = null;
      this.bacLocalService.clientState.bacClientTempId = this.basMessage.clientId;
      this.wsService.startNewSubscription(this.basMessage.clientId);

  }


  ngOnInit() {
  }

}
