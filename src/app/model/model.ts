
import {MCandle} from "./bac.frontend";
import * as d3  from 'd3-ng2-service/src/bundle-d3';
import {KeyedCollection} from "./collections";



export class MConstants{
  //this is need to determine to when to update time axis
  // lets have 1m setup. for this, we will have 5 ticks
  // since this.timeInterval=5*m
  //each time interval setup has different coefficient which is 5 in this case.
  //this has will store the <'1M',5> pairs.
  public updateThresholdCounts:KeyedCollection<number>;
  public timeIntervalInSecond:KeyedCollection<number>;

  constructor(){
    this.updateThresholdCounts = new KeyedCollection<number>()
    this.timeIntervalInSecond = new KeyedCollection<number>()
    this.populateUpdateThresholdCounts();
  }

  populateUpdateThresholdCounts(){
    //see setTimeInterval

    this.timeIntervalInSecond.add('1M',60);
    this.timeIntervalInSecond.add('5M',5*60); // 20/5=4
    this.timeIntervalInSecond.add('30M',30*60);
    this.timeIntervalInSecond.add('1H',60*60);
    this.timeIntervalInSecond.add('2H',2*60*60);
    this.timeIntervalInSecond.add('4H',4*60*60);
    this.timeIntervalInSecond.add('12H',12*60*60);
    this.timeIntervalInSecond.add('1D',1*24*60*60);
    this.timeIntervalInSecond.add('1W',7*1*24*60*60);

    this.updateThresholdCounts.add('1M',10);
    this.updateThresholdCounts.add('5M',6); // 20/5=4
    this.updateThresholdCounts.add('30M',8);
    this.updateThresholdCounts.add('1H',6);
    this.updateThresholdCounts.add('2H',8);
    this.updateThresholdCounts.add('4H',12);
    this.updateThresholdCounts.add('12H',6);
    this.updateThresholdCounts.add('1D',7);
    this.updateThresholdCounts.add('1W',4);



  }

}

export const MCONSTANTS:MConstants = new MConstants();

export class MCandleViewBox{
  public firstIndex:number=-1;
  public lastIndex:number=-1;
  public viewBoxWidth:number;//these two needed to calculate the candles in viewBox
  public candleWidth:number;
  constructor(viewBoxWidth:number, candleWidth:number) {
    this.viewBoxWidth = viewBoxWidth;
    this.candleWidth = candleWidth;

  }
}


export class ObjectId{
  public str:string=null;

  constructor(str:string){
    this.str = str;
  }
}

export class MUiCandle {


  public mcandle: MCandle;


  public x;
  public y;


  private width: number = 8;
  private gwidth: number = 5;
  private gheight: number = 5;

  private height;
  private translateString;
  private topLine = {x: 0, y1: 0, y2: 0};
  private bottomLine = {x: 0, y1: 0, y2: 0};
  private top = 0;
  private bottom = 0;
  private recty=0;

  public increase = false;
  public scale = 1;
  public gScaleY;
  public rectHeight;

  constructor(mcandle: MCandle, sx: (val: number) => any, sy: (val: number) => any) {
    this.mcandle = mcandle;

    this.init(sx, sy);
  }


  init(sx: (val: number) => any, sy: (val: number) => any) {

    //x,y are the position of the g.
    this.scale = 1;
    if (sx == null && sy == null) {
      //no scale given
      this.x = this.mcandle.openTime;
      this.y = this.mcandle.low;
      if (this.mcandle.open >= this.mcandle.close) {
        this.top = this.mcandle.open;
        this.bottom = this.mcandle.close;
        this.increase = false;
      } else {
        this.top = this.mcandle.close;
        this.bottom = this.mcandle.open;
        this.increase = true;
      }
      this.gheight = Math.abs(this.mcandle.high - this.mcandle.low);
      this.height = Math.abs(this.mcandle.open - this.mcandle.close);
      this.topLine.x = this.x + this.width / 2;
      this.topLine.y1 = this.mcandle.high;
      this.topLine.y2 = this.top;
      this.bottomLine.x = this.x + this.width / 2;
      this.bottomLine.y1 = this.mcandle.low;
      this.bottomLine.y2 = this.bottom;
    } else {
      this.height = Math.abs(sy(this.mcandle.high)- sy(this.mcandle.low))+1;//5 to avoid zero height. it is in pixel

      this.gScaleY = d3.scaleLinear().domain([this.mcandle.low*0.9,this.mcandle.high*1.1]).range([this.height,0]);
      let gy = this.gScaleY;
      this.rectHeight=Math.abs(gy(this.mcandle.open)- gy(this.mcandle.close));
      if (this.rectHeight<0.5)
        this.rectHeight=0.5;

      //there exist scale functions, sx,sy.
      this.x = sx(this.mcandle.openTime);
      this.y = sy(this.mcandle.high);
      this.increase = this.mcandle.open < this.mcandle.close;
      if (this.increase) {
        this.topLine.y2 = gy(this.mcandle.close);//rect top
        this.bottomLine.y2 = gy(this.mcandle.open);//rect bottom

      } else {
        this.topLine.y2 = gy(this.mcandle.open);//rect top
        this.bottomLine.y2 = gy(this.mcandle.close);//rect bottom

      }
      this.topLine.y1 = 0;
      this.bottomLine.y1 = this.height;
      this.topLine.x = this.width / 2;
      this.bottomLine.x = this.width / 2;
      this.recty = this.topLine.y2;



      //this.bottomLine.y2 is the bottom of the top line which is top of the rectangle.
      //we cannot use this.topLine.y2 because the rect is drawn from low y to high y.


    }
  }

}

