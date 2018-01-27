import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host
} from '@angular/core';
import {CandleUIModel, ObjectId} from "../../model/model";
import {BasWebSocketService} from "../../services/BasWebSocketService";
import {BacLocalService} from "../../services/BacLocalService";
//import { v4 as uuid } from 'uuid';
import {Subscription} from "rxjs";
import {WebSocketCandleReaderService} from "../../services/WebSocketCandleReaderService";
import { UUID } from 'angular2-uuid';
import {MCandle} from "../../model/bac.frontend";
import {CandleCacheService, CandleCache} from "./CandleCacheService";
import {CandlePlotScaleService} from "./CandlePlotScaleService";

// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets



@Component({
  selector: 'svg:g[Candle]',
  styleUrls: ['./CandlePlot.scss'],
  host:{
    '[attr.transform]':'translate()'

  },
  template: `
    <!--<svg:g [attr.width]="gwidth"  [attr.height]="gheight" >-->
     <!--<svg:circle [attr.r]="5" [attr.cx]="x" [attr.cy]="y" stroke-width="12" class="progress__meter" />-->
    <!--<svg:rect [attr.x]="x" [attr.y]="y" [attr.width]="width" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />-->
    <!--</svg:g>-->
    
    
    <!--<svg:g [attr.transform]="translate()">-->
      <!--<g Candle></g>-->
      <!--<svg:circle [attr.r]="5" [attr.cx]="0" [attr.cy]="0" stroke-width="12" class="progress__meter" />-->
    <svg:rect [attr.x]="model.x" [attr.y]="model.y" [attr.width]="model.width" [attr.height]="model.height" style="fill:rgb(255,0,0);stroke-width:0;" />
    <svg:line [attr.x1]="model.topLine.x" [attr.x2]="model.topLine.x" [attr.y1]="model.topLine.y1" [attr.y2]="model.topLine.y2"  style="stroke:rgb(255,0,0);stroke-width:1;" />
    <svg:line [attr.x1]="model.bottomLine.x" [attr.x2]="model.bottomLine.x" [attr.y1]="model.bottomLine.y1" [attr.y2]="model.bottomLine.y2"  style="stroke:rgb(255,0,0);stroke-width:1;" />
    <svg:text [attr.x]="model.x" [attr.y]="model.y"  style="fill:rgb(0,0,0);stroke-width:0;font-size:6px;" > {{model.mcandle.openTime}}</svg:text>
    
    <!--</svg:g>-->
  `

})
export class Candle implements OnInit {


  public model:CandleUIModel;

  //the shape of the candle
  @Input() low:number=10;
  @Input() high:number=30;
  @Input() open:number=30;
  @Input() close:number=15;
  @Input() openTime:number=17;
  @Input() timeInterval:number=60;
  @Input() x:number=5;
  @Input() y:number=5;
  @Input() scale:number=1;


  private translateString:String;

  candleCacheSubscription: Subscription;

  constructor( private cacheService:CandleCacheService) {
    this.candleCacheSubscription = this.cacheService.getMessage().subscribe(message => this.candleCacheMessageHandler(message));

  }



  candleCacheMessageHandler(message:any){
    console.log("candle: candle.cache message received!");
  }


  translate(){
    let x_ = this.model.x;
    let y_ = this.model.y;
    //return `translate(${x_},${y_})`;
    return `translate(${this.x},${this.y})scale(${this.scale},-1)`;
  }

  private init(mcandle:MCandle){
    this.model = new CandleUIModel(mcandle);
    this.translateString= this.translate();
  }

  ngOnInit() {
    let mcandle:MCandle  = new MCandle();
    mcandle.low= this.low;
    mcandle.high = this.high;
    mcandle.open = this.open;
    mcandle.close = this.close;
    mcandle.openTime=this.openTime;
    mcandle.timeInterval=this.timeInterval;
    this.init(mcandle);

  }

}




@Component({
  selector: '[CandlePlotG]',
  styleUrls: ['./CandlePlot.scss'],
  host:{
    'class':"CandlePlotG",

  },
  template: `
    
    <!--<svg:g  transform="translate(-50,15)">-->
    <!--<svg:rect _ngcontent-c6="" style="fill:rgb(255,0,0);stroke-width:0;" x="60" y="15" width="20" height="15"></svg:rect>-->
    <!--<svg:line _ngcontent-c6="" style="stroke:rgb(255,0,0);stroke-width:1;" x1="70" x2="70" y1="30" y2="30"></svg:line>-->
    <!--<svg:line _ngcontent-c6="" style="stroke:rgb(255,0,0);stroke-width:1;" x1="70" x2="70" y1="10" y2="15"></svg:line>-->
    <!--</svg:g>-->
    <!--<svg:g Candle low="0" high="1" open="0" close="1" openTime="17" timeInterval="60" x="27" y="50" ></svg:g>-->

    <svg:g Candle low="40" high="0" open="80" close="60" openTime="{{i}}" timeInterval="60" x="{{-4200+i*10}}" y="{{150}}" *ngFor="let x_ of testCandleXs;let i=index" ></svg:g>


    <!--<svg:g #gcontainer></svg:g>-->
    <!--<ng-content></ng-content>-->
  `,
  providers:[]
})
export class CandlePlotG implements OnInit {

