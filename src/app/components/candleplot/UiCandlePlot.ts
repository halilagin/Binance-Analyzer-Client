import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host
} from '@angular/core';
import {MUiCandle, ObjectId, MUiCandlePlotSvg} from "../../model/model";
import {BasWebSocketService} from "../../services/BasWebSocketService";
import {BacLocalService} from "../../services/BacLocalService";
//import { v4 as uuid } from 'uuid';
import {Subscription} from "rxjs";
import {WebSocketCandleReaderService} from "../../services/WebSocketCandleReaderService";
import { UUID } from 'angular2-uuid';
import {MCandle} from "../../model/bac.frontend";
import {ServiceCandleCache, CandleCache} from "./ServiceCandleCache";
import {ServiceCandlePlotScale} from "./ServiceCandlePlotScale";
import * as d3  from 'd3-ng2-service/src/bundle-d3';
// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets



@Component({
  selector: 'svg:g[UiCandle]',
  styleUrls: ['./UiCandlePlot.scss'],
  host:{
    '[attr.transform]':'translate()',
    '[attr.id]':'htmlId()'

  },
  template: `
    <!--<svg:g [attr.width]="gwidth"  [attr.height]="gheight" >-->
     <!--<svg:circle [attr.r]="5" [attr.cx]="x" [attr.cy]="y" stroke-width="12" class="progress__meter" />-->
    <!--<svg:rect [attr.x]="x" [attr.y]="y" [attr.width]="width" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />-->
    <!--</svg:g>-->
    
    
    <!--<svg:g [attr.transform]="translate()">-->
      <!--<g Candle></g>-->
      <!--<svg:circle [attr.r]="5" [attr.cx]="0" [attr.cy]="0" stroke-width="12" class="progress__meter" />-->
    <svg:rect [attr.x]="0" [attr.y]="model.recty" [attr.width]="model.width" [attr.height]="model.height" style="fill:rgb(255,0,0);stroke-width:0;" />
    <svg:line [attr.x1]="model.topLine.x" [attr.x2]="model.topLine.x" [attr.y1]="model.topLine.y1" [attr.y2]="model.topLine.y2"  style="stroke:rgb(255,0,0);stroke-width:1;" />
    <svg:line [attr.x1]="model.bottomLine.x" [attr.x2]="model.bottomLine.x" [attr.y1]="model.bottomLine.y1" [attr.y2]="model.bottomLine.y2"  style="stroke:rgb(255,0,0);stroke-width:1;" />
    <svg:text [attr.x]="0" [attr.y]="model.recty"  style="fill:rgb(0,0,0);stroke-width:0;font-size:6px;" > {{model.mcandle.openTime}}</svg:text>
    
    <!--</svg:g>-->
  `

})
export class UiCandle implements OnInit {


  public model:MUiCandle=null;

  //the shape of the candle
  @Input() low:number;
  @Input() high:number;
  @Input() open:number;
  @Input() close:number;
  @Input() openTime:number;
  @Input() timeInterval:number;
  @Input() x:number;
  @Input() y:number;
  @Input() scale:number;


  private translateString:String;

  candleCacheSubscription: Subscription;

  constructor( private cacheService:ServiceCandleCache) {

    this.candleCacheSubscription = this.cacheService.getMessage().subscribe(message => this.candleCacheMessageHandler(message));

  }



  htmlId(){
    return `cndl_${this.timeInterval}_${this.openTime}`;
  }

  candleCacheMessageHandler(message:any){
    //console.log("candle: candle.cache message received!");
  }


  translate(){
    return `translate(${this.model.x},${this.model.y})scale(${this.model.scale},${this.model.scale})`;
  }

  public init(mcandle:MCandle, sx, sy){
    this.model = new MUiCandle(mcandle, sx, sy);

    this.translateString= this.translate();
  }

  public ngOnInit() {
    if (this.model==null){
      //instantiated in a regular way
      let mcandle:MCandle = new MCandle();
      mcandle.low= +this.low;
      mcandle.high = +this.high;
      mcandle.open = +this.open;
      mcandle.close = +this.close;
      mcandle.openTime=+this.openTime;
      mcandle.timeInterval=+this.timeInterval;
      this.init(mcandle, null, null);
      console.log("candle instantiated in a regular way.")
    } else {
      //programmatically instantiated by a factory. init method called instead.
      //do nothing
      console.log("candle programmatically instantiated:openTime", this.model.mcandle.openTime);
    }



  }

}







