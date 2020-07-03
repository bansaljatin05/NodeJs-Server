const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favourites = require('../models/favourite');
const favouriteRouter = express.Router();
var authenticate = require('../authenticate')
const cors = require('./cors');
const favourite = require('../models/favourite');


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

   Favourites.findOne({user:req.user._id}, (err, favourite) => {
       if(err) return next(err);

       if(!favourite) {
           Favourites.create({user: req.user._id}) 
           .then((favourite) => {
               for(i = 0; i < req.body.length; i++) {
                   if(favourite.dishes.indexOf(req.body[i]._id) < 0) favourite.dishes.push(req.body[i]);
               }
                favourite.save()
                .then((favourite) => {
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite)
                    })
                })
                .catch((err) => {
                    return next(err);
                });   
           })
           .catch((err) => {
               return next(err);
           })
       } else {
            
            for(i = 0; i < req.body.length; i++) {
                if(favourite.dishes.indexOf(req.body[i]._id) < 0) favourite.dishes.push(req.body[i]);
            }
            favourite.save()
            .then((favourite) => {
                Favourites.findById(favourite._id)
                .populate('user')
                .populate('dishes')
                .then((favourites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite)
                })
            })
            .catch((err) => {
                return next(err);
            });   
       }
   })
    
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
    Favourites.findOne({user: req.user._id})
    .then((favourites) => {
        if(!favourites) {
            res.statusCode = 200;
            res.setHeader('content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favourites});
        } else {
            if(favourites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favourites});
            } else {
                res.statusCode = 200;
                res.setHeader('content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favourites});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.findOne({user:req.user._id}, (err, favourite) => { 
        if(err) return next(err);
        
        if(!favourite) {
            Favourites.create({ user: req.user._id })
            .then((favourite) => {
                favourite.dishes.push({ "_id": req.params._id });
                favourite.save()
                .then((favourite) => {
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite)
                    })
                }) 
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            })
        } else {
            if(favourite.dishes.indexOf(req.params.dishId) < 0) {
                favourite.dishes.push({"id": req.params.dishId});
                favourite.save()
                .then((favourite) => {
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite)
                    })
                })
                .catch((err) => {
                    return next(err);
                })
            }           
        }
    })
})

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported it');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    
    Favourites.findOne({user:req.user._id}, (err, favourite) => {
        if(err) return next(err);
        var index = favourite.dishes.indexOf(req.params.dishId);
        if(index >= 0) {
            favourite.dishes.splice(index, 1);
            favourite.save()
            .then((favourite) => {
                Favourites.findById(favourite._id)
                .populate('user')
                .populate('dishes')
                .then((favourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                })
            })
            .catch((err) => {
                return next(err);
            })

        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish' + req.params.dishId + 'does not exists in your favourites');
        }
    })   
});

module.exports = favouriteRouter;
