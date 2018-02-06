import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host, OnDestroy
} from '@angular/core';
import {MUiCandle, ObjectId, MUiCandlePlotSvg} from "../../../../model/model";
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
    '[attr.x]':"x()",
    '[attr.y]':"y()",


  },
  styleUrls: ['UiCandlePlotWindow.scss'],
  template: `
  <svg:rect [attr.x]="model.viewBoxX" [attr.y]="0" height="480" width="800" class="UiCandlePlotWindowBGRect"></svg:rect>

  <svg:g *ngIf="model.startStreaming==false" [attr.transform]="initializationMessageTransform()">
    <svg:text  #initializationMessage class="streamingNotStartedText" >Waiting for the connection...</svg:text>
  </svg:g>
  <svg:g #gcontainer></svg:g>
  <ng-content></ng-content>
  `


})
export class UiCandlePlotWindow implements OnInit, OnDestroy {

  @Input() viewBoxX:number;
  @Input() viewBoxY:number;
  @Input() viewBoxWidth:number;
  @Input() viewBoxHeight:number;

  model:MUiCandlePlotSvg;

  @Input() symbol:string="XLMETH";
  @Input() timeInterval:number=60;
  @Input() width:string='800';
  @Input() height:string='480';
  uuid:string=null;

  candleReaderSubscription: Subscription;
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
    private scaleService:ServiceCandlePlotScale

  ) {

   this.model = new MUiCandlePlotSvg();

    //this.parent = parent;
    this.uuid = UUID.UUID();



    this.candleReaderSubscription = this.candleReaderService.getMessage().subscribe(message => this.candleReaderMessageHandler(message));
    this.cacheService.initCandlePlotCache(this.uuid);
    this.scaleService.initCandlePlotScale(
      this.uuid,
      [0,0,0,0],/*minx,miny,max,maxy*/
      +this.width,
      +this.height
    );

  }


  x(){
    return "20";
  }

  y(){
    return "20";
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
    this.cacheService.insertCollection(this.uuid, candles, this.model);
    this.scaleService.initCandlePlotScale(this.uuid,this.cacheService.extent(this.uuid),this.model.width, this.model.height);

    let candles_ = this.cacheService.readLastInserteds(this.uuid);
    for (let i=0;i<candles_.length;i++){
      let c = candles_[i];
      this.createCandleComponent(c, i, +this.width, +this.height);
    }


  }


  candleReaderMessageHandler(message:any){
    if (message.plotId!=this.uuid){
      console.log("CandlePlot: uuid mismatch", "mine is", this.uuid, "received client uuid:",message.plotId);
      return;
    }
    console.log("CandlePlot: received new candles, length:",message.candles.length);
    this.renderer.setElementStyle(this.initializationMessageEl.nativeElement, 'display', 'none');

    let candles = <MCandle[]> message.candles;
    // console.log(`[candle_plot_${this.plotId}]`, candles.length);
    this.projectCandles(candles);

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
    this.model.startStreaming=false;
    this.initializationMessageTransformString = this.initializationMessageTransform();

    console.log("ngOnInit.initializationMessageTransformString",this.initializationMessageTransformString);

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
    console.log("mousedown",e);
    this.model.mouseSwipeMove.x1=+e.offsetX;
  }

  @HostListener('mouseup', ['$event'])
  mouseUp(e) {
    e.stopPropagation();
    this.model.mouseSwipeMove.x2=+e.offsetX;
    let moveLength = this.model.mouseSwipeMove.x1-this.model.mouseSwipeMove.x2;

    //make swipe faster, take pow of 1.1
    if (moveLength<0)
      this.model.viewBoxX -=  Math.pow(Math.abs(moveLength),1.1);
    else
      this.model.viewBoxX +=  Math.pow(Math.abs(moveLength),1.1);
    this.model.viewBox();
  }

  ngOnDestroy(){
      clearInterval(this.pingIntervalId);
  }
}

