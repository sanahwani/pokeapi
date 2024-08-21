import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProjectsWithTasks from '@salesforce/apex/ProjectController.getProjectsWithTasks';

export default class ProjTreeGrid extends NavigationMixin(LightningElement) {
    @track gridData = [];
    @track error;

    @wire(getProjectsWithTasks)
    wiredProjectsWithTasks(result) {
        this.wiredResult = result;
        if (result.data) {
            try {
                this.formatGridData(result.data);
            } catch (e) {
                console.error('Error formatting grid data: ', e);
                this.error = e;
            }
        } else if (result.error) {
            console.error('Error fetching projects with tasks: ', result.error);
            this.error = result.error;
        }
    }

    gridColumns = [
        {
            label: 'Task/Project Name',
            fieldName: 'recordUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_self'
            },
            cellAttributes: { alignment: 'center' }
        },
        {
            label: 'Start Date',
            fieldName: 'Start_Date__c',
            type: 'date',
            cellAttributes: { alignment: 'center' }
        },
        {
            label: 'End Date',
            fieldName: 'End_Date__c',
            type: 'date',
            cellAttributes: { alignment: 'center' }
        },
        {
            label: 'Progress',
            fieldName: 'Progress_Percentage__c',
            type: 'text',
            cellAttributes: { alignment: 'center' }
        },
        {
            label: 'Completed Tasks',
            fieldName: 'Completed_Tasks__c',
            type: 'number',
            cellAttributes: { alignment: 'center' }
        },
        {
            label: 'Total Tasks',
            fieldName: 'Total_Tasks__c',
            type: 'number',
            cellAttributes: { alignment: 'center' }
        },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            cellAttributes: { alignment: 'center' }
        },
        {
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions },
        }
    ];

    formatGridData(result) {
        this.gridData = result.map(project => {
            const tasks = project._children.map(task => ({
                ...task,
                recordUrl: `/lightning/r/Task__c/${task.Id}/view`,
                objectApiName: 'Task__c',
                _children: task._children || []
            }));

            const progressPercentage = project.Progress_Percentage__c;

            let rowClass = '';
            if (project.Status__c === 'Delayed/Overdue') {
                rowClass = 'red-row';
            }

            return {
                ...project,
                recordUrl: `/lightning/r/Project__c/${project.Id}/view`,
                objectApiName: 'Project__c',
                _children: tasks,
                Status__c: project.Status__c,
                Progress_Percentage__c: progressPercentage,
                rowClass: rowClass
            };
        });
    }

    getRowActions(row, doneCallback) {
        const actions = [];
        actions.push({
            label: 'Edit',
            name: 'edit'
        });
        doneCallback(actions);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        console.log('Row action triggered:', actionName, 'on row:', row);

        switch (actionName) {
            case 'edit':
                this.editRecord(row);
                break;
            default:
                break;
        }
    }

    editRecord(row) {
        const recordId = row.Id;
        const objectApiName = row.objectApiName;

        console.log('Navigating to edit record:', recordId, 'of object:', objectApiName);

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: objectApiName,
                actionName: 'edit'
            }
        });
    }

    getRowAttributes(row) {
        return {
            class: row.rowClass || ''
        };
    }
}
