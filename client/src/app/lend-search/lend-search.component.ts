import { Component, OnInit } from '@angular/core';

import { DeedHubService } from '../deedhub.service';

@Component({
  selector: 'app-lend-search',
  templateUrl: './lend-search.component.html',
  styleUrls: ['./lend-search.component.css']
})
export class LendSearchComponent implements OnInit {

  traits: {[key: string]: string[]} = {};

  constructor(private deedHubService: DeedHubService) {
  }

  ngOnInit(): void {
    this.deedHubService.getCollectionMetadata().subscribe(collectionMetadata => {
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
