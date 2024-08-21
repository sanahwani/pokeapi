public with sharing class PartTaskProgressController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTaskProgress(Id taskId) {
        Task__c task = [SELECT Id, Name, Parent_Task__c, Progress_percentage__c,
                        Parent_Task__r.Progress_percentage__c
                        FROM Task__c 
                        WHERE Id = :taskId 
                        LIMIT 1];
        
        Decimal progressPercentage;

        if (task.Parent_Task__c != null) {
            progressPercentage = task.Parent_Task__r.Progress_percentage__c;
        } else {
            progressPercentage = task.Progress_percentage__c;
        }

        return new Map<String, Object>{
            'Id' => task.Id,
            'Name' => task.Name,
            'Progress_percentage__c' => progressPercentage
        };
    }
}
