import { Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[appDarkenBg]'
})
export class DarkenBgDirective {

  @HostBinding('style.background-color') background: string;

  @HostListener('click') cambiaColore() {
    this.background = 'rgba(0, 0, 0, 0.5)'
  }

  @HostListener('mouseover') mostraBg() {
    this.background = '$primary-color-1'
  }
  @HostListener('mouseout') nascondiBg() {
    this.background = 'white'
  }

  constructor() { }

}
