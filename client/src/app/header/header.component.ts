import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { DeedHubService } from '../deedhub.service';

import { CollectionMetadata } from '../entity';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  slugs2CollectionMetadata: {[key: string]: CollectionMetadata} = {};
  collectionGroup: FormGroup;
  collectionsAutoOptions?: Observable<string[]>;

  constructor(private deedHubService: DeedHubService,
              private formBuilder: FormBuilder,
              private router: Router) {
    this.collectionGroup =  new FormGroup({});
  }

  ngOnInit(): void {
    this.collectionGroup = this.formBuilder.group({
      collectionSlug: [undefined],
    });

    this.deedHubService.getAllCollectionMetadata().subscribe(collections => {
      //console.log(collections);
      this.slugs2CollectionMetadata = {};
      for (let collection of collections) {
        if (collection) {
          this.slugs2CollectionMetadata[collection.slug] = collection;
        }
      }

      // add autocomplete options for collections after collections are loaded
      this.collectionsAutoOptions = this.collectionGroup.controls['collectionSlug'].valueChanges.pipe(
        startWith(''),
        map(input => Object.keys(this.slugs2CollectionMetadata).filter(slug => slug.toLowerCase().includes(input.toLowerCase()))),
      );
    });
  }

  selectSlug(slug: string) {
    //console.log(slug);
    this.router.navigateByUrl(`/lend/${slug}`).then(() => {
      window.location.reload();
    });
  }
}
