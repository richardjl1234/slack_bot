var fs = require('fs');
module.exports = {
   showimg:function(req, res, para){
      res.writeHead(200, {'Content-Type': 'Image/png'});
      data = fs.readFileSync('./img/'+para,'binary'); //img folder is the deault folder to keep images in png format
      console.log('the showimg function is called!') ;
      res.write(data, 'binary') ;
      res.end('') ;
   }

}
