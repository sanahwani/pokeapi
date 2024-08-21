import { LightningElement, wire } from 'lwc';
import allAccountsWithContact from '@salesforce/apex/Accountclass.allAccountsWithContact';

export default class Treegrid extends LightningElement {
    gridData = [];
    
    @wire(allAccountsWithContact)
    accountsWithContactResult({ data, error }) {
        if (data) {
            console.log(data);
            this.formatGridData(data);
        }
        if (error) {
            console.error(error);
        }
    }

    //columns
    gridColumns = [
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'text'
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            type: 'text'
        },
        {
            label: 'Account Website',
            fieldName: 'Website',
            type: 'url',
            typeAttributes: {
                target: '_blank'
            }
        }
    ];

    dummyData = [
        {
            Name: 'salesforce',
            email: 's@gmail.com',
            website: 'abc.com'
        },
        {
            Name: 'salesforce2',
            email: 'sdd@gmail.com',
            website: 'abc.com'
        },
        {
            Name: 'salesforce3',
            email: 'sdf@gmail.com',
            website: 'abc.com'
        }
    ];

    formatGridData(result) {
        this.gridData = result.map(item => {
            const { Contacts, ...accounts } = item;
            const updatedContact = (Contacts || []).map(cont => {
                return { ...cont, "_children": this.dummyData };
            });
            return { ...accounts, "_children": updatedContact };
        });
        console.log(this.gridData);
    }
}


//     formatGridData(result){
//         this.gridData= result.map(item=>{
//             const {Contacts, ...accounts}= item
//             return {...accounts,  "_children": Contacts}
//         })
//         console.log(this.gridData)
//     }
// }