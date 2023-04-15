import { Component, OnInit } from '@angular/core';

import { DeedHubService } from '../deedhub.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lend-search',
  templateUrl: './lend-search.component.html',
  styleUrls: ['./lend-search.component.css']
})
export class LendSearchComponent implements OnInit {

  traits: {[key: string]: string[]} = {};

  constructor(private deedHubService: DeedHubService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const slug: string | null = this.route.snapshot.paramMap.get('slug');
    console.log(slug);
    if (slug) {
      this.deedHubService.getCollectionMetadataBySlug(slug).subscribe(collectionMetadata => {
        this.traits = {};
        for (let trait in collectionMetadata.traits) {
          this.traits[trait] = [];
          for (let traitValue in collectionMetadata.traits[trait]) {
            this.traits[trait].push(traitValue);
          }
        }
      });
    }
  }

}
