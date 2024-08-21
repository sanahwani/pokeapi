public with sharing class ProjectProgressController {
    @AuraEnabled(cacheable=true)
    public static List<Project__c> getProjectProgress() {
        return [
            SELECT Id, Name, Completed_Tasks__c, Total_Tasks__c , 	Progress_percentage__c, 	Status__c
            FROM Project__c
            WHERE Completed_Tasks__c != NULL AND Total_Tasks__c != NULL
        ];
    }
}
