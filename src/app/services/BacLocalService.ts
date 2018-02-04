import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import {RequestOptions, Http, Headers } from "@angular/http";
import {BacClientState} from "../model/bac.frontend";
import {Subject} from "rxjs";


@Injectable()
export class BacLocalService {
  private subject = new Subject<any>();

  clientState:BacClientState = new BacClientState();
  constructor() {
    let existingClientState:any = localStorage.getItem("clientState");
    // ebysConsole.info("ecs:"+ existingClientState);
    if (existingClientState==undefined || existingClientState=='undefined') {//create new and store
      this.save(new BacClientState());
      //ebysConsole.info("undefined cs:"+existingClientState);
    }
    else {//get existing
      // let ecs_:string = JSON.parse(existingClientState)._body;
      let ecs = JSON.parse(existingClientState);
      this.save(ecs);
    }
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


  getClientState():BacClientState{
    if (this.clientState==undefined) {
      let newState_ = new BacClientState();
      this.save(newState_);
      return newState_;
    }
    return this.clientState;
  }

  setClientState(newState:BacClientState){
    this.save(newState);
  }

  save(newState:BacClientState){
    this.clientState = newState;
    localStorage.removeItem("clientState");

    localStorage.setItem("clientState",JSON.stringify(newState));

  }

  clientIdReceived(newState:BacClientState){
    this.save(newState);
    if (this.clientState.bacClientId!==null){
      this.sendMessage({"clientId":this.clientState.bacClientId,"action":"clientIdRegistered"});
    }
  }

  clearClientState(){
    console.log("client state is cleared.");
    localStorage.removeItem("clientState");
  }

  doLogout(){
    //this.save(new MEbysClientStorage());
  }

  doLoggedIn(dataString:any){

    // let jwt =  new JwtHelper();
    // dataString = JSON.parse(JSON.stringify(dataString))._body;
    // let data = JSON.parse(dataString);
    //
    // //token,refreshToken
    // this.getClientState().isLoggedIn = true;
    // this.getClientState().tokens.raw = data;
    // this.getClientState().tokens.token = <MJwtPayload> jwt.decodeToken(data.token);
    // this.getClientState().tokens.refreshToken = <MJwtPayload> jwt.decodeToken(data.refreshToken);
    //
    // this.save(this.getClientState());
    // ebysConsole.info(this.getClientState());

    // ebysConsole.info(this.getClientState().tokens.token);
  }

  // getSecureHeader(){
  //   return  new RequestOptions({
  //     headers: new Headers(
  //       {
  //         "Content-Type": "application/json",
  //         "X-Authorization": "Bearer " + this.getClientState().tokens.raw.token
  //       }
  //     ) });
  // }
  //
  // getRequestHeader(){
  //   let header =null;
  //   if (this.getClientState().isLoggedIn)
  //     header =this.getSecureHeader();
  //   else
  //     header = EbysDefaultHeader;
  //   return header;
  // }

  // getUsername(){
  //   return this.clientState.tokens.token.sub.split('_')[0];
  // }
  //
  // getUserOrgId(){
  //   return this.clientState.tokens.token.sub.split('_')[1];
  // }
  //
  // getUserFullname(){
  //   return this.clientState.tokens.token.sub.split('_')[2];
  // }
}
