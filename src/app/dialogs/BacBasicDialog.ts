import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BacLocalService} from "../services/BacLocalService";





@Component({
  selector: 'div[BacBasicDialog]',
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
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Modal Header</h4>
      </div>
      <div class="modal-body">
        <p>Some text in the modal.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>

  </div>

  `,
  providers:[BacLocalService]
})
export class ServerInitProgressBar implements OnInit {
  @Input() visible: boolean = false;
  @Output() closed:EventEmitter<boolean>=new EventEmitter<boolean>();
  visibleAnimate: boolean = true;
  message:string;
  displayString:string;


  display(){
    return "block";
  }

  constructor(private bacLocalService:BacLocalService){


  }


  ngOnInit() {
    this.displayString = this.display();
  }

}




