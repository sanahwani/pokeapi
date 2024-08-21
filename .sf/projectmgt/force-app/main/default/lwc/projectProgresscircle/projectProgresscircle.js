import { LightningElement, wire, track } from 'lwc';
import getProjectProgress from '@salesforce/apex/ProjectProgressController.getProjectProgress';

export default class ProjectProgressCircle extends LightningElement {
    @track projects = [];
    @track currentPageProjects = [];
    currentPage = 1;
    pageSize = 8; // Maximum number of projects per page

    @wire(getProjectProgress)
    wiredProjects({ error, data }) {
        if (data) {
            const allProjects = data
                .filter(project => {
                    return project.Completed_Tasks__c != null && project.Total_Tasks__c != null && project.Total_Tasks__c > 0;
                })
                .map(project => {
                    const completed = project.Completed_Tasks__c;
                    const total = project.Total_Tasks__c;
                    const percentage = (completed / total) * 100;

                    // Determine the styles and alert flag based on project status
                    const isDelayed = project.Status__c === 'Delayed/Overdue';
                    const progressStyle = `background: conic-gradient(${isDelayed ? 'red' : 'green'} ${percentage}%, lightgray ${percentage}%);`;
                    const percentageClass = isDelayed ? 'delayed-percentage' : 'normal-percentage';

                    return {
                        ...project,
                        progressStyle,
                        percentageClass,
                        percentage: Math.round(percentage),
                        isDelayed // Flag to show alert if the project is delayed
                    };
                });

            this.projects = allProjects;
            this.updateCurrentPageProjects();
        } else if (error) {
            console.error('Error retrieving project progress:', error);
        }
    }

    updateCurrentPageProjects() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = this.currentPage * this.pageSize;
        this.currentPageProjects = this.projects.slice(startIndex, endIndex);
    }

    handleNextPage() {
        if (this.currentPage * this.pageSize < this.projects.length) {
            this.currentPage += 1;
            this.updateCurrentPageProjects();
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updateCurrentPageProjects();
        }
    }

    get isNextDisabled() {
        return this.currentPage * this.pageSize >= this.projects.length;
    }

    get isPreviousDisabled() {
        return this.currentPage === 1;
    }
}