@Component({
  selector: 'svg[UiCandlePlotSvg]',
  host:{
    'class':"UiCandlePlotSvg",
    '[attr.viewBox]':"model.viewBoxString"

  },
  styleUrls: ['UiCandlePlot.scss'],
  template: `
  <svg:g #gcontainer></svg:g>
  <ng-content></ng-content>
  `


})
export class UiCandlePlotSvg implements OnInit {

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


  ngAfterViewInit() {
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
    candles_.forEach((c,i)=>{
      this.createCandleComponent(c, i, +this.width, +this.height);
    });

    // let mcandle = candles[0];
    // mcandle.low = 10;
    // mcandle.high = 90;
    // mcandle.open = 80;
    // mcandle.close= 75;
    // mcandle.openTime = 17;
    // mcandle.timeInterval = 60;
    // let candleComponent = this.createCandleComponent(mcandle);
  }


  // projectCandles(candles:MCandle[]){
  //   this.cacheService.insertCollection(this.uuid, candles, this.model);
  //   this.scaleService.initCandlePlotScale(this.uuid,this.cacheService.extent(this.uuid),this.model.width, this.model.height);
  //
  //   let c = new MCandle ();
  //
  //   c.assetVolume=7.27408487;
  //
  //   c.closeTime=1512742979999;
  //   c.dummy= 21734820.5282876;
  //   c.high= 0.00032699;
  //   c.open= 0.00031113;
  //   c.close=0.00031699;
  //   c.low= 0.00030113;
  //   c.middle= 0.00031406;
  //
  //   c.openTime= 1512742920;
  //   c.symbol= "XLMETH";
  //   c.takerBaseVolume= 9122;
  //   c.takerQuoteVolume= 2.89017557;
  //   c.timeInterval= 60;
  //   c.tradeCount= 12;
  //   c.volume= 23212;
  //
  //   this.createCandleComponent(c, 499, +this.width, +this.height);
  //
  // }


  candleReaderMessageHandler(message:any){
    if (message.plotClientId!=this.uuid)
      return;
    let candles = <MCandle[]> message.candles;
    // console.log(`[candle_plot_${this.plotId}]`, candles.length);
    this.projectCandles(candles);

  }


  ngOnInit() {
    this.model.viewBoxX = +this.viewBoxX;
    this.model.viewBoxY = +this.viewBoxY;
    this.model.viewBoxWidth = +this.viewBoxWidth;
    this.model.viewBoxHeight = +this.viewBoxHeight;
    this.model.mouse = {offsetX:-1,offsetY:-1};
    this.model.mouseSwipeMove = {x1:-1,x2:-1,y1:-1,y2:-1};
    console.log("candleplotsvg:viewbox",this.model.viewBox());




    this.model.uuid = this.uuid;
    this.model.width = +this.width;
    this.model.height = +this.height;
    this.model.symbol = this.symbol;
    this.model.timeInterval = +this.timeInterval;

    this.wsService.sendMessage(JSON.stringify({
      "action":"registerCandlePlot",
      plotParams:{
        "symbol":this.symbol,
        "timeInterval":this.timeInterval,
        "plotId":this.uuid
      },
      clientInfo:{
        clientIndex:this.bacLocalService.clientState.bacClientIndex
      }
    }));


  }

  sendMessage(){
    //this.candlePlotSvg.sendMessage("button'dan selam!");
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

    //this.model.viewBoxX=+this.viewBoxX+moveLength ;
    this.model.viewBoxString = this.model.viewBox();
  }
}



@Component({
  selector: 'div[UiCandlePlot]',
  host:{
    'class':"UiCandlePlot",

  },
  styleUrls: ['./UiCandlePlot.scss'],
  templateUrl: './UiCandlePlot.html',


})
export class UiCandlePlot implements OnInit {



  constructor() {


    let d3ScaleY = d3.scaleLinear().domain([ 40,80]).range([0,1]);
    console.log("d3scaley.val(60)==0.5:", d3ScaleY(60));
  }

  ngOnInit() {
  }

  sendMessage(){
    //this.candlePlotSvg.sendMessage("button'dan selam!");
  }

}
