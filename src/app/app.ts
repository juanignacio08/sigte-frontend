import { Component, signal } from '@angular/core';
import { ToastModule } from '@openng/optimus-ui/toast';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('sigte-frontend');
}
