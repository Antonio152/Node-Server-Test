const userCtrl = {};

const CardsModel = require('../models/CardsModel');

userCtrl.findOne = async (req, res) => {
    const id = req.params.id;
  
    CardsModel.findById(id)
      .then(data => {
        if (!data)
          res.status(404).json({ message: "No se encontro el dato con el id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ message: "Error al encontrar el dato con el id=" + id });
      });
  };

// POST
userCtrl.createUser = async (req, res) => {
    // Validamos la respuesta
    if (!req.body.nombreCredencial) {
        res.status(400).json({ message: "El contenido no puede estar vacio!" });
        return;
    }   
    // Creamos la base de datos y comprobamos el estado.
    const cardsmodels  = new CardsModel({
        nombreCredencial: req.body.nombreCredencial,
        contenido: req.body.contenido,
        firmas:req.body.firmas,
        logos:req.body.logos,
        contAd:req.body.contAd,
        published: req.body.published ? req.body.published : false
    });
    // Guardamos los datos en la base de datos
    await cardsmodels 
        .save(cardsmodels)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json({
                message:
                err.message || "Ocurrio algun error creando la tabla de la base de datos."
            });
        });
};

module.exports = userCtrl;