  @Input() symbol:string="XLMETH";
  @Input() timeInterval:number=60;
  @Input() width:string='800';
  @Input() height:string='480';


  uuid:string=null;
  candleReaderSubscription: Subscription;
  candleComponents=[];

  private candleFactory=null;
  @ViewChild("gcontainer") gcontainerEl:ElementRef;
  @ViewChild('gcontainer', {read: ViewContainerRef}) gcontainer: ViewContainerRef;

  testCandleXs=[];
  candlesCircularArray;//this array has 500 elements and updated regularly.



  constructor(
    @Host() parent: CandlePlotSvg,
    @Inject(ViewContainerRef) viewContainerRef,
    private meRef: ElementRef,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer,
    public wsService:BasWebSocketService,
    private bacLocalService:BacLocalService,
    private candleReaderService:WebSocketCandleReaderService,
    private cacheService:CandleCacheService,
    private scaleService:CandlePlotScaleService

  ) {
    this.parent = parent;
    this.uuid = UUID.UUID();

    this.candleReaderSubscription = this.candleReaderService.getMessage().subscribe(message => this.messageHandler(message));
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

    let factory = this.resolver.resolveComponentFactory(Candle);
    //let factory = this.resolver.resolveComponentFactory(Candle);
    //let component = this.gcontainer.createComponent(this.candleFactory);

    let groupNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let candle = factory.create(this.gcontainer.injector, [], groupNode);
    candle.instance.low = mcandle.low;
    candle.instance.high = mcandle.high;
    candle.instance.open = mcandle.open;
    candle.instance.close = mcandle.close;
    candle.instance.openTime = mcandle.openTime;
    candle.instance.timeInterval = mcandle.timeInterval;
    candle.instance.x = this.scaleService.scaleX(this.uuid)(mcandle.openTime);//this syntax is true, scaleX returns a function
    candle.instance.y = this.scaleService.scaleY(this.uuid)(mcandle.low);//this syntax is true, scaleY returns a function
    this.gcontainer.insert(candle.hostView);
    candle.changeDetectorRef.detectChanges();

  }


  projectCandles(candles:MCandle[]){
    this.cache.insertCollection(candles);
    let candles_ = this.cache.readLastInserteds();
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

  messageHandler(message:any){
    if (message.plotClientId!=this.plotId)
      return;
    let candles = <MCandle[]> message.candles;
    // console.log(`[candle_plot_${this.plotId}]`, candles.length);
    this.projectCandles(candles);

  }

  ngOnInit() {

    this.wsService.sendMessage(JSON.stringify({
      "action":"registerCandlePlot",
      plotParams:{
        "symbol":this.symbol,
        "timeInterval":this.timeInterval,
        "plotId":this.plotId
    },
      clientInfo:{
        clientIndex:this.bacLocalService.clientState.bacClientIndex
      }
    }));
  }

}



@Component({
  selector: 'svg[CandlePlotSvg]',
  host:{
    'class':"CandlePlotSvg",
    '[attr.viewBox]':"viewBoxString"

  },
  styleUrls: ['./CandlePlot.scss'],
  template: `
    <ng-content></ng-content>
  `


})
export class CandlePlotSvg implements OnInit {

  @Input() viewBoxX:number;
  @Input() viewBoxY:number;
  @Input() viewBoxWidth:number;
  @Input() viewBoxHeight:number;

  viewBoxString:string;

  mouse={offsetX:-1,offsetY:-1};
  mouseSwapMove={x1:-1,x2:-1,y1:-1,y2:-1};

  constructor(private meRef: ElementRef,private renderer: Renderer) { }


  viewBox(){
    return `${this.viewBoxX} ${this.viewBoxY} ${this.viewBoxWidth} ${this.viewBoxHeight}`;
  }

  ngOnInit() {
    this.viewBoxString = this.viewBox();
    console.log("candleplotsvg:viewbox",this.viewBox());
    this.renderer.setElementAttribute(this._elementRef.nativeElement, 'draggable', 'true');

  }

  sendMessage(){
    //this.candlePlotSvg.sendMessage("button'dan selam!");
  }



  @HostListener('mousedown', ['$event'])
  mouseDown(e) {
    e.stopPropagation();
    console.log("mousedown",e);
    this.mouseSwapMove.x1=+e.offsetX;
  }

  @HostListener('mouseup', ['$event'])
  mouseUp(e) {
    e.stopPropagation();
    this.mouseSwapMove.x2=+e.offsetX;
    let moveLength = this.mouseSwapMove.x1-this.mouseSwapMove.x2;

    //make swipe faster, take pow of 1.1
    if (moveLength<0)
      moveLength = - Math.pow(Math.abs(moveLength),1.1);
    else
      moveLength =  Math.pow(Math.abs(moveLength),1.1);

    this.viewBoxX=+this.viewBoxX+moveLength ;
    this.viewBoxString = this.viewBox();
  }
}



@Component({
  selector: 'div[CandlePlot]',
  host:{
    'class':"CandlePlot",

  },
  styleUrls: ['./CandlePlot.scss'],
  templateUrl: './CandlePlot.html',


})
export class CandlePlot implements OnInit {

  @ViewChild(forwardRef(() => CandlePlotG)) candlePlotSvg: CandlePlotG;


  constructor() { }

  ngOnInit() {
  }

  sendMessage(){
    //this.candlePlotSvg.sendMessage("button'dan selam!");
  }

}
