const e = require('express');
const TelegramApi = require('node-telegram-bot-api');
const token = 'your-bot-token';
var https = require('https');
const fs = require('fs');
const bot = new TelegramApi(token, { polling: true });
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM('').window;
var $ = (jQuery = require('jquery')(window));
let { PythonShell } = require('python-shell');
const urls = {
  youtube: 'Любит смотреть youtube',
  'vk.com': 'Любит сидеть в vk',
  pornhub: 'Любит похабные вещи',
  facebook: 'Любит сидеть в facebook`e',
  stakoverflow: 'Программист',
  habr: 'Программист',
  github: 'Программист',
  coderoad: 'Программист',
  'mos.ru': 'Следит за активностью своего города',
  mephi: 'Следит за активностью МИФИ',
  kinopoisk: 'Любит смотреть kinopoisk',
};
class url_analyze {
  links = [];
  counter = 1;
  constructor(link) {
    this.links.push(link);
  }
}
class person {
  orthography = [];
  words = [];
  urls = {};
  messages = [];
  langs = [];
  polarity = [];
  profane = [];
  subjectivity = [];
  constructor(name) {
    this.name = name;
  }
  popular_words = () => {
    let result = {};
    for (word of this.words) {
      if (!result[word]) result[word] = 0;
      result[word]++;
    }
    let max_count = 0;
    let max_words = [];
    for (word in result) {
      if (result[word] < max_count) continue;
      if (result[word] > max_count) max_words = [];
      max_count = result[word];
      max_words.push(word);
    }
    return max_words.reduce((el, index) => {
      return el + ' ' + index;
    });
  };
  mood = () => {
    let mood =
      (this.polarity.reduce((a, b) => a + b) / this.polarity.length) *
      (this.subjectivity.reduce((a, b) => a + b) / this.subjectivity.length);
    if (mood > 0 && mood <= 0.5) return 'Позитивно - нейтральный';
    else if (mood > 0.5) return 'Позитивный';
    else if (mood < 0 && mood >= -0.5) return 'Агрессивно - нейтральный';
    return 'Агрессивный';
  };
  favorite_phrase = () => {
    var mas = this.messages.reduce(
      function (mas, s) {
        mas.freq[s] = (mas.freq[s] || 0) + 1;
        if (!mas.freq[mas.most] || mas.freq[s] > mas.freq[mas.most]) mas.most = s;
        return mas;
      },
      { freq: {}, most: '' },
    );
    if (mas.freq[mas.most] > 1) return mas.most;
    return 'нет';
  };
  orthography_check = () => {
    let orthography_status = this.orthography.reduce((a, b) => a + b) / this.orthography.length;
    if (orthography_status > 0 && orthography_status <= 0.5) return 'Иногда допускает ошибки';
    else if (orthography_status > 0.5) return 'Неграмотный';
    return 'Грамотный';
  };
  profane_check = () => {
    let profane_status = this.profane.reduce((a, b) => a + b) / this.profane.length;
    if (profane_status > 0 && profane_status <= 0.5) return 'Иногда использует нецензурную лексику';
    else if (profane_status > 0.5) return 'Постоянно использует нецензурную лексику';
    return 'Чистой души человек';
  };
  links_check = () => {
    if (Object.keys(this.urls) == 0) return '';
    let res = '';
    for (let our_domain in urls) {
      for (let domain in this.urls) {
        if (domain.indexOf(our_domain) != -1) {
          res += urls[our_domain] + ',\n';
          for (let used_link_id in this.urls[domain].links) {
            let link = this.urls[domain].links[used_link_id];
            res += `      ${link},\n`;
          }
          break;
        }
      }
    }
    return res;
  };
}
const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Запуск бота.' },
    { command: '/info', description: 'О проекте.' },
    { command: '/how_to_use', description: 'Как пользоваться ботом.' },
  ]);
  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://c.tenor.com/q0Cj0U0_4-0AAAAC/genius-smart.gif');
      return bot.sendMessage(
        chatId,
        'Бот запущен, чтобы воспользоваться анализом переписки - отправьте её JSON формат текстом или файлом.',
      );
    } else if (text === '/info') {
      return bot.sendMessage(
        chatId,
        'Бот реализован для проекта "психолингвистический анализ человека по переписке в Telegram".',
      );
    } else if (text === '/how_to_use') {
      await bot.sendMessage(
        chatId,
        'Откройте нужный вам диалог, в верхнем правом углу вы увидите 3 точки, нажав на эту кнопку выбирите экспорт истрии чата. В открывшимся окне выбирите формат - JSON, нажмите кнопку экспорт. Скопируйте всё содержимое файла и отправьте в этот диалог.',
      );
      return bot.sendPhoto(chatId, 'https://imgur.com/a/1zCjrV7');
    } else if (msg?.['document']?.['file_id']) {
      await bot.sendVideo(chatId, 'https://tenor.com/view/emoji-loading-gif-14294239');
      let file_name = uniqid();
      let document = msg['document'];
      if (document.mime_type != 'application/json')
        return bot.sendMessage(chatId, 'Поддерживаются только файлы типа JSON.');
      let file_id = document['file_id'];
      let link = `https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`;
      $.get(link, data => {
        if (!data.ok) return bot.sendMessage(chatId, 'Ошибка !');
        let file_path = data.result.file_path;
        link = `https://api.telegram.org/file/bot${token}/${file_path}`;
        const file = fs.createWriteStream(`file_${file_name}.json`);
        const request = https.get(link, response => {
          response.pipe(file);
          response.on('end', function () {
            fs.readFile(`file_${file_name}.json`, 'utf8', async (error, data) => {
              if (error) throw error;
              if (!isJson(data)) {
                fs.unlink(`file_${file_name}.json`, err => {
                  if (err) console.log(err);
                });
                return bot.sendMessage(chatId, 'Содержимое файла должно быть JSON !');
              }
              let chat = JSON.parse(data);
              let result = await analyze_part(chat);
              fs.unlink(`file_${file_name}.json`, err => {
                if (err) console.log(err);
              });
              return output(chatId, result, bot);
            });
          });
        });
      });
      return;
    } else if (isJson(text)) {
      await bot.sendVideo(chatId, 'https://tenor.com/view/emoji-loading-gif-14294239');
      let chat = JSON.parse(text);
      let result = await analyze_part(chat);
      return output(chatId, result, bot);
    }
    return bot.sendMessage(chatId, 'Не существующая команда !');
  });
};
analyze_part = async chat => {
  let chat_messsages = chat.messages;
  let result = {};
  for (message_index in chat_messsages) {
    let message = chat_messsages[message_index];
    if (message.type != 'message') continue;
    let message_text = message.text;
    if (typeof message_text == 'object') message_text = message_text[0].text;
    if (message_text.length == 0) continue;
    let message_sender = {
      name: message.from,
      id: message.from_id,
    };
    if (!result[message_sender.id]) result[message_sender.id] = new person(message_sender.name);
    let user = result[message_sender.id];
    let links_status = link_finder(message_text, user);
    if (links_status) continue;
    let tokens = tokenizer(message_text);
    user.messages.push(tokens);
    for (token_index in tokens) {
      if (tokens[token_index] == '' || !tokens[token_index]) continue;
      user.words.push(tokens[token_index]);
    }
  }
  let JSONmessages = JSON.stringify(chat_messsages);
  let PyResult = await runPy(JSONmessages);
  PyResult = PyResult[0];
  for (sender_id in PyResult) {
    let user = PyResult[sender_id];
    result[sender_id].langs = user.language;
    result[sender_id].subjectivity = user.subjectivity;
    result[sender_id].polarity = user.polarity;
    result[sender_id].orthography = user.orthography;
    result[sender_id].profane = user.profane;
  }
  return result;
};
isJson = str => {
  try {
    JSON.parse(str);
    if (!isNaN(str)) return false;
  } catch (err) {
    return false;
  }
  return true;
};
link_finder = (str, user) => {
  var links = str.match(/http\:\/\/[\w\-\.\/]+/);
  var links2 = str.match(/https\:\/\/[\w\-\.\/]+/);
  if (links && links) links = links.concat(links2);
  else if (links2) links = links2;
  else if (!links) links = [];
  for (let i = 0; i < links.length; i++) {
    let link = decodeURI(links[i]).toLowerCase();
    let domain = new URL(link).hostname;
    if (user.urls.hasOwnProperty(domain)) {
      if (user.urls[domain].links.indexOf(link) == -1) user.urls[domain].links.push(link);
      user.urls[domain].counter++;
    } else user.urls[domain] = new url_analyze(link);
  }
  if (links.length > 0) return true;
  return false;
};
link_sort = user => {
  if (Object.keys(user.urls).length <= 10) return;
  let links = [];
  let res = {};
  for (domain in user.urls) {
    let link = user.urls[domain];
    links.push([domain, link.counter]);
  }
  links.sort((a, b) => {
    return b[1] - a[1];
  });
  links.splice(9, links.length - 10);
  for (let i = 0; i < links.length; i++) {
    let domain = links[i][0];
    res[domain] = user.urls[domain];
  }
  user.urls = res;
};
runPy = async message => {
  const {
    success,
    err = '',
    results,
  } = await new Promise((resolve, reject) => {
    let options = {
      mode: 'json',
      pythonPath: 'your-python-path',
      scriptPath: 'your-script-path',
      args: [message],
    };
    PythonShell.run('nlp.py', options, (err, results) => {
      if (err) reject({ success: false, err });
      resolve({ success: true, results });
    });
  });
  if (!success) {
    console.log('Test Error: ' + err);
    return null;
  }
  return results;
};
output = async (chatId, array, bot) => {
  for (user_id in array) {
    let user = array[user_id];
    await bot.sendMessage(
      chatId,
      `
            Пользовтель ${user.name}:
                Уникальных слов: ${dict(user.words).length},
                Самые популярные слова: ${user.popular_words()},
                Всего сообщений: ${user.messages.length},
                Поведение: ${user.mood()},
                Языки: ${user.langs.reduce((a, b) => a + ', ' + b)},
                Любимая фраза: ${user.favorite_phrase()},
                Орфография: ${user.orthography_check()},
                Грубость: ${user.profane_check()},\n${user.links_check()}
        `,
    );
  }
};
dict = words => {
  let result = [];
  for (word of words) {
    if (result.indexOf(word) == -1) result.push(word);
  }
  return result;
};
tokenizer = str => {
  return str
    .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ');
};
(function () {
  this.uniqid = function (pr, en) {
    var pr = pr || '',
      en = en || false,
      result,
      us;
    this.seed = function (s, w) {
      s = parseInt(s, 10).toString(16);
      return w < s.length
        ? s.slice(s.length - w)
        : w > s.length
        ? new Array(1 + (w - s.length)).join('0') + s
        : s;
    };
    result =
      pr +
      this.seed(parseInt(new Date().getTime() / 1000, 10), 8) +
      this.seed(Math.floor(Math.random() * 0x75bcd15) + 1, 5);
    if (en) result += (Math.random() * 10).toFixed(8).toString();
    return result;
  };
})();
start();
