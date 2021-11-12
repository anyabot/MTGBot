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
      name: "ability",
      aliases: ['a'],
      group: "find",
      memberName: "ability",
      description: "find abilities of an unit",
      examples: ["&ability quill"],
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

async function find_dat(message, page,  tobedone) {
  if (tobedone.length == 0) {
    functions.sende(message, page)
  }
  else {
    console.log(tobedone)
  var turn = tobedone.shift()
  var link = turn[0]
  var img = turn[1]
  var name = turn[2]
  await request("https://mist-train-girls.fandom.com" + link, function (err, resp, html) {
    if (!err) {
      var pages2 = page;
      const $ = cheerio.load(html);
      var output;

      output = $(".wikitable.hidden.ability tr:nth-child(4)").html();
      if (output) {
        let embed = new Discord.RichEmbed()
        .setURL("https://mist-train-girls.fandom.com" + link)
        .setTitle(name + "'s Abilities")
        .setThumbnail(img)
        .setColor("LIGHT_GREY")
        let no = $(".wikitable.hidden.ability tbody").children().length
        for (var i =2; i < no + 1; i++) {
          let line1 = lv1line(
            $(".wikitable.hidden.ability tr:nth-child(" + i + ")").html()
          );
          embed.addField("Ability Name", line1[0])
          .addField("Effect", line1[1])
          
        }
        pages2.push(embed);
      }
      find_dat(message, pages2, tobedone)
    }
    else {console.log(err)}
  });
}
}

function lv1line(output) {
  if (output != null) {
    output = output.replace(/<[^>]*>/g, "\n");
    output = output.replace(/\n+ /g, "\n");
  }
  output = he.decode(output);
  output = output.trim();
  var arr = output.split("\n");
  var filtered = arr.filter(function (el) {
    return el != null && el != "";
  });
  return filtered;
}

module.exports = FindStat2;
