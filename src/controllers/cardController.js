const cardController = {}
// Libraries
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const hbs = require('handlebars');
const moment = require('moment');
const CardsModel = require('../models/CardsModel');
// This is actually a post request
cardController.getCard = async (req, res) => {
    
    //CONSULTAMOS EL REGISTRO DE LA BD
    const cred= req.body.formato;
    const query=cred.toString();
    const content = await CardsModel.find({"nombreCredencial": `${query}`})
      .then(data => {
        if (!data)
          console.log("Data no encontrada");
        else console.log("Exito al obtener la data");
        return data
      })
      .catch(err => {
        console.log("Error Consulta: "+err)
      });
    //const arrayQuery={credenciales:content};//ESTO CONTIENE LA DATA DE LA COSULTA EN JSON
    // Storage data from the request
    
    /*------------------>
    LA SOLUCION AL PROBLEMA ES PASAR UNICAMENTE LOS ARRAYS CON LOS DATOS DE LAS IMAGENES
      PROCESAR MEDIANTE UN SEGUNDO CICLO ESOS DATOS PARA MOSTRARLOS
    <------------------- */
    const data = req.body;
    console.log(content[0].contenido)
    data.usuarios[0].credencial= content.logos;
    data.usuarios[0].credencialArray= content[0].logos;
    data.usuarios[0].nombreCred=content[0].nombreCredencial;
    console.log(data);
    console.log('----------------------')
    console.log(content[0])
    // Tools for puppeteer to know what to do
    const compile = async (templateName,data) => {
        // Concat the file path of the handlebar
        const filePath = path.join(process.cwd(), 'src', 'layouts', `${templateName}.handlebars`);
        // Defining html
        const html = await fs.readFile(filePath, 'utf-8');
        // What to compile
        return hbs.compile(html)(data);
    };
    // For date format
    hbs.registerHelper('dateFormat', (value, format) => {
        console.log('formatting', value, format);
        return moment(value).format(format);
    });

    try {
        // Initialize puppeteer and the page
        const browser = await puppeteer.launch({
                headless:false,
                args: ["--no-sandbox",'--disable-setuid-sandbox']
            });
        const page = await browser.newPage();
        // NAME OF THE HANDLEBAR FILE AND IT'S DATA
        const content = await compile(data.formato,data);

        await page.setContent(content);
        await page.emulateMediaFeatures('screen'); //For images
        // How does the pdf will be developed
        const pdf = await page.pdf({
            landscape: true,
            format: 'letter',
            printBackground: true
        });
        // Converting to base 64
        base64 = pdf.toString('base64');
        // End puppeteer actions
        await browser.close();
        // Server's response
        res.json({
            pdf: base64
        })

    } catch (error) {
        res.json({
            msg: error.toString()
        })
    }
}

module.exports = cardController;