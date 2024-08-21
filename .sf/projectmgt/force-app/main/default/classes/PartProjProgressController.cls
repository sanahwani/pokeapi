public with sharing class PartProjProgressController {
    @AuraEnabled(cacheable=true)
    public static Project__c getProjectProgress(Id projectId) {
        return [SELECT Id, Name, Completed_Tasks__c, Total_Tasks__c , 	End_Date__c
                FROM Project__c 
                WHERE Id = :projectId 
                LIMIT 1];
    }
}
