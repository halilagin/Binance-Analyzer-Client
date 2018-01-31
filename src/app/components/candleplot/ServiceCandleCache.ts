import {MCandle} from "../../model/bac.frontend";
import {Injectable} from "@angular/core";
import {CandleCacheMessage, MUiCandlePlotSvg} from "../../model/model";
import {Subject, Observable} from "rxjs";
import {KeyedCollection} from "../../model/collections";
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
  public extent:number[]=[0,0,0,0];//minx miny, maxx maxy
  public maxY:MCandle=null;
  public minY:MCandle=null;
  public minX:MCandle=null;
  public maxX:MCandle=null;

  public cacheSize:number=500;
  public uuid:string;
  public subject:Subject<any>;




  constructor(uuid:string, cacheSize:number, subject:Subject<any>){
    this.uuid = uuid;
    this.front=0;
    this.rear=0;
    this.count=0;
    this.cacheSize = cacheSize;
    this.subject = subject;
    for(let i=0;i<this.cacheSize;i++)
      this.candles.push(new MCandle());

  }


  public setMinX(val:number){
    this.extent[0]=val;
  }
  public setMinY(val:number){
    this.extent[1]=val;
    let message:CandleCacheMessage= new CandleCacheMessage();
    message.action="minYChanged";
    message.data = val;
    this.sendMessage(message);
  }

  public setMaxX(val:number){
    this.extent[2]=val;
  }
  public setMaxY(val:number){
    this.extent[3]=val;
    let message:CandleCacheMessage= new CandleCacheMessage();
    message.action="maxYChanged";
    message.data = val;
    this.sendMessage(message);
  }

  public getMinX(){
    return this.extent[0];
  }
  public getMinY(){
    return this.extent[1];
  }

  public getMaxX(){
    return this.extent[2];
  }
  public getMaxY(){
    return this.extent[3];
  }


  public setMaxCandleY(c:MCandle){
    this.maxY = c;
    this.setMaxY(c.high);

  }

  public setMinCandleY(c:MCandle){
    this.minY = c;
    this.setMinY(c.low);

  }

  public setMaxCandleX(c:MCandle){
    this.maxX = c;
    this.setMaxX(c.openTime);
  }

  public setMinCandleX(c:MCandle){
    this.minX = c;
    this.setMinX(c.openTime);

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
    this.count++;
    this.rear = (this.rear + 1) % this.cacheSize;
    this.candles[this.rear] = c;

  }

  public readLast(n?:number):MCandle[]{
    if (n===undefined)
      return [this.candles[this.rear]];
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




  public insertCollection(cs:MCandle[]){
    if (this.minY==null)
      this.setMinCandleY(cs[0]);
    if (this.maxY==null)
      this.setMaxCandleY(cs[0]);

    if (this.minX==null)
      this.setMinCandleX(cs[0]);
    if (this.maxX==null)
      this.setMaxCandleX(cs[0]);


    let lastCandle = cs[cs.length-1];

    cs.forEach((c)=>{
      //designate the max y
      if (this.maxY==null){
        this.setMaxCandleY(c);
      } else {
        if (c.high>this.maxY.high)
          this.setMaxCandleY(c);
      }
      //designate the min y
      if (this.minY==null){
        this.setMinCandleY(c);
      } else {
        if (c.low<this.minY.low)
          this.setMinCandleY(c);
      }


      //designate the max x
      if (this.maxX==null){
        this.setMaxCandleX(c);
      } else {
        if (c.openTime>this.maxX.openTime)
          this.setMaxCandleX(c);
      }
      //designate the min x
      if (this.minX==null){
        this.setMinCandleX(c);
      } else {
        if (c.openTime<this.minX.openTime)
          this.setMinCandleX(c);
      }


      this.insert(c);
    });
    this.lastInsertCount = cs.length;


    // let message:CandleCacheMessage= new CandleCacheMessage();
    // message.action="newCollectionInserted";
    // message.data = [this.minX, this.maxX, this.minY.low, this.maxY.high];
    // this.sendMessage(message);
  }

  public readLastInserteds():MCandle[]{
    return this.readLast(this.lastInsertCount);
  }

}


@Injectable()
export class ServiceCandleCache {
  public cacheSize:number=500;
  public caches: KeyedCollection<CandleCache>;

  private subject = new Subject<any>();

  constructor(){
    this.caches = new KeyedCollection<CandleCache>();
  }

  public initCandlePlotCache(uuid:string){
    this.caches.add(uuid, new CandleCache(uuid,this.cacheSize, this.subject));
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







  public  getCacheSize(uuid:string) {
    return this.caches.item(uuid).cacheSize;
  }

  public  getCount(uuid:string) {
    return this.caches.item(uuid).count;
  }

  public clear(uuid:string) {
    this.caches.item(uuid).clear();
  }

  public isEmpty(uuid:string) {
    return this.caches.item(uuid).isEmpty();
  }

  public isFull(uuid:string):boolean {
    return this.caches.item(uuid).isFull()
  }

  public extent(uuid:string) {
    return this.caches.item(uuid).extent;
  }


  public readLast(uuid:string,n?:number){
    return this.caches.item(uuid).readLast(n);

  }


  public setMaxY(uuid:string,c:MCandle){
    this.caches.item(uuid).setMaxY(c.high);
  }

  public setMinY(uuid:string,c:MCandle){
    this.caches.item(uuid).setMinY(c.low);
  }

  public insertCollection(uuid:string,cs:MCandle[], muiCandlePlotSvg:MUiCandlePlotSvg){
    this.caches.item(uuid).insertCollection(cs);

  }

  public readLastInserteds(uuid:string):MCandle[]{
    return this.caches.item(uuid).readLastInserteds();
  }


}
