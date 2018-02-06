import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host, OnDestroy
} from '@angular/core';
import {MUiCandle, ObjectId, MUiCandlePlotWindow} from "../../../../model/model";
import {BasWebSocketService} from "../../../../services/BasWebSocketService";
import {BacLocalService} from "../../../../services/BacLocalService";
//import { v4 as uuid } from 'uuid';
import {Subscription} from "rxjs";
import {WebSocketCandleReaderService} from "../../../../services/WebSocketCandleReaderService";
import { UUID } from 'angular2-uuid';
import {MCandle} from "../../../../model/bac.frontend";
import {ServiceCandleCache, CandleCache} from "./ServiceCandleCache";
import {ServiceCandlePlotScale} from "./ServiceCandlePlotScale";
import * as d3  from 'd3-ng2-service/src/bundle-d3';
import {UiCandle} from "./UiCandle";
// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets




@Component({
  selector: 'svg[UiCandlePlotWindow]',
  host:{
    '[attr.viewBox]':"model.viewBoxString",
    '[attr.x]':"x_()",
    '[attr.y]':"y_()",
    '[attr.draggable]':'true'


  },
  styleUrls: ['UiCandlePlotWindow.scss'],
  template: `
  <svg:rect [attr.x]="0" [attr.y]="0" [attr.height]="model.height" [attr.width]="model.width" class="UiCandlePlotWindowBGRect"></svg:rect>

<svg UiCandlePlotFrame draggable="true" [attr.width]="plotWidth" [attr.height]="plotHeight"  viewBoxX="model.viewBoxX" viewBoxY="model.viewBoxY" viewBoxWidth="plotWidth" viewBoxHeight="plotHeight"   class="UiCandlePlotFrame"   >

  <!--<svg:g UiCandlePlotFrame [attr.width]="plotWidth" [attr.height]="plotHeight"  [attr.x]="plotX" [attr.y]="plotY" class="UiCandlePlotFrame">-->
  <!--</svg:g>-->
  `


})
export class UiCandlePlotWindow implements OnInit {

  @Input() viewBoxX:number;
  @Input() viewBoxY:number;
  @Input() viewBoxWidth:number;
  @Input() viewBoxHeight:number;

  model:MUiCandlePlotWindow;

  @Input() symbol:string="XLMETH";
  @Input() timeInterval:number=60;
  @Input() width:string='800';
  @Input() height:string='480';
  uuid:string=null;

  xscale:(number)=>any;
  yscale:(number)=>any;

  x:number;
  y:number;
  plotX:number;
  plotY:number;
  plotWidth:number;
  plotHeight:number;

  constructor(
    @Inject(ViewContainerRef) viewContainerRef,
    private meRef: ElementRef,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer
    // private candleReaderService:WebSocketCandleReaderService,
    // private cacheService:ServiceCandleCache,
    // private scaleService:ServiceCandlePlotScale

  ) {

   this.model = new MUiCandlePlotWindow();
    //this.parent = parent;
    this.uuid = UUID.UUID();


  }


  x_(){
    return "20";
  }

  y_(){
    return "20";
  }

  plot_Width(){
    return this.plotWidth = +this.model.width*0.9;
  }

  plot_Height(){
    return  this.plotHeight =  +this.model.height*0.9;
  }

  plot_X(){
    return  this.plotX = this.xscale(0);
  }

  plot_Y(){
    return  this.plotY =  this.yscale(this.model.height*0.1)
  }

  initPlotDimensions(){
    this.plot_X();this.plot_Y();this.plot_Width();this.plot_Height();
  }

  ngOnInit() {
    this.model.viewBoxX = 0;
    this.model.viewBoxY = +this.viewBoxY;
    this.model.viewBoxWidth = +this.viewBoxWidth;
    this.model.viewBoxHeight = +this.viewBoxHeight;
    this.model.mouse = {offsetX:-1,offsetY:-1};
    this.model.mouseSwipeMove = {x1:-1,x2:-1,y1:-1,y2:-1};




    this.model.uuid = this.uuid;
    this.model.width = +this.width;
    this.model.height = +this.height;
    this.model.symbol = this.symbol;
    this.model.timeInterval = +this.timeInterval;
    this.model.viewBox();

    this.xscale = d3.scaleLinear().domain([ 0,this.model.width ]).range([0,this.model.width]);
    this.yscale = d3.scaleLinear().domain([ 0,this.model.height ]).range([this.model.height,0]);
    this.initPlotDimensions();

  }


}

