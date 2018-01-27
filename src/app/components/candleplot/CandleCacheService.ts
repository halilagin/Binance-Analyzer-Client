import {MCandle} from "../../model/bac.frontend";
import {Injectable} from "@angular/core";
import {CandleCacheMessage} from "../../model/model";
import {Subject, Observable} from "rxjs";
import {KeyedCollection} from "../../model/collections";
import {Candle} from "./CandlePlot";
/**
 * Created by halil on 26/01/2018.
 */


// circular cache
// candles array is circular.
// see: http://www.sanfoundry.com/java-program-circular-buffer/

export class CandleCache{
  public candles:MCandle[]=[];
  public front:number=-1;
  public rear:number=-1;
  public count:number=-1;
  public lastInsertCount:number=-1;
  public maxY:MCandle=null;
  public minY:MCandle=null;
  public cacheSize:number=500;
  public uuid:string;
  public subject:Subject;

  constructor(uuid:string, cacheSize:number, subject:Subject){
    this.uuid = uuid;
    this.front=0;
    this.rear=0;
    this.count=0;
    this.cacheSize = cacheSize;
    this.subject = subject;
    this.candles = new MCandle[this.cacheSize];
  }


  sendMessage(message: any) {
    message.plotUUID= this.uuid;
    this.subject.next(message);
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }


  public  getCacheSize() {
    return this.cacheSize;
  }

  public  getCount() {
    return this.count;
  }

  public clear() {
    this.front =  0;
    this.rear = 0;
    this.count = 0;
    this.candles = new MCandle[this.cacheSize];
  }

  public isEmpty() {
    return this.count == 0;
  }

  public isFull():boolean {
    return this.count == this.cacheSize;
  }

  private insert(c:MCandle) {
    if ( !this.isFull() ) {
      this.count++;
      this.rear = (this.rear + 1) % maxSize;
      this.candles[rear] = c;
    }
    else
      System.out.println("CandleCache:Error : Underflow Exception");
  }

  public readLast(n?:number){
    if (n===undefined)
      return this.candles[this.rear];
    if (n===0)
      return [];

    let first = (this.rear-n+this.getCacheSize()) % this.cacheSize;
    let candles_:MCandle[] = [];
    for (let i=0; i<n; i++){
      let idx = (first+i)%this.cacheSize;
      candles_.push(this.candles[idx]);
    }
    return candles_;
  }


  public setMaxY(c:MCandle){
    this.maxY=c;
    let message:CandleCacheMessage= new CandleCacheMessage();
    message.action="maxYChanged";
    message.data = c;
    this.sendMessage(message);
  }

  public setMinY(c:MCandle){
    this.minY=c;
    let message:CandleCacheMessage= new CandleCacheMessage();
    message.action="minYChanged";
    message.data = c;
    this.sendMessage(message);
  }

  public insertCollection(cs:MCandle[]){
    cs.forEach((c)=>{
      //designate the max
      if (this.max==null){
        this.max=c;
      } else {
        if (c.high>this.max.high)
          this.setMaxY(c);

      }
      //designate the min
      if (this.min==null){
        this.min=c;
      } else {
        if (c.low<this.min.low)
          this.setMinY(c);
      }
      this.insert(c);
    });
    this.lastInsertCount = cs.length;


    let message:CandleCacheMessage= new CandleCacheMessage();
    message.action="newCollectionInserted";
    message.data = [this.minX, this.maxX, this.minY, this.maxY];
    this.sendMessage(message);
  }

  public readLastInserteds(){
    return this.readLast(this.lastInsertCount);
  }

}


@Injectable()
export class CandleCacheService {
  public cacheSize:number=500;
  public caches: KeyedCollection<CandleCache>;

  private subject = new Subject<any>();

  constructor(){
    this.caches = new KeyedCollection<CandleCache>();
  }

  public initCandlePlotCache(uuid:string){
    this.caches.add(uuid, new CandleCache(uuid,this.cacheSize, this.subject));
  }

  //
  //
  // sendMessage(message: any) {
  //   this.subject.next(message);
  // }
  //
  // clearMessage() {
  //   this.subject.next();
  // }
  //
  // getMessage(): Observable<any> {
  //   return this.subject.asObservable();
  // }







  public  getCacheSize(uuid:string) {
    return this.caches.item(uiid).cacheSize;
  }

  public  getCount(uuid:string) {
    return this.caches.item(uiid).count;
  }

  public clear(uuid:string) {
    this.caches.item(uiid).clear();
  }

  public isEmpty(uuid:string) {
    return this.caches.item(uiid).isEmpty();
  }

  public isFull(uuid:string):boolean {
    return this.caches.item(uiid).isFull()
  }


  public readLast(uuid:string,n?:number){
    return this.caches.item(uiid).readLast(n);

  }


  public setMaxY(uuid:string,c:MCandle){
    this.caches.item(uiid).setMaxY(c);
  }

  public setMinY(uuid:string,c:MCandle){
    this.caches.item(uiid).setMinY(c);
  }

  public insertCollection(uuid:string,cs:MCandle[]){
    this.caches.item(uiid).insertCollection(cs);

  }

  public readLastInserteds(uuid:string){
    this.caches.item(uiid).readLastInserteds();
  }


}
