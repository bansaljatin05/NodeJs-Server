const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favourites = require('../models/favourite');

const favouriteRouter = express.Router();

var authenticate = require('../authenticate')

const cors = require('./cors');


favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favourites.find({user:req.user._id})
    .populate('dishes')
    .populate('user')
    .then((favourite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {

   Favourites.findOne({user:req.user._id})
    .then((favourite) => {
        

        if(favourite!= null)
        {  
            for(var i=0;i<req.body.length;i++)
            {

                if(favourite.dishes.indexOf(mongoose.Types.ObjectId(req.body[i]._id)) === -1)
                favourite.dishes.push(mongoose.Types.ObjectId(req.body[i]._id));
            }

           favourite.save()
           .populate("user")
           .populate("dishes")
           .then((favourite)=>{
            console.log('favourite dish added', favourite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourite);})
           .catch((err) => {next(err)});
        }
        else
        { var item ={"user":req.user._id,"dishes":[]};
        for(var i=0;i<req.body.length;i++)
            item.dishes.push(mongoose.Types.ObjectId(req.body[i]._id));
            Favourites.create(item)
            .then((favourite) => {
            console.log('favourite dish added', favourite.toJSON());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
             res.json(favourite);
            }, (err) => next(err))
            .catch((err) => next(err)); 
        }
        }, (err) => {next(err)})
    .catch((err) => {next(err)});
})

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
   Favourites.findOne({user:req.user._id})
    .then( (favourite) => {
        if(favourite!=null)
        {
        Favourites.findById(favourite._id).remove()
        .then((favourite)=>{ 
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err));
        }
        else
        {
             err = new Error('NOTHING TO DELETE');
            err.status = 200;
            return next(err);
        }
    })
    .catch((err) => next(err));    
});



favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported it');
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
  

    Favourites.findOne({user:req.user._id})
    .then((favourite) => {
        

        if(favourite!= null)
        {  
            if(favourite.dishes.indexOf(mongoose.Types.ObjectId(req.params.dishId)) === -1)
            {

           favourite.dishes.push(mongoose.Types.ObjectId(req.params.dishId));
           favourite.save()
           .then((favourite)=>{
            console.log('favourite dish added', favourite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourite);})
           .catch((err) => {next(err)});
            }
            else
            {
                res.statusCode = 403;//not modified
                res.end('dish already marked as favourite');
               
            }
   
         }
        else
        { var item ={"user":req.user._id,"dishes":[req.params.dishId]};
            console.log("item");

            Favourites.create(item)
            .then((favourite) => {
            console.log('favourite dish added', favourite.toJSON());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
             res.json(favourite);
            }, (err) => next(err))
            .catch((err) => next(err)); 
        }
        }, (err) => {next(err)})
    .catch((err) => {next(err)});
})

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported it');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    
        Favourites.findOne({user:req.user._id})
        .then((favourite) => {
        Favourites.findById(favourite._id)
        .then((favourite)=>{ 
            console.log(favourite);
            var index=0;
            for (var i=0;i<favourite.dishes.length;i++)
            {if(favourite.dishes[i]==req.params.dishId)
                {index=i;
                    break;
                }

            }
            favourite.dishes.splice(index,1);
            favourite.save()
            .then(()=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
        })
    .catch((err) => next(err));   

    })
    .catch((err) => next(err));    
});

module.exports = favouriteRouter;