export class CandleCacheMessage{
  public action:string;
  public data:any;
  public plotUUID:string;

}



export class MUiCandlePlotWindow{
  public viewBoxX:number;
  public viewBoxY:number;
  public viewBoxWidth:number;
  public viewBoxHeight:number;
  public width:number=800;
  public height:number=480;
  public viewBoxString:string;
  public uuid:string=null;

  public mouse={offsetX:-1,offsetY:-1};
  public mouseSwipeMove={x1:-1,x2:-1,y1:-1,y2:-1};

  public symbol:string="XLMETH";
  public timeInterval:number=60;

  public title:string;

  public viewBox(){
    this.viewBoxString = `${this.viewBoxX} ${this.viewBoxY} ${this.viewBoxWidth} ${this.viewBoxHeight}`;
    return this.viewBoxString;
  }
}



export class MUiCandlePlotStreamingFrame{
  public x:number;
  public y:number;

  public viewBoxX:number;
  public viewBoxY:number;
  public viewBoxWidth:number;
  public viewBoxHeight:number;

  public viewBoxString:string;

  public mouse={offsetX:-1,offsetY:-1};
  public mouseSwipeMove={x1:-1,x2:-1,y1:-1,y2:-1};



  public symbol:string="XLMETH";
  public timeInterval:number=60;
  public width:number=800;
  public height:number=480;
  public metric:string='px';
  public uuid:string=null;
  public startStreaming=false;

  public candleViewBox:MCandleViewBox;
  public candleWidth:number=10;
  constructor(){

  }

  public viewBox(){
    this.viewBoxString = `${this.viewBoxX} ${this.viewBoxY} ${this.viewBoxWidth} ${this.viewBoxHeight}`;
    return this.viewBoxString;
  }

}


export class MuiPriceAxis {
  public domain:number[]=[]; //[min,max]
  public range:number[]=[]; //[min,max]
  public tickCount:number=5;
  public scale:(number)=>number;
  public ticks:number[]=[];
  public tickPositions:number[]=[];
  //1M=60, 5M=300,15M=900, 30M=1800, 1H=3600, 2H=7200, 4H=14400,6H=21600, 12H=43200, 1D=86400, 1W=7*86400
  public timeInterval:number;


  constructor(domain:number[], range:number[], tickCount:number){


    this.domain = domain;
    this.range = [ range[0]-Math.abs(range[0])*0.05, range[1]+Math.abs(range[1])*0.05 ];
    this.tickCount=tickCount;

    this.scale = d3.scaleLinear().domain(this.domain).range(this.range);
    let binWidth = (domain[1]-domain[0])/this.tickCount;

    this.ticks=[];
    this.tickPositions=[];
    for (let i=0;i<(this.tickCount+1);i++){
      let n = domain[0]+i*binWidth;//+binWidth/2;
      this.ticks.push(n);
      this.tickPositions.push(this.scale(n));
    }

  }

}



export class MuiTimeAxis {
  public domain:number[]=[]; //[min,max]
  public range:number[]=[]; //[min,max]
  public tickCount:number=5;
  public scale:(number)=>number;
  public ticks:number[]=[];
  public tickPositions:number[]=[];
  public timeInterval:number;//in second




  constructor(timeInterval:string, domain:number[], range:number[]){
    this.timeInterval = MCONSTANTS.timeIntervalInSecond.item(timeInterval);

    this.domain = domain;
    this.range = [ range[0]-Math.abs(range[0])*0.05, range[1]+Math.abs(range[1])*0.05 ];
    this.tickCount=(domain[1]-domain[0])/this.timeInterval/MCONSTANTS.updateThresholdCounts.item(timeInterval);



    this.scale = d3.scaleLinear().domain(this.domain).range(this.range);
    let binWidth = (domain[1]-domain[0])/this.tickCount;

    this.ticks=[];
    this.tickPositions=[];
    for (let i=0;i<(this.tickCount+1);i++){
      let n = domain[0]+i*binWidth;//+binWidth/2;
      this.ticks.push(n);
      this.tickPositions.push(this.scale(n));
    }

  }




}


