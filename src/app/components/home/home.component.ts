import { Component, OnInit } from '@angular/core';
import {BasWebSocketService} from "../../services/BasWebSocketService";
import {BacLocalService} from "../../services/BacLocalService";
import {BacServerInitializationState, EnumBacServerInitializationState} from "../../model/bac.frontend";
import {ServerInitProgressBarService} from "../../services/ServerInitProgressBarService";

@Component({
  selector: 'div[app-home]',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  serverMessage:MessageEvent=null;
  basMessage:any=null;
  public ws:WebSocket;

  constructor(public wsService:BasWebSocketService, private bacLocalService:BacLocalService, private serverInitializerProgressBarMessageService:ServerInitProgressBarService){
    this.wsService.createObservableSocket("ws://localhost:4271")
      .subscribe(data=> this.wsHandler(data));


  }

  wsHandler(data:any){
    this.serverMessage = data;
    //console.log("websocket.server.message:",this.serverMessage);
    this.basMessage = JSON.parse(this.serverMessage.data);
    console.log("bacmessage", this.basMessage);

    if (this.basMessage.action=="subscribe") {
      this.bacLocalService.clientState.bacClientIndex = this.basMessage.clientIndex;
      this.bacLocalService.clientState.bacClientId = this.basMessage.id;
      console.log(this.bacLocalService.clientState);
    } else if (this.basMessage.action=="ServerInitializerStarted") {
      this.bacLocalService.clientState.bacServerInitializationState = EnumBacServerInitializationState.STARTED;
      this.serverInitializerProgressBarMessageService.sendMessage(EnumBacServerInitializationState.STARTED);
    } else if (this.basMessage.action=="ServerInitializingInProgress") {
      this.bacLocalService.clientState.bacServerInitializationState = EnumBacServerInitializationState.INPROGRESS;
      this.serverInitializerProgressBarMessageService.sendMessage(EnumBacServerInitializationState.INPROGRESS);
    } else if (this.basMessage.action=="ServerInitializerFinished") {
      this.bacLocalService.clientState.bacServerInitializationState = EnumBacServerInitializationState.FINISHED;
      this.serverInitializerProgressBarMessageService.sendMessage(EnumBacServerInitializationState.FINISHED);
    }
      console.log(this.basMessage);
  }


  sendMessage(message:any){
    this.wsService.sendMessage(message);
  }

  ngOnInit() {
  }

}
