import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BacLocalService} from "../services/BacLocalService";
import {ServerInitProgressBarService} from "../services/ServerInitProgressBarService";
import {Subscription} from "rxjs";
import {BacServerInitializationState, EnumBacServerInitializationState} from "../model/bac.frontend";





@Component({
  selector: 'div[ServerInitProgressBar]',
  styleUrls: ['./ServerInitProgressBar.scss'],

  host:{
    'class':"BacBasicDialog modal fade in",
    '[style.display]':'displayString',
    'role':'dialog'

  },
  template: `
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <!--<div class="modal-header">-->
        <!--<button type="button" class="close" data-dismiss="modal">&times;</button>-->
        <!--<h4 class="modal-title">Modal Header</h4>-->
      <!--</div>-->
      <div class="modal-body">
        <p style="text-align: center;font-weight: bold;font-size: 16px;">Initilazing...</p>
      </div>
      <!--<div class="modal-footer">-->
        <!--<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>-->
      <!--</div>-->
    </div>

  </div>
  `,
  providers:[]
})
export class ServerInitProgressBar implements OnInit {
  @Input() visible: boolean = false;
  @Output() closed:EventEmitter<boolean>=new EventEmitter<boolean>();
  visibleAnimate: boolean = true;
  message:string;
  displayString:string;
  subscription: Subscription;

  constructor(private bacLocalService:BacLocalService, private messageService:ServerInitProgressBarService){

    this.subscription = this.messageService.getMessage().subscribe(message => this.messageHandler(message));

  }

  messageHandler(message:any){

    let m:EnumBacServerInitializationState = <EnumBacServerInitializationState> message;
    console.log("message Listener!", message, m,BacServerInitializationState.INPROGRESS);

    if (m==BacServerInitializationState.STARTED){
      this.displayString = 'block';
    } else if (m==BacServerInitializationState.INPROGRESS){
      this.displayString = 'block';
    } else if (m==BacServerInitializationState.FINISHED){
      this.displayString = 'none';
    }
    console.log("last.display:",this.displayString);

  }

  display(){
    return 'none';
  }

  ngOnInit() {
    this.displayString = this.display();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

}




