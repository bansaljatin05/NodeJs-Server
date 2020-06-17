const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favourites = require('../models/favourite');
const { populate } = require('../models/favourite');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json())

favouriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user._id);
    Favourites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
        if(favourites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourites);
        } else {
            var err = new Error('There are no favourites');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({user: req.user._id})
    .then((favourite) => {
        if(!Favourites.exists({user: req.user._id})) {
            req.body.user = req.user._id;
            Favourites.create(req.body)
            .then((favourite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);           
            }, (err) => next(err));
        } else {
            favourite.insertMany({dishes: req.body});
            favourite.save()
            .then((favourite) => {
                Dishes.findById(dish._id)
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                })                
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.deleteOne({user: req.user._id})
    .then((resp) => { 
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favouriteRouter.route('/:dishId')
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favourites ' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({user: req.user._id})
    .then((favourite) => {
        if(!Favourites.exists({user: req.user._id})) {
            req.body.user = req.user._id;
            req.body.dishes.push(req.params.dishId);
            Favourites.create(req.body)
            .then((favourite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);           
            }, (err) => next(err));
        } else {
            req.body.dishes.push(req.params.dishId);
            favourite.dishes.push(req.body.dishes);
            favourite.save()
            .then((favourite) => {
                Dishes.findById(dish._id)
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                })                
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({user: req.user._id})
    .then((favourite) => { 
        if(Favourites.exists({user: req.user._id}) && favourite.dishes.id(req.params.dishId) != null) {
            favourite.dishes.id(req.params.dishId).remove();
            favourite.save()
            .then((favourite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);     
            })
        } else {
            err = new Error('NO Favourite dishes to delete');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});
module.exports = favouriteRouter;
