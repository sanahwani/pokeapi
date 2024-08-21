import { LightningElement, api, wire, track } from 'lwc';
import getTaskProgress from '@salesforce/apex/PartTaskProgressController.getTaskProgress';

export default class PartTaskProgress extends LightningElement {
    @api recordId;
    @track task = {};

    @wire(getTaskProgress, { taskId: '$recordId' })
    wiredTask({ error, data }) {
        if (data) {
            const task = data;
            if (task) {
                const percentage = task.Progress_percentage__c || 0;

                this.task = {
                    ...task,
                    progressStyle: `background: conic-gradient(lightblue ${percentage}%, lightgray ${percentage}%);`,
                    percentage: Math.round(percentage)
                };
            }
        } else if (error) {
            console.error('Error retrieving task progress:', error);
        }
    }
}
