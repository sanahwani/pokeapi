import { LightningElement, api, wire, track } from 'lwc';
import getTaskWithChildren from '@salesforce/apex/ParticularTask.getTaskWithChildren';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

export default class Showparticulartask extends NavigationMixin(LightningElement) {
    @api recordId; // Holds the ID of the selected task
    @track gridData = []; // Use @track to ensure reactivity
    wiredResult;

    @wire(getTaskWithChildren, { taskId: '$recordId' })
    wiredTaskWithChildren(result) {
        this.wiredResult = result;
        if (result.data) {
            this.formatGridData(result.data);
        } else if (result.error) {
            console.error(result.error);
        }
    }

    // Define the columns for the tree grid
    gridColumns = [
        {
            label: 'Name',
            fieldName: 'recordUrl', // Field name for the URL
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_self'
            }
        },
        {
            label: 'Start Date',
            fieldName: 'Start_Date__c',
            type: 'date'
        },
        {
            label: 'End Date',
            fieldName: 'End_Date__c',
            type: 'date'
        },
        {
            label: 'Status',
            fieldName: 'Task_Status__c',
            type: 'text'
        },
        {
            label: 'Assigned to',
            fieldName: 'Assigned_to__c', // Field name should be `Assigned_to__c`
            type: 'text'
        },
        {
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions }
        }
    ];

    formatGridData(result) {
        this.gridData = this.transformToTreeData(result);
    }

    transformToTreeData(data) {
        const transform = (node) => {
            const { Id, Name, Start_Date__c, End_Date__c, Task_Status__c, Assigned_to__c } = node;
            return {
                Id,
                Name,
                Start_Date__c,
                End_Date__c,
                Task_Status__c,
                Assigned_to__c: Assigned_to__c ? Assigned_to__c : 'Not Assigned', // Handle null values
                recordUrl: `/lightning/r/Task__c/${Id}/view`,
                _children: (Array.isArray(node._children) ? node._children.map(transform) : [])
            };
        };
    
        return [transform(data)];
    }

    @api
    refreshData() {
        return refreshApex(this.wiredResult);
    }

    handleRefresh() {
        this.refreshData();
    }

    navigateToRecordPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Task__c', // Adjust if using a custom object API name
                actionName: 'view'
            }
        });
    }

    getRowActions(row, doneCallback) {
        const actions = [
            { label: 'Edit', name: 'edit' },
            { label: 'Add Task', name: 'add_task' }, // Add Task action
            { label: 'Assign Task', name: 'assignTask' } // New action
        ];
        doneCallback(actions);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'edit':
                this.editRecord(row);
                break;
            case 'add_task': // Handle the add task action
                this.addTask(row);
                break;
            case 'assignTask': // New action handler
                this.assignTask(row);
                break;
            default:
                break;
        }
    }
    assignTask(row) {
        // Encode the default field values to prepopulate the Task__c field in Task_Assignment__c
        const encodedValues = encodeDefaultFieldValues({
            Task__c: row.Id // Automatically populate the Task__c field with the current task ID
        });
    
        // Generate the URL for the new Task_Assignment__c creation page
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Task_Assignment__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: encodedValues
            }
        }).then(url => {
            // Open the generated URL in a new tab
            window.open(url, '_blank');
        }).catch(error => {
            console.error('Error generating URL for Task Assignment:', error);
        });
    }

    editRecord(row) {
        const recordId = row.Id;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Task__c', // Adjust if using a custom object API name
                actionName: 'edit'
            }
        });
    }

    addTask(row) {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Task__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: `Parent_Task__c=${row.Id}`
            }
        });
    }
}
