
import {MCandle} from "./bac.frontend";


export class ObjectId{
  public str:string=null;

  constructor(str:string){
    this.str = str;
  }
}

export class CandleUIModel  {


  public mcandle:MCandle;


  public x;
  public y;


  private width:number=8;
  private gwidth:number=5;
  private gheight:number=5;

  private height;
  private translateString;
  private topLine={x:0,y1:0,y2:0};
  private bottomLine={x:0,y1:0,y2:0};
  private top=0;
  private bottom=0;

  public increase=false;

  constructor( mcandle:MCandle) {
    this.mcandle = mcandle;
    this.init();
  }


  init() {

    if (this.mcandle.open>=this.mcandle.close){
      this.top = this.mcandle.open;
      this.bottom = this.mcandle.close;
      this.increase = false;
    } else {
      this.top = this.mcandle.close;
      this.bottom = this.mcandle.open;
      this.increase = true;
    }

    this.x = 0;
    this.y = this.increase?this.mcandle.open:this.mcandle.close;
    this.gheight = Math.abs(this.mcandle.high-this.mcandle.low);
    this.height = Math.abs(this.mcandle.open-this.mcandle.close);

    this.topLine.x = this.x+this.width/2;
    this.topLine.y1 = this.mcandle.high;
    this.topLine.y2 = this.top;

    this.bottomLine.x = this.x+this.width/2;
    this.bottomLine.y1 = this.mcandle.low;
    this.bottomLine.y2 = this.bottom;
  }

}

