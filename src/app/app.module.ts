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
import {
  UiPlotDesktop
} from "./components/desktop/UiPlotDesktop";

import {
  UiCandlePlotWindow
} from "./components/desktop/windows/candleplot/UiCandlePlotWindow";

import {
  UiCandle
} from "./components/desktop/windows/candleplot/UiCandle";

import {TradeFlow} from "./components/tradeflow/TradeFlow";
import {BasWebSocketService} from "./services/BasWebSocketService";
import {BacLocalService} from "./services/BacLocalService";
import {ServerInitProgressBar} from "./dialogs/ServerInitProgressBar";
import {ServerInitProgressBarService} from "./services/ServerInitProgressBarService";
import {WebSocketCandleReaderService} from "./services/WebSocketCandleReaderService";
import {ServiceCandleCache} from "./components/desktop/windows/candleplot/ServiceCandleCache";
import {ServiceCandlePlotScale} from "./components/desktop/windows/candleplot/ServiceCandlePlotScale";
import {UiCandlePlotStreamingFrame} from "./components/desktop/windows/candleplot/UiCandlePlotStreamingFrame";
import {UiPriceAxis} from "./components/desktop/fragments/UiPriceAxis";
import {Currency8DigitPipe} from "./components/desktop/pipes/Pipes";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VarNav,
    TradeFlow,
    UiCandle,
    UiPlotDesktop,
    UiCandlePlotWindow,
    UiCandlePlotStreamingFrame,
    UiPriceAxis,
    ServerInitProgressBar,
    Currency8DigitPipe
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
  entryComponents:[UiCandle],
  providers: [
    ElectronService,
    BasWebSocketService,
    BacLocalService,
    ServerInitProgressBarService,
    WebSocketCandleReaderService,
    ServiceCandleCache,
    ServiceCandlePlotScale
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
