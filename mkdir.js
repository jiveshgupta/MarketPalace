const fs= require('fs');
var flag='flag';
// fs.mkdir(`./public/${flag}`, (err) => { 
//     if (err) { 
//         return console.error(err); 
//     } 
//     console.log('Directory created successfully!'); 
// }); 
fs.mkdir(`./public/images`, 
  { recursive: true }, (err) => { 
    if (err) { 
      return console.error(err); 
    } 
    console.log('Directory created successfully!'); 
  });