const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client/src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let original = content;
  
  // Replace literal $ followed by an expression block like {price}
  // We want to avoid matching template literal URLs like `http://localhost/.../${id}`
  // In JSX text, it's usually >${price} or spaces then ${price}
  content = content.replace(/(>|\s|\:|\()(\$)\{([^}]+(price|total|Bid|amount|tax|subtotal|Revenue|AtBuy)[^}]*)\}/g, '$1BD {$3}');

  if (content !== original) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Updated', file);
  }
});
