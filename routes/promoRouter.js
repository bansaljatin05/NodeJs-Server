const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json())

promoRouter.route('/')
.get((req, res, next) => {
    Promos.find({})
    .then((promos) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.json(promos);
    },(err) => next(err))
    .catch((err)=> next(err))
})
.post((req, res, next) => {
    Promos.create(req.body)
    .then((promo) => {
        console.log('Promo Created' + promo);
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/plain');
        res.json(promo)
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promos');
})
.delete((req, res, next) => {
    Promos.deleteMany({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/plain');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err))
});

promoRouter.route('/:promoId')
.get((req, res, next) => {
    Promos.findById(req.params.promoId)
    .then((promo) => { 
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/plain');
        res.json(promo);
    },(err) => next(err))
    .catch((err) => next(err))
})
.post((req, res, next) => {
    res.end('Post operation not supported on promos/' + req.params.promoId);
})
.put((req, res, next) => {
    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, { new: true })
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'tex/plain');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete((req, res, next) => {
    Promos.findByIdAndDelete(req.params.promoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'tex/plain');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err))
});

module.exports = promoRouter;