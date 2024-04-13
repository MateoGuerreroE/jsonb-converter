export default class converter {
    private columnNames: string[] = [];
    private rawElements: Object[] = [];
    private tableName: string;
    private typeList: string[];

    constructor(object: string, tableName: string) {
        this.tableName = tableName;
        this.rawElements = JSON.parse(object.replace(/'/g, '`'));
        this.columnNames = Object.keys(this.rawElements[0]);
        this.verifyTypes();
    }

    public createQuery(): string {
        return `INSERT INTO ${this.tableName} (${this.columnNames.join(', ')}) VALUES\n${this.insertValues()}`;
    }

    private insertValues(): string {
        const ElementValues: string[] = this.rawElements.map((element) => this.createInsertStatement(element));
        return ElementValues.map(element => ` (${element})`).join(',\n')
    }

    private getStringValues(object: any): string {
        return Object.values(object).map(element => {
            if (element !== null) {
                let resultingElement: string;
                if (typeof element === 'string') resultingElement = `'${element.trim()}'`;
                else if (typeof element === 'object') {
                    if (Array.isArray(element)) {
                        if (element.length > 1) {
                            const arrayOfInsertions = element.map(item => `jsonb_insert('[]', array['0'], '"${item.trim()}"')`)
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

    private createInsertStatement(object: Object): string {
        return Object.values(object).map((element, index) => {
            let resultingElement: string;
            switch (this.typeList[index]) {
                case 'string':
                    if (element.length === 0) resultingElement = `NULL`;
                    resultingElement = `'${element.trim()}'`;
                    break;
                case 'object':
                    if (Array.isArray(element)) {
                        if (element.length > 1) {
                            const arrayOfInsertions = element.map(item => `jsonb_insert('[]', array['0'], '"${item.trim()}"')`)
                            resultingElement = arrayOfInsertions.join(' || ');
                        } else {
                            resultingElement = `jsonb_insert('[]', array['0'], '"${element[0]}"')`
                        }
                    } else throw new Error('JSON not supported yet') // TODO: Add JSON Support
                    break;
                case 'number':
                case 'double':
                    resultingElement = `${element}`
                    break;
                default: 
                    resultingElement = `NULL`;
            }
            return resultingElement;
        }).join(', ')
    }

    private verifyTypes() {
        const validTypes = ['object', 'string', 'number', 'double'];
        const typeList: string[] = [];
        const sampleElement = this.rawElements[0];
        for (const element of Object.values(sampleElement)) {
            if (validTypes.includes(typeof element)) typeList.push(typeof element);
            else throw new Error(`Unsupported type: ${typeof element}`)
        }
        this.typeList = typeList;
    }

}

