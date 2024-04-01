export default class converter {
    private columnNames: string[] = [];
    private rawElements: any[] = [];
    private tableName: string;

    constructor(object: string, tableName: string) {
        this.tableName = tableName;
        this.rawElements = JSON.parse(object.replace(/'/g, '`'));
        this.columnNames = Object.keys(this.rawElements[0]);
    }

    public createQuery(): string {
        return `INSERT INTO ${this.tableName} (${this.columnNames.join(', ')}) VALUES\n${this.assignValue()}`;
    }

    private assignValue(): string {
        const stringElementValues: string[] = this.rawElements.map((element) => this.getStringValues(element));
        return stringElementValues.map(element => ` (${element})`).join(',\n')
    }

    private getStringValues(object: any): string {
        return Object.values(object).map(element => {
            if (element !== null) {
                let resultingElement: string;
                if (typeof element === 'string') resultingElement = `'${element.trim()}'`;
                else if (typeof element === 'object') {
                    if (Array.isArray(element)) {
                        if (element.length > 1) {
                            const arrayOfInsertions = element.map(item => `jsonb_insert('[]', array['0'], '"${item}"')`)
                            resultingElement = arrayOfInsertions.join(' || ');
                        } else {
                            resultingElement = `jsonb_insert('[]', array['0'], '"${element[0]}"')`
                        }
                    } else resultingElement = `'${element}'`;
                }
                else resultingElement = `'${element}'`;
                return resultingElement;
            }
            else return 'null';
        }).join(', ')
    }

}

