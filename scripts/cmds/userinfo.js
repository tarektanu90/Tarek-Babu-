const { GoatWrapper } = require('fca-liane-utils');

module.exports = {
  config: {
    name: "info",
    version: "3.0",
    role: 0,
    author: "𝗦𝗵𝗔𝗻",
    description: {
      en: "🔍 Get DEEP user insights with FLAIR!"
    },
    category: "𝗜𝗡𝗙𝗢",
    countDown: 3,
    guide: {
      en: "{p}{n}"
    },
    premium: false
  },

  onStart: async function({ event, message, usersData, api, args }) {
    try {
      const uid = await getTargetUid(event, args);
      
      const [userInfo, avatarUrl, userData, allUsers] = await Promise.all([
        api.getUserInfo(uid),
        usersData.getAvatarUrl(uid),
        usersData.get(uid),
        usersData.getAll()
      ]);

      const analysis = analyzeUser(userInfo[uid], userData, allUsers, uid);

      const theme = getRandomTheme();
      
      const response = buildEpicResponse(analysis, theme);

      await message.reply({
        body: response.message,
        attachment: await global.utils.getStreamFromURL(avatarUrl),
        mentions: [{
          tag: userInfo[uid].name,
          id: uid
        }]
      });

    } catch (err) {
      console.error("💥 Mission Failed:", err);
      await message.reply("❌ Oops! The spy satellite malfunctioned. Try again!");
    }
  }
};

async function getTargetUid(event, args) {
  if (args[0]?.match(/profile\.php\?id=(\d+)/)) return args[0].match(/profile\.php\?id=(\d+)/)[1];
  if (/^\d+$/.test(args[0])) return args[0];
  if (event.type === "message_reply") return event.messageReply.senderID;
  return Object.keys(event.mentions)[0] || event.senderID;
}

function analyzeUser(user, data, allUsers, uid) {
  const wealth = formatMoney(data.money);
  
  const rank = allUsers.sort((a, b) => b.exp - a.exp).findIndex(u => u.userID === uid) + 1;
  const totalUsers = allUsers.length;
  
  const personality = getPersonality(data.money, user.gender);
  
  const creationDate = new Date(data.createdAt || Date.now());
  const accountAge = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
  
  return {
    name: user.name,
    uid,
    gender: getGender(user.gender),
    type: getUserType(user.type),
    vanity: user.vanity || "None",
    profileUrl: user.profileUrl,
    birthday: user.isBirthday || "🤫 Private",
    isFriend: user.isFriend ? "✅ Bestie!" : "❌ Stranger Danger",
    wealth,
    rank,
    wealthRank: allUsers.sort((a, b) => b.money - a.money).findIndex(u => u.userID === uid) + 1,
    personality,
    accountAge,
    totalUsers
  };
}

function getRandomTheme() {
  const themes = [
    {
      name: "Cyberpunk",
      border: "═╬═",
      icon: "🌃",
      color: "🔵"
    },
    {
      name: "Pirate",
      border: "▄▄▓▄▄",
      icon: "🏴‍☠️",
      color: "🟠"
    },
    {
      name: "Wizard",
      border: "☆✧✦",
      icon: "🧙",
      color: "🟣"
    },
    {
      name: "Detective",
      border: "🕵️‍♂️✧",
      icon: "🔍",
      color: "🟤"
    }
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

function buildEpicResponse(data, theme) {
  const title = `${theme.icon} ${theme.name.toUpperCase()} PROFILE SCAN ${theme.icon}`;
  
  return {
    message: `
${theme.color.repeat(5)} ${title} ${theme.color.repeat(5)}

${theme.border} 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗬 𝗩𝗘𝗥𝗜𝗙𝗜𝗘𝗗 ${theme.border}
🔮 𝗡𝗮𝗺𝗲: ${data.name}
🧬 𝗨𝗜𝗗: ${data.uid}
⚡ 𝗧𝘆𝗽𝗲: ${data.type}
${data.gender.emoji} 𝗚𝗲𝗻𝗱𝗲𝗿: ${data.gender.text}

${theme.border} 𝗦𝗢𝗖𝗜𝗔𝗟 𝗜𝗡𝗧𝗘𝗟 ${theme.border}
🏷️ 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${data.vanity}
📅 𝗕𝗼𝘁 𝗨𝘀𝗲 𝗔𝗴𝗲: ${data.accountAge} days old
🎂 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${data.birthday}
🤝 𝗦𝘁𝗮𝘁𝘂𝘀: ${data.isFriend}

${theme.border} 𝗘𝗖𝗢𝗡𝗢𝗠𝗬 𝗥𝗘𝗣𝗢𝗥𝗧 ${theme.border}
💰 𝗪𝗲𝗮𝗹𝘁𝗵: $${data.wealth}
🏆 𝗥𝗮𝗻𝗸: ${data.rank}/${data.totalUsers}
💎 𝗪𝗲𝗮𝗹𝘁𝗵 𝗥𝗮𝗻𝗸: ${data.wealthRank}/${data.totalUsers}

${theme.border} 𝗣𝗘𝗥𝗦𝗢𝗡𝗔𝗟𝗜𝗧𝗬 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦 ${theme.border}
🧠 𝗧𝘆𝗽𝗲: ${data.personality.type}
📝 𝗗𝗲𝘀𝗰: ${data.personality.description}

${"✨".repeat(3)} 𝗘𝗡𝗗 𝗢𝗙 𝗥𝗘𝗣𝗢𝗥𝗧 ${"✨".repeat(3)}
`.trim(),
    theme: theme.name
  };
}

function getPersonality(money, gender) {
  const personalities = [
    {
      type: "💸 High Roller",
      description: "Likes fancy avocados and private jets"
    },
    {
      type: "🦉 Wise Owl",
      description: "Probably reads books and drinks tea"
    },
    {
      type: "🌶️ Spicy Memelord",
      description: "Definitely posts questionable content"
    },
    {
      type: "🍀 Lucky Newbie",
      description: "Still figuring out how to tag people"
    }
  ];
  
  if (money > 1000000) return personalities[0];
  if (gender == 1) return personalities[1];
  if (gender == 2) return personalities[2];
  return personalities[3];
}

function getGender(gender) {
  return {
    1: { emoji: "👩", text: "Female" },
    2: { emoji: "👨", text: "Male" },
    default: { emoji: "🌈", text: "Mystery Gender" }
  }[gender] || { emoji: "❓", text: "Unknown" };
}

function getUserType(type) {
  const types = {
    "user": "👤 Civilian",
    "page": "📜 Ancient Scroll",
    "event": "🎪 Party Zone",
    "group": "👥 Secret Society",
    "app": "🤖 Robot Overlord",
    default: "👽 Unknown Entity"
  };
  return types[type?.toLowerCase()] || types.default;
}

function formatMoney(amount) {
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixIndex = 0;
  
  while (amount >= 1000 && suffixIndex < suffixes.length - 1) {
    amount /= 1000;
    suffixIndex++;
  }
  
  return amount.toFixed(amount < 10 ? 1 : 0) + suffixes[suffixIndex];
}

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
