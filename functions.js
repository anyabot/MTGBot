var name = require("./library/lib.js").name;
require("@gouch/to-title-case");
const commando = require("discord.js-commando");
const Discord = require("discord.js");
exports.nameChange = function nameChange(text) {
    var unit = text.toLowerCase().toTitleCase();
    if (name[unit]) unit = name[unit];
    return unit;
};

exports.sende = function sende(message, pages) {
    var embed = pages[0];
    let page = 1;
    embed = pages[0];
    embed.setFooter("Page " + page + " of " + pages.length);
    if (pages.length != 1) {
        message.channel.send(embed).then((msg) => {
            msg.react("⬅️").then((r) => {
                msg.react("➡️");

                // Filters
                const backwardsFilter = (reaction, user) =>
                    reaction.emoji.name === "⬅️" && !user.bot;
                const forwardsFilter = (reaction, user) =>
                    reaction.emoji.name === "➡️" && !user.bot;

                const backwards = msg.createReactionCollector(backwardsFilter, {
                    timer: 6000,
                });
                const forwards = msg.createReactionCollector(forwardsFilter, {
                    timer: 6000,
                });

                backwards.on("collect", (r) => {
                    r.remove(r.users.filter((u) => !u.bot).first());
                    if (page === 1) {
                        page = pages.length + 1;
                    }
                    page--;
                    embed = pages[page - 1];
                    embed.setFooter("Page " + page + " of " + pages.length);
                    msg.edit(embed);
                });

                forwards.on("collect", (r) => {
                    r.remove(r.users.filter((u) => !u.bot).first());
                    if (page === pages.length) {
                        page = 0;
                    }
                    page++;
                    embed = pages[page - 1];
                    embed.setFooter("Page " + page + " of " + pages.length);
                    msg.edit(embed);
                });
            });
        });
    } else {
        message.channel.send(embed);
    }
};
