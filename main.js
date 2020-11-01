// load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.MYPORT) || 3000
const API_KEY = process.env.API_KEY || ''
// set API_KEY=b66ccfb3ca484c7da4fffe2695578336
const endPoint = 'http://newsapi.org/v2/top-headlines'
/*
http://newsapi.org/v2/top-headlines
?q=bitcoin
&from=2020-09-30
&sortBy=publishedAt
&apiKey=b66ccfb3ca484c7da4fffe2695578336
*/

// create an instance
const app = express()

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

// configure application
app.use(express.static(__dirname + '/images'))


// configure app

app.get('/', (req, resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
})

app.get('/getNews',
    //express.urlencoded({extended: true}),
    async (req, resp) => {
        //console.info('body: ', req.query.search)
        const searchstr = req.query.search
        const url = withQuery(
            endPoint,
            {
                q: req.query.search,
                category: req.query.category,
                country: req.query.country,
               // apiKey: API_KEY

            }
        )
        console.info(url)
      
        const headers = {
            'X-Api-Key': API_KEY
        }

        let result = await fetch(url, { headers })

        try {
            const news = await result.json()
            //const news_str = JSON.stringify(news)
            //console.info(news)
            //console.info('news_str ', news_str)

            const news_dis = news.articles
                .map(v => {
                    return { 
                        title: v.title,
                        url: v.url,
                        urltoimage: v.urlToImage,
                        newsDate: v.publishedAt,
                        summary: v.description  
                    }
                })
                //console.info(news_dis)

            resp.status(200)
            resp.type('text/html')
            resp.render('search', {
                searchstr, news_dis,
                hasContent: !!news_dis.length
            })
        } catch(e) {
            console.error('Error ', e)
            return Promise.reject(e)
        } 
    }
)

// start server
if (API_KEY) {
    app.listen(PORT, () => { 
        console.info(`Application started on Port ${PORT} at ${new Date()}`)
        console.info(`API_KEY is ${API_KEY}`)
    })
}
else {
    console.error('API_KEY is not set')
    console.info(`API_KEY is ${API_KEY}`)
}
