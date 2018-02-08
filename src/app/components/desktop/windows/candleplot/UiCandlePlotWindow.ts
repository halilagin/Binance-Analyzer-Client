import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host, OnDestroy
} from '@angular/core';
import {MUiCandle, ObjectId, MUiCandlePlotWindow, MuiPriceAxis} from "../../../../model/model";
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
import {UiPriceAxis} from "../../fragments/UiPriceAxis";
import {UiCandlePlotStreamingFrame} from "./UiCandlePlotStreamingFrame";
import {UiTimeAxis} from "../../fragments/UiTimeAxis";
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
  <svg:rect [attr.x]="0" [attr.y]="0" [attr.height]="model.height" [attr.width]="model.width" class="UiCandlePlotStreamingFrame"></svg:rect>
  <svg UiCandlePlotStreamingFrame #candlePlot [x]="plotX" [y]="plotY"  [width]="plotWidth" [height]="plotHeight"       ></svg>
  <svg UiPriceAxis #priceAxis
        [layout]="'vertical'" 
        [x]="priceAxisX" 
        [y]="plotY"  
        [width]="priceAxisWidth" 
        [height]="plotHeight" 
        ></svg>
  <svg UiTimeAxis #timeAxis
        [layout]="'horizontal'" 
        [timeInterval]="'1M'"
        [x]="0" 
        [y]="timeAxisY"  
        [width]="plotWidth" 
        [height]="timeAxisHeight"  
        ></svg>
  
  
  
  <!--<svg  #rightBottomCorner [attr.transform]="rightBottomCornerTransformString()">-->
    <svg  #rightBottomCorner [attr.x]="plotWidth" [attr.y]="timeAxisY" [attr.height]="timeAxisHeight" [attr.width]="priceAxisWidth">
       <!--<svg:rect [attr.x]="0" [attr.y]="0" [attr.height]="timeAxisHeight" [attr.width]="priceAxisWidth" style="fill:red;">-->
       <!---->
<!--</svg:rect>-->
       <svg:text x="0" [attr.y]="timeAxisHeight" style="fill:#2dcd2d;">{{model.title}}</svg:text>
       
  </svg>
  `


})
export class UiCandlePlotWindow implements OnInit {



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
  public priceAxisX: number;
  public priceAxisWidth:number;
  public timeAxisY:number;
  public timeAxisHeight:number;
  public timeAxisWidth:number;
  public scaleServiceSubscription:Subscription;
  public cahceServiceSubscription:Subscription;

  @ViewChild('priceAxis') priceAxis: UiPriceAxis;
  @ViewChild('candlePlot') candlePlot: UiCandlePlotStreamingFrame;

  @ViewChild('timeAxis') timeAxis: UiTimeAxis;


  constructor(
    @Inject(ViewContainerRef) viewContainerRef,
    private meRef: ElementRef,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer,
    // private candleReaderService:WebSocketCandleReaderService,
    private cacheService:ServiceCandleCache,
    private scaleService:ServiceCandlePlotScale

  ) {
    this.model = new MUiCandlePlotWindow();
    this.model.uuid = UUID.UUID();

    //this.parent = parent;


    this.cahceServiceSubscription = this.cacheService.getMessage().subscribe(message => this.cahceServiceMessageHandler(message));

    this.scaleServiceSubscription = this.scaleService.getMessage().subscribe(message => this.scaleServiceMessageHandler(message));

  }



  cahceServiceMessageHandler(message){
    let extent = message.data;

    if (message.action=="scaleChanged" && message.plotUUID==this.candlePlot.uuid ){
        this.scaleService.changeScale(message.plotUUID, extent);
        let priceDomain = [extent[1],extent[3]];
        this.priceAxis.changeScale(priceDomain);
      }

      let timeDomain = [extent[2]-60*this.timeAxis.timeIntervalInSecond(),extent[2]];
      let timeRange=[0,this.candlePlot.model.width];
      this.timeAxis.changeScale(this.timeAxis.timeInterval, timeDomain, timeRange );

  }


  scaleServiceMessageHandler(message){

  }


  x_(){
    return  this.x = 20;
  }

  y_(){
    return this.y = 20;
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
    return  this.plotY =  this.yscale(this.model.height*0.95)
  }

  priceAxis_X(){
    return this.priceAxisX = this.plotX+this.plotWidth;
  }

  priceAxis_Width(){
    return this.priceAxisWidth = +this.model.width*0.1;
  }


  timeAxis_Y(){
    return this.timeAxisY = this.plotY+this.plotHeight;
  }

  timeAxis_Height(){
    return this.timeAxisHeight = +this.model.height*0.05;
  }

  timeAxis_Width(){
    //return this.timeAxisWidth = this.plotWidth+this.priceAxisWidth;
    return this.timeAxisWidth = this.plotWidth;
  }

  rightBottomCornerTransformString(){
    return `translate(${this.plotWidth},${this.timeAxisY})`;
  }


  initPlotDimensions(){
    this.plot_X();this.plot_Y();this.plot_Width();this.plot_Height();

    this.priceAxis_X();this.priceAxis_Width();

    this.timeAxis_Y();this.timeAxis_Height(); this.timeAxis_Width();
  }

  ngOnInit() {

    this.model.viewBoxX = 0;
    this.model.viewBoxY = 0;
    this.model.viewBoxWidth = +this.width;
    this.model.viewBoxHeight = +this.height;
    this.model.mouse = {offsetX:-1,offsetY:-1};
    this.model.mouseSwipeMove = {x1:-1,x2:-1,y1:-1,y2:-1};




    this.model.uuid = this.uuid;
    this.model.width = +this.width;
    this.model.height = +this.height;
    this.model.symbol = this.symbol;
    this.model.timeInterval = +this.timeInterval;
    this.model.title = this.symbol;

    this.xscale = d3.scaleLinear().domain([ 0,this.model.width ]).range([0,this.model.width]);
    this.yscale = d3.scaleLinear().domain([ 0,this.model.height ]).range([this.model.height,0]);

    this.model.viewBox();
    this.initPlotDimensions();


  }


}

