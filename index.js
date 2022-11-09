const {
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder
} = require('discord.js');
const client = new Client({ intents: ['Guilds', 'MessageContent', 'GuildMessages'] });
const config = require('./config.json');
require('dotenv').config();
const keepAlive = require('./server.js');


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
})

// the embed to send with apply buttons

client.on('messageCreate', (message) => {
    if (message.content === '!send') {
        if (!config.admins.includes(message.author.id)) return;
        const embed = new EmbedBuilder()
        .setTitle('Work at YOUR SERVER')
        .setDescription('Click the buttons below!')
        .setColor('#2f3136')
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Moderation') // Department to apply
            .setCustomId('applymoderation')
        )
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Partnership') // department to apply
            .setCustomId('applypartnership')
        )
        const channel = message.guild.channels.cache.get(config.embedChannel);
        if (!channel) return;
        channel.send({
            embeds: [embed],
            components: [row]
        })
    }
})

// Opens a web page

keepAlive();


// what happens when the moderation button is clicked

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        // show modal
        if (interaction.customId === 'applymoderation') {
            const modal = new ModalBuilder()
            .setTitle('Staff Application')
            .setCustomId('apply_mod')
    // questions
            const ageComponent = new TextInputBuilder()
            .setCustomId('staff_age')
            .setLabel("How old are you?")
            .setMinLength(1)
            .setMaxLength(3)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('19')
            .setRequired(true)
    
            const whyYou = new TextInputBuilder()
            .setCustomId('staff_timezone')
            .setLabel("In what timezone are you located?")
            .setMaxLength(120)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(`GMT+1`)
            .setRequired(true)

            const moddesc = new TextInputBuilder()
            .setCustomId('mod_desc')
            .setLabel("Why would you like to become a moderator?")
            .setMinLength(10)
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`A moderator...`)
            .setRequired(true)

            const experience = new TextInputBuilder()
            .setCustomId('experience')
            .setLabel("Describe past experience you feel is relevant")
            .setMinLength(10)
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`I previously worked...`)
            .setRequired(false)

            const about = new TextInputBuilder()
            .setCustomId('about')
            .setLabel("Tell us about yourself! ")
            .setMinLength(10)
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`I'm...`)
            .setRequired(false)
    
            const rows = [ageComponent, whyYou, moddesc, experience, about].map(
                (component) => new ActionRowBuilder().addComponents(component)
            )
    
            modal.addComponents(...rows);
            interaction.showModal(modal);
            // end of modal
        }

        // Accept and deny buttons
        if (interaction.customId === 'staff_accept_mod') {
            const getIdFromFooter = interaction.message.embeds[0].footer.text;
            const getMemberMod = await interaction.guild.members.fetch(getIdFromFooter);
            await getMemberMod.roles.add(config.staffRoles).catch((err) => {
                console.error(err)
                return interaction.reply({
                    content: ":x: There was an error when a try to add roles for the user."
                })
            });
            interaction.reply({
                content: `✅ Accepted **${getMemberMod.user.username}`
            })
            await getMemberMod.send({
                content: `Hey ${getMemberMod.user.username}, You've been accepted into Moderation`
            }).catch(() => {
                return interaction.message.reply(':x: Unable to message this user. Possible users DMs are turned off.')
            })
            const newDisabledRow = new ActionRowBuilder()
            // buttons that get posted along with the staff application in the staff apps channel
            .setComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_mod_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Deny')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
        if (interaction.customId === 'staff_deny_mod') {
            const getIdFromFooter = interaction.message.embeds[0].footer?.text;
            const getMemberMod = await interaction.guild.members.fetch(getIdFromFooter);
            await getMemberMod.send({
                content: `Hey ${getMemberMod.user.tag} you have been denied.`
            }).catch(e => {})
            interaction.reply({
                content: `:x: ${getMemberMod.user.tag} has been rejected by ${interaction.user.tag}.`
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_mod_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Deny')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'apply_mod') {
            const staffAge = interaction.fields.getTextInputValue('staff_age');
            const staffWhyYou = interaction.fields.getTextInputValue('staff_timezone');
            const moddesc = interaction.fields.getTextInputValue('mod_desc');
            const experience = interaction.fields.getTextInputValue('experience');
            const about = interaction.fields.getTextInputValue('about');
            if (isNaN(staffAge)) {
                return interaction.reply({
                    content: ":x: Your age must be a number, please resend the form.",
                    ephemeral: true
                })
            }
            client.users.send(interaction.user.id, "Your application has been submitted sucesfully.")
            interaction.reply({
                content: '✅ Your staff application has been submit successfully.',
                ephemeral: true
            })

            const staffSubmitChannel = interaction.guild.channels.cache.get(config.submitChannel);
            if (!staffSubmitChannel) return;
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("Moderation staff application")
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: interaction.user.id })
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                {
                    name: "Age:",
                    value: staffAge
                },
                {
                    name: "Timezone:",
                    value: staffWhyYou
                },
                {
                    name: "What it means to be a mod:",
                    value: moddesc
                },
                {
                    name: "Past experience:",
                    value: experience
                },
                {
                    name: "About user:",
                    value: about
                }
            )

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_mod')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
            )
            staffSubmitChannel.send({
                embeds: [embed],
                components: [row]
            })
        }
    }
})

