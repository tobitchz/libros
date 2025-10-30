import { Component } from '@angular/core';
import { Proveedor } from '../proveedor';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {

  fotoURL : string | null = null

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
}
