import {Component, Input,ContentChildren, QueryList,ElementRef, Renderer} from "@angular/core";


@Component({
  selector: '[VarNavDropItem]',
  template: `
     <ng-content></ng-content>
  `
})
export class VarNavDropItem {
  @Input() link;
  @Input() title;

  constructor(public el: ElementRef, public renderer: Renderer) {
    //renderer.setElementClass(this.el.nativeElement,"dropdown", true);
    //this.innerHTML = this.el.nativeElement.innerHTML;
  }

}



@Component({
  selector: '[VarNavDrop]',

  template: `
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{title}} <span class="caret"></span></a>
                <ul class="dropdown-menu">
                  <li><ng-content select="a[VarNavDropItem]"></ng-content></li>
                </ul>
         
  `
})
export class VarNavDrop {
  @Input() title;
  @ContentChildren(VarNavDropItem) items2: QueryList<VarNavDropItem>;

  constructor(public el: ElementRef, public renderer: Renderer) {
    renderer.setElementClass(this.el.nativeElement,"dropdown", true);
  }

  ngAfterContentInit(){

  }
}



@Component({
  selector: 'VarNavItem',

  template: `
  
              <ng-content></ng-content>
  `
})
export class VarNavItem {
  @Input() link;
  @Input() title;


}



@Component({
  selector: 'VarNav',

  template: `




	<nav class="navbar navbar-default">
  		<div class="container-fluid">
			  <div class="collapse navbar-collapse" >
      			<ul class="nav navbar-nav">
              <li *ngFor = "let item of items.toArray(); let i=index;">
                <a  href="{{item.link}}">{{item.title}} <span *ngIf="i==0" class="sr-only">(current)</span></a>
              </li>
              
              <ng-content select="li[VarNavDrop]"></ng-content> 
              

       			<li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
          <ul class="dropdown-menu">
            <li><a href="#">Action</a></li>
            <li><a href="#">Another action</a></li>
            <li><a href="#">Something else here</a></li>
            <li role="separator" class="divider"></li>
            <li><a href="#">Separated link</a></li>
            <li role="separator" class="divider"></li>
            <li><a href="#">One more separated link</a></li>
          </ul>
        </li>
             </ul>
      	</div>
      </div>
    </nav>
  `
})
export class VarNav {
  @ContentChildren(VarNavItem) items: QueryList<VarNavItem>;
  //@ContentChildren(VarNavDrop) drops: QueryList<VarNavDrop>;

}






