import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { installHarness } from './core/testing/harness-loader';
import { ThemeService } from './theme.service';

@Component({
  imports: [MatButton, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly theme = inject(ThemeService);

  constructor() {
    installHarness();
  }
}
