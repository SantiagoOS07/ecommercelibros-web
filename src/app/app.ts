import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './componentes/header/header';
import { Footer } from './componentes/footer/footer';
import { Notificaciones } from './componentes/notificaciones/notificaciones';

@Component({
  imports: [RouterOutlet, Header, Footer, Notificaciones],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}