public with sharing class TaskController {

    @AuraEnabled(cacheable=true)
    public static List<Task__c> getTasksWithHierarchy() {
        return [
            SELECT Id, Name, Parent_Task__c, Parent_Task__r.Name, 	Start_Date__c, 	End_Date__c,Task_Status__c
            FROM Task__c
            ORDER BY Parent_Task__c, Name
        ];
    }
}