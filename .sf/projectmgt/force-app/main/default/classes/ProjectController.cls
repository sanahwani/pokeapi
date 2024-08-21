public with sharing class ProjectController {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getProjectsWithTasks() {
        List<Project__c> projects = [
            SELECT Id, Name, Progress_Percentage__c, Total_Tasks__c, Completed_Tasks__c, Start_Date__c, End_Date__c, Status__c,
                (SELECT Id, Name, Parent_Task__c, Start_Date__c, End_Date__c, Task_Status__c
                 FROM Tasks__r)
            FROM Project__c
            ORDER BY Name
        ];

        Map<Id, List<Task__c>> taskHierarchyMap = buildTaskHierarchy(projects);

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (Project__c project : projects) {
            List<Map<String, Object>> tasksWithSubtasks = buildTaskHierarchyMap(project.Tasks__r, taskHierarchyMap);

            result.add(new Map<String, Object>{
                'Id' => project.Id,
                'Name' => project.Name,
                'Start_Date__c' => project.Start_Date__c,
                'End_Date__c' => project.End_Date__c,
                'Progress_Percentage__c' => project.Progress_Percentage__c,
                'Completed_Tasks__c' => project.Completed_Tasks__c,
                'Total_Tasks__c' => project.Total_Tasks__c,
                'Status__c' => project.Status__c,
                'recordType' => 'Project__c',
                '_children' => tasksWithSubtasks
            });
        }

        return result;
    }

    private static Map<Id, List<Task__c>> buildTaskHierarchy(List<Project__c> projects) {
        Set<Id> taskIds = new Set<Id>();
        for (Project__c project : projects) {
            for (Task__c task : project.Tasks__r) {
                taskIds.add(task.Id);
            }
        }

        List<Task__c> allSubtasks = [
            SELECT Id, Name, Parent_Task__c, Start_Date__c, End_Date__c
            FROM Task__c
            WHERE Parent_Task__c IN :taskIds
        ];

        Map<Id, List<Task__c>> taskHierarchyMap = new Map<Id, List<Task__c>>();
        for (Task__c subtask : allSubtasks) {
            if (!taskHierarchyMap.containsKey(subtask.Parent_Task__c)) {
                taskHierarchyMap.put(subtask.Parent_Task__c, new List<Task__c>());
            }
            taskHierarchyMap.get(subtask.Parent_Task__c).add(subtask);
        }

        return taskHierarchyMap;
    }

    private static List<Map<String, Object>> buildTaskHierarchyMap(List<Task__c> tasks, Map<Id, List<Task__c>> taskHierarchyMap) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (Task__c task : tasks) {
            List<Map<String, Object>> subtasks = new List<Map<String, Object>>();
            if (taskHierarchyMap.containsKey(task.Id)) {
                subtasks = buildTaskHierarchyMap(taskHierarchyMap.get(task.Id), taskHierarchyMap);
            }

            result.add(new Map<String, Object>{
                'Id' => task.Id,
                'Name' => task.Name,
                'Start_Date__c' => task.Start_Date__c,
                'End_Date__c' => task.End_Date__c,
                'recordType' => 'Task__c',
                '_children' => subtasks
            });
        }
        return result;
    }
}
