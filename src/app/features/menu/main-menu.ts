import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.html',
})
export class MainMenu {
  private readonly router = inject(Router);

  protected play(): void {
    void this.router.navigateByUrl('/play');
  }
}
