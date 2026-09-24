import { Component, Input } from '@angular/core';
@Component({
  imports: [],
  selector: 'app-title-subtitle',
  styleUrl: './title-subtitle.component.css',
  templateUrl: './title-subtitle.component.html',
})
export class TitleSubtitleComponent {
  @Input() title ?: string;
  @Input() subtitle ?: string;
  @Input() icon : string = 'pi-folder';
}
