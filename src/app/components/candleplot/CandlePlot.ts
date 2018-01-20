import {Component, OnInit, Input} from '@angular/core';
import {CandleModel, CandleUIParameters} from "../../model/model";


// see: https://www.sarasoueidan.com/blog/svg-coordinate-systems/
// see: https://github.com/ohjames/rxjs-websockets
@Component({
  selector: 'g[SvgG]',
  styleUrls: ['./CandlePlot.scss'],
  template: `
    <ng-content></ng-content>
  `

})
export class SvgG implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}


@Component({
  selector: 'g[Candle]',
  styleUrls: ['./CandlePlot.scss'],
  host:{
    '[attr.transform]':'translateString'
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

    <!--</svg:g>-->
  `

})
export class Candle implements OnInit {


  public model:CandleModel;

  //the shape of the candle
  @Input() low:number=10;
  @Input() high:number=30;
  @Input() open:number=30;
  @Input() close:number=15;

  private translateString:String;

  constructor() {

  }

  translate(){
    let x_ = this.model.x;
    let y_ = this.model.y;
    return `translate(${x_},${y_})`;
  }

  ngOnInit() {
    let candleParams = new CandleUIParameters();
    candleParams.low= 10;
    candleParams.high = 90;
    candleParams.open = 80;
    candleParams.close = 75;
    candleParams.sequence=17;
    candleParams.timeInterval=60;

    this.model = new CandleModel(candleParams);
    this.translateString= this.translate();
  }

}




@Component({
  selector: 'svg[CandlePlotSvg]',
  styleUrls: ['./CandlePlot.scss'],
  host:{
    'class':"CandlePlotSvg",

  },
  template: `
    <ng-content></ng-content>
  `
})
export class CandlePlotSvg implements OnInit {

  // @Input() width;
  // @Input() height;
  //

  constructor() { }

  ngOnInit() {
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

  constructor() { }

  ngOnInit() {
  }

}
