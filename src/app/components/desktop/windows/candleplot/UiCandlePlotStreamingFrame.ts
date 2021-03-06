import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host, OnDestroy
} from '@angular/core';
import {MUiCandle, ObjectId, MUiCandlePlotStreamingFrame, MCandleViewBox} from "../../../../model/model";
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
import {ServiceUiCandlePlotStreamingFrame} from "./ServiceUiCandlePlotStreamingFrame";
// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets




@Component({
  selector: 'svg[UiCandlePlotStreamingFrame]',
  host:{
    '[attr.viewBox]':"model.viewBoxString",
    '[attr.class]':"UiCandlePlotStreamingFrame",
    '[attr.draggable]':'true',
    '[attr.x]':"model.x",
    '[attr.y]':"model.y",
    '[attr.width]':'model.width',
    '[attr.height]':'model.height'

  },
  styleUrls: ['UiCandlePlotStreamingFrame.scss'],
  template: `
  <svg:rect [attr.x]="model.viewBoxX" [attr.y]="0" [attr.height]="height" [attr.width]="width" class="UiCandlePlotWindowBGRect"></svg:rect>
  <svg:g *ngIf="model.startStreaming==false" [attr.transform]="initializationMessageTransform()">
    <svg:text  #initializationMessage class="streamingNotStartedText" >Waiting for the connection...</svg:text>
  </svg:g>
  <svg:g #gcontainer></svg:g>
  <ng-content></ng-content>
  `


})
export class UiCandlePlotStreamingFrame implements OnInit, OnDestroy {
  @Input() x:number;
  @Input() y:number;
  @Input() symbol:string="XLMETH";
  @Input() timeInterval:number=60;
  @Input() width:string='800';
  @Input() height:string='480';
  @Input() uuid:string=null;

  model:MUiCandlePlotStreamingFrame;
  candleReaderSubscription: Subscription;
  timeFrameInViewBox:number[]; //the left most and right most candles' opentime values.

  @ViewChild("gcontainer") gcontainerEl:ElementRef;
  @ViewChild('gcontainer', {read: ViewContainerRef}) gcontainer: ViewContainerRef;
  @ViewChild("initializationMessage") initializationMessageEl:ElementRef;



  initializationMessageTransformString:string;
  localStorageSubscription: Subscription;
  pingIntervalId:any=null;
  constructor(
    @Inject(ViewContainerRef) viewContainerRef,
    private meRef: ElementRef,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer,
    public wsService:BasWebSocketService,
    private bacLocalService:BacLocalService,
    private candleReaderService:WebSocketCandleReaderService,
    private cacheService:ServiceCandleCache,
    private scaleService:ServiceCandlePlotScale,
    private myService:ServiceUiCandlePlotStreamingFrame,


  ) {

    this.model = new MUiCandlePlotStreamingFrame();
    //this.parent = parent;
    this.uuid = UUID.UUID();




  }


  initializationMessageTransform(){
    let w = this.model.width/2;//(this.initializationMessageEl.nativeElement.offsetWidth/2);
    if (this.initializationMessageEl!==undefined && this.initializationMessageEl.nativeElement!==undefined  ) {
      w = this.model.width / 2 - ((parseInt(this.initializationMessageEl.nativeElement.clientWidth)) / 2);
    }
    let h = this.model.height/2;

    return `translate(${w},${h})`;
  }

  createCandleComponent(mcandle:MCandle, index:number, canvasWidth:number, canvasHeight:number) {

    let factory = this.resolver.resolveComponentFactory(UiCandle);
    //let factory = this.resolver.resolveComponentFactory(Candle);
    //let component = this.gcontainer.createComponent(this.candleFactory);

    let groupNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let candle = factory.create(this.gcontainer.injector, [], groupNode);
    // let x = this.scaleService.scaleX(this.uuid)(mcandle.openTime);//this syntax is true, scaleX returns a function;
    // let y = this.scaleService.scaleY(this.uuid)(mcandle.low);//this syntax is true, scaleY returns a function
    candle.instance.init(mcandle,this.scaleService.scaleX(this.uuid),this.scaleService.scaleY(this.uuid));
    this.gcontainer.insert(candle.hostView);
    candle.changeDetectorRef.detectChanges();

  }

  projectCandles(candles:MCandle[]){
    this.cacheService.insertCollection(this.uuid, candles);
    this.scaleService.initCandlePlotScale(this.uuid,this.cacheService.extent(this.uuid),this.model.width, this.model.height);

    let candles_ = this.cacheService.readLastInserteds(this.uuid);
    for (let i=0;i<candles_.length;i++){
      let c = candles_[i];
      this.createCandleComponent(c, i, +this.width, +this.height);
    }

    if (this.model.startStreaming==false){//this the first time streamed candles created. after that this block will not be executed again.
      //initialize the candles in viewBox. after that these candleViewbox will be updated by dragging which changes the viewbox.
      this.model.candleViewBox.firstIndex = this.cacheService.caches.item(this.uuid).cacheViewBox.firstIndex;
      this.model.candleViewBox.lastIndex = this.cacheService.caches.item(this.uuid).cacheViewBox.lastIndex;
      //update x and y scales.
    } else
      ;//it is now streaming and first and last should be updated by dragging but not cache service.


  }


