'use strict';

require('dotenv').config();

const data = require('./data.json');

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);




const server = express();
const port= process.env.PORT

server.use(cors());
server.use (express.json);

server.get('/', handelMovie)
server.get('/favorite', handelGet) //Welcome to Favorite Page
server.get('/trending',handelTrending)
server.get('/search',handelSearching)
server.get('/rout1',handelRout1)
server.get('/rout2',handelRout2)
server.post('/addMovie',handelAddMovie)
server.get('/getMovies',handelGetMovie)
server.put('/UPDATE/:id', upMovieHandler);
server.delete('/DELETE/:id', delMovieHandler);
server.get('/getMovie/:id', getMovie);

server.use('', handleError) // 404 Error
server.use (handleError500)

let url=`https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.APIKEY}`

function Movie(id,title,release_date, poster_path, overview) {
    this.id=id;
    this.title = title;
    this.release_date=release_date;
    this.poster_path = poster_path;
    this.overview = overview;
   
    
}


/ **   handelMovie ** /
function handelMovie(req, res) {

    let obj = new Movie(data.title, data.poster_path, data.overview);
    return res.status(200).json(obj);
}


//**    handelGet        ** /
function handelGet(request, response) {
    return response.status(200).send("Welcome to Favorite Page")
}

function handelTrending(request, response) {
   axios.get(url).then((access)=>{let movieData=access.data.results
let movieC=movieData.map((access2)=>{return new Movie(access2.id,access2.title,access2.release_date,access2.poster_path,access2.overview);
     })
response.status(200).json(movieC)
   }).catch((err) => {
    console.log("Error");
   })
}

let movie = "Riverdance: The Animated Adventure";

function handelSearching(request, response) {
    let url2=`https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&query=${movie} `;
    axios.get(url2).then((access)=>{let movieData=access.data.results
 let movieC=movieData.map((access2)=>{return new Movie(access2.id,access2.title,access2.release_date,access2.poster_path,access2.overview);
      })
 response.status(200).json(movieC)
    }).catch((err) => {
     console.log("Error");
    })
 }
 function handelRout1(request, response) {
 let url3 = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.APIKEY}`;
 axios.get(url3)
 .then((access3) => {
     let result = access3.data;
     res.status(200).json(result);
     console.log(result);
 }).catch((err) => {
     console.log("Error");
 })}
 


 function handelRout2(request, response) {
    let url4 = `https://api.themoviedb.org/3/person/11?api_key=${process.env.APIKEY}`;
    axios.get(url4)
    .then((access4) => {
        let result = access4.data;
        res.status(200).json(result);
        console.log(result);
    }).catch((err) => {
        console.log("Error");
    })}


    function handelAddMovie (request, response){
    const movie = request.body;
    let sql = `INSERT INTO ACTIONMOVIE(title,release_date,poster_path,overview) VALUES ($1,$2,$3,$4) RETURNING *;`
    let values=[movie.title,movie.release_date,movie.poster_path,movie.overview];
    client.query(sql,values).then(data => {
        response.status(200).json(data);
    }).catch(error =>{
        handleError500(error, request, response)
    });
    }





    function handelGetMovie(req,res){
        let sql = `SELECT * FROM ACTIONMOVIE;`;
        client.query(sql).then(data=>{
           res.status(200).json(data.rows);
        }).catch(error=>{
            handleError500(error,req,res)
        });
    }
    



    function upMovieHandler(req, res) {
        const id = req.params.id;
        const movie = req.body;
        const sql = `UPDATE ACTIONMOVIE SET title =$1, release_date = $2, poster_path = $3 ,overview = $4 WHERE id=$5 RETURNING *;`;
        let values = [movie.title, movie.release_date, movie.poster_path, movie.overview, id];
        client.query(sql, values).then(data => {
            res.status(200).json(data.rows);
            // res.status(204)
        }).catch(error => {
            HandleError500(error, req, res)
        });
    }
    



    function  delMovieHandler(req, res) {
        const id = req.params.id;
        const sql = `DELETE FROM ACTIONMOVIE WHERE id=${id};`
        client.query(sql).then(() => {
            res.status(200).send("the movie got deleted");
        }).catch(error => {
            HandleError500(error, req, res)
        });
    }
    





    function getMovie(req,res){
        const id = req.params.id;
        let sql = `SELECT * FROM ACTIONMOVIE WHERE id=${id};`;
        client.query(sql).then(data=>{
           res.status(200).json(data.rows);
        }).catch(error=>{
            handleError500(error,req,res)
        });
    }



/**        handleError404          **/
function handleError(request, response) {
    response.status(404).send('page not found error 404')
}


/**       handleError500          **/
function handleError500(error,request, response) {
    const err = {
        "status": 500,
        "responseText": "Sorry, something went wrong"
    }
    response.status(500).send(err);

}


server.listen(3000, () => {
    console.log("my server is listining to port 3000");
})
