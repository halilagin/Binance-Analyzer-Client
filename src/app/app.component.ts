import {Component, OnDestroy} from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import {BacLocalService} from "./services/BacLocalService";
import {Subscription} from "rxjs";
import {BasWebSocketService} from "./services/BasWebSocketService";

@Component({
  selector: 'div[app-root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host:{
    'class':'container'
  }
})
export class AppComponent implements OnDestroy {


  localStorageSubscription: Subscription;

  pingIntervalId:any=null;

  constructor(public electronService: ElectronService,
    private translate: TranslateService, private bacLocalService:BacLocalService,    public wsService:BasWebSocketService,
  ) {
    //this.bacLocalService.clearClientState();

    this.localStorageSubscription = this.bacLocalService.getMessage().subscribe(message => this.localStorageMessageHandler(message));

    translate.setDefaultLang('en');

    if (electronService.isElectron()) {
      console.log('Mode electron');
      // Check if electron is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.ipcRenderer);
      // Check if nodeJs childProcess is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }


  localStorageMessageHandler(message:any){
    if (message.action=="clientIdRegistered"){

      // this.pingIntervalId =  setInterval(()=>{
      //   this.wsService.sendMessage({"action":"ping", "clientId":this.bacLocalService.getClientState().bacClientId});
      // },10000);
    }
  }

  ngOnDestroy(){
    if (this.pingIntervalId!=null)
      clearInterval(this.pingIntervalId);
  }
}


