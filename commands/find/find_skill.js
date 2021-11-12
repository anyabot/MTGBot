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
      name: "skill",
      aliases: ['skills'],
      group: "find",
      memberName: "skill",
      description: "find skills of an unit",
      examples: ["&skill quill"],
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
          find_dat(message, tobedone)
        }
      }
    });
  }
}

async function find_dat(message, tobedone) {
  if (tobedone.length == 0) {
    return
  }
  else {
    console.log(tobedone)
  var turn = tobedone.shift()
  var link = turn[0]
  var img = turn[1]
  var name = turn[2]
  await request("https://mist-train-girls.fandom.com" + link, function (err, resp, html) {
    if (!err) {
      var pages2 = [];
      const $ = cheerio.load(html);
      var output;

      output = $(".wikitable.hidden.skill tr:nth-child(4)").html();
      if (output) {
        let no = $(".wikitable.hidden.skill tbody").children().length
        for (var i =3; i < no + 1; i++) {
          let line1 = lv1line(
            $(".wikitable.hidden.skill tr:nth-child(" + i + ")").html()
          );
          if (line1.length > 5) {
            let embed = new Discord.RichEmbed()
            .setURL("https://mist-train-girls.fandom.com" + link)
            .setTitle(name + "'s Skills")
            .setThumbnail(img)
            .setColor("LIGHT_GREY")
            .addField("Skill Name", line1[0])
            .addField("SP Cost", line1[1], true)
            .addField("RP Cost", line1[2], true)
            .addField("Element", line1[3], true)
            .addField("Range", line1[4], true)
            .addField("Effect", line1[5])
            if (line1[6]) {
              embed.addField("Note", line1[6])
            }
            pages2.push(embed);
          }
          else {
            let embed = new Discord.RichEmbed()
            .setURL("https://mist-train-girls.fandom.com" + link)
            .setTitle(name + "'s Skills")
            .setThumbnail(img)
            .setColor("LIGHT_GREY")
            .addField("Skill Name", line1[0])
            .addField("Element", line1[1], true)
            .addField("Range", line1[2], true)
            .addField("Effect", line1[3])
            if (line1[4]) {
              embed.addField("Note", line1[4])
            }
            pages2.push(embed);
          }
        }
        functions.sende(message, pages2)
      }
      find_dat(message, tobedone)
    }
    else {console.log(err)}
  });
}
}

function lv1line(output) {
  if (output != null) {
    output = output.replace(/<a[^>]*>(<img[^>]*data-image-key="Element_)([^.]*)([^>]*)><\/a>/g, "$2 ");
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
