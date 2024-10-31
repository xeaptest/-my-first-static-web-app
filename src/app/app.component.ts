import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <div>Hello {{ value }}</div>
    <div>
      <label for="username">Username:</label>
      <input id="username" [(ngModel)]="username" />
    </div>
    <div>
      <label for="password">Password:</label>
      <input id="password" [(ngModel)]="password" type="password" />
    </div>
    <button [disabled]="!username || !password" (click)="logIn()">Login</button>
    <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
  `,
  styles: [`
    .error {
      color: red;
      margin-top: 20px;
    }
  `]
})
export class AppComponent {
  value = 'World';
  errorMessage: string = '';
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  logIn() {
    const url = 'https://oneclickvouchertest.azurewebsites.net/functions-ext/api/v1/login';
    const body = { username: this.username, password: this.password };
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': 'Y6BvR0SyIvsCPF7R33RR3ffcPSVEf3nRv8XTQWAo2pHyAzFuz4POeQ==',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post(url, body, {headers}).subscribe(
      (response: any) => {
        this.value = response.data.token;
        this.errorMessage = '';
      },
      error => {
        this.errorMessage = `Error: ${error.message}`;
      }
    );
  }
}


