const {createReadStream} = require('fs'); 
const csv = require('csv-parser');

module.exports = (filePath, callback) => {
    const accounts = [];
    createReadStream(filePath).pipe(csv()).on('data', data => {
        try {
            accounts.push(data.username)
        }
        catch(err) {
            console.log(err);
        }
    }).on('end', () => {
        callback(accounts);
    });
}