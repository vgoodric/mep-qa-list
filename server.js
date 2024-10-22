//npm start
const express = require('express');
const path = require('path');
const app = express();

app.set('views', './mepListTool/views');
app.set('view engine', 'ejs');

const port = 80;

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, './')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function evalFileName(stat, filePath, q) {
  return (
    stat.isFile() &&
    (filePath.toLowerCase().indexOf('.html') === filePath.length - 5 || filePath.toLowerCase().indexOf('.htm') === filePath.length - 4)
  );
}
function evalDirectoryName(stat, filePath) {
  return stat.isDirectory() && filePath.indexOf('_') !== 0 && filePath.indexOf('.') !== 0;
}
function walkSync(currentDirPath, callback) {
  let fs = require('fs'),
    path = require('path');
  fs.readdirSync(currentDirPath).forEach(function (name) {
    let filePath = path.join(currentDirPath, name),
      stat = fs.statSync(filePath);
    if (evalFileName(stat, filePath)) {
      callback(filePath, stat);
    } else if (evalDirectoryName(stat, filePath)) {
      walkSync(filePath, callback);
    }
  });
}

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, './mepListTool/index.html'));
});

//gets list of offers for search field
app.get('/fileList.js', (request, response) => {
  let results = [];
  walkSync('./offers', function (filePath, stat) {
    if (filePath.toLowerCase().indexOf(request.query.q.toLowerCase()) >= 0) {
      var filePathArray = filePath.split('/').join('\\').split('\\');
      results.push({
        title: filePathArray[filePathArray.length - 1],
        description: '/' + filePathArray.join('/'),
        lastUpdate: stat.ctime,
      });
    }
  });
  walkSync('./examples', function (filePath, stat) {
    if (filePath.toLowerCase().indexOf(request.query.q.toLowerCase()) >= 0) {
      var filePathArray = filePath.split('/').join('\\').split('\\');
      results.push({
        title: filePathArray[filePathArray.length - 1],
        description: '/' + filePathArray.join('/'),
        lastUpdate: stat.ctime,
      });
    }
  });
  results.sort(function (a, b) {
    return -(a.lastUpdate - b.lastUpdate);
  });
  let jsonResponse = {
    results: results,
  };
  response.send(JSON.stringify(jsonResponse));
});

app.post('/saveFile.js', (request, response) => {
  const fileName = request.body.fileName;
  const fileContents = request.body.fileContents;
  let fs = require('fs');
  fs.writeFile('.' + fileName, fileContents, function (err) {
    if (err) throw err;
  });
});

app.post('/deleteFile.js', (request, response) => {
  const fileName = request.body.fileName;
  let fs = require('fs');
  fs.unlinkSync('.' + fileName, function (err) {
    if (err) throw err;
  });
});

app.get('/activity/', function (request, response) {
  response.render('activity', {
    name: request.query.name,
    targetUrl: request.query.targetUrl,
    qaLink: request.query.qaLink,
    targetToken: request.query.targetToken,
    targetAudience: request.query.targetAudience,
    experiences: request.query.experiences,
    action: request.query.action,
    jiraUrl: request.query.jiraUrl,
    charterUrl: request.query.charterUrl,
    selectedActivity: request.query.selectedActivity,
    pages: request.query.pages,
  });
});
app.post('/activity/', function (request, response) {
  response.render('activity', {
    name: request.body.name,
    targetUrl: request.body.targetUrl,
    qaLink: request.body.qaLink,
    targetToken: request.body.targetToken,
    targetAudience: request.body.targetAudience,
    experiences: request.body.experiences,
    action: request.body.action,
    jiraUrl: request.body.jiraUrl,
    charterUrl: request.body.charterUrl,
    selectedActivity: request.body.selectedActivity,
    pages: request.body.pages,
  });
});

app.listen(port, () => {
  console.log(`Mep Manifest Manager can be found on http://localhost:${port}/`);
});
