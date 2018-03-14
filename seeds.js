const mongoose = require("mongoose"),
  Photo = require("./models/photo"),
  User = require("./models/user");

var data = [
  {
    title: "Headlights and Sky",
    image:
      "https://scontent-dfw5-1.cdninstagram.com/vp/276c91549efcb4f6e1abfbe7c6337349/5B13C792/t51.2885-15/e35/22639396_1522480931151125_4135549869592936448_n.jpg",
    alt: "A red night sky streaked with gray clouds and headlights"
  },
  {
    name: "Sky and Lines",
    image:
      "https://scontent-dfw5-1.cdninstagram.com/vp/32962b15049ec800b7a42d7977c5d064/5B49F80D/t51.2885-15/e35/27891611_187760091980096_6056875756854706176_n.jpg",
    description: "A powerful sky and powerful powerlines"
  },
  {
    name: "Cat",
    image:
      "https://scontent-dfw5-1.cdninstagram.com/vp/75fa433dfd1fc350bd06dcc12aaeadc7/5B122267/t51.2885-15/e35/23098468_369342926811971_8224079193143508992_n.jpg",
    description: "A gray cat sitting in the sun"
  }
  // ,
  // {
  //     name: "Lake",
  //     image: "https://scontent-dfw5-1.cdninstagram.com/vp/9d44d6351a7ea9dc718f07dcc7499818/5B10D553/t51.2885-15/e35/27879534_155076658633045_745030023873822720_n.jpg",
  //     description: "Badass lake in Oregon"
  // },
  // {
  //     name: "La Push",
  //     image: "https://scontent-dfw5-1.cdninstagram.com/vp/f93e7d5269814a94cb1ed35359bcd778/5B186464/t51.2885-15/e35/26072722_172250983531148_3289159970448211968_n.jpg",
  //     description: "La Push beach in Washington"
  // },
  // {
  //     name: "Camper",
  //     image: "https://scontent-dfw5-1.cdninstagram.com/vp/ef5682c8915f1cb21244de8d9aee21d9/5B14F309/t51.2885-15/e35/25024959_1410036792458615_8480168709816582144_n.jpg",
  //     description: "Camper in the Hoh Rainforest"
  // },
  // {
  //     name: "Sunset",
  //     image: "https://scontent-dfw5-1.cdninstagram.com/vp/3cac78ea04dcc153a74f01599736641b/5B2D3435/t51.2885-15/e35/25013964_135676173765419_515616458881892352_n.jpg",
  //     description: "Colorful sunset through the window"
  // },
  // {
  //     name: "Clouds",
  //     image: "https://scontent-dfw5-1.cdninstagram.com/vp/b8133b12183cd242b135692cb62459d0/5B16BB14/t51.2885-15/e35/21147278_135355247079324_424590021522096128_n.jpg",
  //     description: "White clouds against a blue sky"
  // },
  // {
  //     name: "Beach Houses",
  //     image: "https://scontent-dfw5-1.cdninstagram.com/vp/ed19cfdc0acf7d727a8cf40a6f1108af/5B2CC8E6/t51.2885-15/e35/20346797_108122436519951_1246258127565750272_n.jpg",
  //     description: "Seagul flying by the houses on Cannon Beach"
  // }
];

function seedDB() {
  //Remove all photos
  Photo.remove({}, err => {
    if (err) {
      console.log(err);
    }
    console.log("removed photos!");

    User.remove({}, err => {
      if (err) {
        console.log(err);
      }

      console.log("removed users!");
    });

    // data.forEach((seed) => {
    //     Photo.create(seed, (err, photo) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("added a photo");

    //         }
    //     });
    // });
  });
}

module.exports = seedDB;
