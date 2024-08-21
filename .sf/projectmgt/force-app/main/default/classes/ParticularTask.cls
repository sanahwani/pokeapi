public with sharing class ParticularTask {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTaskWithChildren(Id taskId) {
        // Query for the specific task with its assigned user
        Task__c task = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Task_Status__c, 
                   (SELECT Assigned_to__r.Name FROM Task_Assignments__r) // Fetch related Task Assignments
            FROM Task__c
            WHERE Id = :taskId
            LIMIT 1
        ];
    
        // Recursively fetch child tasks and build the hierarchy
        Map<Id, List<Task__c>> taskHierarchy = getTaskHierarchy(new Set<Id>{task.Id});
        return buildTaskTree(task, taskHierarchy);
    }
    
    private static Map<Id, List<Task__c>> getTaskHierarchy(Set<Id> parentTaskIds) {
        Map<Id, List<Task__c>> taskMap = new Map<Id, List<Task__c>>();

        if (!parentTaskIds.isEmpty()) {
            // Query for child tasks and related Task Assignments
            List<Task__c> childTasks = [
                SELECT Id, Name, Start_Date__c, End_Date__c, Task_Status__c, Parent_Task__c,
                       (SELECT Assigned_to__r.Name FROM Task_Assignments__r)
                FROM Task__c
                WHERE Parent_Task__c IN :parentTaskIds
            ];

            for (Task__c task : childTasks) {
                if (!taskMap.containsKey(task.Parent_Task__c)) {
                    taskMap.put(task.Parent_Task__c, new List<Task__c>());
                }
                taskMap.get(task.Parent_Task__c).add(task);
            }

            // Recursively fetch the children of the current child tasks
            Set<Id> childTaskIds = new Set<Id>();
            for (Task__c child : childTasks) {
                childTaskIds.add(child.Id);
            }

            // Merge with results of recursive call
            Map<Id, List<Task__c>> subTaskMap = getTaskHierarchy(childTaskIds);
            for (Id parentId : subTaskMap.keySet()) {
                if (!taskMap.containsKey(parentId)) {
                    taskMap.put(parentId, new List<Task__c>());
                }
                taskMap.get(parentId).addAll(subTaskMap.get(parentId));
            }
        }

        return taskMap;
    }

   

    private static Map<String, Object> buildTaskTree(Task__c task, Map<Id, List<Task__c>> taskHierarchy) {
        List<Map<String, Object>> childTasksList = new List<Map<String, Object>>();

        if (taskHierarchy.containsKey(task.Id)) {
            for (Task__c child : taskHierarchy.get(task.Id)) {
                childTasksList.add(buildTaskTree(child, taskHierarchy));
            }
        }

        // Aggregate assigned users
        String assignedToNames = '';
        for (Task_Assignment__c assignment : task.Task_Assignments__r) {
            assignedToNames += assignment.Assigned_to__r.Name + '; ';
        }

        return new Map<String, Object>{
            'Id' => task.Id,
            'Name' => task.Name,
            'Start_Date__c' => task.Start_Date__c,
            'End_Date__c' => task.End_Date__c,
            'Task_Status__c' => task.Task_Status__c,
            'Assigned_to__c' => assignedToNames.trim(), // Aggregate assigned users
            '_children' => childTasksList
        };
    }
}
