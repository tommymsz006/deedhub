import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { CollectionMetadata } from './entity';

@Injectable({
  providedIn: 'root'
})
export class DeedHubService {

  constructor(private http: HttpClient) { }

  public getCollectionMetadata(): Observable<CollectionMetadata> {
    //console.log(`${environment.tesseractServiceUrl}/api/v3/list/models`);
    return this.http.get<CollectionMetadata>(`${environment.deedHubServiceUrl}/api/collection`,
      {}).pipe(
        catchError(DeedHubService.handleError<CollectionMetadata>('getCollectionMetadata'))
      );
  }

  private static handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);    // log to console instead
      return of(result as T);  // let the app keep running with the result
    };
  }
}
