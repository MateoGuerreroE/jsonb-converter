import converter from "./converter.js";
// @ts-ignore
import fs from 'fs';

// Replace here with the full JSON array.
// NOTE: Nested quotes (\") are not supported yet, you can replace them with a text editor.
// Only character that will be replaced is ' for `.
const result = `[{}]`

const conv = new converter(result, 'test.datagrid__book');
const output = conv.createQuery();

fs.writeFile('output.txt', output, (err) => {
    if (err) {
        console.log('Error writting SQL code into file: ' + err);
    } else {
        console.log('SQL generated.')
    }
});
