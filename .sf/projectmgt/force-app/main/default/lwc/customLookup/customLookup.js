import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/ParticularProj.searchRecords';

export default class CustomLookup extends LightningElement {
    @api objectApiName;
    @track results = [];
    searchKey = '';

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        if (this.searchKey.length > 1) {
            searchRecords({ searchKey: this.searchKey, objectApiName: this.objectApiName })
                .then(result => {
                    this.results = result;
                })
                .catch(error => {
                    console.error('Error fetching records', error);
                });
        } else {
            this.results = [];
        }
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selectedName = event.target.innerText;
        const selectEvent = new CustomEvent('lookupselect', {
            detail: { id: selectedId, name: selectedName }
        });
        this.dispatchEvent(selectEvent);
    }
}
