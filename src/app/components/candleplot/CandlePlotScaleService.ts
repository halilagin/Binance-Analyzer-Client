import {MCandle} from "../../model/bac.frontend";
import {Injectable} from "@angular/core";
import {CandleCacheService} from "./CandleCacheService";
import {Subject, Subscription, Observable} from "rxjs";
import {KeyedCollection} from "../../model/collections";
/**
 * Created by halil on 26/01/2018.
 */


// circular cache
// candles array is circular.
// see: http://www.sanfoundry.com/java-program-circular-buffer/


export class CandlePlotScale{
  private uuid:string;
  private subject:Subject<any>;
  candleCacheSubscription: Subscription;
  private extent:number[]; //[minx,miny, maxx,maxy]
  private height:number=null;
  private weight:number=null;

  public scaleX=()=>{};
  public scaleY=()=>{};

  constructor(uuid:string, subject:Subject, candleCacheSubscription, extent:number[], width:number, height:number){
    //extent: [minX:number, maxX:number,minY:number,maxY:number]
    //this.candleCacheSubscription = this.cacheService.getMessage().subscribe(message => this.candleCacheMessageHandler(message));
    this.uuid = uuid;
    this.subject = subject;
    this.candleCacheSubscription = candleCacheSubscription;
    this.extent = extent;

    this.weight = weight;
    this.height = height;

    this.scaleY = (val) =>{
      let maxY = this.extent[1];
      return (maxY-val)/this.height;
    };

    this.scaleX = (val) =>{
      let maxX = this.extent[2];
      return (maxX-val)/this.width;
    };


  }
}


@Injectable()
export class CandlePlotScaleService {

  public candlePlotScales: KeyedCollection<CandlePlotScale>;

  private subject = new Subject<any>();
  candleCacheSubscription: Subscription;

  constructor(private candleCacheService:CandleCacheService){
    this.candleCacheSubscription = this.cacheService.getMessage().subscribe(message => this.candleCacheMessageHandler(message));

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
    let cps = new CandlePlotScale(uuid, this.subject, this.candleCacheSubscription, extent, width, height);
    this.candlePlotScales.add(message.plotUUID, cps);
  }

  public scaleX(uuid:string){
    return this.candlePlotScales.item(uuid).scaleX;
  }
  public scaleY(uuid:string){
    return this.candlePlotScales.item(uuid).scaleY;
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