  candleReaderMessageHandler(message:any){
    if (message.plotId!=this.uuid){
      console.log("CandlePlot: uuid mismatch", "mine is", this.uuid, "received client uuid:",message.plotId);
      return;
    }
//    console.log("CandlePlot: received new candles, length:",message.candles.length);
    //this.renderer.setElementStyle(this.initializationMessageEl.nativeElement, 'display', 'none');

    let candles = <MCandle[]> message.candles;
    // console.log(`[candle_plot_${this.plotId}]`, candles.length);
    this.projectCandles(candles);
    this.model.startStreaming = true;

  }


  localStorageMessageHandler(message:any){
    if (message.action=="clientIdRegistered"){
      console.log("UICandlePlot: client id regesitered", message.clientId, "registering the plot");
      this.wsService.sendMessage({
        "action":"registerCandlePlot",
        plotParams:{
          "symbol":this.symbol,
          "timeInterval":this.timeInterval,
          "plotId":this.uuid
        },
        clientInfo:{
          clientId:this.bacLocalService.clientState.bacClientId
        }
      });
      this.startPinger();
    }
  }

  startPinger(){
    this.pingIntervalId = setInterval(()=>{
      this.wsService.sendMessage({"action":"ping", "clientId":this.bacLocalService.getClientState().bacClientId, "plotId":this.uuid});
    },10000);
  }

  ngOnInit() {


    this.model.x = +this.x;
    this.model.y = +this.y;

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
    this.model.viewBox();
    this.model.startStreaming=false;
    this.model.candleWidth=10;
    this.initializationMessageTransformString = this.initializationMessageTransform();


    this.model.candleViewBox = new MCandleViewBox(this.model.width, this.model.candleWidth);

    this.candleReaderSubscription = this.candleReaderService.getMessage().subscribe(message => this.candleReaderMessageHandler(message));
    this.cacheService.initCandlePlotCache(this.uuid, this.model.viewBoxWidth, this.model.candleWidth);
    this.scaleService.initCandlePlotScale(
      this.uuid,
      [0,0,0,0],/*minx,miny,max,maxy*/
      +this.width,
      +this.height
    );


    //console.log("ngOnInit.initializationMessageTransformString",this.initializationMessageTransformString);

    if (this.bacLocalService.clientState.bacClientId!=null){
      this.wsService.sendMessage({
        "action":"registerCandlePlot",
        plotParams:{
          "symbol":this.symbol,
          "timeInterval":this.timeInterval,
          "plotId":this.uuid
        },
        clientInfo:{
          clientId:this.bacLocalService.clientState.bacClientId
        }
      });
      this.startPinger();
    } else {
      //wait to have a clientId, when clientId registered, receive the message and register for the plot listener.
      this.localStorageSubscription = this.bacLocalService.getMessage().subscribe(message => this.localStorageMessageHandler(message));
    }

  }


  @HostListener('mousedown', ['$event'])
  mouseDown(e) {
    e.stopPropagation();
    //console.log("mousedown",e);
    this.model.mouseSwipeMove.x1=+e.offsetX;
  }

  @HostListener('mouseup', ['$event'])
  mouseUp(e) {
    e.stopPropagation();
    this.model.mouseSwipeMove.x2=+e.offsetX;
    let moveLength = this.model.mouseSwipeMove.x1-this.model.mouseSwipeMove.x2;

    //make swipe faster, take pow of 1.1
    let change_ = Math.pow(Math.abs(moveLength),1.1);
    let candleCount = Math.floor(change_/this.model.candleWidth);
    change_ = candleCount * this.model.candleWidth; //make the change multiplication of candlewidth
    let direction=0;
    if (moveLength<0) {
      this.model.viewBoxX -= change_;
      direction=-1;
    }else {
      this.model.viewBoxX += change_;
      direction=1;
    }
    this.model.viewBox();

    this.setCandleViewBox(direction, candleCount);
  }

  setCandleViewBox(direction, candleCount){
    //cacheService
    this.cacheService.moveCacheViewBox(this.uuid, direction, candleCount);
    let timeDomainExtent= this.cacheService.cacheViewBoxTimes(this.uuid);

    let message = {
      "action":"viewboxChanged",
      "bordersInOpenTime":timeDomainExtent
    };


    this.myService.sendMessage(message);
  }

  ngOnDestroy(){
    clearInterval(this.pingIntervalId);
  }
}
