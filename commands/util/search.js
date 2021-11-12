const commando = require('discord.js-commando');
const Discord = require('discord.js');
var request = require('request');
var cheerio = require('cheerio');
var urlencode = require('urlencode');

class Search extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'search',
            group: 'util2',
            memberName: 'search',
            description: 'wiki search',
            examples: ['&search tower'],
        });
    }
    async run(message, input) {
        var link = "https://mist-train-girls.fandom.com/wiki/Special:Search?query=" + urlencode(input)

        request(link, function (err, resp, html) {
            if (!err) {
                var out = ""
                const $ = cheerio.load(html);
                var max = 6
                for (var i = 1; i < max; i++) {
                    var tex = $('.unified-search__results li:nth-child(' + i + ') article h1 a').text()
                    var li = $('.unified-search__results li:nth-child(' + i + ') article h1 a').attr('href')
                    var vid = $('.unified-search__results li:nth-child(' + i + ') h1 a').text()
                    if (tex != null && li != null) {
                        out = out + tex.trim() + ": <" + li + ">\n"
                    }
                    if (vid == "Videos for '" + input + "'") {
                        max++;
                    }
                }
                if (out != "") {
                    message.channel.send(out)
                } else {
                    message.channel.send("No Result")
                }
            }
        })
    }
}

module.exports = Search;
