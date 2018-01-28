

export enum EnumBacServerInitializationState{
  NOTRELEVANT=1,
  STARTED=2,
  INPROGRESS=3,
  FINISHED=4
}

export const BacServerInitializationState: typeof EnumBacServerInitializationState = EnumBacServerInitializationState;



export class BacClientState{
  isLoggedIn:boolean=false;
  bacClientId:string=null;
  bacClientIndex:number=-1;
  bacServerInitializationState:EnumBacServerInitializationState=EnumBacServerInitializationState.NOTRELEVANT;
}


export class MCandle{
  assetVolume:number;
  close:number;
  closeTime:number;
  dummy:number;
  high:number;
  low:number;
  middle:number;
  open:number;
  openTime:number;
  symbol:string;
  takerBaseVolume:number;
  takerQuoteVolume:number;
  timeInterval:number;
  tradeCount:number;
  volume:number;
}
