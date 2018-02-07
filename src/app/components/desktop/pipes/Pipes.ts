/**
 * Created by halil on 07/02/2018.
 */
import {Pipe, PipeTransform} from '@angular/core';



@Pipe({name: 'Currency8DigitPipe'})
export class Currency8DigitPipe implements PipeTransform {
  transform(value: number): number {
    return Math.round (value * 10000000)/100000000;
  }
}
