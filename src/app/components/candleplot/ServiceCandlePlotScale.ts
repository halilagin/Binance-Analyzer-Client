/**
 * Created by halil on 26/01/2018.
 */


import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs";
import {KeyedCollection} from "../../model/collections";
import * as d3  from 'd3-ng2-service/src/bundle-d3';

// circular cache
// candles array is circular.
// see: http://www.sanfoundry.com/java-program-circular-buffer/


export class CandlePlotScale{
  private uuid:string;
  private extent:number[]; //[minx,miny, maxx,maxy]
  private height:number=null;
  private width:number=null;

  public scaleX=(val):number=>{return null;};
  public scaleY=(val):number=>{return null;};

  private d3ScaleY;
  private d3ScaleX;

  private cacheSize=500;

  constructor(uuid:string, extent:number[], width:number, height:number){
    this.d3ScaleY = d3.scaleLinear().domain([ extent[1]-Math.abs(extent[1])*0.1, extent[3]+Math.abs(extent[3])*0.1 ]).range([height,0]);
    //this.d3ScaleX = d3.scaleLinear().domain([ extent[0]-Math.abs(extent[0])*0.1, extent[2]+Math.abs(extent[2])*0.1 ]).range([-4200,width]);

    let ordinalDomain=[];
    for (let i=0;i<this.cacheSize;i++){//items are in max first, min last order.
      ordinalDomain.push(extent[0]+i*60);
    }


    let ordinalRange =[];
    for (let i=0;i<this.cacheSize;i++){
      ordinalRange.push(800-i*10);
    }
    this.d3ScaleX = d3.scaleOrdinal().domain(ordinalDomain).range(ordinalRange);
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

  public scaleX(uuid:string){
    return this.scales.item(uuid).scaleX;
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
