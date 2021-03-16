'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');

//server setup
const app = express();

//middlewares
require('dotenv').config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//database setup
const client = new pg.Client(process.env.DATABASE_URL);

// const client = new pg.Client({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: { rejectUnauthorized: false },
// });


//routes
app.get('/',homeHandler);
app.post('/favourite',favouriteHandler);
app.get('/favourite',favouriteHandler2);
app.get('/details/:id',detailsHandler);
app.put('/update/:id',updateHandler);
app.delete('/delete/:id',deleteHandler);








//handlers
function homeHandler(req,res){
	let url='https://digimon-api.herokuapp.com/api/digimon'
	superagent.get(url)
	.then((data)=>{
		let digimonData = data.body.map((item)=>{

			return new Digimon(item);
		})
		res.render('pages/home',{data:digimonData})
	})

}

function favouriteHandler(req,res){
	let {name,img,level}=req.body;
	let sql='INSERT INTO digimon (name,img,level) VALUES ($1,$2,$3);';
	let values=[name,img,level];
	client.query(sql,values)
	.then((data)=>{
		res.redirect('/favourite')
	})
}

function favouriteHandler2(req,res){
	let sql='SELECT * FROM digimon;';
	client.query(sql)
	.then((results)=>{
		res.render('pages/favourite',{data:results.rows});
	})
}

function detailsHandler(req,res){
	let id=req.params.id;
	let sql='SELECT * FROM digimon WHERE id=$1;';
	let value=[id];
	client.query(sql,value)
	.then((results)=>{
		res.render('pages/details',{data:results.rows[0]});
	})
}

function updateHandler(req,res){
	let id=req.params.id;
	let{name,img,level}=req.body;
	let sql='UPDATE digimon SET name=$1,img=$2,level=$3 WHERE id=$4;';
	let values=[name,img,level,id]
	client.query(sql,values)
	.then((results)=>{
		res.redirect(`/details/${id}`);
	})
}

function deleteHandler(req,res){
	let id=req.params.id;
	let sql='DELETE FROM digimon WHERE id=$1;';
	let value=[id];
	client.query(sql,value)
	.then((results)=>{
		res.redirect('/favourite')
	})


}




//constractor
function Digimon(data){
	this.name=data.name;
	this.img=data.img;
	this.level=data.level;

}





const PORT = process.env.PORT || 3030;

client.connect().then(() => {
	app.listen(PORT, () => {
		console.log(`listening on PORT ${PORT}`);
	});
});

