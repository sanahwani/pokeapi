public with sharing class Accountclass {

    @AuraEnabled(cacheable=true)
    public static List<Account> allAccountsWithContact() {
        return [
            SELECT Id, Name, Phone,
                   (SELECT Id, Name, Phone, Email FROM Contacts)
            FROM Account
            LIMIT 5
        ];
    }
}
