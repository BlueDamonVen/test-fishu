var express       = require('express'),
    mongoose      = require('mongoose'),
    bodyParser    = require('body-parser'),
    moment        = require('moment'),
    autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.connect('mongodb://admin:Caracas2011@ds015878.mongolab.com:15878/fishu', function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

autoIncrement.initialize(connection);

  Schema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    owner: {
      type: Number
    },
    priority:{
      type: Number,
      required: true
    },
    dueDate:{
      type: Date,
      required: true
    },
    creator:{
      type: Number,
    },
    taskStatus:{
      type: Number,
    },
    createdAt:{
      type: Date
    },
    UpdatedAt:{
      type: Date
    }
  }),

  Schema.pre('save', function(next){
    now = new Date();
    this.UpdatedAt = now;
    if ( !this.createdAt ) {
      this.createdAt = now;
    }
    next();
  });

  Schema.plugin(autoIncrement.plugin, 'Task');

  Task = connection.model('Task', Schema);

express()
  .use(bodyParser.json()) 
  .use(bodyParser.urlencoded({ extended: true })) 

  .get('/api', function (req, res) {
    res.json(200, {msg: 'API ON' });
  })

  .get('/api/task/', function (req, res) {
    Task.find( function ( err, todos ){
      res.json(200, todos);
    });
  })


  .post('/api/task/create', function (req, res) {
      var task = new Task(req.query);
      task.save(function (err) {
        res.json(200, task);
      });
  })

  .get('/api/task/destroy/:id', function (req, res) {
    Task.findOneAndRemove({ _id: req.params.id }, function ( err, task ) {
      if(err){
        res.json(500, err);
      }else{
        res.json(200, task);
      }
    });
  })

  .post('/api/task/update/:id', function (req, res) {
    if (req.params.id != undefined){
      Task.findOne({ _id: req.params.id}, function ( err, task ) {
        if(task){
          task.name = req.query.name;
          task.priority = req.query.priority;
          task.dueDate = req.query.dueDate;
          task.save( function ( err, task ){
            res.json(200, task);
          });
        }else{
          res.json(404, {
            status: 404,
            errors: [{
              ValidationError: "Id is Invalid"
            }]
          });
        }
      });
    }else{
          res.json(400, {
            status: 400,
            errors: [{
              ValidationError: "No Id Provided"
            }]
          });      
    }
  })

  .use(express.static(__dirname + '/'))
  .listen(process.env.PORT || 5000);
