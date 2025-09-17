import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';
import { CocktailRecipe } from '../models/cocktailRecipe.model';
import { Bottles } from '../models/bottles.model';

const API_URL = 'http://192.168.199.35:8000'; // Passe die URL an deinen Backend-Server an

export interface CocktailIngredient {
  name: string;
  amountLiter: number;
}

export interface Cocktail {
  name: string;
  ingredients: CocktailIngredient[];
}

// export interface CocktailRecipe {
//   index: string;
//   name: string;
//   bottles: {
//     name: string;
//     index: string;
//     ratio: number;
//   }[];
// }


export interface MixResponse {
  success: boolean;
  msg?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  constructor(private http: HttpClient) { }

  mixCocktail(cocktail: Cocktail): Observable<MixResponse> {
    return this.http.post<MixResponse>(`${API_URL}/mix`, cocktail).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Mixen des Cocktails:', error);
        return of({ success: false, msg: 'Internal error' });
      })
    );
  }

  getBottles(): Observable<Bottles[]> {
    return this.http.get<Partial<Bottles>[]>(`${API_URL}/bottles`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Abrufen der Flaschenliste:', error);
        return of([]);
      }),
      map((data) => data.map((item) => new Bottles(item)))
    );
  }

  setBottle(bottle: Bottles): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${API_URL}/bottles`, bottle).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Hinzufügen der Flasche:', error);
        return of({ success: false, message: 'Flasche konnte nicht hinzugefügt werden' });
      })
    );
  }

  getPumpConfiguration(): Observable<{ [pumpId: string]: string }> {
    return this.http.get<{ [pumpId: string]: string }>(`${API_URL}/config`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Abrufen der Pumpen-Konfiguration:', error);
        return of({});
      })
    );
  }

  setPumpConfiguration(mapping: { [pumpId: string]: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${API_URL}/config/set-all`, mapping).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Senden der Pumpen-Konfiguration:', error);
        return of({ success: false, message: 'Konfiguration konnte nicht übertragen werden' });
      })
    );
  }

  getCocktailRecipes(): Observable<CocktailRecipe[]> {
    return this.http.get<CocktailRecipe[]>(`${API_URL}/cocktail_recipe`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Abrufen der Cocktail-Rezepte:', error);
        return of([]);
      })
    );
  }

  setCocktailRecipe(recipe: CocktailRecipe): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${API_URL}/cocktail_recipe`, recipe).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Speichern des Cocktail-Rezepts:', error);
        return of({ success: false, message: 'Speichern fehlgeschlagen' });
      })
    );
  }

  updateCocktailRecipe(recipe: CocktailRecipe): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${API_URL}/cocktail_recipe/${recipe.index}`, recipe).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Aktualisieren des Cocktail-Rezepts:', error);
        return of({ success: false, message: 'Aktualisierung fehlgeschlagen' });
      })
    );
  }

  deleteCocktailRecipe(recipeIndex: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/cocktail_recipe/${recipeIndex}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Fehler beim Löschen des Cocktail-Rezepts:', error);
        return of({ message: 'Löschen fehlgeschlagen' });
      })
    );
  }


}