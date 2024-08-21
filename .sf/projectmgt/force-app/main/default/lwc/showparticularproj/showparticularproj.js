import { LightningElement, api, wire, track } from 'lwc';
import getProjectWithTasks from '@salesforce/apex/ParticularProj.getProjectWithTasks';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
export default class ShowParticularProj extends NavigationMixin(LightningElement) {
    @api recordId;
    @track gridData = [];

    @wire(getProjectWithTasks, { projectId: '$recordId' })
    projectWithTasksResult({ data, error }) {
        if (data) {
            console.log('Data received:', JSON.stringify(data)); // Log the raw data
            this.formatGridData(data);
        } else if (error) {
            console.error('Error received:', error);
        }
    }

    gridColumns = [
        {
            label: 'Project/Task Name',
            fieldName: 'recordUrl',
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
            label: 'Progress',
            fieldName: 'Progress_Percentage__c',
            type: 'number',
            typeAttributes: {
                step: '0.01'
            },
            cellAttributes: {
                class: { fieldName: 'progressCellClass' }
            }
        },
        {
            label: 'Completed Tasks',
            fieldName: 'Completed_Tasks__c',
            type: 'number'
        },
        {
            label: 'Total Tasks',
            fieldName: 'Total_Tasks__c',
            type: 'number'
        },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
        },
        {
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions }
        }
    ];

    formatGridData(project) {
        console.log('Formatting project data:', JSON.stringify(project)); // Log the project data
    
        const formatTasks = (tasks) => {
            return tasks.map(task => {
                let formattedTask = {
                    Id: task.Id,
                    Name: task.Name,
                    recordUrl: `/lightning/r/Task__c/${task.Id}/view`,
                    Start_Date__c: task.Start_Date__c,
                    End_Date__c: task.End_Date__c,
                    Task_Status__c: task.Task_Status__c,
                    Progress_Percentage__c: this.roundPercentage(task.Progress_Percentage__c),
                    progressCellClass: 'slds-text-align_center',
                    recordType: 'Task__c',
                    _children: task._children ? formatTasks(task._children) : []
                };
    
                return formattedTask;
            });
        };
    
        this.gridData = [{
            Id: project.Id,
            Name: project.Name,
            recordUrl: `/lightning/r/Project__c/${project.Id}/view`,
            Start_Date__c: project.Start_Date__c,
            End_Date__c: project.End_Date__c,
            Total_Tasks__c: project.Total_Tasks__c,
            Completed_Tasks__c: project.Completed_Tasks__c,
            Status__c: project.Status__c,  
            Progress_Percentage__c: this.roundPercentage(project.Progress_Percentage__c),
            progressCellClass: 'slds-text-align_center',
            statusClass: project.Status__c === 'Delayed/Overdue' ? 'red-background' : '',
            _children: formatTasks(project._children)
        }];
    
        console.log('Grid data:', JSON.stringify(this.gridData)); // Log the formatted grid data
    }
    
    roundPercentage(value) {
        return Math.round(value * 100) / 100;
    }

    getRowActions(row, doneCallback) {
        const actions = [
            { label: 'Edit', name: 'edit' },
            { label: 'Add Task', name: 'addTask' },
            { label: 'Assign Task', name: 'assignTask' } // New action
        ];
        doneCallback(actions);
    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
    
        if (actionName === 'edit') {
            this.editRecord(row);
        } else if (actionName === 'addTask') {
            this.addTask(row);
        } else if (actionName === 'assignTask') { // New action handler
            this.assignTask(row);
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
        const objectApiName = row.recordType;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: objectApiName,
                actionName: 'edit'
            }
        });
    }
    addTask(row) {
        let queryParams = `Project__c=${this.recordId}`;
        if (row.recordType === 'Task__c') {
            queryParams += `,Parent_Task__c=${row.Id}`;
        }
    
        // Encode the default field values
        const encodedValues = encodeDefaultFieldValues({
            Project__c: this.recordId,
            Parent_Task__c: row.recordType === 'Task__c' ? row.Id : undefined
        });
    
        // Generate the URL for the new task creation page
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Task__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: encodedValues
            }
        }).then(url => {
            // Open the generated URL in a new tab
            window.open(url, '_blank');
        }).catch(error => {
            console.error('Error generating URL:', error);
        });
    }
    
    
}
