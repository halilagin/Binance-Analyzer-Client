import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import {VarNav} from "./components/varnav/VarNav";
import {CandlePlot, Candle, CandlePlotG, CandlePlotSvg} from "./components/candleplot/CandlePlot";
import {TradeFlow} from "./components/tradeflow/TradeFlow";
import {BasWebSocketService} from "./services/BasWebSocketService";
import {BacLocalService} from "./services/BacLocalService";
import {ServerInitProgressBar} from "./dialogs/ServerInitProgressBar";
import {ServerInitProgressBarService} from "./services/ServerInitProgressBarService";
import {WebSocketCandleReaderService} from "./services/WebSocketCandleReaderService";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VarNav,
    CandlePlot,
    TradeFlow,
    Candle,
    CandlePlotG,
    CandlePlot,
    CandlePlotSvg,
    ServerInitProgressBar
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  entryComponents:[Candle],
  providers: [ElectronService, BasWebSocketService, BacLocalService, ServerInitProgressBarService, WebSocketCandleReaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
