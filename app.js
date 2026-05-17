const express = require('express');
const supabaseClient = require('@supabase/supabase-js');

const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

app.use(express.static(__dirname + '/public'));

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseURL, supabaseKey);

const COLOR_QUERY = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'cyan',
    'indigo',
    'violet'
];

/**
 * Site pages
 */
app.get('/', (req, res) => {
    res.sendFile('public/drawpad.html', { root: __dirname });
});

app.get('/guide', (req, res) => {
    res.sendFile('public/guide.html', { root: __dirname });
});
app.get('/drawing', (req, res) => {
    res.sendFile('public/drawingmethod.html', { root: __dirname });
});
app.get('/about', (req, res) => {
    res.sendFile('public/about.html', { root: __dirname });
});

/**
 * Site data APIs
 */
app.get('/data/api/zenquote', async (req, res) => {
    const { data, error } = await supabase.from('zenquotes')
        .select();
    if (!data) {
        return;
    }
    const now = new Date();
    const lastUpdate = data[data.length - 1]['created_at'];
    if (lastUpdate.slice(11, 13) != now.getUTCHours()) {
        const zqdata = await fetch("https://zenquotes.io/api/random")
            .then(res => res.json())
            .then(data => {
                console.log(`Received data from ZenQuotes API with content: ${data[0]['h']}`)
                return data[0]['h'];
            });
        if (!zqdata) {
            console.log("Using old data for zen quote")
            res.send(data);
            return;
        }
        const { delresponse, delerror } = await supabase.from('zenquotes')
            .delete()
            .gt('id', 0);
        const { data, error } = await supabase.from('zenquotes')
            .insert({
                html: zqdata
            })
            .select();
        if (error) {
            console.log("ERROR on Supabase update in zenquote API")
            console.log(error)
            res.status = 500;
            res.send(error);
        }
        else {
            res.send(data);
        }
        return;
    }

    if (error) {
        console.log("ERROR on Supabase access in zenquote API")
        console.log(error)
        res.status = 500;
        res.send(error);
    }
    else {
        res.send(data[data.length - 1]);
    }
});

app.get('/data/api/palettes', async (req, res) => {
    let { data, error } = await supabase.from('palettes')
        .select();
    if (!data) {
        return;
    }
    const now = new Date();
    const lastUpdate = data[data.length - 1]['created_at'];
    if (lastUpdate.slice(8, 10) != now.getUTCDate()) {
        let cq = COLOR_QUERY[Math.floor(Math.random() * COLOR_QUERY.length)]
        const pdata = await fetch(`https://colormagic.app/api/palette/search?q=${cq}`)
            .then(res => res.json())
            .then(data => {
                console.log(`Received data from Colormagic API with content: ${data[0]['colors']}`)
                return data;
            });
        if (!pdata) {
            console.log("Using old data for color palette")
            res.send(data);
            return;
        }
        const { delresponse, delerror } = await supabase.from('palettes')
            .delete()
            .gt('id', 0);
        let newCount = pdata.length > 10 ? 10 : pdata.length;
        for (let i = 0; i < newCount; i++) {
            let { data, error } = await supabase.from('palettes')
                .insert({
                    colors: pdata[i]['colors']
                });
            if (error) {
                console.log("ERROR on Supabase update in zenquote API")
                console.log(error)
                res.status = 500;
                res.send(error);
                return;
            }
        }
        let { data, error } = await supabase.from('palettes')
            .select();
        if (error) {
            console.log("ERROR on Supabase access in zenquote API")
            console.log(error)
            res.status = 500;
            res.send(error);
        }
        else {
            res.send(data);
        }
        return;
    }

    if (error) {
        console.log("ERROR on Supabase access in zenquote API")
        console.log(error)
        res.status = 500;
        res.send(error);
    }
    else {
        res.send(data);
    }
});

/**
 * TESTING
 */
// app.get('/test/static', (req, res) => {
//     res.sendFile('public/test/static.html', { root: __dirname });
// });
// app.get('/test/canvas', (req, res) => {
//     res.sendFile('public/test/canvas.html', { root: __dirname });
// });

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});