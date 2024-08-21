import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Project__c.Name',
    'Project__c.Completed_Tasks__c',
    'Project__c.Total_Tasks__c'
];

export default class ProjectProgress extends LightningElement {
    @api recordId;
    @track project;
    @track error;
    @track noData = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    loadProjectData({ error, data }) {
        if (data) {
            const completed = data.fields.Completed_Tasks__c.value || 0;
            const total = data.fields.Total_Tasks__c.value || 1; // Avoid division by zero
            const percentage = (completed / total) * 100;

            this.project = {
                Name: data.fields.Name.value,
                Completed_Tasks__c: completed,
                Total_Tasks__c: total,
                progressStyle: `background: conic-gradient(lightblue ${percentage}%, lightgray ${percentage}%);`,
                percentage: Math.round(percentage)
            };
            this.error = undefined;
            this.noData = false;
        } else if (error) {
            this.error = error;
            this.project = null;
            this.noData = false;
        } else {
            this.project = null;
            this.noData = true;
        }
    }
}
