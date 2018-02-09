/**
 * Created by halil on 26/01/2018.
 */


import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs";
import {KeyedCollection} from "../../../../model/collections";
import * as d3  from 'd3-ng2-service/src/bundle-d3';
import {MCandle} from "../../../../model/bac.frontend";
import {MUiCandle} from "../../../../model/model";

// circular cache
// candles array is circular.
// see: http://www.sanfoundry.com/java-program-circular-buffer/


export class CandlePlotScale{
  public uuid:string;
  public extent:number[]; //[minx,miny, maxx,maxy]
  public height:number=null;
  public width:number=null;

  public scaleX:any;
  public scaleY:any=(val):number=>{return null;};

  public rscaleX:any;


  private d3ScaleY;
  private d3ScaleX;
  private d3RScaleX;
  private cacheSize=500;




  constructor(uuid:string, extent:number[], width:number, height:number){
    this.d3ScaleY = d3.scaleLinear().domain([ extent[1]-Math.abs(extent[1])*0.1, extent[3]+Math.abs(extent[3])*0.1 ]).range([height,0]);

    let ordinalDomain=[];
    for (let i=0;i<this.cacheSize;i++){//items are in max first, min last order.
      ordinalDomain.push(extent[0]+i*60);
    }


    let ordinalRange =[];
    for (let i=0;i<this.cacheSize;i++){
      ordinalRange.push(width-i*10-100);//TODO: this shows the last candles position. replace the constant. 10 is the width of the candle. 100 is to move a bit to the left.
    }
    this.d3ScaleX = d3.scaleOrdinal().domain(ordinalDomain).range(ordinalRange);
    this.d3RScaleX = d3.scaleOrdinal().domain(ordinalRange).range(ordinalDomain);
    //extent: [minX:number, maxX:number,minY:number,maxY:number]
    //this.candleCacheSubscription = this.cacheService.getMessage().subscribe(message => this.candleCacheMessageHandler(message));
    this.uuid = uuid;
    this.extent = extent;

    this.width = width;
    this.height = height;

    this.scaleY = (val) =>{
      return this.d3ScaleY(val);
    };

    this.scaleX = (val) =>{
      return this.d3ScaleX(val);
    };

    this.rscaleX = (val) =>{
      return  this.d3RScaleX (val);

    };


  }
}


@Injectable()
export class ServiceCandlePlotScale {

  public scales: KeyedCollection<CandlePlotScale>;

  private subject = new Subject<any>();

  constructor(){
      this.scales = new KeyedCollection<CandlePlotScale>();
  }


  sendMessage(message: any) {
    this.subject.next(message);
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  public initCandlePlotScale(uuid:string, extent:number[], width:number, height:number){
    let cps = new CandlePlotScale(uuid,  extent, width, height);
    this.scales.add(uuid, cps);
  }

  public changeScale(uuid:string, extent){
    let old_:CandlePlotScale = this.scales.item(uuid);
    let cps = new CandlePlotScale(uuid,  extent, old_.width, old_.height);
    this.scales.add(uuid, cps);
  }

  public scaleX(uuid:string):any{
    return this.scales.item(uuid).scaleX;
  }

  public rscaleX(uuid:string):any{
    return this.scales.item(uuid).rscaleX;
  }

  public scaleY(uuid:string){
    return this.scales.item(uuid).scaleY;
  }


  candleCacheMessageHandler(message){
    // if (message.action=="newCollectionInserted"){
    //   let cps = new CandlePlotScale(
    //         message.plotUUID,
    //         this.candleCacheSubscription,
    //         message.data[0],
    //         message.data[1],
    //         message.data[2],
    //         message.data[3],
    //         );
    //   this.candlePlotScales.add(message.plotUUID, cps);
    //   this.scaleY = (y:number)=>{this.candleCacheService.maxY-y/300;};
    // }
  }


}