// what happens when the apply pertnership button is clicked 


client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        // show modal
        if (interaction.customId === 'applypartnership') {
            const modal = new ModalBuilder()
            .setTitle('Staff Application')
            .setCustomId('apply_partner')
    //questions
            const nameComponent = new TextInputBuilder()
            .setCustomId('staff_age')
            .setLabel("How old are you?")
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true)
            .setPlaceholder('19')
            .setStyle(TextInputStyle.Short)
    
            const ageComponent = new TextInputBuilder()
            .setCustomId('staff_experience')
            .setLabel("Describe your partnership experience")
            .setMinLength(1)
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('I have previously...')
            .setRequired(true)
    
            const whyYou = new TextInputBuilder()
            .setCustomId('staff_pt_number')
            .setLabel("How many partnerships do you fulfil per week?")
            .setMinLength(0)
            .setMaxLength(120)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(`15`)
            .setRequired(true)

            const dedicated = new TextInputBuilder()
            .setCustomId('staff_dedicated')
            .setLabel("How dedicated are you to this position?")
            .setMinLength(10)
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`I am...`)
            .setRequired(true)

            const anythingelse = new TextInputBuilder()
            .setCustomId('staff_extras')
            .setLabel("Is there anything else you'd like to add?")
            .setMinLength(1)
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
    
            const rows = [nameComponent, ageComponent, whyYou, dedicated, anythingelse].map(
                (component) => new ActionRowBuilder().addComponents(component)
            )
    
            modal.addComponents(...rows);
            interaction.showModal(modal);
            // end of modal
        }
        // Accept and deny buttons
        if (interaction.customId === 'staff_accept_partner') {
            const getIdFromFooter = interaction.message.embeds[0].footer.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.roles.add("1022049770002456617").catch((err) => {
                console.error(err)
                return interaction.reply({
                    content: ":x: There was an error when a try to add roles for the user."
                })
            });
            interaction.reply({
                content: `✅ Added hired role for **${getMember.user.username}**, Accepted into Partnership by ${interaction.user.username}. Ensure you've sent a welcome message in , <#1022049466917847050> and have purged the channel.`
            })
            await getMember.send({
                content: `Hey ${getMember.user.username}, You've been accepted into the team.`
            }).catch(() => {
                return interaction.message.reply(':x: Unable to message this user. Possible users DMs are turned off.')
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_partner_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Deny')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
        if (interaction.customId === 'staff_deny') {
            const getIdFromFooter = interaction.message.embeds[0].footer?.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.send({
                content: `Hey ${getMemberMod.user.tag} you have been rejected.`
            }).catch(e => {})
            interaction.reply({
                content: `:x: ${getMember.user.tag} has been rejected by ${interaction.user.tag}.`
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_partner_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Deny')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
    } 
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'apply_partner') {
            const staffName = interaction.fields.getTextInputValue('staff_age');
            const staffAge = interaction.fields.getTextInputValue('staff_experience');
            const staffWhyYou = interaction.fields.getTextInputValue('staff_pt_number');
            const anythingelse = interaction.fields.getTextInputValue('staff_extras');
            const staffdedicated = interaction.fields.getTextInputValue('staff_dedicated');

            client.users.send(interaction.user.id, "Your application has been submitted sucesfully.")
            interaction.reply({
                content: '✅ Your staff application has been submit successfully.',
                ephemeral: true
            })

            const staffSubmitChannel = interaction.guild.channels.cache.get(config.submitChannel);
            if (!staffSubmitChannel) return;
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: interaction.user.id })
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                {
                    name: "How old are you?",
                    value: staffName
                },
                {
                    name: "Describe your partnership experience",
                    value: staffAge
                },
                {
                    name: "How many partnerships do you fulfil per week?",
                    value: staffWhyYou
                },
                {
                    name: "How dedicated are you to this position?",
                    value: staffdedicated
                },
                {
                    name: "Anything else you'd like to add?",
                    value: anythingelse
                }
            )
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_partner')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
            )
            staffSubmitChannel.send({
                embeds: [embed],
                components: [row]
            })
        }
    }
})

client.login(process.env.TOKEN);