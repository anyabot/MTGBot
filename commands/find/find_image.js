const commando = require("discord.js-commando");
const Discord = require("discord.js");
var request = require("request-promise");
var cheerio = require("cheerio");
var he = require("he");
require("@gouch/to-title-case");
var urlencode = require("urlencode");
var functions = require("../../functions.js");

class FindStat2 extends commando.Command {
  constructor(client) {
    super(client, {
      name: "image",
      aliases: ['i', "img"],
      group: "find",
      memberName: "image",
      description: "find images of an unit",
      examples: ["&image quill"],
      args: [
        {
          key: "text",
          prompt: "What unit do you want to know about?",
          type: "string",
        },
      ],
    });
  }

  async run(message, { text }) {
    var unit = functions.nameChange(text);
    var pages = [];
    var link = "https://mist-train-girls.fandom.com/wiki/" + urlencode(unit);
    request(link, function (err, resp, html) {
      if (!err) {
        const $ = cheerio.load(html);
        var tk = $(".categories").text().includes("Train Knights");
        if (tk) {
          var tobedone = []
          for (
            var i = 1;
            i < $(".wikitable tbody").eq(0).children().length;
            i++
          ) {
            let img = $(
              ".wikitable tbody tr:nth-child(" + (i+1).toString() + ") td:nth-child(1) a img"
            ).attr("data-src");
            if (!img) {
              img = $(
                ".wikitable tbody tr:nth-child(" + (i+1).toString() + ") td:nth-child(1) a img"
              ).attr("src");
            }
            let link2 = $(".wikitable tbody tr:nth-child(" + (i+1).toString() + ") td:nth-child(2) a").attr(
              "href"
            );
            let name = $(".wikitable tbody tr:nth-child(" + (i+1).toString() + ") td:nth-child(2) a").attr(
              "title"
            );
            tobedone.push([link2, img, name])
          }
          find_dat(message, pages, tobedone)
        }
      }
    });
  }
}

async function find_dat(message, pages, tobedone) {
  if (tobedone.length == 0) {
    functions.sende(message, pages)
  }
  else {
    console.log(tobedone)
  var turn = tobedone.shift()
  var link = turn[0]
  var name = turn[2]
  await request("https://mist-train-girls.fandom.com" + link, function (err, resp, html) {
    if (!err) {
      var pages2 = pages;
      const $ = cheerio.load(html);
      var output;

      output = $(".infobox img").html();
      if (output) {
        let img = $(".infobox img").attr("data-src").split("/scale-to-width-down")[0]
        if (!img) {
          $(".infobox img").attr("src").split("/scale-to-width-down")[0]
        }
        let embed = new Discord.RichEmbed()
          .setURL("https://mist-train-girls.fandom.com" + link)
          .setTitle(name + "'s Stats")
          .setImage(img)
        pages2.push(embed);
      }

      find_dat(message, pages2, tobedone)
    }
    else {console.log(err)}
  });
}
}

module.exports = FindStat2;
