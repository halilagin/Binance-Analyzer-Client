import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host
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
// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets



@Component({
  selector: 'svg:g[UiCandle]',
  styleUrls: ['UiCandlePlotWindow.scss'],
  host:{
    '[attr.transform]':'translate()',
    '[attr.id]':'htmlId()',
    '[attr.class]':"'UiCandle'"

  },
  template: `
    <!--<svg:g [attr.width]="gwidth"  [attr.height]="gheight" >-->
     <!--<svg:circle [attr.r]="5" [attr.cx]="x" [attr.cy]="y" stroke-width="12" class="progress__meter" />-->
    <!--<svg:rect [attr.x]="x" [attr.y]="y" [attr.width]="width" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />-->
    <!--</svg:g>-->
    
    
    <!--<svg:g [attr.transform]="translate()">-->
      <!--<g Candle></g>-->
      <!--<svg:circle [attr.r]="5" [attr.cx]="0" [attr.cy]="0" stroke-width="12" class="progress__meter" />-->
    <svg:rect [attr.x]="0" [attr.y]="model.recty" [attr.width]="model.width" [attr.height]="model.rectHeight" [attr.class]="rectCssClass()" />
    <svg:line [attr.x1]="model.topLine.x" [attr.x2]="model.topLine.x" [attr.y1]="model.topLine.y1" [attr.y2]="model.topLine.y2"  [attr.class]="lineCssClass()" />
    <svg:line [attr.x1]="model.bottomLine.x" [attr.x2]="model.bottomLine.x" [attr.y1]="model.bottomLine.y1" [attr.y2]="model.bottomLine.y2"  [attr.class]="lineCssClass()" />
    <!--<svg:text [attr.x]="0" [attr.y]="model.recty"  style="fill:rgb(0,0,0);stroke-width:0;font-size:6px;" > {{model.mcandle.openTime}}</svg:text>-->
    
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



  candleCacheSubscription: Subscription;

  constructor( private cacheService:ServiceCandleCache) {

    this.candleCacheSubscription = this.cacheService.getMessage().subscribe(message => this.candleCacheMessageHandler(message));

  }

  rectCssClass(){
    return this.model.increase?"rectIncrease":"rectDecrease";
  }

  lineCssClass(){
    return this.model.increase?"lineIncrease":"lineDecrease";
  }

  htmlId(){
    return `cndl_${this.model.mcandle.timeInterval}_${this.model.mcandle.openTime}`;
  }

  candleCacheMessageHandler(message:any){
    //console.log("candle: candle.cache message received!");
  }


  translate(){
    return `translate(${this.model.x},${this.model.y})scale(${this.model.scale},${this.model.scale})`;
  }

  public init(mcandle:MCandle, sx, sy){
    this.model = new MUiCandle(mcandle, sx, sy);
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
      //console.log("candle instantiated in a regular way.")
    } else {
      //programmatically instantiated by a factory. init method called instead.
      //do nothing
      //console.log("candle programmatically instantiated:openTime", this.model.mcandle.openTime);
    }



  }

}


