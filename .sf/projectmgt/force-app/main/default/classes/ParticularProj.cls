
public with sharing class ParticularProj {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getProjectWithTasks(Id projectId) {
        // Query the project and its immediate tasks
        Project__c project = [
            SELECT Id, Name, Progress_Percentage__c, Start_Date__c, End_Date__c, Completed_Tasks__c, Total_Tasks__c, Status__c,
                (SELECT Id, Name, Parent_Task__c, Start_Date__c, End_Date__c, Task_Status__c
                 FROM Tasks__r)
            FROM Project__c
            WHERE Id = :projectId
            LIMIT 1
        ];

        // Organize tasks and their subtasks recursively
        List<Map<String, Object>> tasksWithHierarchy = organizeTasksWithHierarchy(project.Tasks__r);

        // Return the project data including its tasks and subtasks
        return new Map<String, Object>{
            'Id' => project.Id,
            'Name' => project.Name,
            'Start_Date__c' => project.Start_Date__c,
            'End_Date__c' => project.End_Date__c,
            'Progress_Percentage__c' => project.Progress_Percentage__c,
            'Total_Tasks__c' => project.Total_Tasks__c,
            'Completed_Tasks__c' => project.Completed_Tasks__c,
            'Status__c' => project.Status__c,
            '_children' => tasksWithHierarchy,
            'recordType' => 'Project__c'
        };
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> searchRecords(String searchKey, String objectApiName) {
        String query = 'SELECT Id, Name FROM ' + objectApiName + ' WHERE Name LIKE :searchKey LIMIT 10';
        List<SObject> records = Database.query(query);
        List<Map<String, Object>> resultList = new List<Map<String, Object>>();

        for (SObject record : records) {
            resultList.add(new Map<String, Object>{
                'Id' => record.Id,
                'Name' => (String)record.get('Name')
            });
        }

        return resultList;
    }

    public static List<String> getFieldLabels(String objectApiName) {
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
        Map<String, Schema.SObjectField> fields = sObjectType.getDescribe().fields.getMap();
        List<String> fieldLabels = new List<String>();

        for (Schema.SObjectField field : fields.values()) {
            Schema.DescribeFieldResult fieldResult = field.getDescribe();
            fieldLabels.add(fieldResult.getLabel());
        }

        return fieldLabels;
    }
    private static List<Map<String, Object>> organizeTasksWithHierarchy(List<Task__c> tasks) {
        List<Map<String, Object>> taskList = new List<Map<String, Object>>();
        for (Task__c task : tasks) {
            Map<String, Object> taskMap = new Map<String, Object>{
                'Id' => task.Id,
                'Name' => task.Name,
                'Start_Date__c' => task.Start_Date__c,
                'End_Date__c' => task.End_Date__c,
                'Task_Status__c' => task.Task_Status__c,
                'recordType' => 'Task__c'
            };

            // Query for the subtasks recursively
            List<Task__c> subtasks = [
                SELECT Id, Name, Parent_Task__c, Start_Date__c, End_Date__c, Task_Status__c
                FROM Task__c
                WHERE Parent_Task__c = :task.Id
            ];

            if (!subtasks.isEmpty()) {
                taskMap.put('_children', organizeTasksWithHierarchy(subtasks));
            }

            taskList.add(taskMap);
        }
        return taskList;
    }
}