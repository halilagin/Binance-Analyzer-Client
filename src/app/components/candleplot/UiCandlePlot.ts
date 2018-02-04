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
  }

  ngOnInit() {
  }

  sendMessage(){
    //this.candlePlotSvg.sendMessage("button'dan selam!");
  }

}
