import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <div>Hello {{ value }}</div>
    <button (click)="changeValue()">Change Value</button>
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

  constructor(private http: HttpClient) {}

  changeValue() {
    const url = 'https://oneclickvouchertest.azurewebsites.net/functions-ext/api/v1/login';
    const body = { username: 'user', password: 'pass' };
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': 'Y6BvR0SyIvsCPF7R33RR3ffcPSVEf3nRv8XTQWAo2pHyAzFuz4POeQ==',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post(url, body).subscribe(
      response => {
        this.value = 'abcdef';
        this.errorMessage = '';
      },
      error => {
        this.errorMessage = `Error: ${error.message}`;
      }
    );
  }
}
