
export class CandleUIParameters {



  //the shape of the candle
  public low: number = 10;
  public high: number = 30;
  public open: number = 30;
  public close: number = 15;
  public sequence:number=17;
  public timeInterval:number=60;
}


export class ObjectId{
  public str:string=null;

  constructor(str:string){
    this.str = str;
  }
}

export class CandleModel  {



  //the shape of the candle
  public params:CandleUIParameters;

  public sequence:number=17;
  public timeInterval:number=60;
  public x;
  public y;


  private width:number=20;
  private gwidth:number=5;
  private gheight:number=5;

  private height;
  private translateString;
  private topLine={x:0,y1:0,y2:0};
  private bottomLine={x:0,y1:0,y2:0};
  private top=0;
  private bottom=0;

  public increase=false;

  constructor(params:CandleUIParameters) {
    this.params = params;
    this.init();
  }


  init() {

    if (this.params.open>=this.params.close){
      this.top = this.params.open;
      this.bottom = this.params.close;
      this.increase = false;
    } else {
      this.top = this.params.close;
      this.bottom = this.params.open;
      this.increase = true;
    }

    this.x = 60;
    this.y = this.increase?this.params.open:this.params.close;
    this.gheight = Math.abs(this.params.high-this.params.low);
    this.height = Math.abs(this.params.open-this.params.close);

    this.topLine.x = this.x+this.width/2;
    this.topLine.y1 = this.params.high;
    this.topLine.y2 = this.top;

    this.bottomLine.x = this.x+this.width/2;
    this.bottomLine.y1 = this.params.low;
    this.bottomLine.y2 = this.bottom;
  }

}

