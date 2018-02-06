import {
  Component, OnInit, Input, ViewChild, forwardRef, Renderer, ComponentFactoryResolver,
  ElementRef, ViewContainerRef, Inject, ReflectiveInjector, HostListener, HostBinding, Host
} from '@angular/core';
import * as d3  from 'd3-ng2-service/src/bundle-d3';
// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets



@Component({
  selector: 'svg[UiPlotDesktop]',
  host:{


  },
  styleUrls: ['UiPlotDesktop.scss'],
  templateUrl: 'UiPlotDesktop.html',


})
export class UiPlotDesktop implements OnInit {
  @Input() width:string='800';
  @Input() height:string='480';


  constructor() {
    let d3ScaleY = d3.scaleLinear().domain([ 40,80]).range([0,1]);
  }

  ngOnInit() {
  }

  sendMessage(){
    //this.candlePlotSvg.sendMessage("button'dan selam!");
  }

}
