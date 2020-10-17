import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path'

// const articlesInfo = {
//   'learn-react': {
//     upvotes: 0,
//     comments: [],
//   },
//   'learn-node': {
//     upvotes: 0,
//     comments: [],
//   },
//   'my-thoughts-on-resumes': {
//     upvotes: 0,
//     comments: [],
//   }
// }

const app = express();

app.use(express.static(path.join(__dirname, '/build')))
app.use(bodyParser.json());
const withDB = async (operations, res) => {
  try {
    
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db('my-blog');

    await operations(db);

    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
  }
};

app.get('/api/articles/:name', async (req, res) => {
  withDB( async (db) => {

    // try {
      
      const articleName = req.params.name;
      
      // const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
      // const db = client.db('my-blog');
      
      const articlesInfo = await db.collection('articles').findOne({ name: articleName });
      res.status(200).json(articlesInfo);
      
      //   client.close();
      // } catch (error) {
        //   res.status(500).json({ message: 'Error connecting to db', error });
        // }
        // });
      }, res);
    });

app.post('/api/articles/:name/upvote', async (req, res) => {
  withDB( async (db) => {

  // try {
    const articleName = req.params.name;

    // articlesInfo[articleName].upvotes += 1;
    // res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes!`);
    // const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    // const db = client.db('my-blog');

    const articlesInfo = await db.collection('articles').findOne({ name: articleName }, { useUnifiedTopology: true });
    await db.collection('articles').updateOne({ name: articleName }, {
      '$set': {
        upvotes: articlesInfo.upvotes + 1,
      },
    });

    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);

    // client.close();
  // } catch (error) {
  //   res.status(500).json({ message: 'Error connecting to db!', error })
  // }
}, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  withDB( async (db) => {
    const articlesInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
      '$set': {
        comments: articlesInfo.comments.concat({ username, text })
      },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);

  }, res);

  // articlesInfo[articleName].comments.push({ username, text });
  // res.status(200).send(articlesInfo[articleName]);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

// app.get('/hello', (req, res, next) => { res.send('hello') });
// app.get('/hello/:name', (req, res) => { res.send(`Hello ${req.params.name}`) })
// app.post('/hello', (req, res) => { res.send(`Hello ${req.body.name}`) })

app.listen(8000, () => { console.log('Listening on port 8000') });