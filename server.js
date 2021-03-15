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
app.post('/add',addDataHandler);
app.get('/favourite',addDataHandler2);



//handlers
function homeHandler(req,res){
	let url=`https://digimon-api.herokuapp.com/api/digimon`;
	superagent.get(url)
	.then((data)=>{

		let digimonData = data.body.map((item)=>{
			console.log(item)

			return new Digimon(item)

		})
		res.render('pages/home',{data:digimonData})
	})

}

function addDataHandler(req,res){
	let {name,img,level}=req.query;
    //insert
    let sql = 'INSERT INTO digimon (name,img,level) VALUES ($1,$2,$3);';
    let values =[name,img,level];
	console.log(values)
	client.query(sql,values)
	.then(()=>{
		res.redirect('/favourite');
	})


}

function addDataHandler2(req,res){
	let sql='SELECT * FROM digimon;';
	client.query(sql)
	.then((results)=>{
		console.log(results.rows)
		res.render('./pages/favourite',{data:results.rows});
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

