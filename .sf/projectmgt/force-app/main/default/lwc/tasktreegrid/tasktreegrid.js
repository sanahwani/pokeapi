import { LightningElement, wire, track } from 'lwc';
import getTasksWithHierarchy from '@salesforce/apex/TaskController.getTasksWithHierarchy';
import { NavigationMixin } from 'lightning/navigation';

export default class TaskTreeGrid extends NavigationMixin(LightningElement) {
    @track gridData = [];
    wiredResult;

    @wire(getTasksWithHierarchy)
    wiredTasksWithHierarchy(result) {
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
            label: 'Task Name',
            fieldName: 'recordUrl', // Field name for the URL
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_self'
            }
        },
        {
            label: 'Task Status',
            fieldName: 'Task_Status__c',
            type: 'text'
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
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions }
        }
    ];

    getRowActions(row, doneCallback) {
        const actions = [
            { label: 'Edit', name: 'edit' },
            { label: 'Add Task', name: 'add_task' }
        ];
        doneCallback(actions);
    }
    

    // Handle row action
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Task__c',
                        actionName: 'edit'
                    }
                });
                break;
            case 'add_task':
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
                break;
            default:
                break;
        }
    }

    // Method to format the data into a hierarchical structure
    formatGridData(tasks) {
        console.log('Tasks from Apex:', tasks); // Add this line
        const taskMap = new Map();
    
        // Create a map of tasks by Id
        tasks.forEach(task => {
            taskMap.set(task.Id, {
                ...task,
                recordUrl: `/lightning/r/Task__c/${task.Id}/view`, // Generate the URL
                _children: []
            });
        });
    
        // Build the hierarchical data structure
        tasks.forEach(task => {
            if (task.Parent_Task__c) {
                const parentTask = taskMap.get(task.Parent_Task__c);
                if (parentTask) {
                    parentTask._children.push(taskMap.get(task.Id));
                }
            }
        });
    
        // Recursively build the hierarchy, starting from tasks without a parent
        this.gridData = [...taskMap.values()].filter(task => !task.Parent_Task__c);
        console.log('Formatted Grid Data:', this.gridData); // Add this line
    }
    
}
