import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host, OnDestroy
} from '@angular/core';
import {MuiPriceAxis, MuiTimeAxis} from "../../../model/model";
import { DecimalPipe } from '@angular/common';
import {Currency8DigitPipe} from "../pipes/Pipes"

import { DatePipe } from '@angular/common';

@Component({
  selector: 'svg[UiTimeAxis]',
  host:{
    '[attr.x]':"x",
    '[attr.y]':"y",
    '[attr.width]':"width",
    '[attr.height]':"height"


  },
  styleUrls: ['UiTimeAxis.scss'],
  template: `
    <svg:rect [attr.x]="0" [attr.y]="0" [attr.height]="height" [attr.width]="width" class="UiCandlePlotStreamingFrame"></svg:rect>
    <svg:g *ngFor="let tick of model.ticks;let i=index" [attr.transform]="translateString(model.tickPositions[i])">
      <!--<text x="0" y="10" class="UiTimeAxisText">{{tick | Currency8DigitPipe | number:'.8-8'}}</text>-->
      <text x="0" y="10" class="UiTimeAxisText">{{showTime(tick)}}</text>
    </svg:g>
  `


})
export class UiTimeAxis implements OnInit {

  model:MuiTimeAxis;

  @Input() width:number;
  @Input() height:number;
  @Input() x:number;
  @Input() y:number;
  @Input() timeInterval;//1M, 5M,15M, 30M, 1H, 2H, 4H,6H, 12H, 1D, 1W
  @Input() layout:string="horizontal"; //vertical
  @Input() tickCount:number;

  constructor() {
    this.tickCount=5;
  }

  timeIntervalInSecond(){
    return this.model.timeInterval;
  }

  showTime(t){
    if (t==NaN || t==undefined || t==null)
      return '-';

    var datePipe = new DatePipe("en-US");
    let d = new Date(t*1000); //it is stored in db with 0.0001 multiplied. store it back.
    let format='HH:mm';

    if (this.timeInterval=="1M"){
      format = "HH:mm";
    } else if (this.timeInterval=="5M") {
      format = "HH:mm";
    } else if (this.timeInterval=="15M") {
      format = "dd/HH";
    } else if (this.timeInterval=="30M") {
      format = "dd/HH";
    } else if (this.timeInterval=="1H") {
      format = "dd/HH";
    } else if (this.timeInterval=="2H") {
      format = "dd/HH";
    } else if (this.timeInterval=="4H") {
      format = "MM/dd";
    } else if (this.timeInterval=="6H") {
      format = "MM/dd";
    } else if (this.timeInterval=="12H") {
      format = "MM/dd";
    } else if (this.timeInterval=="1D") {
      format = "MM/dd";
    } else if (this.timeInterval=="1W") {
      format = "yyyy/MM";
    }

    return datePipe.transform(d, format);

  }

  translateString(position:number){
    // if (this.layout=="vertical")
    //   return `translate(0,${position})`;
    return `translate(${position},0)`;
  }


  ngOnInit() {
    this.model = new MuiTimeAxis(this.timeInterval, [0,0], [-4000,0] );


  }

  changeScale(timeInterval_:string='1M', domain:number[], range:number[]){
    // let domain = [+this.domainMin, +this.domainMax];
    // let range = [+this.rangeMin, +this.rangeMax];
    if (this.layout=="horizontal")
      this.model = new MuiTimeAxis(timeInterval_, domain,  range );
    else
      this.model = new MuiTimeAxis(timeInterval_, domain, range);

    //this.model.ticksScaled = [10,50,100,150,200];

  }


}

