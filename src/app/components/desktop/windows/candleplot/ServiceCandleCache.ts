import {MCandle} from "../../../../model/bac.frontend";
import {Injectable} from "@angular/core";
import {CandleCacheMessage, MUiCandlePlotWindow, MUiCandle, MCandleViewBox} from "../../../../model/model";
import {Subject, Observable} from "rxjs";
import {KeyedCollection} from "../../../../model/collections";
/**
 * Created by halil on 26/01/2018.
 */


// circular cache
// candles array is circular.
// see: http://www.sanfoundry.com/java-program-circular-buffer/




export class CandleCache{
  public candles:MCandle[]=[];
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

  public cacheViewBox:MCandleViewBox;
  public candleCountInViewBox:number;


  constructor(uuid:string, cacheSize:number, subject:Subject<any>, viewBoxWidth:number, candleWidth:number){
    this.uuid = uuid;
    this.count=0;
    this.cacheSize = cacheSize;
    this.subject = subject;
    this.cacheViewBox = new MCandleViewBox(viewBoxWidth,candleWidth);
    this.candleCountInViewBox = viewBoxWidth/candleWidth;
    for(let i=0;i<this.cacheSize;i++)
      this.candles.push(new MCandle());


  }


  public setMinX(val:number, fireEvent:boolean=false){
    this.extent[0]=val;
  }
  public setMinY(val:number, fireEvent:boolean=false){
    this.extent[1]=val;
    if (fireEvent) {
      let message:CandleCacheMessage= new CandleCacheMessage();
      message.action="scaleChanged";
      message.data = this.extent;
      this.sendMessage(message);
    }
  }

  public setMaxX(val:number, fireEvent:boolean=false){
    this.extent[2]=val;
  }
  public setMaxY(val:number, fireEvent:boolean=false){
    this.extent[3]=val;
    if (fireEvent) {
      let message:CandleCacheMessage= new CandleCacheMessage();
      message.action="scaleChanged";
      message.data = this.extent;
      this.sendMessage(message);
    }
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


  public setMaxCandleY(c:MCandle, fireEvent:boolean=false){
    this.maxY = c;
    this.setMaxY(c.high,fireEvent);

  }

  public setMinCandleY(c:MCandle, fireEvent:boolean=false){
    this.minY = c;
    this.setMinY(c.low,fireEvent);

  }

  public setMaxCandleX(c:MCandle, fireEvent:boolean=false){
    this.maxX = c;
    this.setMaxX(c.openTime,fireEvent);
  }

  public setMinCandleX(c:MCandle, fireEvent:boolean=false){
    this.minX = c;
    this.setMinX(c.openTime,fireEvent);

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
    this.candles.shift();
    this.candles.push(c);
  }

  public readLast(n?:number):MCandle[]{
    if (n===undefined)
      return [this.candles[this.cacheSize-1]];
    if (n===0)
      return [];

    let candles_:MCandle[] = [];
    for (let i=this.cacheSize-n; i< this.cacheSize; i++)
      candles_.push(this.candles[i]);
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


    let message:CandleCacheMessage= new CandleCacheMessage();
    message.action="scaleChanged";
    message.data = this.extent;
    this.sendMessage(message);


    // let message:CandleCacheMessage= new CandleCacheMessage();
    // message.action="newCollectionInserted";
    // message.data = [this.minX, this.maxX, this.minY.low, this.maxY.high];
    // this.sendMessage(message);
  }

  public readLastInserteds():MCandle[]{
    return this.readLast(this.lastInsertCount);
  }


  moveCacheViewBox(direction:number,candleCount:number){
    if (Number.isNaN(direction) || Number.isNaN(direction) || this.cacheViewBox.lastIndex==-1 || this.cacheViewBox.firstIndex==-1 ){
      this.cacheViewBox.lastIndex = this.cacheSize-1;
      this.cacheViewBox.firstIndex = this.cacheViewBox.lastIndex - Math.floor(this.cacheViewBox.viewBoxWidth / this.cacheViewBox.candleWidth);
        console.log("moveCacheViewBox nan case");
    } else {
      this.cacheViewBox.firstIndex += direction * candleCount;//direction 1 or -1
      this.cacheViewBox.lastIndex += direction * candleCount;//direction 1 or -1
    }
    console.log("moveCacheViewBox.direction & count:",direction,candleCount);

    console.log("moveCacheViewBox.indexes:",this.cacheViewBox.firstIndex,this.cacheViewBox.lastIndex, this.cacheViewBox.viewBoxWidth, this.cacheViewBox.candleWidth);

  }

  getCandle(idx):MCandle{
    return this.candles[idx];
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

  public initCandlePlotCache(uuid:string,   viewBoxWidth:number, candleWidth:number){
    this.caches.add(uuid, new CandleCache(uuid,this.cacheSize, this.subject, viewBoxWidth, candleWidth));
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

  public insertCollection(uuid:string,cs:MCandle[]){
    this.caches.item(uuid).insertCollection(cs);

  }

  public readLastInserteds(uuid:string):MCandle[]{
    return this.caches.item(uuid).readLastInserteds();
  }

  public moveCacheViewBox(uuid:string, direction:number, candleCount:number){
      let cache_ = this.caches.item(uuid);
      cache_.moveCacheViewBox(direction,candleCount);
  }

  public cacheViewBoxTimes(uuid:string){
    let cache_ = this.caches.item(uuid);
    let firstIndex = cache_.cacheViewBox.firstIndex;
    let lastIndex = cache_.cacheViewBox.lastIndex;
    console.log("cacheViewBoxTimes.indexes:",firstIndex,lastIndex);
    return [cache_.candles[firstIndex].openTime,cache_.candles[lastIndex].openTime];
  }

  public getCandle(uuid:string,idx:number):MCandle{
    return this.caches.item(uuid).getCandle(idx);
  }

}
