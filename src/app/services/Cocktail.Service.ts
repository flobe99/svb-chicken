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
}