import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host, OnDestroy
} from '@angular/core';
import {MuiPriceAxis} from "../../../model/model";
import { DecimalPipe } from '@angular/common';
import {Currency8DigitPipe} from "../pipes/Pipes"


@Component({
  selector: 'svg[UiPriceAxis]',
  host:{
    '[attr.x]':"x",
    '[attr.y]':"y",
    '[attr.width]':"width",
    '[attr.height]':"height"


  },
  styleUrls: ['UiPriceAxis.scss'],
  template: `
    <svg:rect [attr.x]="0" [attr.y]="0" [attr.height]="height" [attr.width]="width" class="UiCandlePlotStreamingFrame"></svg:rect>
    

    <svg:g *ngFor="let tick of model.ticks;let i=index" [attr.transform]="translateString(model.tickPositions[i])">
      <text x="0" y="0" class="UiPriceAxisText">{{tick | Currency8DigitPipe | number:'.8-8'}}</text>
    </svg:g>
  `


})
export class UiPriceAxis implements OnInit {

  model:MuiPriceAxis;

  @Input() width:number;
  @Input() height:number;
  @Input() x:number;
  @Input() y:number;


  @Input() layout:string="vertical"; //vertical
  @Input() tickCount:number;
  constructor() {
    this.tickCount=5;
  }



  translateString(position:number){
    // if (this.layout=="vertical")
      return `translate(0,${position})`;
    // return `translate(${position},0)`;
  }


  ngOnInit() {
    this.model = new MuiPriceAxis([0,0], [0,0], 0 );


  }

  changeScale(domain:number[], tickCount:number=10){
    // let domain = [+this.domainMin, +this.domainMax];
    // let range = [+this.rangeMin, +this.rangeMax];
    if (this.layout=="vertical")
      this.model = new MuiPriceAxis(domain, [+this.height,0], tickCount );
    else
      this.model = new MuiPriceAxis(domain, [0,+this.width], tickCount );

    //this.model.ticksScaled = [10,50,100,150,200];
  }


}

