const express = require("express")
const sqlite3 = require("sqlite3")
const sqlite = require("sqlite")
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload")
const morgan = require("morgan")
const cors = require("cors")
const nodemailer = require("nodemailer");
const fs = require("fs");

const ACCESS_TOKEN = 'Yt%z+x@p&]F!wD2J=#QjB;A3*r>8:c^/RK$V_5),[Ty4g(hu7.'

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});


// async..await is not allowed in global scope, must use a wrapper
async function send() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}




const app = express();

app.use(fileUpload({
    createParentPath: true
}));

app.use(cors())
app.use(express.json())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const db = sqlite.open('database.db')

// db.then((db) => db.exec('DROP TABLE courses'))
// db.then((db) => db.exec("CREATE TABLE professors(id INTEGER PRIMARY KEY ASC, name_ru VARCAHR(255), name_en VARCAHR(255), bio_ru CLOB DEFAULT '', bio_en CLOB DEFAULT '', portrait_url VARCHAR(255) DEFAULT '')"))
// db.then((db) => db.exec(`
// INSERT INTO pages(route) VALUES(
//     'about-us')
// `))

app.use("/private", (request, response, next) => {
    if (request.headers.authorization === ACCESS_TOKEN) {
        next();
    } else {
        response.status(403).send("Please, enter correct access key and try again")
    }
});

app.get("/private/pages", async (request, response) => {
    const rows = await (await db).exec(`SELECT * FROM pages`)
    response.send(rows)
})

app.get("/pages/:route", async (request, response) => {
    const row = await (await db).each(`SELECT * FROM pages WHERE route = '${request.params["route"]}'`)
    response.send(row)
});
app.post("/private/pages/:route", async (request, response) => {
    const { content_ru, content_en, route } = request.body;
    try {
    await (await db).exec(`UPDATE pages SET content_ru = '${content_ru}', content_en = '${content_en}' WHERE route = '${route}'`);
    response.status(200).send()
    } catch {
        response.status(500).send("Something went wrong")
    }
});

app.get("/courses", async (request, response) => {
    const rows = await (await db).all(`SELECT * FROM courses`)
    response.send(rows)
});

app.get("/private/courses", async (request, response) => {
    const rows = await (await db).all(`SELECT * FROM courses`)
    response.send(rows)
});

app.get("/short-courses", async (request, response) => {
    const rows = await (await db).all(`SELECT * FROM courses WHERE is_short = 1`)
    response.send(rows)
});

app.get("/courses/:id", async (request, response) => {
    const row = await (await db).each(`SELECT * FROM courses WHERE id = ${request.params["id"]}`)
    response.send(row)
});

app.post("/private/courses", async (request, response) => {
    const { description_ru, description_en, title_ru, title_en, is_short } = request.body;
 
    try {
    await (await db).exec(`INSERT INTO courses(title_ru, title_en, description_ru, description_en, is_short) VALUES('${title_ru}', '${title_en}', '${description_ru}', '${description_en}', ${is_short})`);
    response.status(200).send()
    } catch {
        response.status(500).send("Something went wrong")
    }
});
app.post("/private/courses/:id", async (request, response) => {
    const { description_ru, description_en, title_ru, title_en, is_short } = request.body;
    try {
    await (await db).exec(`UPDATE courses SET title_ru = '${title_ru}', title_en = '${title_en}', description_en = '${description_en}', description_ru ='${description_ru}', is_short = ${is_short} WHERE id = '${request.params["id"]}'`);
    response.status(200).send()
    } catch {
        response.status(500).send("Something went wrong")
    }
});
app.delete("/private/courses/:id", async (request, response) => {
    try {
    await (await db).exec(`DELETE FROM courses WHERE id = '${request.params["id"]}'`);
    response.status(200).send()
    } catch {
        response.status(500).send("Something went wrong")
    }
});

app.get("/professors", async (request, response) => {
    const rows = await (await db).all(`SELECT * FROM professors`)
    response.send(rows)
});

app.get("/private/professors", async (request, response) => {
    const rows = await (await db).all(`SELECT * FROM professors`)
    response.send(rows)
});

app.post("/private/professors", async (request, response) => {
    const { bio_ru, bio_en, name_ru, name_en, portrait } = request.body;
    try {
        await (await db).exec(`INSERT INTO professors(name_ru, name_en, bio_en, bio_ru, portrait_url) VALUES('${name_ru}', '${name_en}', '${bio_en}', '${bio_ru}', '${portrait}')`);
        response.status(200).send()
    } catch {
        response.status(500).send("Something went wrong")
    }
});
app.post("/private/professors/:id", async (request, response) => {
    const { bio_ru, bio_en, name_ru, name_en, portrait } = request.body;
    try {
    if (!!portrait) {
        await (await db).exec(`UPDATE professors SET name_ru = '${name_ru}', name_en = '${name_en}', bio_en = '${bio_en}', bio_ru ='${bio_ru}', portrait_url = '${portrait}' WHERE id = '${request.params["id"]}'`);
    } else {
        await (await db).exec(`UPDATE professors SET name_ru = '${name_ru}', name_en = '${name_en}', bio_en = '${bio_en}', bio_ru ='${bio_ru}' WHERE id = '${request.params["id"]}'`);
    }
    response.status(200).send()
    } catch {
        response.status(500).send("Something went wrong")
    }
});
app.delete("/private/professors/:id", async (request, response) => {
    try {
        await (await db).exec(`DELETE FROM professors WHERE id = '${request.params["id"]}'`);
        response.status(200).send()
        } catch {
            response.status(500).send("Something went wrong")
        }
});

app.post("/join-courses", async function(request, response){
    response.send("Запись на курсы. Email");
    const info = await transporter.sendMail({
        from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
        to: "vitek123654@hotmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
});

app.post("/private/files", (request, response) => {
    if (!!request.files) {
        const {file} = request.files;
        file.mv('./uploads/' + file.name);
        const fileUrl = `http://${request.headers.host}/files/${file.name}` 
        response.send({file_url: fileUrl})
    } else {
        response.status(400).send("No files")
    }
})

app.get("/files/:filename", (request, response) => {
    console.log()
    fs.readFile(`./uploads/${request.params['filename']}`, (err, data) => {
        console.log(data)
        // response.setHeader('Content-Type', 'image/jpg').send(data)
        response.writeHead(200, {'Content-Type': 'image/jpg'}).end(data, "utf-8")
    })
})

app.listen(3000);