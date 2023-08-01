import { Component, Input } from '@angular/core';
import { COLORS, Colors } from '@models/colors.model';

@Component({
  selector: 'app-card-color',
  templateUrl: './card-color.component.html'
})
export class CardColorComponent {
  @Input () color: Colors = 'sky'

  mapColors = COLORS

  get colors(){
    const classes = this.mapColors[this.color]
    return classes ? classes : {}
  }
}


